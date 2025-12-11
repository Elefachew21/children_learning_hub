import './firebaseConfig.js';
import { watchAuth, loginWithEmail, signupWithEmail, logout, routeToDashboard, getCurrentUser } from './auth.js';
import { Lessons } from './lessons.js';
import { Quiz } from './quiz.js';

const page = document.body.getAttribute('data-page');

function setYear(){
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

function qs(id){ return document.getElementById(id); }

async function initHome(){
  const btnLogin = qs('btnLogin');
  const btnSignup = qs('btnSignup');
  const btnDashboard = qs('btnDashboard');
  const footerDash = document.getElementById('footerDashboard');
  const btnGetStarted = qs('btnGetStarted');
  const btnExplore = qs('btnExplore');

  const user = getCurrentUser();
  const hasUser = !!user;
  if (btnDashboard) btnDashboard.classList.toggle('hidden', !hasUser);
  if (footerDash) footerDash.classList.toggle('hidden', !hasUser);

  btnLogin?.addEventListener('click', () => location.href = 'pages/login.html');
  btnSignup?.addEventListener('click', () => location.href = 'pages/signup.html');
  btnDashboard?.addEventListener('click', routeToDashboard);
  footerDash?.addEventListener('click', routeToDashboard);
  btnGetStarted?.addEventListener('click', () => hasUser ? routeToDashboard() : (location.href = 'pages/signup.html'));
  btnExplore?.addEventListener('click', () => location.href = '#subjects');
}

async function initLogin(){
  const form = qs('loginForm');
  const msg = qs('loginMsg');
  form?.addEventListener('submit', async (e) =>{
    e.preventDefault();
    msg.textContent = '';
    const email = qs('email').value.trim();
    const password = qs('password').value;
    try{
      await loginWithEmail({ email, password });
      msg.textContent = 'Success! Redirecting...';
      msg.className = 'success';
      setTimeout(routeToDashboard, 500);
    }catch(err){
      msg.textContent = err.message || 'Login failed';
      msg.className = 'error';
    }
  });
}

async function initSignup(){
  const form = qs('signupForm');
  const msg = qs('signupMsg');
  form?.addEventListener('submit', async (e) =>{
    e.preventDefault();
    msg.textContent = '';
    const displayName = qs('name').value.trim();
    const age = Number(qs('age').value) || 0;
    const email = qs('email').value.trim();
    const password = qs('password').value;
    try{
      await signupWithEmail({ email, password, displayName, age });
      msg.textContent = 'Account created! Redirecting...';
      msg.className = 'success';
      setTimeout(routeToDashboard, 600);
    }catch(err){
      msg.textContent = err.message || 'Signup failed';
      msg.className = 'error';
    }
  });
}

async function initDashboardAdmin(){
  const btnLogout = qs('btnLogout');
  btnLogout?.addEventListener('click', logout);
  Lessons.initAdmin();
}

async function initDashboardStudent(){
  const btnLogout = qs('btnLogout');
  const btnToSubjects = qs('btnToSubjects');
  btnLogout?.addEventListener('click', logout);
  btnToSubjects?.addEventListener('click', () => location.href = '../index.html#subjects');
  Lessons.initStudentDashboard();
}

async function initSubjectPage(subject){
  Lessons.initSubject(subject);
  Quiz.bind();
}

function boot(){
  setYear();
  switch(page){
    case 'home': return initHome();
    case 'login': return initLogin();
    case 'signup': return initSignup();
    case 'dashboard-admin': return initDashboardAdmin();
    case 'dashboard-student': return initDashboardStudent();
    case 'amharic': return initSubjectPage('Amharic');
    case 'reading': return initSubjectPage('Reading');
    case 'maths': return initSubjectPage('Maths');
    case 'general': return initSubjectPage('General');
    default: return;
  }
}

watchAuth(() => {
  // Update UI if needed (already reading synchronously on home)
});

boot();
