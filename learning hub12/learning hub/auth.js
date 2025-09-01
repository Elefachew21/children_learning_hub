import { 
  signInWithEmailAndPassword,
  getAuth 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize services
const auth = getAuth();
const db = getFirestore();

document.getElementById('loginUser').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    // 1. Authenticate user
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // 2. Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }
    
    // 3. Store user data
    const userData = userDoc.data();
    localStorage.setItem('user', JSON.stringify({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      ...userData // Include additional Firestore data
    }));
    
    // 4. Redirect based on user role (example)
    if (userData.role === "student") {
      window.location.href = "student-dashboard.html";
    } else if (userData.role === "teacher") {
      window.location.href = "teacher-portal.html";
    } else {
      window.location.href = "lessons.html";
    }

  } catch (error) {
    // Error handling remains the same
    console.error("Login error:", error);
    alert(error.message);
  }
});