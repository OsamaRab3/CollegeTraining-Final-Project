document.addEventListener('DOMContentLoaded', () => {


    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('token', result.token); 
                    localStorage.setItem('email', email);
                    window.location.href = '/profile';
                } else {
                    alert(result.message || 'Login failed.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during login.');
            }
        });
    }

  
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const result = await response.json();
                
                if (response.ok) {
                    localStorage.setItem('email', email);
                    window.location.href = '/profile';
                } else {
                    alert(result.message || 'Signup failed.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during signup.');
            }
        });
    }

    document.querySelectorAll('.enroll-button').forEach(button => {
        button.addEventListener('click', async () => {
            const courseId = button.dataset.courseId;
            const studentEmail = localStorage.getItem('email');

            if (!studentEmail) {
                alert('You must be logged in to enroll in a course.');
                return;
            }

            try {
                const response = await fetch('/enroll', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseId, studentEmail })
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message || 'Enrolled successfully.');
                } else {
                    alert(result.message || 'Enrollment failed.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during enrollment.');
            }
        });
    });
});
