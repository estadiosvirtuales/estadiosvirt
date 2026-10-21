const puppeteer = require('puppeteer-core');
const path = require('path');

async function generarCountdown() {
    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1600, deviceScaleFactor: 1 });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            body { background: transparent; padding: 20px; display: flex; flex-direction: column; gap: 30px; align-items: center; }

            .urgency-card {
                width: 980px;
                height: 280px;
                background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                border: 2.5px solid #ff3b30;
                border-radius: 28px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: 0 16px 45px rgba(255, 59, 48, 0.35);
            }
            .urgency-text {
                color: #ffd700;
                font-size: 38px;
                font-weight: 900;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
            }
            .count-num {
                font-size: 140px;
                font-weight: 900;
                line-height: 1;
            }
        </style>
    </head>
    <body>
        <div class="urgency-card" id="count-3">
            <div class="urgency-text">⏱️ ¿LO SACASTE? ¡COMENTÁ ANTES DEL MAPA!</div>
            <div class="count-num" style="color: #ff3b30; text-shadow: 0 0 30px rgba(255,59,48,0.7);">3</div>
        </div>
        <div class="urgency-card" id="count-2" style="border-color:#ff9500; box-shadow: 0 16px 45px rgba(255, 149, 0, 0.35);">
            <div class="urgency-text">⏱️ ¿LO SACASTE? ¡COMENTÁ ANTES DEL MAPA!</div>
            <div class="count-num" style="color: #ff9500; text-shadow: 0 0 30px rgba(255,149,0,0.7);">2</div>
        </div>
        <div class="urgency-card" id="count-1" style="border-color:#00ff77; box-shadow: 0 16px 45px rgba(0, 255, 119, 0.35);">
            <div class="urgency-text">⏱️ ¿LO SACASTE? ¡COMENTÁ ANTES DEL MAPA!</div>
            <div class="count-num" style="color: #00ff77; text-shadow: 0 0 30px rgba(0,255,119,0.7);">1</div>
        </div>
    </body>
    </html>`;

    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    const counts = [
        { id: '#count-3', file: 'ui_count_3.png' },
        { id: '#count-2', file: 'ui_count_2.png' },
        { id: '#count-1', file: 'ui_count_1.png' }
    ];

    for (const item of counts) {
        const el = await page.$(item.id);
        if (el) {
            await el.screenshot({ path: path.join(__dirname, item.file), omitBackground: true });
        }
    }

    console.log('✅ Countdown cards generadas.');
    await browser.close();
}

generarCountdown().catch(console.error);
