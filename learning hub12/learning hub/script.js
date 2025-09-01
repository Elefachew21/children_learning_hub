document.addEventListener('DOMContentLoaded', function() {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };
    
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Check auth state
    firebase.auth().onAuthStateChanged(function(user) {
        const authLink = document.getElementById('auth-link');
        if (user) {
            // User is signed in
            authLink.innerHTML = '<a href="dashboard.html" class="btn-login">Dashboard</a>';
        } else {
            // No user is signed in
            authLink.innerHTML = '<a href="#login" class="btn-login">Login</a>';
        }
    });
    
    // Testimonial slider functionality
    const testimonials = document.querySelectorAll('.testimonial');
    const dotsContainer = document.querySelector('.slider-dots');
    let currentTestimonial = 0;
    
    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            showTestimonial(index);
        });
        dotsContainer.appendChild(dot);
    });
    
    function showTestimonial(index) {
        testimonials.forEach(testimonial => testimonial.classList.remove('active'));
        testimonials[index].classList.add('active');
        
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        
        currentTestimonial = index;
    }
    
    // Auto-rotate testimonials
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
    
    // Navigation buttons
    document.querySelector('.slider-prev').addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
    });
    
    document.querySelector('.slider-next').addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    });
    
    // Subject card navigation
    const subjectCards = document.querySelectorAll('.card');
    subjectCards.forEach(card => {
        card.addEventListener('click', function() {
            const subject = this.getAttribute('data-subject');
            if (firebase.auth().currentUser) {
                window.location.href = `${subject}/index.html`;
            } else {
                document.querySelector('.auth-modal').classList.add('active');
            }
        });
    });
    
    // Explore buttons
    const exploreButtons = document.querySelectorAll('.btn-subject');
    exploreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.card');
            const subject = card.getAttribute('data-subject');
            if (firebase.auth().currentUser) {
                window.location.href = `${subject}/index.html`;
            } else {
                document.querySelector('.auth-modal').classList.add('active');
            }
        });
    });
    
    // CTA buttons
    document.getElementById('start-learning').addEventListener('click', function() {
        if (firebase.auth().currentUser) {
            window.location.href = "dashboard.html";
        } else {
            document.querySelector('.auth-modal').classList.add('active');
        }
    });
    
    document.getElementById('placement-test').addEventListener('click', function() {
        if (firebase.auth().currentUser) {
            // Start placement test
            alert('Placement test would begin here');
        } else {
            document.querySelector('.auth-modal').classList.add('active');
        }
    });
    
    // Login modal functionality
    const loginLink = document.querySelector('a[href="#login"]');
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
           document.querySelector('.auth-modal').classList.add('active');

        });
    }
    
    // Close modal
    document.querySelector('.close-auth').addEventListener('click', function() {
        document.querySelector('.auth-modal').classList.remove('active');
    });
    
    // Switch between login/signup tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding form
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.remove('active');
            });
            document.getElementById(`${tabId}-form`).classList.add('active');
        });
    });
    
    // Switch to reset password form
    document.getElementById('reset-password').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById('reset-form').classList.add('active');
    });
    
    // Back to login from reset
    document.getElementById('back-to-login').addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById('login-form').classList.add('active');
        
        // Also switch the tab
        authTabs.forEach(t => t.classList.remove('active'));
        document.querySelector('.auth-tab[data-tab="login"]').classList.add('active');
    });
});