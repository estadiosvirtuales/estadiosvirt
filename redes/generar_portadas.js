const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function generarPortadas() {
    console.log('🎨 Generando portadas de alta definición para el Feed de TikTok e Instagram...');

    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const portadas = [
        {
            id: 'maracana',
            name: 'Portada_Estadio_Maracana.jpg',
            bgImage: path.join(__dirname, 'raw_maracana_frame.jpg'),
            title: '¿QUÉ ESTADIO ES ESTE?',
            badgeDifficulty: 'NIVEL: LEYENDA 🔥',
            clueText: '78.838 hinchas · 2 finales del Mundo · Sede histórica',
            ctaSub: '¿En cuántos segundos lo sacás? Dejalo en comentarios'
        },
        {
            id: 'psg',
            name: 'Portada_Estadio_PSG_Parc_Des_Princes.jpg',
            bgImage: path.join(__dirname, 'raw_psg_frame.jpg'),
            title: '¿QUÉ ESTADIO ES ESTE?',
            badgeDifficulty: 'PARC DES PRINCES · PARÍS',
            clueText: 'Acá jugaron juntos Messi, Mbappé y Neymar',
            ctaSub: '¿En cuántos segundos podés adivinarlo? Comentá'
        }
    ];

    for (const p of portadas) {
        if (!fs.existsSync(p.bgImage)) continue;
        // Convertir imagen local a base64
        const imgBuffer = fs.readFileSync(p.bgImage);
        const bgBase64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                body {
                    width: 1080px;
                    height: 1920px;
                    overflow: hidden;
                    position: relative;
                    background: #090e17;
                }

                /* Fondo del Dron con viñeta cinematográfica */
                .bg-drone {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 1080px;
                    height: 1920px;
                    background-image: url('${bgBase64}');
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.65) contrast(1.1);
                }

                .vignette-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 1080px;
                    height: 1920px;
                    background: radial-gradient(circle at center, rgba(9, 14, 23, 0.2) 0%, rgba(9, 14, 23, 0.85) 75%, rgba(9, 14, 23, 0.98) 100%),
                                linear-gradient(180deg, rgba(9, 14, 23, 0.95) 0%, transparent 22%, transparent 75%, rgba(9, 14, 23, 0.98) 100%);
                }

                /* Contenedor Safe Zone (centrado para cuadrícula 3:4 del Feed de TikTok/Instagram) */
                .safe-zone {
                    position: absolute;
                    top: 240px;
                    left: 50px;
                    right: 50px;
                    bottom: 240px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    text-align: center;
                    z-index: 10;
                }

                /* Header Brand */
                .brand-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 12px;
                    background: linear-gradient(135deg, rgba(14, 26, 42, 0.96) 0%, rgba(8, 14, 24, 0.98) 100%);
                    border: 2px solid rgba(0, 255, 119, 0.6);
                    border-top: 2.5px solid rgba(110, 255, 180, 0.9);
                    border-radius: 35px;
                    color: #00ff77;
                    font-size: 24px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 2.5px;
                    padding: 12px 32px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(0, 255, 119, 0.35);
                }

                /* Center Hero Block */
                .center-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    width: 100%;
                }

                .difficulty-badge {
                    background: rgba(255, 215, 0, 0.15);
                    border: 2px solid #ffd700;
                    color: #ffd700;
                    font-size: 26px;
                    font-weight: 900;
                    letter-spacing: 1.5px;
                    padding: 8px 24px;
                    border-radius: 20px;
                    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
                }

                .main-title {
                    color: #ffffff;
                    font-size: 64px;
                    font-weight: 900;
                    line-height: 1.15;
                    letter-spacing: -1px;
                    text-shadow: 0 4px 20px rgba(0,0,0,0.9), 0 0 35px rgba(0, 255, 119, 0.4);
                    text-transform: uppercase;
                }

                /* Floating Clue Box */
                .clue-box {
                    width: 100%;
                    max-width: 900px;
                    background: linear-gradient(135deg, rgba(17, 24, 39, 0.92) 0%, rgba(10, 15, 26, 0.96) 100%);
                    border: 1.5px solid rgba(255, 255, 255, 0.2);
                    border-left: 10px solid #00ff77;
                    border-radius: 24px;
                    padding: 24px 30px;
                    box-shadow: 0 16px 45px rgba(0, 0, 0, 0.85);
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                .clue-icon { font-size: 52px; filter: drop-shadow(0 2px 10px rgba(0,0,0,0.6)); }
                .clue-desc {
                    text-align: left;
                    color: #f1f5f9;
                    font-size: 32px;
                    font-weight: 800;
                    line-height: 1.35;
                }

                /* Footer CTA */
                .footer-block {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 14px;
                }

                .sub-question {
                    color: #cbd5e1;
                    font-size: 28px;
                    font-weight: 700;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.9);
                }

                .cta-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 14px;
                    background: linear-gradient(135deg, #00ff77 0%, #00c853 100%);
                    color: #090e17;
                    font-size: 30px;
                    font-weight: 900;
                    padding: 18px 45px;
                    border-radius: 25px;
                    box-shadow: 0 10px 30px rgba(0, 255, 119, 0.45), 0 5px 0 #00963b;
                    letter-spacing: 0.5px;
                }
            </style>
        </head>
        <body>
            <div class="bg-drone"></div>
            <div class="vignette-overlay"></div>

            <div class="safe-zone">
                <!-- Marca arriba -->
                <div class="brand-pill">
                    ⚽ ESTADIOS VIRTUALES · TRIVIA
                </div>

                <!-- Bloque central con gancho de alto impacto -->
                <div class="center-block">
                    <div class="difficulty-badge">${p.badgeDifficulty}</div>
                    <div class="main-title">${p.title}</div>
                    
                    <div class="clue-box">
                        <div class="clue-icon">💡</div>
                        <div class="clue-desc">${p.clueText}</div>
                    </div>
                </div>

                <!-- Bloque inferior con llamado a la acción -->
                <div class="footer-block">
                    <div class="sub-question">${p.ctaSub}</div>
                    <div class="cta-btn">
                        🎮 JUGÁ EN EL LINK DEL PERFIL
                    </div>
                </div>
            </div>
        </body>
        </html>`;

        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        await new Promise(r => setTimeout(r, 600));

        const destDownloads = path.join(process.env.USERPROFILE, 'Downloads', p.name);
        const destDesktop = path.join(process.env.USERPROFILE, 'Desktop', p.name);
        const destFolderE = path.join('E:\\Google earth studio\\videos para mostrar\\PSG-FRANCIA', p.name);

        await page.screenshot({ path: destDownloads, quality: 95, type: 'jpeg' });
        fs.copyFileSync(destDownloads, destDesktop);
        if (p.id === 'psg' && fs.existsSync(path.dirname(destFolderE))) {
            fs.copyFileSync(destDownloads, destFolderE);
        }

        console.log(`✅ Portada generada: ${p.name}`);
        console.log(`   - Descargas: ${destDownloads}`);
        console.log(`   - Escritorio: ${destDesktop}`);
        if (p.id === 'psg') console.log(`   - Carpeta E: ${destFolderE}`);
    }

    await browser.close();
    console.log('\n🎉 ¡TODAS LAS PORTADAS FUERON CREADAS CON ÉXITO!');
}

generarPortadas().catch(console.error);
