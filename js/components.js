/*
  공통 컴포넌트 시뮬레이션 스크립트 (components.js)
  - AI 챗봇의 동작을 담당합니다.
*/

// DOM 콘텐츠가 모두 로드된 후에 스크립트를 실행합니다.
document.addEventListener('DOMContentLoaded', () => {

    // --- 필요한 HTML 요소 가져오기 ---
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // --- 챗봇 창 열고 닫기 로직 ---
    // 플로팅 버튼 클릭 시 채팅창 표시
    chatbotFab.addEventListener('click', () => {
        chatWindow.style.display = 'flex';
        console.log('챗봇 창을 엽니다.');
    });

    // 닫기 버튼 클릭 시 채팅창 숨김
    closeChatBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
        console.log('챗봇 창을 닫습니다.');
    });

    // --- 채팅 시뮬레이션 로직 ---
    chatInputForm.addEventListener('submit', (event) => {
        event.preventDefault(); // 폼 기본 제출 동작 방지
        const userInput = chatInput.value.trim();

        if (userInput === '') return; // 입력값이 없으면 아무것도 안 함

        // 1. 사용자 메시지를 화면에 표시
        appendMessage(userInput, 'user');
        chatInput.value = ''; // 입력창 비우기

        // 2. 봇이 답변하는 것처럼 보이게 잠시 지연
        setTimeout(() => {
            let botResponse = '';
            // 시나리오에 따른 봇 답변 생성
            if (userInput.includes('정산액')) {
                botResponse = '"강원임업"의 예상 정산액은 "총 1억 3천 8백만원"입니다.';
            } else {
                botResponse = '죄송합니다. 시연 버전에서는 해당 질문에 답변할 수 없습니다.';
            }
            
            // 3. 봇의 답변을 화면에 표시
            appendMessage(botResponse, 'bot');

        }, 800); // 0.8초 지연
    });

    /**
     * 메시지를 채팅창에 추가하는 함수
     * @param {string} text - 메시지 내용
     * @param {string} sender - 메시지를 보낸 주체 ('user' 또는 'bot')
     */
    function appendMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        messageContentDiv.textContent = text;

        messageDiv.appendChild(messageContentDiv);
        chatMessages.appendChild(messageDiv);

        // 메시지 추가 후 항상 맨 아래로 스크롤
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        console.log(`${sender} 메시지 추가: ${text}`);
    }
});
