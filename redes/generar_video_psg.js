const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Generando video interactivo: Estadio Parque de los Príncipes (PSG)...');

// 1. GENERAR PISTA DE AUDIO PROCEDURAL (25 SEGUNDOS)
function generarAudioProcedural(duracionSeg = 25.0, sampleRate = 44100) {
    const totalSamples = Math.floor(duracionSeg * sampleRate);
    const dataSize = totalSamples * 2;
    const buffer = Buffer.alloc(44 + dataSize);

    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20); // PCM
    buffer.writeUInt16LE(1, 22); // Mono
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    const samples = new Float32Array(totalSamples);

    function addTone(startSec, durSec, freq, volume = 0.35, decay = 3) {
        const start = Math.floor(startSec * sampleRate);
        const count = Math.floor(durSec * sampleRate);
        for (let i = 0; i < count && start + i < totalSamples; i++) {
            const t = i / sampleRate;
            const env = Math.exp(-decay * (i / count));
            samples[start + i] += Math.sin(2 * Math.PI * freq * t) * env * volume;
        }
    }

    function addWhoosh(startSec, durSec = 0.5, volume = 0.3) {
        const start = Math.floor(startSec * sampleRate);
        const count = Math.floor(durSec * sampleRate);
        for (let i = 0; i < count && start + i < totalSamples; i++) {
            const t = i / count;
            const env = Math.sin(Math.PI * t);
            samples[start + i] += (Math.random() * 2 - 1) * env * volume;
        }
    }

    function addBellDing(startSec, freq = 987.77) {
        addTone(startSec, 1.2, freq, 0.35, 4);
        addTone(startSec + 0.03, 1.0, freq * 1.5, 0.2, 5);
    }

    function addTick(startSec) {
        addTone(startSec, 0.05, 1200, 0.3, 25);
    }

    function addPinPop(startSec) {
        const start = Math.floor(startSec * sampleRate);
        const count = Math.floor(0.12 * sampleRate);
        for (let i = 0; i < count && start + i < totalSamples; i++) {
            const t = i / sampleRate;
            const freq = 680 - (i / count) * 450;
            const env = Math.exp(-12 * (i / count));
            samples[start + i] += Math.sin(2 * Math.PI * freq * t) * env * 0.45;
        }
    }

    // 0.2s: Whoosh cinemático de inicio
    addWhoosh(0.2, 0.8, 0.35);

    // Campanitas de las 3 pistas
    addBellDing(3.5, 880);
    addBellDing(7.5, 987.77);
    addBellDing(11.5, 1174.66);

    // 16s - 19s: Tics de suspenso
    addTick(16.0);
    addTick(17.0);
    addTick(18.0);
    addTick(19.0);

    // 19.5s: Whoosh + Pop de clavada de pin en el mapa de París
    addWhoosh(19.4, 0.4, 0.4);
    addPinPop(19.6);

    // 20.0s: Fanfarria de victoria triunfal (5.000 pts)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(20.0 + idx * 0.06, 3.5, freq, 0.35, 1.5);
    });

    // 20.5s - 25s: Ovación de tribuna
    for (let i = 0; i < 4; i++) {
        addWhoosh(20.5 + i * 1.1, 1.8, 0.22);
    }

    for (let i = 0; i < totalSamples; i++) {
        const clamped = Math.max(-1.0, Math.min(1.0, samples[i]));
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2);
    }

    return buffer;
}

const tempAudioPath = path.join(__dirname, 'temp_audio_psg.wav');
fs.writeFileSync(tempAudioPath, generarAudioProcedural(25.0));

// 2. GENERAR ARCHIVO .ASS (ESTILOS Y TEXTOS PARA EL PSG)
const assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: PillBadge, Arial, 32, &H0076E600, &H00000000, &H00000000, &H90000000, 1, 0, 0, 0, 100, 100, 2, 0, 1, 4, 2, 8, 40, 40, 80, 1
Style: MainHook, Arial, 58, &H00FFFFFF, &H00000000, &H00000000, &H90000000, 1, 0, 0, 0, 100, 100, 1, 0, 1, 6, 4, 8, 40, 40, 140, 1
Style: SubHook, Arial, 38, &H0000D7FF, &H00000000, &H00000000, &H90000000, 1, 0, 0, 0, 100, 100, 1, 0, 1, 5, 3, 8, 40, 40, 220, 1
Style: Clue1, Arial, 42, &H00FFFFFF, &H00000000, &H00000000, &HA0000000, 1, 0, 0, 0, 100, 100, 1, 0, 1, 5, 2, 8, 40, 40, 1330, 1
Style: Clue2, Arial, 42, &H00FFFFFF, &H00000000, &H00000000, &HA0000000, 1, 0, 0, 0, 100, 100, 1, 0, 1, 5, 2, 8, 40, 40, 1440, 1
Style: Clue3, Arial, 42, &H00FFFFFF, &H00000000, &H00000000, &HA0000000, 1, 0, 0, 0, 100, 100, 1, 0, 1, 5, 2, 8, 40, 40, 1550, 1
Style: Urgency, Arial, 46, &H0000D7FF, &H00000000, &H00000000, &H90000000, 1, 0, 0, 0, 100, 100, 2, 0, 1, 6, 3, 8, 40, 40, 1340, 1
Style: Countdown, Arial, 170, &H00303BFF, &H00000000, &H00FFFFFF, &H90000000, 1, 0, 0, 0, 100, 100, 0, 0, 1, 8, 5, 8, 40, 40, 1430, 1
Style: RevealHeader, Arial, 58, &H0076E600, &H00000000, &H00000000, &HB0000000, 1, 0, 0, 0, 100, 100, 2, 0, 1, 7, 4, 8, 40, 40, 1240, 1
Style: RevealCTA, Arial, 36, &H00F8BD38, &H00000000, &H00000000, &HB0000000, 1, 0, 0, 0, 100, 100, 1, 0, 1, 5, 3, 8, 40, 40, 1810, 1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:25.00,PillBadge,,0,0,80,,⚽ ESTADIOS VIRTUALES ⚽
Dialogue: 0,0:00:00.00,0:00:25.00,MainHook,,0,0,140,,¿QUE ESTADIO ES ESTE? 👀
Dialogue: 0,0:00:00.00,0:00:25.00,SubHook,,0,0,220,,Solo el 5% lo reconoce desde el aire

Dialogue: 0,0:00:03.50,0:00:16.00,Clue1,,0,0,1330,,💡 PISTA 1: Capacidad para 48.583 hinchas
Dialogue: 0,0:00:07.50,0:00:16.00,Clue2,,0,0,1440,,🏆 PISTA 2: Sede de la primera final de Champions
Dialogue: 0,0:00:11.50,0:00:16.00,Clue3,,0,0,1550,,⭐ PISTA 3: Aca jugaron Messi, Mbappe y Neymar

Dialogue: 0,0:00:16.00,0:00:19.50,Urgency,,0,0,1340,,⏱️ ¿LO SACASTE? ¡COMENTA YA!
Dialogue: 0,0:00:16.50,0:00:17.50,Countdown,,0,0,1430,,3
Dialogue: 0,0:00:17.50,0:00:18.50,Countdown,,0,0,1430,,{\\c&H0000A5FF&}2
Dialogue: 0,0:00:18.50,0:00:19.50,Countdown,,0,0,1430,,{\\c&H0076E600&}1

Dialogue: 0,0:00:19.50,0:00:25.00,RevealHeader,,0,0,1240,,🎯 ¡PARQUE DE LOS PRINCIPES (PSG)! 🇫🇷
Dialogue: 0,0:00:19.50,0:00:25.00,RevealCTA,,0,0,1810,,👉 Juega gratis en el link de mi perfil 👈
`;

const tempAssPath = path.join(__dirname, 'overlay_psg.ass');
fs.writeFileSync(tempAssPath, assContent, 'utf8');

// 3. RUTAS DE ARCHIVOS
const inputVideoPath = "E:\\Google earth studio\\Francia\\Subidos\\PSG.mp4";
const mapCardPath = path.join(__dirname, 'mapa_psg_card.png');
const outputName = 'Estadio_Parque_De_Los_Principes_PSG.mp4';
const outputDownloads = path.join(process.env.USERPROFILE, 'Downloads', outputName);
const outputDesktop = path.join(process.env.USERPROFILE, 'Desktop', outputName);

if (!fs.existsSync(inputVideoPath)) {
    console.error(`❌ No se encontró el video fuente en: ${inputVideoPath}`);
    process.exit(1);
}

const escapedAssPath = tempAssPath.replace(/\\/g, '/').replace(/:/g, '\\:');

const filterComplex = [
    // Fondo vertical desenfocado (1080x1920) y oscurecido
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.22[bg]`,
    
    // Video central nítido (1080x608)
    `[0:v]scale=1080:608[fg]`,
    
    // Tarjeta del mapa de París de StadiumGuessr (960x460)
    `[2:v]scale=960:460[map]`,
    
    // Superponer video central en el fondo
    `[bg][fg]overlay=0:(H-h)/2[v_drone]`,
    
    // Superponer tarjeta del mapa de París entre el segundo 19.5 y el 25
    `[v_drone][map]overlay=60:1320:enable='between(t,19.5,25)'[base_with_map]`,
    
    // Renderizar tipografía y animaciones .ASS
    `[base_with_map]ass='${escapedAssPath}'[outv]`
].join(';');

const ffmpegArgs = [
    '-y',
    '-t', '25',
    '-i', inputVideoPath,
    '-i', tempAudioPath,
    '-i', mapCardPath,
    '-filter_complex', filterComplex,
    '-map', '[outv]',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '19',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outputDownloads
];

console.log('🎬 Renderizando video Parque de los Príncipes en 1080x1920 (25s)...');
const ffmpeg = spawn('ffmpeg', ffmpegArgs);

let ffmpegStderr = '';
ffmpeg.stderr.on('data', (data) => {
    const msg = data.toString();
    ffmpegStderr += msg;
    const match = msg.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
    if (match) {
        process.stdout.write(`\r⏱️ Progreso: ${match[1]} / 00:00:25.00`);
    }
});

ffmpeg.on('close', (code) => {
    if (fs.existsSync(tempAudioPath)) fs.unlinkSync(tempAudioPath);
    if (fs.existsSync(tempAssPath)) fs.unlinkSync(tempAssPath);

    if (code === 0) {
        fs.copyFileSync(outputDownloads, outputDesktop);
        console.log(`\n\n🎉 ¡VIDEO GENERADO CON ÉXITO!`);
        console.log(`📂 Descargas: ${outputDownloads}`);
        console.log(`📂 Escritorio: ${outputDesktop}`);
        const stat = fs.statSync(outputDownloads);
        console.log(`📊 Tamaño: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
    } else {
        console.error(`\n❌ Error al renderizar. Código: ${code}`);
        console.error(ffmpegStderr);
    }
});
