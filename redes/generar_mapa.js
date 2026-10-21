const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function capturarMapa() {
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
                background: rgba(9, 14, 23, 0.92);
                border: 2px solid #00e676;
                color: #00e676;
                padding: 10px 24px;
                border-radius: 30px;
                font-size: 24px;
                font-weight: 800;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                box-shadow: 0 6px 20px rgba(0,0,0,0.6);
            }
            .score-badge span { color: #fff; }
            .bottom-badge {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(9, 14, 23, 0.92);
                border: 1px solid rgba(255,255,255,0.2);
                color: #ffd700;
                padding: 8px 22px;
                border-radius: 20px;
                font-size: 20px;
                font-weight: 700;
                z-index: 1000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.6);
            }
            .custom-pin {
                width: 32px;
                height: 32px;
                background: #ff3b30;
                border: 4px solid #fff;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
            }
        </style>
    </head>
    <body>
        <div id="map-card">
            <div class="score-badge">🎯 ¡A 12 METROS! · <span>5.000 PUNTOS 🔥</span></div>
            <div id="map"></div>
            <div class="bottom-badge">📍 Río de Janeiro, Brasil · ESTADIO MARACANÁ</div>
        </div>
        <script>
            const map = L.map('map', { attributionControl: false, zoomControl: false }).setView([-22.91216, -43.23018], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(map);

            // Anillo de pulso verde
            L.circleMarker([-22.91216, -43.23018], {
                radius: 35,
                color: '#00e676',
                fillColor: '#00e676',
                fillOpacity: 0.25,
                weight: 4
            }).addTo(map);

            // Marcador Pin rojo
            const pinIcon = L.divIcon({
                className: 'custom-pin-wrap',
                html: '<div class=\"custom-pin\"></div>',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            });
            L.marker([-22.91216, -43.23018], { icon: pinIcon }).addTo(map);
        </script>
    </body>
    </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500)); // Esperar a que carguen los tiles de OpenStreetMap

    const outputPath = path.join(__dirname, 'mapa_maracana_card.png');
    const cardElement = await page.$('#map-card');
    await cardElement.screenshot({ path: outputPath, omitBackground: true });
    console.log(`✅ Tarjeta de mapa capturada: ${outputPath}`);

    await browser.close();
}

capturarMapa().catch(console.error);
