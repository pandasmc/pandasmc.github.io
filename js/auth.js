/*
  로그인 시뮬레이션 스크립트 (auth.js)
*/

// DOM 콘텐츠가 모두 로드된 후에 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {
    
    // HTML에서 필요한 요소들을 가져옵니다.
    const loginForm = document.getElementById('login-form');
    const userIdInput = document.getElementById('userId');
    const errorMessage = document.getElementById('error-message');

    // 폼(form)이 제출될 때의 이벤트를 처리합니다.
    loginForm.addEventListener('submit', (event) => {
        // 폼의 기본 제출 동작(페이지 새로고침)을 막습니다.
        event.preventDefault();

        // 사용자가 입력한 아이디 값을 가져옵니다.
        const userId = userIdInput.value.trim();

        // 에러 메시지를 초기화합니다.
        errorMessage.textContent = '';

        // 아이디 값에 따라 페이지를 이동시킵니다.
        if (userId === 'admin') {
            // 'admin'을 입력하면 대시보드 페이지로 이동합니다.
            console.log('관리자(admin)로 로그인합니다. dashboard.html로 이동합니다.');
            window.location.href = 'dashboard.html';
        } else if (userId === 'driver') {
            // 'driver'를 입력하면 운전자 페이지로 이동합니다.
            console.log('운전자(driver)로 로그인합니다. driver.html로 이동합니다.');
            window.location.href = 'driver.html';
        } else {
            // 둘 다 아니면 에러 메시지를 표시합니다.
            console.log('로그인 실패: 올바른 아이디가 아닙니다.');
            errorMessage.textContent = '아이디를 확인해주세요. (admin 또는 driver)';
        }
    });
});
