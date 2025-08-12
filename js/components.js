/* =================================================================
   공통 컴포넌트 JS (components.js - 시나리오 2 구현)
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 변수 및 요소 정의 ---
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatWindow = document.getElementById('chat-window');
    const closeChatBtn = document.getElementById('close-chat-btn');
    const chatInputForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const micBtn = document.getElementById('mic-btn');

    // 시나리오 2의 복합 질문
    const complexQuery = "현재 운송 중인 화물의 예상 정산액을 계산하고, 지금 경로가 새로 바뀐 지자체 조례에 저촉되지 않는지 확인해줘.";


    // --- 2. 챗봇 창 열고 닫기 ---
    chatbotFab.addEventListener('click', () => {
        chatWindow.style.display = 'flex';
    });

    closeChatBtn.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });


    // --- 3. 시나리오 2: 음성 입력 및 단계적 답변 시뮬레이션 ---

    // 마이크 버튼 클릭 시, 복합 질문 자동 입력
    micBtn.addEventListener('click', () => {
        chatInput.value = complexQuery;
        chatInput.focus();
    });

    // 메시지 전송 이벤트 처리
    chatInputForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userInput = chatInput.value.trim();
        if (userInput === '') return;

        appendMessage(userInput, 'user');
        chatInput.value = '';

        // 입력된 메시지가 시나리오의 복합 질문과 일치하는지 확인
        if (userInput === complexQuery) {
            // RAG 과정 시뮬레이션을 위한 단계적 답변
            simulateRAGResponse();
        } else {
            // 일반적인 질문에 대한 기본 답변
            setTimeout(() => {
                appendMessage('죄송합니다. 시연 버전에서는 해당 질문에 답변할 수 없습니다.', 'bot');
            }, 800);
        }
    });


    // --- 4. 헬퍼 함수 ---

    /**
     * RAG(검색 증강 생성) 과정을 시뮬레이션하는 함수
     */
    function simulateRAGResponse() {
        // 1단계: 질문 분석
        setTimeout(() => {
            appendMessage('질문을 분석 중입니다...', 'bot', true);
        }, 800);

        // 2단계: 정보 검색
        setTimeout(() => {
            appendMessage('데이터베이스를 조회하여 관련 정보를 검색합니다: 적재량, REC 가격, GPS 경로, 최신 조례...', 'bot', true);
        }, 2200);

        // 3단계: 최종 답변 생성
        setTimeout(() => {
            const finalResponse = `답변을 생성했습니다.\n\n- 예상 정산액: <strong>1,380,000원</strong> (적재량 42톤, REC 단가 32,857원 기준)\n- 규제 확인: 현재 운송 경로는 개정된 '산림 인접 지역 도로 통행 제한 조례'에 <strong>저촉되지 않습니다.</strong>\n\n*출처: 국가법령정보센터, 내부 DB`;
            appendMessage(finalResponse, 'bot');
        }, 4000);
    }

    /**
     * 메시지를 채팅창에 추가하는 함수
     * @param {string} text - 메시지 내용 (HTML 포함 가능)
     * @param {string} sender - 메시지 주체 ('user' 또는 'bot')
     * @param {boolean} isThinking - '생각 중' 효과를 위한 파라미터
     */
    function appendMessage(text, sender, isThinking = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        
        // isThinking 파라미터가 true이면, 타이핑 효과를 위한 클래스 추가
        if (isThinking) {
            messageContentDiv.classList.add('thinking');
        }
        
        // text에 HTML 태그가 포함될 수 있으므로 innerHTML 사용
        messageContentDiv.innerHTML = text.replace(/\n/g, '<br>');

        messageDiv.appendChild(messageContentDiv);
        chatMessages.appendChild(messageDiv);

        // 메시지 추가 후 항상 맨 아래로 스크롤
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // '생각 중' 효과를 위한 CSS 동적 삽입
    const style = document.createElement('style');
    style.innerHTML = `
        .message-content.thinking::after {
            content: '';
            display: inline-block;
            width: 8px;
            height: 2px;
            background-color: currentColor;
            border-radius: 2px;
            animation: thinking-dot 1.5s infinite;
            animation-delay: 0.5s;
            box-shadow: 10px 0 0 currentColor, 20px 0 0 currentColor;
            margin-left: 5px;
            opacity: 0.4;
        }
        @keyframes thinking-dot {
            0% { box-shadow: 10px 0 0 transparent, 20px 0 0 transparent; }
            25% { box-shadow: 10px 0 0 currentColor, 20px 0 0 transparent; }
            50% { box-shadow: 10px 0 0 currentColor, 20px 0 0 currentColor; }
        }
    `;
    document.head.appendChild(style);
});
