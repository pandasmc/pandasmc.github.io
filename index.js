// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the role selection buttons
    const adminButton = document.getElementById('adminBtn');
    const companyButton = document.getElementById('companyBtn');
    const webAdminButton = document.getElementById('webAdminBtn');

    // Function to handle page transition
    const goToPage = (url) => {
        document.body.classList.add('fade-out');
        setTimeout(() => {
            window.location.href = url;
        }, 500);
    };

    // Add a new style element for the fade-out animation
    const style = document.createElement('style');
    style.innerHTML = `
        body.fade-out {
            animation: fadeOut 0.5s ease-out forwards;
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Add event listeners
    if (adminButton) {
        adminButton.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage('admin.html');
        });
    }

    if (companyButton) {
        companyButton.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage('company.html');
        });
    }

    if (webAdminButton) {
        webAdminButton.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage('web_admin.html');
        });
    }
});
