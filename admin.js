document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements & Global State ---
    const kpiPanel = document.getElementById('kpi-panel');
    const scenarioPanel = document.getElementById('scenario-panel');
    const startDemoBtn = document.getElementById('start-demo-btn');
    let map; // To be initialized later
    let demoInterval; // For KPI updates

    // --- Map Initialization ---
    const initMap = () => {
        map = L.map('map').setView([36.5, 127.5], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);
    };

    // --- KPI Dashboard Logic ---
    const updateKpi = () => {
        const volumeEl = document.getElementById('kpi-volume');
        const vehiclesEl = document.getElementById('kpi-vehicles');
        
        let currentVolume = 1254 + Math.floor(Math.random() * 10);
        let currentVehicles = 82 + (Math.random() > 0.5 ? 1 : -1);
        if (currentVehicles < 80) currentVehicles = 80;

        volumeEl.textContent = `${currentVolume.toLocaleString()} 톤`;
        vehiclesEl.textContent = `${currentVehicles} 대`;
    };

    // --- Demo Scenario Functions ---
    const demoSteps = {
        start: () => {
            scenarioPanel.classList.remove('show');
            if (demoInterval) clearInterval(demoInterval); // Stop previous interval if any
            setTimeout(demoSteps.showAlert, 600);
        },

        showAlert: () => {
            const alertPanel = createPanel('alert-panel', 'right-panel', `
                <div class="panel-header"><i class="fas fa-exclamation-triangle"></i><h2>이상 징후 발생</h2></div>
                <div class="panel-content">
                    <div id="alert-item" class="alert-item">
                        <strong>[주의] 허가 구역 이탈</strong>
                        <p>차량 12가3456 (운전자: 김철수)</p>
                    </div>
                </div>`);
            document.getElementById('alert-item').addEventListener('click', demoSteps.investigate);
        },

        investigate: () => {
            hideAndRemovePanel('alert-panel');
            
            const violationAreaCenter = [35.237, 128.686];
            map.flyTo(violationAreaCenter, 14, { animate: true, duration: 2.5 });

            setTimeout(() => {
                const permittedAreaCoords = [[35.240, 128.680], [35.242, 128.695], [35.235, 128.698], [35.230, 128.685]];
                const vehiclePathCoords = [[35.238, 128.682], [35.239, 128.688], [35.236, 128.692], [35.233, 128.699]];
                const violationPoint = vehiclePathCoords[vehiclePathCoords.length - 1];

                L.polygon(permittedAreaCoords, { color: 'green', fillColor: '#00ff00', fillOpacity: 0.2 }).addTo(map);
                L.polyline(vehiclePathCoords, { color: 'blue' }).addTo(map);

                const violationIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
                });
                
                const popupContent = `
                    <div class="custom-popup">
                        <h3><i class="fas fa-car-crash"></i> 이탈 정보</h3>
                        <p><strong>차량:</strong> 12가3456</p>
                        <p><strong>운전자:</strong> 김철수</p>
                        <p><strong>이탈 시간:</strong> 16분 전</p>
                        <p class="danger-text"><strong>상태:</strong> 허가 구역 경계 250m 이탈</p>
                    </div>`;

                L.marker(violationPoint, { icon: violationIcon }).addTo(map).bindPopup(popupContent).openPopup();
                
                setTimeout(demoSteps.showActions, 2000);
            }, 2500);
        },

        showActions: () => {
            const actionPanel = createPanel('action-panel', 'right-panel', `
                <div class="panel-header"><i class="fas fa-cogs"></i><h2>후속 조치</h2></div>
                <div class="panel-content">
                    <p>이상 징후가 확인되었습니다. 다음 조치를 실행할 수 있습니다.</p>
                    <button id="contact-btn"><i class="fas fa-phone-alt"></i> 현장 담당자에게 연락</button>
                    <button id="report-btn"><i class="fas fa-file-alt"></i> 원클릭 보고서 생성</button>
                </div>`);
            document.getElementById('report-btn').addEventListener('click', demoSteps.generateReport);
            document.getElementById('contact-btn').addEventListener('click', () => alert('시연: 담당자에게 연락을 시도합니다.'));
        },

        generateReport: () => {
            const btn = document.getElementById('report-btn');
            btn.classList.add('loading');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 보고서 생성 중...';
            btn.disabled = true;

            setTimeout(() => {
                btn.classList.remove('loading');
                btn.style.backgroundColor = 'var(--success-color)';
                btn.innerHTML = '<i class="fas fa-check-circle"></i> 생성 완료 (Incident_Report_2025.pdf)';
                
                const actionPanel = document.getElementById('action-panel');
                const successMsg = document.createElement('p');
                successMsg.style.cssText = 'color: var(--success-color); font-weight: bold; text-align: center; margin-top: 10px;';
                successMsg.textContent = '보고서가 성공적으로 생성되었습니다.';
                actionPanel.querySelector('.panel-content').appendChild(successMsg);
            }, 2500);
        }
    };

    // --- Helper Functions for Panels ---
    const createPanel = (id, positionClass, innerHTML) => {
        const panel = document.createElement('div');
        panel.id = id;
        panel.className = `panel ${positionClass}`;
        panel.innerHTML = innerHTML;
        document.body.appendChild(panel);
        setTimeout(() => panel.classList.add('show'), 100);
        return panel;
    };

    const hideAndRemovePanel = (id) => {
        const panel = document.getElementById(id);
        if (panel) {
            panel.classList.remove('show');
            setTimeout(() => panel.remove(), 700);
        }
    };

    // --- Initial Setup ---
    const initialize = () => {
        initMap();
        kpiPanel.classList.add('show');
        scenarioPanel.classList.add('show');
        demoInterval = setInterval(updateKpi, 2000);
        startDemoBtn.addEventListener('click', demoSteps.start);
    };

    initialize();
});
