export const Quiz = {
  bind(){
    const dlg = document.getElementById('dlgQuiz');
    const body = document.getElementById('quizBody');
    const title = document.getElementById('quizTitle');
    const msg = document.getElementById('quizMsg');

    window.addEventListener('open-quiz', (e) =>{
      const { lesson } = e.detail;
      title.textContent = `Quiz: ${lesson.lessonTitle}`;
      renderQuiz(lesson.quiz || []);
      dlg.showModal();
    });

    function renderQuiz(items){
      body.innerHTML = '';
      items.forEach((q, idx) =>{
        const wrapper = document.createElement('fieldset');
        const legend = document.createElement('legend');
        legend.textContent = `${idx+1}. ${q.question}`;
        wrapper.appendChild(legend);
        (q.options || []).forEach(opt =>{
          const id = `q${idx}_${opt}`;
          const label = document.createElement('label');
          label.style.display = 'flex';
          label.style.gap = '8px';
          label.style.alignItems = 'center';
          label.innerHTML = `<input type="radio" name="q${idx}" value="${opt}"> ${opt}`;
          wrapper.appendChild(label);
        });
        body.appendChild(wrapper);
      });
    }

    const form = document.getElementById('quizForm');
    form?.addEventListener('submit', (e) =>{
      e.preventDefault();
      const fields = [...body.querySelectorAll('fieldset')];
      let score = 0; let total = fields.length;
      fields.forEach((fs, idx) =>{
        const chosen = fs.querySelector(`input[name="q${idx}"]:checked`)?.value;
        const correct = fs.querySelector('legend').textContent; // will fix with metadata if needed
      });
      // In this simple placeholder, award all attempts as participation
      msg.textContent = `Submitted!`;
      msg.className = 'success';
      setTimeout(() => dlg.close(), 600);
    });
  }
};
