/*
  대시보드 인터랙션 시뮬레이션 스크립트 (dashboard.js)
*/

// DOM 콘텐츠가 모두 로드된 후에 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {

    // HTML에서 필요한 요소들을 가져옵니다.
    const alertItems = document.querySelectorAll('.alert-item');
    const vehicleIcon = document.getElementById('vehicle-icon');
    const alertIcon = document.getElementById('alert-icon');

    // 각 '이상 징후' 목록 아이템에 클릭 이벤트를 추가합니다.
    alertItems.forEach(item => {
        item.addEventListener('click', () => {

            // --- 시각적 피드백을 위한 'active' 클래스 관리 ---
            // 먼저 모든 아이템에서 'active' 클래스를 제거합니다.
            alertItems.forEach(i => i.classList.remove('active'));
            // 현재 클릭한 아이템에만 'active' 클래스를 추가합니다.
            item.classList.add('active');


            // --- 아이콘 이동 및 표시 시뮬레이션 ---
            // 클릭한 아이템의 data 속성에서 좌표 값을 가져옵니다. (시연용 좌표)
            const lat = item.dataset.lat;
            const lng = item.dataset.lng;

            // 차량 아이콘을 해당 좌표로 부드럽게 이동시킵니다.
            vehicleIcon.style.top = `${lat}%`;
            vehicleIcon.style.left = `${lng}%`;

            console.log(`차량 아이콘을 위치 (${lat}%, ${lng}%)로 이동합니다.`);

            // 클릭한 아이템이 '경고' 또는 '위험' 상태인지 확인합니다.
            if (item.querySelector('.warning') || item.querySelector('.critical')) {
                // 경고 아이콘을 차량과 같은 위치에 표시합니다.
                alertIcon.style.top = `${lat}%`;
                alertIcon.style.left = `${lng}%`;
                alertIcon.style.display = 'block';
                console.log('경고 아이콘을 표시합니다.');
            } else {
                // '정보' 상태일 경우 경고 아이콘을 숨깁니다.
                alertIcon.style.display = 'none';
                console.log('경고 아이콘을 숨깁니다.');
            }
        });
    });

    // CSS에 'active' 클래스에 대한 스타일을 추가하면 더 좋습니다.
    // 예: .alert-item.active { background-color: #e8f0fe; }
    const style = document.createElement('style');
    style.innerHTML = `.alert-item.active { background-color: #f0f4f8; border-left: 3px solid var(--primary-color); }`;
    document.head.appendChild(style);
});
