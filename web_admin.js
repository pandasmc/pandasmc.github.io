document.addEventListener('DOMContentLoaded', () => {

    // --- Clock ---
    const clockElement = document.getElementById('clock');
    const updateClock = () => {
        const now = new Date();
        clockElement.textContent = now.toLocaleTimeString('ko-KR');
    };
    setInterval(updateClock, 1000);
    updateClock();

    // --- Map Initialization ---
    const map = L.map('map', { zoomControl: false }).setView([36.5, 127.5], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO', maxZoom: 20
    }).addTo(map);

    // --- Charts Initialization ---
    const createChart = (ctx, type, data, options = {}) => new Chart(ctx, { type, data, options });
    const chartOptions = {
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: 'rgba(204, 214, 246, 0.8)' } } },
        scales: {
            y: { ticks: { color: 'rgba(204, 214, 246, 0.8)' }, grid: { color: 'rgba(0, 199, 255, 0.1)' } },
            x: { ticks: { color: 'rgba(204, 214, 246, 0.8)' }, grid: { color: 'rgba(0, 199, 255, 0.1)' } }
        }
    };
    const statusChart = createChart(document.getElementById('statusChart').getContext('2d'), 'doughnut', {
        labels: ['정상 운행', '정차', '점검 중'],
        datasets: [{ data: [873, 33, 16], backgroundColor: ['#64ffda', '#00c7ff', '#ff647c'], borderColor: '#0a192f', borderWidth: 3 }]
    }, { ...chartOptions, cutout: '70%' });
    const collectionChart = createChart(document.getElementById('collectionChart').getContext('2d'), 'bar', {
        labels: ['강원', '경기', '충청', '경상', '전라'],
        datasets: [{ label: '수집량 (톤)', data: [280, 150, 210, 350, 260], backgroundColor: 'rgba(0, 199, 255, 0.5)', borderColor: 'rgba(0, 199, 255, 1)', borderWidth: 1 }]
    }, chartOptions);

    // --- Demo Scenario ---
    const startDemoBtn = document.getElementById('start-demo-btn');
    const rightPanel = document.getElementById('right-panel-container');
    let demoRunning = false;

    const demoSteps = {
        start: () => {
            if (demoRunning) return;
            demoRunning = true;
            startDemoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 시나리오 진행 중';
            startDemoBtn.disabled = true;

            setTimeout(demoSteps.showAlert, 1000);
        },
        showAlert: () => {
            const initialWidget = document.getElementById('initial-widget');
            if(initialWidget) initialWidget.style.display = 'none';
            
            const alertWidget = document.createElement('div');
            alertWidget.id = 'alert-widget';
            alertWidget.className = 'widget';
            alertWidget.innerHTML = `
                <h2 class="widget-title"><i class="fas fa-exclamation-triangle"></i> 이상 징후 알림</h2>
                <ul id="notice-list" class="notice-list">
                    <li class="notice-item">
                        <strong>허가 구역 이탈</strong>
                        <p>차량 12가3456 / 강원 춘천</p>
                    </li>
                </ul>`;
            rightPanel.appendChild(alertWidget);
            
            alertWidget.querySelector('.notice-item').addEventListener('click', (e) => {
                e.currentTarget.classList.add('selected');
                demoSteps.investigate();
            });
        },
        investigate: () => {
            const violationAreaCenter = [37.88, 127.73];
            map.flyTo(violationAreaCenter, 13, { animate: true, duration: 2 });

            setTimeout(() => {
                const permittedArea = L.polygon([[37.90, 127.70], [37.90, 127.76], [37.86, 127.76], [37.86, 127.70]], { color: '#64ffda', fillOpacity: 0.1 });
                const vehiclePath = L.polyline([[37.88, 127.71], [37.89, 127.72], [37.895, 127.74], [37.89, 127.77]], { color: '#00c7ff' });
                const violationMarker = L.marker([37.89, 127.77], {
                    icon: L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png', iconSize: [25, 41], iconAnchor: [12, 41] })
                }).bindPopup('<h3><i class="fas fa-car-crash"></i> 이탈 정보</h3><p><strong>차량:</strong> 12가3456</p><p><strong>상태:</strong> 허가 구역 310m 이탈</p>').openPopup();

                map.addLayer(permittedArea).addLayer(vehiclePath).addLayer(violationMarker);
                
                demoSteps.showActionPanel();
            }, 2000);
        },
        showActionPanel: () => {
            const alertWidget = document.getElementById('alert-widget');
            if(alertWidget) alertWidget.remove();

            const actionWidget = document.createElement('div');
            actionWidget.id = 'action-widget';
            actionWidget.className = 'widget';
            actionWidget.innerHTML = `
                <h2 class="widget-title"><i class="fas fa-cogs"></i> 상세 정보 및 조치</h2>
                <p><strong>차량:</strong> 12가3456 (김철수)</p>
                <p><strong>위치:</strong> 강원도 춘천시 동면</p>
                <p><strong>상태:</strong> <span style="color:var(--highlight-red)">허가 구역 이탈 (310m)</span></p>
                <button id="contact-btn" class="action-button contact"><i class="fas fa-phone-alt"></i> 현장 담당자 연락</button>
                <button id="report-btn" class="action-button"><i class="fas fa-file-alt"></i> 원클릭 보고서 생성</button>
            `;
            rightPanel.appendChild(actionWidget);

            actionWidget.querySelector('#report-btn').addEventListener('click', demoSteps.generateReport);
            actionWidget.querySelector('#contact-btn').addEventListener('click', () => alert('시연: 담당자에게 연락을 시도합니다.'));
        },
        generateReport: (e) => {
            const btn = e.currentTarget;
            btn.classList.add('loading');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 보고서 생성 중...';
            btn.disabled = true;

            setTimeout(() => {
                btn.classList.remove('loading');
                btn.classList.add('success');
                btn.innerHTML = '<i class="fas fa-check-circle"></i> 생성 완료 (다운로드)';
                btn.disabled = false;
                // In a real app, this would trigger a file download.
                btn.onclick = () => alert('시연: Incident_Report_2025.pdf 파일 다운로드를 시작합니다.');
            }, 2500);
        }
    };

    startDemoBtn.addEventListener('click', demoSteps.start);
});
