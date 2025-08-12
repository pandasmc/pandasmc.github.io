document.addEventListener('DOMContentLoaded', () => {
    let routeMap, forecastMap; // Declare map variables

    // --- Tab Switching Logic ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // Initialize map only when tab is activated
            if (targetId === 'routePlannerSection' && !routeMap) initRouteMap();
            if (targetId === 'forecastSection' && !forecastMap) initForecastMap();
        });
    });

    // --- Helper function to initialize maps ---
    const initMap = (containerId, view, zoom) => {
        const map = L.map(containerId).setView(view, zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);
        return map;
    };

    const initRouteMap = () => routeMap = initMap('routeMap', [36.7, 127.2], 8);
    const initForecastMap = () => forecastMap = initMap('forecastMap', [37.8, 128.2], 8);
    
    // Initialize the first tab's map
    initRouteMap();

    // --- Route Planner Logic ---
    document.getElementById('findRouteBtn').addEventListener('click', () => {
        routeMap.eachLayer(layer => { if (!!layer.toGeoJSON) routeMap.removeLayer(layer); });

        const start = { lat: 37.8813, lng: 127.7298, name: '출발: 춘천' };
        const wp1 = { lat: 37.3423, lng: 127.9202, name: '경유1: 원주' };
        const wp2 = { lat: 36.3504, lng: 127.3845, name: '경유2: 대전' };
        const end = { lat: 36.9914, lng: 126.6995, name: '도착: 당진' };
        
        const aiRoute = [[start.lat, start.lng], [wp1.lat, wp1.lng], [36.8, 127.1], [wp2.lat, wp2.lng], [end.lat, end.lng]];
        const normalRoute = [[start.lat, start.lng], [37.5, 127.8], [wp1.lat, wp1.lng], [wp2.lat, wp2.lng], [36.8, 126.8], [end.lat, end.lng]];

        L.polyline(aiRoute, { color: '#2c5282', weight: 7, opacity: 0.9, dashArray: '10, 5' }).addTo(routeMap).bindPopup('<b>AI 추천 최적 경로</b>');
        L.polyline(normalRoute, { color: '#a0aec0', weight: 4 }).addTo(routeMap).bindPopup('일반 경로');
        
        [start, wp1, wp2, end].forEach(p => L.marker([p.lat, p.lng]).addTo(routeMap).bindPopup(p.name));
        routeMap.fitBounds(L.polyline(aiRoute).getBounds(), { padding: [30, 30] });
        
        const routeInfo = document.getElementById('routeInfo');
        routeInfo.innerHTML = `
            <h4><i class="fas fa-chart-line"></i> 경로 비교 결과</h4>
            <p><strong>AI 추천 경로:</strong> 4시간 21분 / 285km</p>
            <p><strong>일반 경로:</strong> 4시간 56분 / 302km</p>
            <p><strong><i class="fas fa-check-circle" style="color:green;"></i> 효과:</strong> 35분 단축, 유류비 12% 절감 예상</p>
        `;
        routeInfo.classList.remove('hidden');
    });

    // --- AI Forecast Logic ---
    document.getElementById('runForecastBtn').addEventListener('click', () => {
        const heatData = [
            [37.75, 128.87, 0.9], [37.53, 128.62, 0.7], [38.05, 128.40, 0.5],
            [37.9, 127.7, 0.4], [37.4, 128.2, 0.6], [37.6, 128.0, 0.8]
        ];
        L.heatLayer(heatData, { radius: 35, blur: 25, maxZoom: 12 }).addTo(forecastMap);
        
        const forecastInfo = document.getElementById('forecastInfo');
        forecastInfo.innerHTML = `
            <h4><i class="fas fa-fire"></i> 강원도 바이오매스 발생 예측</h4>
            <p>붉은색 지역일수록 발생 예측량이 높습니다.</p>
            <p><strong>주요 발생원:</strong> 재선충병 피해목, 숲가꾸기</p>
        `;
        forecastInfo.classList.remove('hidden');
        document.getElementById('runForecastBtn').disabled = true;
        document.getElementById('runForecastBtn').innerText = '예측 결과 표시 완료';
    });

    // --- AI Chat Logic ---
    document.getElementById('startChatBtn').addEventListener('click', (e) => {
        e.target.closest('.scenario-box').style.display = 'none';
        const chatWrapper = document.querySelector('.chat-window-wrapper');
        chatWrapper.classList.remove('hidden');
        runChatScenario();
    });

    const runChatScenario = () => {
        const chatWindow = document.querySelector('.chat-window');
        const addMessage = (text, type, delay = 0) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const msg = document.createElement('div');
                    msg.classList.add('chat-message', `${type}-message`);
                    if (type === 'bot-typing') {
                        msg.innerHTML = `<span></span><span></span><span></span>`;
                    } else {
                        msg.textContent = text;
                    }
                    chatWindow.appendChild(msg);
                    chatWindow.scrollTop = chatWindow.scrollHeight;
                    resolve(msg);
                }, delay);
            });
        };

        const userQuestion = "지금 운송 중인 화물 예상 정산액이랑, 새로 바뀐 지자체 조례에 현재 운송 경로가 저촉 안 되는지 확인해 줘.";
        
        async function sequence() {
            await addMessage(userQuestion, 'user');
            const typing = await addMessage('', 'bot-typing', 500);
            await new Promise(r => setTimeout(r, 2000));
            typing.remove();
            await addMessage("네, 김 대표님. 요청하신 내용을 분석하여 답변드립니다.", 'bot');
            await addMessage("먼저, 현재 운송 건의 예상 정산액은 다음과 같습니다.\n- 품목: 미이용 바이오매스\n- 중량: 42.5톤\n- 예상 정산액: 1,380,000원 (REC 가중치 1.5 적용)", 'bot', 1500);
            await addMessage("다음으로, 강원도 개정 조례(2025-07-01 시행)와 현재 운송 경로의 저촉 여부를 확인했습니다. 다행히 저촉되는 구간은 없습니다.", 'bot', 2000);
            await addMessage("안전 운행하세요!", 'bot', 1000);
        }
        sequence();
    };
});
