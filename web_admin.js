document.addEventListener('DOMContentLoaded', () => {

    // --- App State & Global Variables ---
    let map;
    let vehicleMarkers = L.markerClusterGroup();
    let mapLayers = {};
    const rightSidebarDynamicArea = document.getElementById('dynamic-widget-area');
    const kpiViolations = document.getElementById('kpi-violations');
    const totalVehicleCount = 48;
    
    const dashboardState = {
        violations: 0,
        activeVehicles: Math.floor(totalVehicleCount * 0.9),
        isViolationScenarioActive: false
    };

    document.getElementById('kpi-total-vehicles').innerHTML = `${totalVehicleCount} <small>대</small>`;
    document.getElementById('kpi-active-vehicles').innerHTML = `${dashboardState.activeVehicles} <small>대</small>`;
    kpiViolations.textContent = `${dashboardState.violations} 건`;

    // --- Clock ---
    const clockElement = document.getElementById('clock');
    setInterval(() => { clockElement.textContent = new Date().toLocaleString('ko-KR'); }, 1000);

    // --- Map Initialization ---
    const initMap = () => {
        map = L.map('map', { zoomControl: false }).setView([36.5, 127.5], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CARTO' }).addTo(map);
        map.addLayer(vehicleMarkers);
    };

    // --- Chart & KPI Initialization ---
    new Chart(document.getElementById('weekly-collection-chart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [{ label: '수집량 (톤)', data: [22, 25, 23, 28, 31, 35, 26], backgroundColor: 'rgba(24, 144, 255, 0.6)' }]
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
    
    // --- Right Panel Widget Control ---
    const renderWidget = (id, content) => {
        rightSidebarDynamicArea.innerHTML = '';
        const widget = document.createElement('div');
        widget.id = id;
        widget.className = 'widget flex-grow';
        widget.innerHTML = content;
        rightSidebarDynamicArea.appendChild(widget);
        return widget;
    };

    // --- Modal Control ---
    const modal = document.getElementById('feed-modal');
    const modalTitle = document.getElementById('modal-title');
    const droneVideo = document.getElementById('drone-video');
    const feedImage = document.getElementById('cctv-image');
    
    const showModal = (type, source) => {
        modalTitle.textContent = type === 'cctv' ? 'CCTV-102 실시간 영상' : 'DRONE-01 실시간 피드';
        
        if (type === 'drone') {
            feedImage.classList.add('hidden');
            droneVideo.classList.remove('hidden');
            droneVideo.src = source;
            droneVideo.play();
        } else {
            droneVideo.classList.add('hidden');
            droneVideo.pause();
            feedImage.src = source;
            feedImage.classList.remove('hidden');
        }
        modal.classList.remove('hidden');
    };
    
    const closeModal = () => {
        modal.classList.add('hidden');
        droneVideo.pause();
        droneVideo.src = ""; // Stop video loading
    };
    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- Alert Scenario ---
    const startAlertScenario = () => {
        dashboardState.isViolationScenarioActive = true;
        dashboardState.violations = 1;
        kpiViolations.textContent = `${dashboardState.violations} 건`;
        addLog('fas fa-exclamation-triangle', '새로운 위반 의심 알림 발생: 차량 34다5678');
        
        const widget = renderWidget('alert-widget', `
            <h2 class="widget-title">위반 의심 알림</h2>
            <ul class="notice-list"><li class="notice-item"><strong>허가 구역 이탈</strong><p>차량 34다5678 / 태백산맥</p></li></ul>
            <button id="back-to-main" class="action-button secondary" style="margin-top: auto;"><i class="fas fa-arrow-left"></i> 초기 화면으로</button>
        `);
        widget.querySelector('#back-to-main').addEventListener('click', renderInitialWidget);
        
        widget.querySelector('.notice-item').addEventListener('click', (e) => {
            e.currentTarget.classList.add('selected');
            map.flyTo([37.13, 128.95], 14);
            
            if (mapLayers.violation) mapLayers.violation.forEach(layer => map.removeLayer(layer));

            setTimeout(() => {
                const permittedArea = L.polygon([[37.15, 128.92], [37.15, 128.98], [37.11, 128.98], [37.11, 128.92]], { color: '#52c41a', fillOpacity: 0.1 });
                const violationMarker = L.marker([37.14, 128.99], { icon: createVehicleIcon('danger') }).bindPopup('<b>차량 34다5678</b>').openPopup();
                const cctvMarker = L.marker([37.148, 128.97], { icon: L.divIcon({ html: '<i class="fas fa-video" style="color:#595959; font-size:20px;"></i>' }) });
                const patrolMarker = L.marker([37.10, 128.93], { icon: L.divIcon({ html: '<i class="fas fa-car-side" style="color:#fa8c16; font-size:20px;"></i>' }) }).bindPopup('순찰팀 02 (ETA: 12분)');

                mapLayers.violation = [permittedArea, violationMarker, cctvMarker, patrolMarker];
                mapLayers.violation.forEach(layer => layer.addTo(map));
                
                cctvMarker.on('click', () => showModal('cctv', 'https://placehold.co/600x400/333333/FFFFFF?text=CCTV+Feed'));

                renderActionPanel();
            }, 2000);
        });
    };

    const renderActionPanel = () => {
        const widget = renderWidget('action-widget', `
            <h2 class="widget-title">상세 정보 및 조치</h2>
            <div class="info-group"><p><strong>차량:</strong> 34다5678 (박현준)</p><p><strong>상태:</strong> <span class="accent-red">허가 구역 이탈 (450m)</span></p></div>
            <button id="drone-btn" class="action-button secondary"><i class="fas fa-helicopter"></i> 드론 출동</button>
            <button id="report-btn" class="action-button primary" disabled><i class="fas fa-file-alt"></i> 보고서 생성</button>
            <button id="back-to-main" class="action-button secondary" style="margin-top: auto;"><i class="fas fa-arrow-left"></i> 초기 화면으로</button>
        `);
        widget.querySelector('#back-to-main').addEventListener('click', renderInitialWidget);

        widget.querySelector('#drone-btn').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 드론 출동 중...';
            btn.disabled = true;
            addLog('fas fa-helicopter', '드론을 현장으로 출동시켰습니다.');
            
            const drone = L.marker([37.18, 128.93], { icon: L.divIcon({ html: '<i class="fas fa-helicopter" style="font-size:24px;"></i>' }) }).addTo(map);
            mapLayers.violation.push(drone);
            setTimeout(() => {
                drone.setLatLng([37.14, 128.99]);
                showModal('drone', 'img/드론영상.mp4');
                btn.innerHTML = '<i class="fas fa-check"></i> 드론 현장 도착';
                widget.querySelector('#report-btn').disabled = false;
            }, 4000);
        });
        
        widget.querySelector('#report-btn').addEventListener('click', (e) => {
             const btn = e.currentTarget;
             btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 생성 중...';
             btn.disabled = true;
             setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> 생성 완료';
                btn.classList.add('success');
             }, 2000);
        });
    };

    // --- AI Chatbot ---
    const renderChatbotWidget = () => {
        const widget = renderWidget('chatbot-widget', `
            <h2 class="widget-title"><i class="fas fa-robot"></i> AI 분석 챗봇</h2>
            <div class="chat-container">
                <div class="chat-window"><div class="chat-message bot-message">무엇을 분석해드릴까요?</div></div>
                <div class="chat-suggestion-area">
                    <p class="suggestion-title">추천 질문:</p>
                    <button class="suggestion-btn" data-query="금일 현황 요약 보고">금일 현황 요약</button>
                    <button class="suggestion-btn" data-query="최신 REC 정책 변경사항">REC 정책 변경</button>
                    <button class="suggestion-btn" data-query="위반 차량 조치 현황 보고">위반 차량 조치 현황</button>
                </div>
            </div>
            <button id="start-alert-demo" class="action-button primary" style="margin-top:16px;"><i class="fas fa-play"></i> 위반 의심 분석 시작</button>
        `);
        widget.querySelector('#start-alert-demo').addEventListener('click', startAlertScenario);
        
        const chatWindow = widget.querySelector('.chat-window');
        widget.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                const queryText = btn.textContent.trim();
                addChatMessage(queryText, 'user', chatWindow);
                simulateRag(query, chatWindow);
            });
        });
    };
    const addChatMessage = (message, type, chatWindow) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${type}-message`;
        msgDiv.innerHTML = message;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return msgDiv;
    };
    
    const simulateRag = async (query, chatWindow) => {
        const ragContainer = addChatMessage('<div class="rag-source"><strong>데이터 검색 중...</strong></div>', 'bot', chatWindow);

        const sources = {
            '금일 현황 요약 보고': ['<i class="fas fa-database"></i> 실시간 자산 DB', '<i class="fas fa-history"></i> 이벤트 로그'],
            '최신 REC 정책 변경사항': ['<i class="fas fa-file-alt"></i> 산림자원법 DB', '<i class="fas fa-bullhorn"></i> 최신 고시 문서'],
            '위반 차량 조치 현황 보고': ['<i class="fas fa-folder-open"></i> 사건 기록 DB']
        };
        
        const sourceList = sources[query] || [];
        for (let i = 0; i < sourceList.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            ragContainer.innerHTML += `<div class="rag-source-item" style="animation-delay: ${i*0.1}s">${sourceList[i]}</div>`;
        }

        setTimeout(() => {
            let response = "";
            if (query.includes('요약')) {
                response = `금일 현황 보고: 총 ${totalVehicleCount}대 중 ${dashboardState.activeVehicles}대 운행 중. 현재까지 ${dashboardState.violations}건의 위반 의심 사례가 있었습니다.`;
            } else if (query.includes('REC')) {
                response = "정책 분석 결과: 산림자원법 시행령 개정(2025-07-01)에 따라, 미이용 산림 바이오매스 REC 가중치가 1.5에서 1.2로 조정될 예정입니다.";
            } else if (query.includes('조치 현황')) {
                if (dashboardState.isViolationScenarioActive) {
                    response = "사건번호 2025-0812-01 (차량 34다5678) 건: 드론 출동하여 증거 영상 확보 완료. 보고서 생성 대기 중입니다.";
                } else {
                    response = "현재 추적 중인 위반 사례가 없습니다.";
                }
            }
            addChatMessage(response, 'bot', chatWindow);
        }, 1000 + sourceList.length * 800);
    };

    const renderInitialWidget = () => {
        if (mapLayers.violation) {
            mapLayers.violation.forEach(layer => map.removeLayer(layer));
            delete mapLayers.violation;
        }
        dashboardState.isViolationScenarioActive = false;
        dashboardState.violations = 0;
        kpiViolations.textContent = `${dashboardState.violations} 건`;
        map.flyTo([36.5, 127.5], 7);
        renderChatbotWidget();
    };

    // --- Initial Load ---
    initMap();
    generateVehicles(totalVehicleCount);
    addLog('fas fa-check-circle', '시스템이 성공적으로 시작되었습니다.');
    renderInitialWidget();
});
