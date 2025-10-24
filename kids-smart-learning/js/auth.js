import {
  auth,
  db,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  doc,
  getDoc,
  setDoc,
} from './firebaseConfig.js';

// Helpers
const usersCol = 'users';
const storageKeys = {
  role: 'ksl.userRole',
  profile: 'ksl.userProfile',
};

export function watchAuth(callback){
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(){
  return auth.currentUser;
}

export async function ensureUserProfile(uid, { displayName }){
  const userRef = doc(db, usersCol, uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()){
    const profile = {
      displayName: displayName || 'Student',
      role: 'student',
      points: 0,
      avatarUrl: '',
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, profile);
    localStorage.setItem(storageKeys.role, 'student');
    localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
    return profile;
  } else {
    const profile = snap.data();
    if (profile?.role) localStorage.setItem(storageKeys.role, profile.role);
    localStorage.setItem(storageKeys.profile, JSON.stringify(profile));
    return profile;
  }
}

export async function getUserRole(uid){
  const cached = localStorage.getItem(storageKeys.role);
  if (cached) return cached;
  const userRef = doc(db, usersCol, uid);
  const snap = await getDoc(userRef);
  const role = snap.exists() ? (snap.data().role || 'student') : 'student';
  localStorage.setItem(storageKeys.role, role);
  return role;
}

export async function signupWithEmail({ email, password, displayName, age }){
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) await updateProfile(user, { displayName });
  await ensureUserProfile(user.uid, { displayName });
  return user;
}

export async function loginWithEmail({ email, password }){
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(user.uid, { displayName: user.displayName || 'Student' });
  return user;
}

export async function logout(){
  await signOut(auth);
  localStorage.removeItem(storageKeys.role);
  localStorage.removeItem(storageKeys.profile);
}

export async function routeToDashboard(){
  const user = getCurrentUser();
  if (!user) return (window.location.href = '/kids-smart-learning/pages/login.html');
  const role = await getUserRole(user.uid);
  if (role === 'admin') window.location.href = '/kids-smart-learning/pages/dashboard_admin.html';
  else window.location.href = '/kids-smart-learning/pages/dashboard_student.html';
}

export async function requireRole(required){
  const user = getCurrentUser();
  if (!user) return (window.location.href = '/kids-smart-learning/pages/login.html');
  const role = await getUserRole(user.uid);
  if (required === 'admin' && role !== 'admin'){
    return (window.location.href = '/kids-smart-learning/pages/dashboard_student.html');
  }
  if (required === 'student' && role !== 'student'){
    return (window.location.href = '/kids-smart-learning/pages/dashboard_admin.html');
  }
  return true;
}

export function getCachedProfile(){
  const raw = localStorage.getItem(storageKeys.profile);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
