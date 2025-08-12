document.addEventListener('DOMContentLoaded', () => {

    // --- App State & Global Variables ---
    let map;
    let vehicleMarkers = L.markerClusterGroup();
    let mapLayers = {};
    const kpiViolations = document.getElementById('kpi-violations');
    const totalVehicleCount = 48;
    document.getElementById('kpi-total-vehicles').innerHTML = `${totalVehicleCount} <small>대</small>`;
    document.getElementById('kpi-active-vehicles').innerHTML = `${Math.floor(totalVehicleCount * 0.9)} <small>대</small>`;


    // --- Clock ---
    const clockElement = document.getElementById('clock');
    const updateClock = () => {
        clockElement.textContent = new Date().toLocaleString('ko-KR');
    };
    setInterval(updateClock, 1000);
    updateClock();

    // --- Map Initialization ---
    const initMap = () => {
        map = L.map('map', { zoomControl: false }).setView([36.5, 127.5], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO'
        }).addTo(map);
        map.addLayer(vehicleMarkers);
    };

    // --- Chart & KPI Initialization ---
    new Chart(document.getElementById('weekly-collection-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [{
                label: '수집량 (톤)',
                data: [22, 25, 23, 28, 31, 35, 26],
                backgroundColor: 'rgba(24, 144, 255, 0.6)',
                borderColor: 'rgba(24, 144, 255, 1)',
                borderWidth: 1
            }]
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    setTimeout(() => { document.getElementById('carbon-progress-bar').style.width = '64.2%'; }, 500);

    // --- Event Log ---
    const eventLog = document.getElementById('event-log');
    const addLog = (icon, message) => {
        const li = document.createElement('li');
        li.className = 'log-item';
        li.innerHTML = `<i class="log-icon ${icon}"></i><span class="log-message">${message}</span>`;
        eventLog.prepend(li);
        if (eventLog.children.length > 20) eventLog.lastChild.remove();
    };
    
    // --- Vehicle Simulation ---
    const forestCoordinates = [
        [38.12, 128.46], [35.33, 127.73], [37.10, 128.98], [36.85, 128.25],
        [37.75, 127.92], [36.57, 129.18], [35.40, 127.65], [37.17, 128.88]
    ];
    const getRandomForestCoordinate = () => {
        const base = forestCoordinates[Math.floor(Math.random() * forestCoordinates.length)];
        return [base[0] + (Math.random() - 0.5) * 0.2, base[1] + (Math.random() - 0.5) * 0.2];
    };
    const createVehicleIcon = (status) => {
        const color = status === 'danger' ? '#f5222d' : status === 'idle' ? '#faad14' : '#52c41a';
        return L.divIcon({
            html: `<i class="fas fa-truck" style="color: ${color}; font-size: 18px;"></i>`,
            className: 'vehicle-marker', iconSize: [20, 20], iconAnchor: [10, 10]
        });
    };
    const generateVehicles = (count) => {
        for (let i = 0; i < count; i++) {
            const status = Math.random() > 0.95 ? 'danger' : Math.random() > 0.8 ? 'idle' : 'normal';
            const marker = L.marker(getRandomForestCoordinate(), { icon: createVehicleIcon(status) });
            marker.options.vehicleData = { id: 1000 + i, status: status };
            vehicleMarkers.addLayer(marker);
        }
    };
    
    // --- Scenario Control ---
    const clearScenarioLayers = () => {
        if (mapLayers.violation) {
            mapLayers.violation.forEach(layer => map.removeLayer(layer));
            delete mapLayers.violation;
        }
    };

    // --- Alert Scenario ---
    const startAlertScenario = () => {
        clearScenarioLayers();
        kpiViolations.textContent = '1 건';
        addLog('fas fa-exclamation-triangle', '새로운 위반 의심 알림 발생');

        const scenarioWidget = document.getElementById('scenario-widget');
        scenarioWidget.innerHTML = `
            <h2 class="widget-title">위반 의심 알림</h2>
            <ul class="notice-list"><li class="notice-item"><strong>허가 구역 이탈</strong><p>차량 34다5678 / 태백산맥</p></li></ul>`;
        
        scenarioWidget.querySelector('.notice-item').addEventListener('click', (e) => {
            e.currentTarget.classList.add('selected');
            map.flyTo([37.13, 128.95], 14);
            
            setTimeout(() => {
                const permittedArea = L.polygon([[37.15, 128.92], [37.15, 128.98], [37.11, 128.98], [37.11, 128.92]], { color: '#52c41a', fillOpacity: 0.1 });
                const vehiclePath = L.polyline([[37.13, 128.93], [37.14, 128.94], [37.145, 128.96], [37.14, 128.99]], { color: '#1890ff' });
                const violationMarker = L.marker([37.14, 128.99], { icon: createVehicleIcon('danger') })
                    .bindPopup('<b>차량 34다5678</b><br>허가 구역 450m 이탈').openPopup();
                
                mapLayers.violation = [permittedArea, vehiclePath, violationMarker];
                mapLayers.violation.forEach(layer => layer.addTo(map));
            }, 2000);
        });
    };
    document.getElementById('start-alert-demo').addEventListener('click', startAlertScenario);

    // --- AI Chatbot ---
    const chatInput = document.querySelector('.chat-input');
    const chatWindow = document.querySelector('.chat-window');
    const chatSendBtn = document.getElementById('chat-send-btn');

    const handleChat = () => {
        const question = chatInput.value;
        if (!question) return;

        chatWindow.innerHTML += `<div class="chat-message user-message">${question}</div>`;
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        setTimeout(() => {
            chatWindow.innerHTML += `<div class="chat-message bot-message">네, '${question}' 조건으로 지도 데이터를 필터링합니다.</div>`;
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
            let filterStatus = 'all';
            if (question.includes('위험') || question.includes('danger')) {
                filterStatus = 'danger';
            } else if (question.includes('정차') || question.includes('idle')) {
                filterStatus = 'idle';
            }

            vehicleMarkers.eachLayer(marker => {
                if (filterStatus === 'all' || marker.options.vehicleData.status === filterStatus) {
                    marker.setOpacity(1);
                } else {
                    marker.setOpacity(0.1);
                }
            });
            addLog('fas fa-search', `AI 챗봇이 '${filterStatus}' 상태 차량을 필터링했습니다.`);
        }, 1500);
    };

    chatSendBtn.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    // --- Initial Load ---
    initMap();
    generateVehicles(totalVehicleCount);
    addLog('fas fa-check-circle', '시스템이 성공적으로 시작되었습니다.');
});
