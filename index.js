// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the two role selection buttons
    const adminButton = document.getElementById('adminBtn');
    const companyButton = document.getElementById('companyBtn');

    // Check if the buttons exist to prevent errors
    if (adminButton) {
        // Add a click event listener to the 'Admin' button
        adminButton.addEventListener('click', () => {
            // When clicked, navigate to the admin page
            window.location.href = 'admin.html';
        });
    }

    if (companyButton) {
        // Add a click event listener to the 'Company' button
        companyButton.addEventListener('click', () => {
            // When clicked, navigate to the company page
            window.location.href = 'company.html';
        });
    }

});
