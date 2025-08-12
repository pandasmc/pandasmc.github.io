document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const scenarioPanel = document.getElementById('scenario-panel');
    const startDemoBtn = document.getElementById('start-demo-btn');

    // --- Map Initialization ---
    const map = L.map('map').setView([36.5, 127.5], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Show scenario panel on load
    setTimeout(() => scenarioPanel.classList.add('show'), 500);

    // --- Scenario Data ---
    const violationAreaCenter = [35.237, 128.686];
    const permittedAreaCoords = [[35.240, 128.680], [35.242, 128.695], [35.235, 128.698], [35.230, 128.685]];
    const vehiclePathCoords = [[35.238, 128.682], [35.239, 128.688], [35.236, 128.692], [35.233, 128.699]];
    const violationPoint = vehiclePathCoords[vehiclePathCoords.length - 1];

    // --- Demo Logic ---
    startDemoBtn.addEventListener('click', () => {
        // Hide the scenario panel
        scenarioPanel.classList.remove('show');

        // After a short delay, show the animated alert
        setTimeout(createAndShowAlert, 600);
    });

    function createAndShowAlert() {
        const alertPanel = document.createElement('div');
        alertPanel.id = 'alert-panel';
        alertPanel.className = 'panel';
        alertPanel.innerHTML = `
            <div class="panel-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h2>이상 징후 알림</h2>
            </div>
            <div class="panel-content">
                <div id="alert-item" class="alert-item">
                    <strong>[주의]</strong> 차량 12가3456
                    <p>허가 구역 이탈 의심</p>
                </div>
            </div>
        `;
        document.body.appendChild(alertPanel);
        
        // Show the panel
        setTimeout(() => alertPanel.classList.add('show'), 100);

        // Add click listener to the new alert item
        document.getElementById('alert-item').addEventListener('click', runMapScenario);
    }

    function runMapScenario() {
        // Hide the alert panel
        document.getElementById('alert-panel').classList.remove('show');

        // Fly to the violation area
        map.flyTo(violationAreaCenter, 14, { animate: true, duration: 2.5 });

        // After flying, draw the scenario elements
        setTimeout(() => {
            L.polygon(permittedAreaCoords, { color: 'green', fillColor: '#00ff00', fillOpacity: 0.3 }).addTo(map).bindPopup("허가 구역");
            L.polyline(vehiclePathCoords, { color: 'blue' }).addTo(map).bindPopup("차량 이동 경로");

            const violationIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            });
            
            // Create popup content with a simple bar chart
            const popupContent = `
                <div class="custom-popup">
                    <b>경고: 허가 구역 이탈</b><br>
                    차량: 12가3456<hr>
                    <div class="chart-title">이탈 후 경과 시간</div>
                    <div class="bar-chart">
                        <div class="bar danger" style="height: 80%;"></div>
                    </div>
                    <span>16분 경과</span>
                </div>
            `;

            L.marker(violationPoint, { icon: violationIcon })
                .addTo(map)
                .bindPopup(popupContent)
                .openPopup();
        }, 2500);
    }
});
