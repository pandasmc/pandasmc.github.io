// Wait for the DOM to be fully loaded before executing the script
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const loader = document.getElementById('loader');
    const alertItem = document.getElementById('alert-item');

    // --- Map Initialization ---
    // Show loader
    loader.style.display = 'flex';

    // Initialize the map and set its view to the center of South Korea
    const map = L.map('map').setView([36.5, 127.5], 7);

    // Add the OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Hide loader once map tiles are loaded
    map.whenReady(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // Wait for transition to finish
    });


    // --- Scenario Data ---
    // Coordinates for the simulation
    const initialVehicles = [
        { lat: 37.5665, lng: 126.9780, name: '서울 01호' },
        { lat: 35.1796, lng: 129.0756, name: '부산 02호' },
        { lat: 35.8714, lng: 128.6014, name: '대구 03호' }
    ];

    const violationAreaCenter = [35.237, 128.686]; // 경상남도 창원시 부근

    const permittedAreaCoords = [
        [35.240, 128.680],
        [35.242, 128.695],
        [35.235, 128.698],
        [35.230, 128.685]
    ];

    const vehiclePathCoords = [
        [35.238, 128.682],
        [35.239, 128.688],
        [35.236, 128.692],
        [35.233, 128.699] // This point is outside the permitted area
    ];
    
    const violationPoint = vehiclePathCoords[vehiclePathCoords.length - 1];


    // --- Initial Map Setup ---
    // Add markers for initial vehicles
    let vehicleMarkers = [];
    initialVehicles.forEach(v => {
        const marker = L.marker([v.lat, v.lng]).addTo(map).bindPopup(v.name);
        vehicleMarkers.push(marker);
    });


    // --- Event Listener for Scenario ---
    alertItem.addEventListener('click', () => {
        // 1. Remove initial vehicle markers for a cleaner view
        vehicleMarkers.forEach(marker => map.removeLayer(marker));
        
        // 2. Smoothly fly to the violation area
        map.flyTo(violationAreaCenter, 14, {
            animate: true,
            duration: 2.5
        });

        // 3. After flying, draw the scenario elements
        setTimeout(() => {
            // Draw the permitted area (green polygon)
            L.polygon(permittedAreaCoords, { 
                color: 'green', 
                fillColor: '#00ff00', 
                fillOpacity: 0.3 
            }).addTo(map).bindPopup("허가 구역");

            // Draw the vehicle's path (blue line)
            L.polyline(vehiclePathCoords, { color: 'blue' }).addTo(map).bindPopup("차량 이동 경로");

            // Create a custom icon for the violation
            const violationIcon = L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            // Add a red marker at the violation point
            L.marker(violationPoint, { icon: violationIcon })
                .addTo(map)
                .bindPopup("<b>경고: 허가 구역 이탈 지점</b><br>차량: 12가3456")
                .openPopup();
        }, 2500); // Wait for the flyTo animation to complete
    });

});
