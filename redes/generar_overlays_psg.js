const puppeteer = require('puppeteer-core');
const path = require('path');

async function generarOverlays() {
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 2400, deviceScaleFactor: 1 });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: transparent; padding: 20px; display: flex; flex-direction: column; gap: 40px; align-items: center; }

            /* HEADER */
            .header-container {
                width: 980px;
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.94) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2px solid rgba(0, 255, 119, 0.45);
                border-top: 2.5px solid rgba(110, 255, 180, 0.85);
                border-radius: 28px;
                padding: 18px 24px;
                text-align: center;
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(0, 255, 119, 0.25);
            }
            .hero-eyebrow {
                display: inline-block;
                background: rgba(0, 255, 119, 0.12);
                border: 1.5px solid rgba(0, 255, 119, 0.6);
                color: #00ff77;
                font-size: 22px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 2px;
                padding: 6px 22px;
                border-radius: 30px;
                margin-bottom: 10px;
            }
            .title {
                color: #ffffff;
                font-size: 52px;
                font-weight: 900;
                letter-spacing: -0.5px;
                margin-bottom: 6px;
            }
            .subtitle {
                color: #ffd700;
                font-size: 28px;
                font-weight: 700;
            }

            /* PISTAS */
            .clue-group {
                display: flex;
                flex-direction: column;
                gap: 14px;
                width: 980px;
            }
            .clue-card {
                width: 980px;
                height: 94px;
                background: linear-gradient(135deg, rgba(17, 24, 39, 0.94) 0%, rgba(10, 15, 26, 0.98) 100%);
                border: 1.5px solid rgba(255, 255, 255, 0.12);
                border-radius: 20px;
                display: flex;
                align-items: center;
                padding: 0 24px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
                position: relative;
                overflow: hidden;
            }
            .clue-indicator {
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 10px;
            }
            .clue-icon {
                font-size: 38px;
                margin-right: 18px;
            }
            .clue-text {
                color: #ffffff;
                font-size: 34px;
                font-weight: 800;
            }
            .clue-tag {
                font-weight: 900;
                margin-right: 10px;
            }

            /* REVELACIÓN */
            .reveal-banner {
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2px solid #00ff77;
                border-radius: 24px;
                padding: 12px 36px;
                display: inline-flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 8px 30px rgba(0, 255, 119, 0.35);
            }
            .reveal-text {
                color: #00ff77;
                font-size: 42px;
                font-weight: 900;
            }
            .club-tag {
                color: #ffffff;
                font-size: 34px;
                font-weight: 700;
                background: rgba(255, 255, 255, 0.14);
                padding: 4px 16px;
                border-radius: 12px;
            }

            /* BOTON CTA */
            .btn-cta {
                display: inline-block;
                background: linear-gradient(135deg, #00ff77 0%, #00c853 100%);
                color: #090e17;
                font-size: 28px;
                font-weight: 900;
                padding: 16px 40px;
                border-radius: 22px;
                box-shadow: 0 8px 25px rgba(0, 255, 119, 0.4);
                letter-spacing: 0.5px;
            }
        </style>
    </head>
    <body>
        <!-- 1. Header -->
        <div class="header-container" id="ui-header">
            <div class="hero-eyebrow">ESTADIOS VIRTUALES · STADIUMGUESSR</div>
            <div class="title">¿QUÉ ESTADIO ES ESTE?</div>
            <div class="subtitle">¿En cuántos segundos podés adivinarlo?</div>
        </div>

        <!-- 2. Pista 1 -->
        <div class="clue-group" id="ui-pistas-1">
            <div class="clue-card">
                <div class="clue-indicator" style="background:#00ff77; box-shadow: 0 0 15px #00ff77;"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag" style="color:#00ff77;">PISTA 1:</span> Capacidad para 48.583 hinchas</div>
            </div>
        </div>

        <!-- 3. Pistas 1 + 2 -->
        <div class="clue-group" id="ui-pistas-2">
            <div class="clue-card">
                <div class="clue-indicator" style="background:#00ff77; box-shadow: 0 0 15px #00ff77;"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag" style="color:#00ff77;">PISTA 1:</span> Capacidad para 48.583 hinchas</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:#38bdf8; box-shadow: 0 0 15px #38bdf8;"></div>
                <div class="clue-icon">🏆</div>
                <div class="clue-text"><span class="clue-tag" style="color:#38bdf8;">PISTA 2:</span> Primera final de Champions (1956)</div>
            </div>
        </div>

        <!-- 4. Pistas 1 + 2 + 3 -->
        <div class="clue-group" id="ui-pistas-3">
            <div class="clue-card">
                <div class="clue-indicator" style="background:#00ff77; box-shadow: 0 0 15px #00ff77;"></div>
                <div class="clue-icon">💡</div>
                <div class="clue-text"><span class="clue-tag" style="color:#00ff77;">PISTA 1:</span> Capacidad para 48.583 hinchas</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:#38bdf8; box-shadow: 0 0 15px #38bdf8;"></div>
                <div class="clue-icon">🏆</div>
                <div class="clue-text"><span class="clue-tag" style="color:#38bdf8;">PISTA 2:</span> Primera final de Champions (1956)</div>
            </div>
            <div class="clue-card">
                <div class="clue-indicator" style="background:#ffd700; box-shadow: 0 0 15px #ffd700;"></div>
                <div class="clue-icon">⭐</div>
                <div class="clue-text"><span class="clue-tag" style="color:#ffd700;">PISTA 3:</span> Acá jugaron Messi, Mbappé y Neymar</div>
            </div>
        </div>

        <!-- 5. Revelación Título -->
        <div class="reveal-banner" id="ui-reveal-title">
            <span class="reveal-text">PARC DES PRINCES</span>
            <span class="club-tag">PARÍS SAINT-GERMAIN</span>
        </div>

        <!-- 6. Botón CTA -->
        <div class="btn-cta" id="ui-cta-btn">
            JUGÁ GRATIS EN EL LINK DEL PERFIL
        </div>
    </body>
    </html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const elements = [
        { id: '#ui-header', file: 'ui_header.png' },
        { id: '#ui-pistas-1', file: 'ui_pistas_1.png' },
        { id: '#ui-pistas-2', file: 'ui_pistas_2.png' },
        { id: '#ui-pistas-3', file: 'ui_pistas_3.png' },
        { id: '#ui-reveal-title', file: 'ui_reveal_title.png' },
        { id: '#ui-cta-btn', file: 'ui_cta_btn.png' }
    ];

    for (const item of elements) {
        const el = await page.$(item.id);
        if (el) {
            await el.screenshot({ path: path.join(__dirname, item.file), omitBackground: true });
        }
    }

    console.log('✅ Todos los assets UI generados con éxito.');
    await browser.close();
}

generarOverlays().catch(console.error);
