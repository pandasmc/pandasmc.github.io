// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the two role selection buttons
    const adminButton = document.getElementById('adminBtn');
    const companyButton = document.getElementById('companyBtn');

    // Function to handle page transition
    const goToPage = (url) => {
        // Add a class to the body to trigger a fade-out animation
        document.body.classList.add('fade-out');
        
        // Wait for the animation to complete before changing the page
        setTimeout(() => {
            window.location.href = url;
        }, 500); // This duration should match the CSS animation duration
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


    // Check if the buttons exist to prevent errors
    if (adminButton) {
        // Add a click event listener to the 'Admin' button
        adminButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            goToPage('admin.html');
        });
    }

    if (companyButton) {
        // Add a click event listener to the 'Company' button
        companyButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior
            goToPage('company.html');
        });
    }

});
