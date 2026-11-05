document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const forgotLink = document.getElementById('forgotPasswordLink');
    const forgotModal = document.getElementById('forgotModal');
    const closeModal = document.getElementById('closeModal');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (err) {
                window.location.href = 'dashboard.html';
            }
        });
    }

    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotModal.classList.remove('hidden');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            forgotModal.classList.add('hidden');
        });
    }
});