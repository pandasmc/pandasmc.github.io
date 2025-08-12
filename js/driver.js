/* =================================================================
   운전자 페이지 JS (driver.js - Leaflet.js 기반 재작성)
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. 변수 및 데이터 정의 ---
    let map; // 지도 객체
    let routeLayers = []; // 현재 지도에 그려진 경로 레이어를 저장하는 배열

    // DOM 요소 가져오기
    const optimizerForm = document.getElementById('optimizer-form');
    const loadingSpinner = document.getElementById('loading-spinner');
    const mapContainer = document.getElementById('map');
    const routeSummary = document.getElementById('route-summary');

    // 시연용 경로 데이터 (경남 서부권)
    const locations = {
        '진주 수목원': [35.108, 128.025],
        '사천 KAI': [35.088, 128.064],
        '고성 공룡엑스포': [34.972, 128.324],
        '하동 삼성궁': [35.267, 127.633]
    };
    
    // 미리 정의된 최적 경로 순서
    const optimizedOrder = ['진주 수목원', '하동 삼성궁', '사천 KAI', '고성 공룡엑스포'];


    // --- 2. 지도 초기화 함수 ---
    function initMap() {
        // 지도를 'map' div에 초기화
        map = L.map('map').setView([35.15, 128.0], 9); // 경남 서부권 중심

        // OpenStreetMap 타일 레이어 추가
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    }


    // --- 3. 이벤트 핸들러 ---
    optimizerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // 1. 로딩 시작
        loadingSpinner.style.display = 'block';
        mapContainer.style.opacity = '0.5';
        routeSummary.innerHTML = '';
        clearRoute(); // 이전 경로 삭제
        console.log('경로 최적화 시뮬레이션을 시작합니다...');

        // 2. 계산하는 것처럼 보이도록 2초 지연
        setTimeout(() => {
            // 3. 로딩 종료
            loadingSpinner.style.display = 'none';
            mapContainer.style.opacity = '1';
            console.log('...계산 완료.');

            // 4. 미리 정의된 경로 데이터로 결과 그리기
            drawOptimizedRoute();

            // 5. 요약 정보 표시
            routeSummary.innerHTML = '최적 경로 탐색 완료! 총 <strong>4개</strong> 수집처, 예상 소요 시간 <strong>2시간 45분</strong>';

        }, 2000);
    });


    // --- 4. 지도 시각화 함수 ---

    // 지도 위의 경로와 마커를 지우는 함수
    function clearRoute() {
        routeLayers.forEach(layer => map.removeLayer(layer));
        routeLayers = [];
    }

    // 최적 경로를 지도에 그리는 함수
    function drawOptimizedRoute() {
        const routeCoords = optimizedOrder.map(name => locations[name]);

        // 경로 선(Polyline) 그리기
        const polyline = L.polyline(routeCoords, {
            color: 'var(--secondary-color)',
            weight: 5,
            opacity: 0.8
        }).addTo(map);
        routeLayers.push(polyline);

        // 각 지점에 마커(Marker) 생성
        optimizedOrder.forEach((name, index) => {
            const coord = locations[name];
            let iconHtml, markerClass;

            if (index === 0) { // 시작점
                markerClass = 'marker-start';
                iconHtml = '<i class="fa-solid fa-flag"></i>';
            } else if (index === optimizedOrder.length - 1) { // 도착점
                markerClass = 'marker-end';
                iconHtml = '<i class="fa-solid fa-flag-checkered"></i>';
            } else { // 경유지
                markerClass = 'marker-stopover';
                iconHtml = `<strong>${index + 1}</strong>`;
            }

            const customIcon = L.divIcon({
                html: iconHtml,
                className: `route-marker ${markerClass}`,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker(coord, { icon: customIcon }).addTo(map)
                .bindPopup(`<b>${index + 1}. ${name}</b>`);
            routeLayers.push(marker);
        });

        // 모든 마커가 보이도록 지도 뷰 조정
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
        console.log('지도에 최적 경로를 그렸습니다.');
    }

    // --- 5. 초기 실행 ---
    initMap();

    // 마커 스타일을 위한 CSS 동적 삽입
    const style = document.createElement('style');
    style.innerHTML = `
        .route-marker {
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 50%;
            color: white;
            font-weight: 600;
            box-shadow: var(--shadow-md);
            border: 2px solid white;
        }
        .route-marker.marker-start { background-color: var(--accent-green); }
        .route-marker.marker-stopover { background-color: var(--secondary-color); }
        .route-marker.marker-end { background-color: var(--primary-color); }
    `;
    document.head.appendChild(style);
});
