document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements & Global State ---
    const bottomSheet = document.getElementById('bottom-sheet');
    const panelContent = document.getElementById('panel-content');
    let map;

    // --- Map Initialization ---
    const initMap = () => {
        map = L.map('map', { zoomControl: false }).setView([36.5, 127.5], 7);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO'
        }).addTo(map);
    };

    // --- Panel Content Templates ---
    const templates = {
        initial: `
            <div class="widget">
                <div class="kpi-grid">
                    <div><span class="kpi-label">금일 수집량</span><span class="kpi-value">1,254 톤</span></div>
                    <div><span class="kpi-label">운행 차량</span><span class="kpi-value">82 대</span></div>
                    <div><span class="kpi-label">평균 함수율</span><span class="kpi-value">45.8 %</span></div>
                </div>
                <hr style="border:none; border-top:1px solid #e2e8f0; margin: 20px 0;">
                <h2 class="widget-title"><i class="fas fa-video"></i> 시나리오</h2>
                <p class="scenario-desc">AI가 감지한 이상 징후를 분석하고, 원클릭 보고서를 생성하는 과정을 시연합니다.</p>
                <button id="start-demo-btn" class="action-button start"><i class="fas fa-play-circle"></i> 시연 시작</button>
            </div>`,
        alert: `
            <div class="widget">
                <h2 class="widget-title"><i class="fas fa-exclamation-triangle" style="color:var(--warning-color);"></i> 이상 징후 발생</h2>
                <div id="alert-item" class="alert-item">
                    <strong>허가 구역 이탈</strong>
                    <p>차량 12가3456 (운전자: 김철수)</p>
                </div>
            </div>`,
        action: `
            <div class="widget">
                <h2 class="widget-title"><i class="fas fa-cogs" style="color:var(--success-color);"></i> 상세 정보 및 조치</h2>
                <p><strong>차량:</strong> 12가3456 (김철수)</p>
                <p><strong>상태:</strong> <span style="color:var(--danger-color); font-weight:bold;">허가 구역 이탈 (310m)</span></p>
                <button id="contact-btn" class="action-button contact"><i class="fas fa-phone-alt"></i> 현장 담당자 연락</button>
                <button id="report-btn" class="action-button report"><i class="fas fa-file-alt"></i> 원클릭 보고서 생성</button>
            </div>`
    };

    // --- Panel Control ---
    const updatePanel = (content) => {
        panelContent.innerHTML = content;
        // Re-add event listeners for new content
        const startBtn = document.getElementById('start-demo-btn');
        if (startBtn) startBtn.addEventListener('click', demoSteps.start);
        
        const alertItem = document.getElementById('alert-item');
        if (alertItem) alertItem.addEventListener('click', demoSteps.investigate);

        const reportBtn = document.getElementById('report-btn');
        if (reportBtn) reportBtn.addEventListener('click', demoSteps.generateReport);
        
        const contactBtn = document.getElementById('contact-btn');
        if (contactBtn) contactBtn.addEventListener('click', () => alert('시연: 담당자에게 연락을 시도합니다.'));
    };

    // --- Demo Scenario Steps ---
    const demoSteps = {
        start: () => {
            const btn = document.getElementById('start-demo-btn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 시나리오 진행 중...';
            btn.disabled = true;
            setTimeout(() => updatePanel(templates.alert), 1500);
        },
        investigate: () => {
            bottomSheet.classList.add('partial-hide'); // Partially hide panel
            
            const violationAreaCenter = [35.237, 128.686];
            map.flyTo(violationAreaCenter, 14, { animate: true, duration: 2.5 });

            setTimeout(() => {
                const permittedArea = L.polygon([[35.240, 128.680], [35.242, 128.695], [35.235, 128.698], [35.230, 128.685]], { color: 'green', fillOpacity: 0.2 });
                const vehiclePath = L.polyline([[35.238, 128.682], [35.239, 128.688], [35.236, 128.692], [35.233, 128.699]], { color: 'blue' });
                const violationMarker = L.marker([35.233, 128.699], {
                    icon: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', iconSize: [25, 41], iconAnchor: [12, 41] })
                }).bindPopup('<div class="custom-popup"><h3><i class="fas fa-car-crash"></i> 이탈 정보</h3><p><strong>차량:</strong> 12가3456</p><p class="danger-text"><strong>상태:</strong> 허가 구역 310m 이탈</p></div>').openPopup();

                map.addLayer(permittedArea).addLayer(vehiclePath).addLayer(violationMarker);
                
                updatePanel(templates.action);
                bottomSheet.classList.remove('partial-hide');
            }, 2500);
        },
        generateReport: () => {
            const btn = document.getElementById('report-btn');
            btn.classList.add('loading');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 보고서 생성 중...';
            btn.disabled = true;

            setTimeout(() => {
                btn.classList.remove('loading');
                btn.classList.add('success');
                btn.innerHTML = '<i class="fas fa-check-circle"></i> 생성 완료 (다운로드)';
                btn.disabled = false;
                btn.onclick = () => alert('시연: Incident_Report_2025.pdf 파일 다운로드를 시작합니다.');
            }, 2500);
        }
    };

    // --- Initial Setup ---
    const initialize = () => {
        initMap();
        updatePanel(templates.initial);
        setTimeout(() => bottomSheet.classList.add('show'), 500);
    };

    initialize();
});
