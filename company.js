document.addEventListener('DOMContentLoaded', () => {

    // --- Tab Switching Logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Activate the clicked button and its corresponding content
            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });


    // --- Route Planner Logic ---
    const addWaypointBtn = document.getElementById('addWaypointBtn');
    const waypointsContainer = document.getElementById('waypoints-container');
    const findRouteBtn = document.getElementById('findRouteBtn');
    const routeInfo = document.getElementById('routeInfo');
    let waypointCount = 0;

    // Initialize map
    const routeMap = L.map('routeMap').setView([36.5, 127.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(routeMap);

    // Add waypoint input field
    addWaypointBtn.addEventListener('click', () => {
        waypointCount++;
        const newWaypoint = document.createElement('div');
        newWaypoint.classList.add('input-group');
        newWaypoint.innerHTML = `
            <label><i class="fas fa-map-pin"></i> 경유지 ${waypointCount}</label>
            <input type="text" value="대전광역시">
        `;
        waypointsContainer.appendChild(newWaypoint);
    });

    // Find route simulation
    findRouteBtn.addEventListener('click', () => {
        // Clear previous layers
        routeMap.eachLayer(layer => {
            if (!!layer.toGeoJSON) {
                routeMap.removeLayer(layer);
            }
        });

        // --- Scenario Data ---
        const startPoint = { lat: 37.8813, lng: 127.7298, name: '출발: 춘천' };
        const waypoint = { lat: 36.3504, lng: 127.3845, name: '경유: 대전' };
        const endPoint = { lat: 36.9914, lng: 126.6995, name: '도착: 당진' };
        const routePoints = [
            [startPoint.lat, startPoint.lng],
            [waypoint.lat, waypoint.lng],
            [endPoint.lat, endPoint.lng]
        ];

        // Add markers
        L.marker(routePoints[0]).addTo(routeMap).bindPopup(startPoint.name);
        L.marker(routePoints[1]).addTo(routeMap).bindPopup(waypoint.name);
        L.marker(routePoints[2]).addTo(routeMap).bindPopup(endPoint.name);

        // Draw polyline
        L.polyline(routePoints, { color: 'blue', weight: 5 }).addTo(routeMap);

        // Fit map to bounds
        routeMap.fitBounds(routePoints, { padding: [50, 50] });
        
        // Display route info
        routeInfo.innerHTML = `
            <h4>최적 경로 분석 결과</h4>
            <p><strong>예상 소요 시간:</strong> 4시간 21분</p>
            <p><strong>총 거리:</strong> 285km</p>
            <p><strong>예상 유류비:</strong> 48,450원 (AI 최적화로 <strong>8% 절감</strong>)</p>
        `;
    });


    // --- AI Chat Logic ---
    const chatWindow = document.querySelector('.chat-window');
    const sendBtn = document.getElementById('sendBtn');

    // Initial bot message
    function addBotMessage(text, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', 'bot-message');
        if (isTyping) {
            messageDiv.classList.add('typing');
            messageDiv.innerHTML = `<span>.</span><span>.</span><span>.</span>`;
        } else {
            messageDiv.textContent = text;
        }
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return messageDiv;
    }

    addBotMessage("안녕하세요! '강원임업' 김 대표님, 무엇을 도와드릴까요?");

    // Send message simulation
    sendBtn.addEventListener('click', () => {
        // --- Scenario 2 Data ---
        const userQuestion = "지금 운송 중인 화물 예상 정산액이랑, 새로 바뀐 지자체 조례에 현재 운송 경로가 저촉 안 되는지 확인해 줘.";
        const botAnswer = "요청하신 결과값은 다음과 같습니다. '강원임업'의 2분기 예상 정산액은 '총 1억 3천 8백만원'이며, 현재 경로는 개정된 조례에 저촉되지 않습니다. 안전 운행하세요!";

        // 1. Display user's pre-scripted question
        const userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('chat-message', 'user-message');
        userMessageDiv.textContent = userQuestion;
        chatWindow.appendChild(userMessageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // 2. Show typing indicator
        const typingIndicator = addBotMessage('', true);

        // 3. Show bot's answer after a delay
        setTimeout(() => {
            chatWindow.removeChild(typingIndicator);
            addBotMessage(botAnswer);
        }, 2000); // 2-second delay to simulate thinking
    });
});
