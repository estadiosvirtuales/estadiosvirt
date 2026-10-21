const puppeteer = require('puppeteer-core');
const path = require('path');

// Función para calcular distancia Haversine en metros
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
}

// Función para calcular puntos de 0 a 5.000
function getScore(distanceMeters) {
    if (distanceMeters < 25) return 5000;
    // Fórmula similar a StadiumGuessr
    const score = Math.max(1000, Math.round(5000 * Math.exp(-distanceMeters / 3000)));
    return score;
}

async function capturarMapaPSGRealista() {
    const targetLat = 48.8414;
    const targetLng = 2.2530;

    // Simular un tiro realista (aprox 450 - 650 metros de distancia, efectividad ~85%-92%)
    const userLat = 48.8448;
    const userLng = 2.2482;

    const dist = getDistanceMeters(userLat, userLng, targetLat, targetLng);
    const pts = getScore(dist);
    const distText = dist < 1000 ? `${dist} METROS` : `${(dist / 1000).toFixed(1)} KM`;

    console.log(`📍 Tiro simulado PSG: Distancia ${distText} | Puntaje: ${pts} PTS`);

    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 960, height: 460, deviceScaleFactor: 2 });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: transparent; overflow: hidden; width: 960px; height: 460px; }
            #map-card {
                position: relative;
                width: 960px;
                height: 460px;
                border-radius: 28px;
                overflow: hidden;
                border: 4px solid #00e676;
                box-shadow: 0 16px 50px rgba(0, 230, 118, 0.35), 0 0 0 2px rgba(0,0,0,0.8);
            }
            #map {
                width: 100%;
                height: 100%;
                background: #111;
            }
            .score-badge {
                position: absolute;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.94);
                border: 2px solid #00e676;
                color: #00e676;
                padding: 10px 26px;
                border-radius: 30px;
                font-size: 24px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                box-shadow: 0 8px 25px rgba(0,0,0,0.7);
            }
            .score-badge span { color: #fff; }
            .bottom-badge {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.94);
                border: 1px solid rgba(255,255,255,0.25);
                color: #ffd700;
                padding: 8px 24px;
                border-radius: 20px;
                font-size: 20px;
                font-weight: 700;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            }
            .user-pin {
                width: 32px;
                height: 32px;
                background: #ff3b30;
                border: 4px solid #fff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(0,0,0,0.7);
            }
        </style>
    </head>
    <body>
        <div id="map-card">
            <div class="score-badge">🎯 ¡A ${distText}! · <span>${pts.toLocaleString('es-AR')} PUNTOS 🔥</span></div>
            <div id="map"></div>
            <div class="bottom-badge">📍 París, Francia · PARC DES PRINCES</div>
        </div>
        <script>
            const userPos = [${userLat}, ${userLng}];
            const targetPos = [${targetLat}, ${targetLng}];

            // Centrar mapa abarcando ambos puntos
            const centerLat = (userPos[0] + targetPos[0]) / 2;
            const centerLng = (userPos[1] + targetPos[1]) / 2;

            const map = L.map('map', { attributionControl: false, zoomControl: false }).setView([centerLat, centerLng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            // 1. Línea punteada de tiro (estilo StadiumGuessr)
            L.polyline([userPos, targetPos], {
                color: '#ff3b30',
                weight: 4,
                dashArray: '8, 8',
                opacity: 0.95
            }).addTo(map);

            // 2. Marcador Verde oficial del Estadio
            L.circleMarker(targetPos, {
                radius: 14,
                color: '#00e676',
                fillColor: '#090e17',
                fillOpacity: 1,
                weight: 4
            }).addTo(map);

            L.circleMarker(targetPos, {
                radius: 35,
                color: '#00e676',
                fillColor: '#00e676',
                fillOpacity: 0.2,
                weight: 2
            }).addTo(map);

            // 3. Marcador Pin rojo del Usuario
            const pinIcon = L.divIcon({
                className: 'custom-pin-wrap',
                html: '<div class=\"user-pin\"></div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });
            L.marker(userPos, { icon: pinIcon }).addTo(map);
        </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));

    const outputPath = path.join(__dirname, 'mapa_psg_card.png');
    const cardElement = await page.$('#map-card');
    await cardElement.screenshot({ path: outputPath, omitBackground: true });
    console.log(`✅ Nuevo mapa realista capturado: ${outputPath}`);

    await browser.close();
}

capturarMapaPSGRealista().catch(console.error);
