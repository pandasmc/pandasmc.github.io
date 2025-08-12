document.addEventListener('DOMContentLoaded', () => {

    // --- App State & DOM Elements ---
    const app = {
        maps: {
            route: null,
            forecast: null
        },
        elements: {
            tabs: document.querySelectorAll('.tab-button'),
            contents: document.querySelectorAll('.tab-content'),
            // Demo 1: Route Planner
            findRouteBtn: document.getElementById('findRouteBtn'),
            routeDemoContainer: document.getElementById('route-demo-container'),
            routeInfo: document.getElementById('routeInfo'),
            // Demo 2: Forecast
            runForecastBtn: document.getElementById('runForecastBtn'),
            forecastDemoContainer: document.getElementById('forecast-demo-container'),
            forecastInfo: document.getElementById('forecastInfo'),
            forecastQuarterSelect: document.getElementById('forecast-quarter'),
            // Demo 3: Chat
            startChatBtn: document.getElementById('startChatBtn'),
            chatDemoContainer: document.getElementById('chat-demo-container'),
            chatWindow: document.querySelector('#chat-demo-container .chat-window')
        }
    };

    // --- Generic Map Initializer ---
    const initMap = (containerId, view, zoom) => {
        const map = L.map(containerId, { zoomControl: false }).setView(view, zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);
        return map;
    };

    // --- Clear Layers Helper ---
    const clearMapLayers = (map) => {
        map.eachLayer(layer => {
            if (!layer.options.attribution) { // Keep the base tile layer
                map.removeLayer(layer);
            }
        });
    };

    // --- Tab Switching Logic ---
    app.elements.tabs.forEach(button => {
        button.addEventListener('click', () => {
            app.elements.tabs.forEach(btn => btn.classList.remove('active'));
            app.elements.contents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Demo 1: Route Optimization ---
    const runRouteDemo = () => {
        app.elements.routeDemoContainer.classList.remove('hidden');
        
        if (!app.maps.route) {
            app.maps.route = initMap('routeMap', [36.7, 127.2], 8);
        }
        clearMapLayers(app.maps.route);
        app.maps.route.invalidateSize(); // Recalculate map size

        const start = { lat: 37.88, lng: 127.73, name: '춘천' };
        const end = { lat: 36.99, lng: 126.69, name: '당진' };
        const aiRoute = [[37.88, 127.73], [37.34, 127.92], [36.8, 127.1], [36.99, 126.69]];
        const normalRoute = [[37.88, 127.73], [37.5, 127.8], [37.34, 127.92], [36.35, 127.38], [36.99, 126.69]];

        L.polyline(aiRoute, { color: '#2c5282', weight: 7, opacity: 0.9 }).addTo(app.maps.route).bindPopup('<b>AI 추천 최적 경로</b>');
        L.polyline(normalRoute, { color: '#a0aec0', weight: 5, dashArray: '10, 10' }).addTo(app.maps.route).bindPopup('일반 경로');
        
        L.marker([start.lat, start.lng]).addTo(app.maps.route).bindPopup(start.name);
        L.marker([end.lat, end.lng]).addTo(app.maps.route).bindPopup(end.name);
        
        app.maps.route.fitBounds(L.polyline(normalRoute).getBounds(), { padding: [40, 40] });
        
        app.elements.routeInfo.innerHTML = `
            <h4><i class="fas fa-chart-line"></i> 경로 비교 결과</h4>
            <p><strong>AI 추천 경로:</strong> <span class="highlight">4시간 21분 / 285km</span></p>
            <p><strong>일반 경로:</strong> 4시간 56분 / 302km</p>
            <p><i class="fas fa-info-circle"></i> AI는 실시간 교통정보와 포장/비포장 임도 데이터를 분석하여 최적 경로를 추천합니다.</p>
        `;
        app.elements.routeInfo.classList.remove('hidden');
    };

    // --- Demo 2: AI Supply/Demand Forecast ---
    const runForecastDemo = () => {
        app.elements.forecastDemoContainer.classList.remove('hidden');

        if (!app.maps.forecast) {
            app.maps.forecast = initMap('forecastMap', [37.8, 128.2], 8);
        }
        clearMapLayers(app.maps.forecast);
        app.maps.forecast.invalidateSize();

        const selectedQuarter = app.elements.forecastQuarterSelect.value;
        const heatData = selectedQuarter === 'q3' 
            ? [[37.75, 128.87, 0.9], [37.53, 128.62, 0.7], [38.05, 128.40, 0.5]]
            : [[37.9, 127.7, 0.8], [37.4, 128.2, 0.6], [37.6, 128.0, 0.9]];
        
        L.heatLayer(heatData, { radius: 40, blur: 30, maxZoom: 12, gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'} }).addTo(app.maps.forecast);
        
        app.elements.forecastInfo.innerHTML = `
            <h4><i class="fas fa-fire"></i> ${selectedQuarter === 'q3' ? '3분기' : '4분기'} 바이오매스 발생 예측</h4>
            <p><strong>분석 지역:</strong> 강원도</p>
            <p><strong>주요 발생원:</strong> ${selectedQuarter === 'q3' ? '재선충병 피해목' : '숲가꾸기 사업'}</p>
            <p class="highlight"><strong>결론:</strong> ${selectedQuarter === 'q3' ? '영동' : '영서'} 지역 중심의 수집 계획 필요</p>
        `;
        app.elements.forecastInfo.classList.remove('hidden');
    };

    // --- Demo 3: AI Assistant ---
    const runChatDemo = () => {
        app.elements.chatDemoContainer.classList.remove('hidden');
        app.elements.chatWindow.innerHTML = ''; // Clear previous chat

        const addMessage = (text, type, delay = 0) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const msg = document.createElement('div');
                    msg.classList.add('chat-message', `${type}-message`);
                    if (type === 'bot-typing') {
                        msg.innerHTML = `<span></span><span></span><span></span>`;
                    } else {
                        msg.innerHTML = text;
                    }
                    app.elements.chatWindow.appendChild(msg);
                    app.elements.chatWindow.scrollTop = app.elements.chatWindow.scrollHeight;
                    resolve(msg);
                }, delay);
            });
        };

        const userQuestion = "지금 운송 중인 화물 예상 정산액이랑, 새로 바뀐 지자체 조례에 현재 운송 경로가 저촉 안 되는지 확인해 줘.";
        
        async function sequence() {
            await addMessage(userQuestion, 'user');
            const typing = await addMessage('', 'bot-typing', 500);
            await new Promise(r => setTimeout(r, 1500));
            typing.remove();

            await addMessage("네, 김 대표님. 요청하신 내용을 분석합니다.", 'bot');
            await addMessage("<i class='fas fa-database'></i> 실시간 운송 DB 조회 중...", 'bot-source-info', 1000);
            await addMessage("<strong>예상 정산액:</strong> 1,380,000원 (REC 가중치 1.5 적용)", 'bot', 1500);
            await addMessage("<i class='fas fa-book'></i> 강원도 개정 조례 DB 확인 중...", 'bot-source-info', 1000);
            await addMessage("<strong>조례 저촉 여부:</strong> 특이사항 없음. 현재 운송 경로는 개정 조례에 저촉되지 않습니다.", 'bot', 2000);
            await addMessage("안전 운행하세요!", 'bot', 1000);
        }
        sequence();
    };

    // --- Event Listeners ---
    app.elements.findRouteBtn.addEventListener('click', runRouteDemo);
    app.elements.runForecastBtn.addEventListener('click', runForecastDemo);
    app.elements.startChatBtn.addEventListener('click', (e) => {
        e.target.closest('.scenario-box').classList.add('hidden');
        runChatDemo();
    });

});
