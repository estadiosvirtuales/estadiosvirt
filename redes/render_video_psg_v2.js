const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 Renderizando video PSG con diseño 100% idéntico a la web...');

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

    // 19.5s: Whoosh + Pop de clavada de pin en el mapa
    addWhoosh(19.4, 0.4, 0.4);
    addPinPop(19.6);

    // 20.0s: Fanfarria triunfal de 5.000 pts (C5, E5, G5, C6)
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        addTone(20.0 + idx * 0.06, 3.5, freq, 0.35, 1.5);
    });

    // 20.5s - 25s: Ovación de cancha
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

// 2. RUTAS DE ASSETS
const inputVideoPath = "E:\\Google earth studio\\Francia\\Subidos\\PSG.mp4";
const outputName = 'Estadio_Parque_De_Los_Principes_PSG.mp4';
const outputDownloads = path.join(process.env.USERPROFILE, 'Downloads', outputName);
const outputDesktop = path.join(process.env.USERPROFILE, 'Desktop', outputName);

const assets = [
    path.join(__dirname, 'ui_header.png'),       // 2:v
    path.join(__dirname, 'ui_pistas_1.png'),     // 3:v
    path.join(__dirname, 'ui_pistas_2.png'),     // 4:v
    path.join(__dirname, 'ui_pistas_3.png'),     // 5:v
    path.join(__dirname, 'ui_count_3.png'),      // 6:v
    path.join(__dirname, 'ui_count_2.png'),      // 7:v
    path.join(__dirname, 'ui_count_1.png'),      // 8:v
    path.join(__dirname, 'mapa_psg_card.png'),   // 9:v
    path.join(__dirname, 'ui_reveal_title.png'), // 10:v
    path.join(__dirname, 'ui_cta_btn.png')       // 11:v
];

// Comprobar que existen todos los assets
for (const a of assets) {
    if (!fs.existsSync(a)) {
        console.error(`❌ Falta asset: ${a}`);
        process.exit(1);
    }
}

// 3. CONSTRUCCIÓN DEL FILTRO FFMPEG
const filterComplex = [
    // Fondo desenfocado 1080x1920
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:5,eq=brightness=-0.22[bg]`,
    
    // Video central nítido 1080x608
    `[0:v]scale=1080:608[fg]`,
    
    // Superponer video central en el fondo
    `[bg][fg]overlay=0:(H-h)/2[base]`,
    
    // Header superior constante (0s a 25s) en x=50, y=50
    `[base][2:v]overlay=50:50[v_header]`,
    
    // Pistas progresivas (y=1330)
    `[v_header][3:v]overlay=50:1330:enable='between(t,3.5,7.5)'[v_p1]`,
    `[v_p1][4:v]overlay=50:1330:enable='between(t,7.5,11.5)'[v_p2]`,
    `[v_p2][5:v]overlay=50:1330:enable='between(t,11.5,16.0)'[v_p3]`,
    
    // Cuenta regresiva (16.0s a 19.5s)
    `[v_p3][6:v]overlay=50:1340:enable='between(t,16.0,17.5)'[v_c3]`,
    `[v_c3][7:v]overlay=50:1340:enable='between(t,17.5,18.5)'[v_c2]`,
    `[v_c2][8:v]overlay=50:1340:enable='between(t,18.5,19.5)'[v_c1]`,
    
    // FASE FINAL REVELACIÓN (19.5s a 25.0s):
    // 1. Título arriba del mapa
    `[v_c1][10:v]overlay=(W-w)/2:1240:enable='between(t,19.5,25)'[v_rev_title]`,
    // 2. Tarjeta del mapa de París (960x460)
    `[9:v]scale=960:460[map_scaled]`,
    `[v_rev_title][map_scaled]overlay=60:1320:enable='between(t,19.5,25)'[v_map]`,
    // 3. Botón 3D de llamado a la acción
    `[v_map][11:v]overlay=(W-w)/2:1805:enable='between(t,19.5,25)'[outv]`
].join(';');

const ffmpegArgs = [
    '-y',
    '-t', '25',
    '-i', inputVideoPath, // 0:v
    '-i', tempAudioPath,  // 1:a
    '-i', assets[0],      // 2:v
    '-i', assets[1],      // 3:v
    '-i', assets[2],      // 4:v
    '-i', assets[3],      // 5:v
    '-i', assets[4],      // 6:v
    '-i', assets[5],      // 7:v
    '-i', assets[6],      // 8:v
    '-i', assets[7],      // 9:v
    '-i', assets[8],      // 10:v
    '-i', assets[9],      // 11:v
    '-filter_complex', filterComplex,
    '-map', '[outv]',
    '-map', '1:a',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outputDownloads
];

console.log('🎬 Renderizando video Parque de los Príncipes con diseño web en 1080x1920...');
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

    if (code === 0) {
        fs.copyFileSync(outputDownloads, outputDesktop);
        const destFolderE = path.join('E:\\Google earth studio\\videos para mostrar\\PSG-FRANCIA', outputName);
        if (fs.existsSync(path.dirname(destFolderE))) {
            fs.copyFileSync(outputDownloads, destFolderE);
            console.log(`📂 Carpeta E: ${destFolderE}`);
        }
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
