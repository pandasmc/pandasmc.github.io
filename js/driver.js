/*
  운전자 페이지 인터랙션 시뮬레이션 스크립트 (driver.js)
*/

// DOM 콘텐츠가 모두 로드된 후에 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {

    // --- 필요한 HTML 요소 가져오기 ---
    const currentStatus = document.getElementById('current-status');
    const toggleWorkButton = document.getElementById('toggle-work-button');
    
    const openModalButton = document.getElementById('open-modal-button');
    const closeModalButton = document.getElementById('close-modal-button');
    const dataModal = document.getElementById('data-modal');
    
    const dataForm = document.getElementById('data-form');
    const successMessage = document.getElementById('success-message');

    // --- '작업 시작/종료' 버튼 로직 ---
    let isWorking = false; // 현재 작업 상태를 저장하는 변수

    toggleWorkButton.addEventListener('click', () => {
        isWorking = !isWorking; // 버튼을 누를 때마다 상태를 반전시킴

        if (isWorking) {
            // 작업 시작 상태로 변경
            currentStatus.textContent = '운송 중';
            toggleWorkButton.innerHTML = '<i class="fa-solid fa-stop"></i> 작업 종료';
            toggleWorkButton.classList.remove('btn-primary');
            toggleWorkButton.classList.add('btn-danger'); // 시각적 구분을 위해 새로운 클래스 추가
            console.log('작업을 시작합니다.');
        } else {
            // 작업 종료 (대기) 상태로 변경
            currentStatus.textContent = '대기 중';
            toggleWorkButton.innerHTML = '<i class="fa-solid fa-play"></i> 작업 시작';
            toggleWorkButton.classList.remove('btn-danger');
            toggleWorkButton.classList.add('btn-primary');
            console.log('작업을 종료합니다.');
        }
    });

    // --- 데이터 입력 모달 로직 ---
    // '현장 데이터 입력' 버튼 클릭 시 모달 열기
    openModalButton.addEventListener('click', () => {
        dataModal.style.display = 'flex';
        console.log('데이터 입력 모달을 엽니다.');
    });

    // '취소' 버튼 클릭 시 모달 닫기
    closeModalButton.addEventListener('click', () => {
        dataModal.style.display = 'none';
        console.log('데이터 입력 모달을 닫습니다.');
    });

    // 모달 폼 제출 시뮬레이션
    dataForm.addEventListener('submit', (event) => {
        event.preventDefault(); // 실제 폼 제출 방지
        console.log('데이터 제출을 시뮬레이션합니다.');

        // 성공 메시지 표시
        successMessage.style.display = 'block';

        // 1.5초 후에 메시지와 모달을 자동으로 닫음
        setTimeout(() => {
            successMessage.style.display = 'none';
            dataModal.style.display = 'none';
            dataForm.reset(); // 폼 입력 내용 초기화
            console.log('성공 메시지 및 모달을 자동으로 닫습니다.');
        }, 1500);
    });

    // --- '작업 종료' 버튼을 위한 스타일 추가 ---
    const style = document.createElement('style');
    style.innerHTML = `
        .btn-danger {
            background-color: #d9534f;
            color: white;
        }
        .btn-danger:hover {
            background-color: #c9302c;
        }
    `;
    document.head.appendChild(style);
});
