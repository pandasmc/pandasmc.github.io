/* =================================================================
   대시보드 페이지 JS (dashboard.js - Leaflet.js 기반 재작성)
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. 변수 및 데이터 정의 ---
    let map; // 지도 객체를 저장할 변수
    const alertItems = document.querySelectorAll('.alert-item');
    
    // 시나리오 시연을 위한 가상 데이터
    const vehicleData = {
        '1': {
            path: [[35.1595, 128.0833], [35.1650, 128.0900], [35.1700, 128.0850]],
            geofence: [[35.155, 128.078], [35.165, 128.078], [35.165, 128.088], [35.155, 128.088]],
            alertPos: [35.1700, 128.0850] // 경로 이탈 지점
        },
        '2': {
            path: [[35.0555, 128.4334], [35.0580, 128.4350], [35.0600, 128.4300]],
            geofence: [[35.050, 128.425], [35.060, 128.425], [35.060, 128.435], [35.050, 128.435]],
            alertPos: [35.0615, 128.4280] // 장기 체류 지점 (허가 구역 밖)
        },
        '3': {
            path: [[35.1983, 128.1583], [35.2000, 128.1600], [35.2050, 128.1650]],
            geofence: [[35.195, 128.155], [35.210, 128.155], [35.210, 128.170], [35.195, 128.170]],
            alertPos: [35.2000, 128.1600] // 과속 감지 지점
        }
    };

    // 현재 지도에 그려진 레이어를 관리하기 위한 변수
    let currentLayers = {
        geofence: null,
        path: null,
        alertMarker: null
    };

    // --- 2. 지도 초기화 함수 ---
    function initMap() {
        // 지도를 'map' div에 초기화하고, 중심점과 줌 레벨을 설정합니다.
        map = L.map('map').setView([35.1, 128.3], 9);

        // OpenStreetMap 타일 레이어를 추가합니다. (API 키 필요 없음)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // 초기 차량 마커들을 지도에 표시합니다.
        Object.keys(vehicleData).forEach(id => {
            const vehicle = vehicleData[id];
            const lastPos = vehicle.path[vehicle.path.length - 1];
            
            const truckIcon = L.divIcon({
                html: '<i class="fa-solid fa-truck"></i>',
                className: 'truck-icon',
                iconSize: [30, 30]
            });

            L.marker(lastPos, { icon: truckIcon }).addTo(map)
                .bindPopup(`차량 ${id}번`);
        });
    }

    // --- 3. 이벤트 핸들러 함수 ---
    function handleAlertClick(event) {
        const targetItem = event.currentTarget;
        const lat = parseFloat(targetItem.dataset.lat);
        const lon = parseFloat(targetItem.dataset.lon);
        const vehicleId = targetItem.dataset.vehicleId;

        // 모든 알림 아이템의 'active' 클래스를 제거하고, 클릭된 아이템에만 추가
        alertItems.forEach(item => item.classList.remove('active'));
        targetItem.classList.add('active');

        // 부드럽게 지도를 해당 위치로 이동
        map.flyTo([lat, lon], 14);

        // 이전에 그려진 레이어들 삭제
        clearMapLayers();

        // 시나리오에 맞는 시각적 요소들을 지도에 그림
        drawAlertDetails(vehicleId);
    }

    // --- 4. 지도 시각화 함수 ---

    // 지도 위의 경로, 허가구역 등 레이어를 지우는 함수
    function clearMapLayers() {
        if (currentLayers.geofence) map.removeLayer(currentLayers.geofence);
        if (currentLayers.path) map.removeLayer(currentLayers.path);
        if (currentLayers.alertMarker) map.removeLayer(currentLayers.alertMarker);
    }

    // 선택된 알림에 대한 상세 정보(경로, 허가구역 등)를 그리는 함수
    function drawAlertDetails(vehicleId) {
        const data = vehicleData[vehicleId];
        if (!data) return;

        // 허가 구역 (녹색 반투명 폴리곤) 그리기
        currentLayers.geofence = L.polygon(data.geofence, { 
            color: '#28a745', 
            fillColor: '#28a745', 
            fillOpacity: 0.2 
        }).addTo(map);

        // 이동 경로 (파란색 실선) 그리기
        currentLayers.path = L.polyline(data.path, { 
            color: '#007bff',
            weight: 5
        }).addTo(map);

        // 이상 지점 (붉은색 강조 마커) 그리기
        const alertIcon = L.divIcon({
            html: '<i class="fa-solid fa-triangle-exclamation"></i>',
            className: 'alert-marker-icon',
            iconSize: [30, 30]
        });
        currentLayers.alertMarker = L.marker(data.alertPos, { icon: alertIcon }).addTo(map);
    }

    // --- 5. 초기 실행 ---
    initMap();

    // 각 알림 아이템에 클릭 이벤트 리스너 추가
    alertItems.forEach(item => {
        item.addEventListener('click', handleAlertClick);
    });

    // 페이지 로드 시 'active' 클래스를 가진 아이템을 찾아 자동으로 클릭 처리
    const initiallyActiveItem = document.querySelector('.alert-item.active');
    if (initiallyActiveItem) {
        initiallyActiveItem.click();
    }
    
    // 지도 위 아이콘을 위한 추가 CSS 동적 삽입
    const style = document.createElement('style');
    style.innerHTML = `
        .truck-icon {
            color: var(--primary-color);
            font-size: 20px;
            text-shadow: 0 0 3px white;
            text-align: center;
            line-height: 30px;
        }
        .alert-marker-icon {
            color: var(--accent-red);
            font-size: 24px;
            text-shadow: 0 0 5px white;
            animation: blink 1.5s infinite;
        }
        @keyframes blink {
            50% { opacity: 0.3; }
        }
    `;
    document.head.appendChild(style);
});
