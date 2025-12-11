# Kids Smart Learning

A modern, responsive, and kid-friendly web application that helps children learn Amharic, Reading (English), Maths, and General Knowledge. Built with HTML, CSS, JavaScript, and Firebase (Authentication, Firestore, Storage, Hosting).

## Features
- Firebase Authentication (email/password, optional anonymous)
- Admin dashboard: manage lessons, quizzes, users, and view statistics
- Student dashboard: progress, rewards, and subject navigation
- Interactive lessons and quizzes with audio pronunciation support
- Responsive, colorful UI with gamified elements (points, stars, badges)
- Local caching and offline-friendly reads

## Tech Stack
- Frontend: HTML5, CSS3, JavaScript (vanilla ES modules)
- Backend: Firebase Authentication, Firestore, Storage
- Hosting: Firebase Hosting

## Project Structure
```
/kids-smart-learning/
├── index.html
├── /pages/
│   ├── login.html
│   ├── signup.html
│   ├── dashboard_admin.html
│   ├── dashboard_student.html
│   ├── amharic.html
│   ├── reading.html
│   ├── maths.html
│   ├── general.html
├── /css/
│   ├── style.css
│   ├── dashboard.css
├── /js/
│   ├── firebaseConfig.js
│   ├── auth.js
│   ├── main.js
│   ├── lessons.js
│   ├── quiz.js
│   ├── dashboard.js
├── /assets/
│   ├── images/
│   ├── sounds/
│   ├── icons/
├── /data/
│   └── sample_lessons.json
└── README.md
```

## Getting Started

### 1) Create Firebase Project
1. Go to Firebase Console and create a new project.
2. Enable Authentication (Email/Password). Optionally enable Anonymous and Google.
3. Create Cloud Firestore in Production mode.
4. Enable Cloud Storage.

### 2) Add Web App and Config
- In Project Settings > General > Your Apps > Web App, register a new app and copy the config.
- Open `js/firebaseConfig.js` and replace the placeholder values in `firebaseConfig` with your actual keys.

### 3) Firestore Data Model
- Collections:
  - `users/{uid}`: { displayName, role: 'admin'|'student', points, avatarUrl, createdAt }
  - `lessons/{lessonId}`: { subject, lessonTitle, content, imageUrl, audioUrl, difficulty, quiz[], createdAt }
  - `progress/{uid_lessonId}`: { uid, lessonId, completed, updatedAt }

### 4) Local Development
- Serve with any static server that supports ES Modules, or use Firebase Hosting preview.
- For a quick test:
```bash
# from the project root
python3 -m http.server 5500
# open http://localhost:5500/kids-smart-learning/
```

### 5) Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting  # choose existing project, set public dir to kids-smart-learning, configure as SPA: yes
firebase deploy
```

### 6) Firebase Security Rules (Example)
Use conservative rules; below is a starting point. Adjust for your needs.

Firestore rules (example):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'; }

    match /users/{uid} {
      allow read: if isSignedIn() && uid == request.auth.uid || isAdmin();
      allow write: if isAdmin() || (isSignedIn() && uid == request.auth.uid);
    }

    match /lessons/{id} {
      allow read: if true; // lessons are public to read
      allow write: if isAdmin();
    }

    match /progress/{id} {
      allow read, write: if isSignedIn() && resource.data.uid == request.auth.uid;
    }
  }
}
```

Storage rules (example):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isSignedIn() { return request.auth != null; }
    function isAdmin() { return isSignedIn() && get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin'; }

    match /lesson_images/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    match /lesson_audio/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### Sample Data Import
- Use the Admin dashboard to add lessons or import `data/sample_lessons.json` manually into Firestore.

## Performance Notes
- Lessons list cached in `localStorage` by subject
- Use Firestore `limit` and pagination (`startAfter`) for long lists
- Images should be optimized and lazy-loaded using native `loading="lazy"`
- Consider minifying CSS/JS and enabling HTTP/2 + caching via Hosting

## Roadmap
- Points/stars/badges system and leaderboard
- Charts for admin statistics (Chart.js)
- Better quiz scoring with explanations
- Offline support via Firebase Hosting caching headers and Service Worker
