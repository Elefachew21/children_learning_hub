import { db, storage,
  collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc,
  query, where, orderBy, limit, serverTimestamp, startAfter,
  ref, uploadBytes, getDownloadURL
} from './firebaseConfig.js';

import { getCurrentUser, requireRole } from './auth.js';

const colLessons = 'lessons';
const colProgress = 'progress';

const cacheKeys = {
  lessons: (subject) => `ksl.lessons.${subject}`,
};

async function fetchLessons(subject, { pageSize = 24, cursor = null } = {}){
  // Try cache
  const cached = localStorage.getItem(cacheKeys.lessons(subject));
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  const base = collection(db, colLessons);
  let q = query(base, where('subject', '==', subject), orderBy('createdAt', 'desc'), limit(pageSize));
  const snap = await getDocs(q);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  localStorage.setItem(cacheKeys.lessons(subject), JSON.stringify(data));
  return data;
}

async function createOrUpdateLesson(lesson){
  const now = new Date().toISOString();
  if (lesson.id){
    const refDoc = doc(db, colLessons, lesson.id);
    await updateDoc(refDoc, { ...lesson, updatedAt: now });
    return lesson.id;
  } else {
    const refCol = collection(db, colLessons);
    const created = await addDoc(refCol, { ...lesson, createdAt: now });
    return created.id;
  }
}

async function uploadMediaIfAny({ imageFile, audioFile, id }){
  const uploaded = {};
  if (imageFile){
    const r = ref(storage, `lesson_images/${id}_${imageFile.name}`);
    await uploadBytes(r, imageFile);
    uploaded.imageUrl = await getDownloadURL(r);
  }
  if (audioFile){
    const r = ref(storage, `lesson_audio/${id}_${audioFile.name}`);
    await uploadBytes(r, audioFile);
    uploaded.audioUrl = await getDownloadURL(r);
  }
  return uploaded;
}

async function markLessonCompleted(lessonId){
  const user = getCurrentUser();
  if (!user) return;
  const refDoc = doc(db, colProgress, `${user.uid}_${lessonId}`);
  await setDoc(refDoc, { uid: user.uid, lessonId, completed: true, updatedAt: new Date().toISOString() }, { merge: true });
}

function renderLessonCard(lesson){
  const card = document.createElement('div');
  card.className = 'lesson-card';
  card.innerHTML = `
    <header>
      <div class="badge-small">${lesson.subject}</div>
    </header>
    <h4>${lesson.lessonTitle}</h4>
    <p class="helper">${lesson.content || ''}</p>
    <footer>
      <button class="btn btn-primary" data-action="start">Start</button>
      <button class="btn btn-outline" data-action="quiz">Quiz</button>
    </footer>
  `;
  card.querySelector('[data-action="start"]').addEventListener('click', () => {
    // Play audio if available
    if (lesson.audioUrl){
      const audio = new Audio(lesson.audioUrl);
      audio.play().catch(()=>{});
    }
    markLessonCompleted(lesson.id);
  });
  card.querySelector('[data-action="quiz"]').addEventListener('click', () => {
    const event = new CustomEvent('open-quiz', { detail: { lesson } });
    window.dispatchEvent(event);
  });
  return card;
}

export const Lessons = {
  async initSubject(subject){
    const container = document.getElementById('lessons');
    container.innerHTML = '';
    const lessons = await fetchLessons(subject);
    lessons.forEach(lesson => container.appendChild(renderLessonCard(lesson)));
  },

  async initAdmin(){
    await requireRole('admin');
    const grid = document.getElementById('viewLessons');
    const btnNew = document.getElementById('btnNewLesson');
    const dlg = document.getElementById('dlgLesson');

    async function load(subject){
      grid.innerHTML = '';
      const lessons = await fetchLessons(subject);
      lessons.forEach(lesson => {
        const el = document.createElement('div');
        el.className = 'card';
        el.innerHTML = `
          <h4>${lesson.lessonTitle}</h4>
          <p class="helper">${lesson.content || ''}</p>
          <div class="actions">
            <button class="btn btn-outline" data-action="edit">Edit</button>
          </div>
        `;
        el.querySelector('[data-action="edit"]').addEventListener('click', () => openEditor(lesson));
        grid.appendChild(el);
      });
    }

    function openEditor(lesson = null){
      const subjectEl = document.getElementById('lessonSubject');
      const titleEl = document.getElementById('lessonTitle');
      const descEl = document.getElementById('lessonDesc');
      const diffEl = document.getElementById('lessonDifficulty');
      const quizEl = document.getElementById('lessonQuiz');
      const msgEl = document.getElementById('lessonMsg');
      const imageEl = document.getElementById('lessonImage');
      const audioEl = document.getElementById('lessonAudio');

      msgEl.textContent = '';
      subjectEl.value = lesson?.subject || document.getElementById('adminSubject').value;
      titleEl.value = lesson?.lessonTitle || '';
      descEl.value = lesson?.content || '';
      diffEl.value = lesson?.difficulty || 'Easy';
      quizEl.value = JSON.stringify(lesson?.quiz || [], null, 2);
      imageEl.value = '';
      audioEl.value = '';

      dlg.showModal();

      const form = document.getElementById('lessonForm');
      form.onsubmit = async (e) => {
        e.preventDefault();
        try{
          const payload = {
            id: lesson?.id,
            subject: subjectEl.value,
            lessonTitle: titleEl.value.trim(),
            content: descEl.value.trim(),
            difficulty: diffEl.value,
            quiz: JSON.parse(quizEl.value || '[]'),
          };
          const id = await createOrUpdateLesson(payload);
          const uploaded = await uploadMediaIfAny({
            id,
            imageFile: imageEl.files?.[0],
            audioFile: audioEl.files?.[0],
          });
          if (Object.keys(uploaded).length){
            await createOrUpdateLesson({ id, ...uploaded });
          }
          msgEl.textContent = 'Saved';
          msgEl.className = 'success';
          dlg.close();
          await load(document.getElementById('adminSubject').value);
        }catch(err){
          msgEl.textContent = err.message || 'Failed to save';
          msgEl.className = 'error';
        }
      };
    }

    document.getElementById('adminSubject').addEventListener('change', (e) => load(e.target.value));
    btnNew.addEventListener('click', () => openEditor());
    await load(document.getElementById('adminSubject').value);
  },

  async initStudentDashboard(){
    const uid = getCurrentUser()?.uid;
    // TODO: fetch stats; placeholder UI update
    document.getElementById('statPoints').textContent = '0';
    document.getElementById('statStars').textContent = '0';
    document.getElementById('statBadges').textContent = '0';
    document.getElementById('overallProgress').style.width = '0%';
  },
};
