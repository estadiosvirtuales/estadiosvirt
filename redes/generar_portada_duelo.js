const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function generarPortadaDuelo() {
    console.log('🎨 Generando portada de alto impacto para TikTok/Reels...');

    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const rawFramePath = path.join(__dirname, 'raw_vs_frame.jpg');
    let bgBase64 = '';
    if (fs.existsSync(rawFramePath)) {
        bgBase64 = 'data:image/jpeg;base64,' + fs.readFileSync(rawFramePath).toString('base64');
    }

    const racingEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Racing.webp')).toString('base64');
    const indepEscudo = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Independiente.webp')).toString('base64');
    const logoEv = 'data:image/webp;base64,' + fs.readFileSync(path.join(__dirname, '..', 'escudos', 'Logo.webp')).toString('base64');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body {
                width: 1080px;
                height: 1920px;
                overflow: hidden;
                position: relative;
                background: #090e17;
            }

            .bg-drone {
                position: absolute;
                inset: 0;
                background-image: url('${bgBase64}');
                background-size: cover;
                background-position: center;
                filter: brightness(0.60) contrast(1.15);
            }

            .vignette {
                position: absolute;
                inset: 0;
                background: radial-gradient(circle at center, rgba(9, 14, 23, 0.25) 0%, rgba(9, 14, 23, 0.85) 75%, rgba(9, 14, 23, 0.98) 100%),
                            linear-gradient(180deg, rgba(9, 14, 23, 0.92) 0%, transparent 25%, transparent 75%, rgba(9, 14, 23, 0.95) 100%);
            }

            /* SAFE ZONE TIKTOK (Centrado vertical para cuadrícula 3:4 y 1:1) */
            .safe-zone {
                position: absolute;
                top: 260px;
                left: 50px;
                right: 50px;
                bottom: 260px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: space-between;
                text-align: center;
                z-index: 10;
            }

            /* HEADER */
            .brand-badge {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2px solid rgba(0, 230, 118, 0.6);
                border-top: 2.5px solid rgba(110, 255, 180, 0.9);
                border-radius: 35px;
                color: #00ff77;
                font-size: 24px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                padding: 10px 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 230, 118, 0.35);
            }

            /* TITULO CENTRAL */
            .main-box {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
                width: 100%;
            }
            .hook-pill {
                background: rgba(255, 215, 0, 0.15);
                border: 2px solid #ffd700;
                color: #ffd700;
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 1.5px;
                padding: 8px 24px;
                border-radius: 20px;
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                text-transform: uppercase;
            }
            .main-title {
                color: #ffffff;
                font-size: 68px;
                font-weight: 900;
                line-height: 1.1;
                letter-spacing: -1px;
                text-shadow: 0 4px 25px rgba(0,0,0,0.9), 0 0 35px rgba(0, 230, 118, 0.4);
                text-transform: uppercase;
            }
            .sub-title {
                color: #cbd5e1;
                font-size: 26px;
                font-weight: 700;
            }

            /* DUELO CARDS */
            .duel-row {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 20px;
                width: 100%;
                margin: 20px 0;
            }
            .team-card {
                flex: 1;
                max-width: 420px;
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(10, 15, 26, 0.98) 100%);
                border: 2px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                padding: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.8);
            }
            .team-card.racing { border-top: 6px solid #00b0ff; }
            .team-card.indep { border-top: 6px solid #ff3344; }
            .team-card img {
                width: 90px;
                height: 90px;
                object-fit: contain;
                filter: drop-shadow(0 6px 14px rgba(0,0,0,0.7));
            }
            .team-name {
                color: #ffffff;
                font-size: 26px;
                font-weight: 900;
                line-height: 1.1;
            }
            .stadium-name {
                color: #94a3b8;
                font-size: 18px;
                font-weight: 700;
                text-transform: uppercase;
            }

            .vs-circle {
                background: linear-gradient(135deg, #ffd700 0%, #ff8800 100%);
                color: #0b111e;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 34px;
                font-weight: 900;
                border: 4px solid #ffffff;
                box-shadow: 0 0 30px rgba(255, 190, 0, 0.7);
                flex-shrink: 0;
            }

            /* FOOTER CTA */
            .footer-box {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }
            .cta-btn {
                display: inline-flex;
                align-items: center;
                gap: 14px;
                background: linear-gradient(135deg, #00ff77 0%, #00c853 100%);
                color: #090e17;
                font-size: 28px;
                font-weight: 900;
                padding: 16px 42px;
                border-radius: 25px;
                box-shadow: 0 10px 30px rgba(0, 255, 119, 0.45);
            }
        </style>
    </head>
    <body>
        <div class="bg-drone"></div>
        <div class="vignette"></div>

        <div class="safe-zone">
            <!-- 1. BADGE ARRIBA -->
            <div class="brand-badge">
                🥊 DUELO DE CAPACIDAD · AVELLANEDA
            </div>

            <!-- 2. TITULO PRINCIPAL -->
            <div class="main-box">
                <div class="hook-pill">¿CILINDRO O LIBERTADORES?</div>
                <div class="main-title">¿CUÁL TIENE MÁS CAPACIDAD?</div>
                <div class="sub-title">Separados por 300 metros · El 80% se equivoca 😱</div>

                <!-- 3. TARJETAS VS -->
                <div class="duel-row">
                    <div class="team-card racing">
                        <img src="${racingEscudo}">
                        <div class="team-name">RACING</div>
                        <div class="stadium-name">El Cilindro</div>
                    </div>

                    <div class="vs-circle">VS</div>

                    <div class="team-card indep">
                        <img src="${indepEscudo}">
                        <div class="team-name">INDEPENDIENTE</div>
                        <div class="stadium-name">Libertadores</div>
                    </div>
                </div>
            </div>

            <!-- 4. CTA INFERIOR -->
            <div class="footer-box">
                <div class="cta-btn">
                    🗳️ VOTÁ EN COMENTARIOS ANTES DEL FINAL
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    await page.setContent(html, { timeout: 5000 });

    const outputPath = "E:\\Google earth studio\\videos para mostrar\\DUELO DE CAPACIDAD\\RACING-VS-INDEPENDIENTE\\Portada_Duelo_Avellaneda.jpg";
    await page.screenshot({
        path: outputPath,
        type: 'jpeg',
        quality: 95
    });

    console.log(`✅ Portada optimizada generada en: ${outputPath}`);
    await browser.close();

    // Eliminar frame temporal
    if (fs.existsSync(rawFramePath)) fs.unlinkSync(rawFramePath);
}

generarPortadaDuelo().catch(err => {
    console.error('❌ Error generando portada:', err);
});
