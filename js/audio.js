// ========================================================
// ESTADIOS VIRTUALES - MOTOR DE AUDIO DINÁMICO (WEB AUDIO API)
// 100% Nativo, Sintetizado en tiempo real, Sin descargas de archivos externos
// ========================================================

(function () {
    let audioCtx = null;
    let soundEnabled = localStorage.getItem('ev_sound_enabled') === 'true';

    function initAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function toggleSonidoEfectos() {
        soundEnabled = !soundEnabled;
        localStorage.setItem('ev_sound_enabled', String(soundEnabled));
        actualizarBotonSonido();

        if (soundEnabled) {
            initAudioContext();
            reproducirSonido('acierto');
            if (typeof showToast === 'function') {
                showToast("Efectos de sonido activados 🔊");
            }
        } else {
            if (typeof showToast === 'function') {
                showToast("Efectos de sonido silenciados 🔇");
            }
        }
    }
    window.toggleSonidoEfectos = toggleSonidoEfectos;

    function actualizarBotonSonido() {
        const btn = document.getElementById('sound-toggle-btn');
        const icon = document.getElementById('sound-icon');
        if (!btn || !icon) return;

        if (soundEnabled) {
            btn.classList.add('sound-on');
            btn.setAttribute('title', 'Sonido: Activado (Clic para silenciar)');
            btn.setAttribute('aria-label', 'Silenciar sonido');
            icon.className = 'ph-duotone ph-speaker-high';
        } else {
            btn.classList.remove('sound-on');
            btn.setAttribute('title', 'Sonido: Silenciado (Clic para activar)');
            btn.setAttribute('aria-label', 'Activar sonido');
            icon.className = 'ph-duotone ph-speaker-slash';
        }
    }
    window.actualizarBotonSonido = actualizarBotonSonido;

    function reproducirSonido(tipo) {
        if (!soundEnabled) return;
        const ctx = initAudioContext();
        if (!ctx) return;

        try {
            const now = ctx.currentTime;

            if (tipo === 'click') {
                // Click táctil / pop sutil
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(540, now);
                osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.045);

            } else if (tipo === 'whoosh') {
                // Transición rápida de aire / vuelo
                const dur = 0.16;
                const bufferSize = ctx.sampleRate * dur;
                const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(320, now);
                filter.frequency.exponentialRampToValueAtTime(1800, now + dur);
                filter.Q.setValueAtTime(2.5, now);

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.01, now);
                gain.gain.linearRampToValueAtTime(0.25, now + dur * 0.4);
                gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);
                noise.start(now);

            } else if (tipo === 'acierto' || tipo === 'xp') {
                // Campana armónica brillante de éxito (C5 -> G5)
                const notas = [523.25, 783.99];
                notas.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const t = now + idx * 0.08;

                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, t);

                    gain.gain.setValueAtTime(0.22, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(t);
                    osc.stop(t + 0.38);
                });

            } else if (tipo === 'silbato') {
                // Silbato arbitral real con modulación de bolilla (2 tonos + vibrato ~25Hz)
                const dur = 0.38;
                const baseFreqs = [2850, 3120];

                baseFreqs.forEach(freq => {
                    const osc = ctx.createOscillator();
                    const vibrato = ctx.createOscillator();
                    const vibGain = ctx.createGain();
                    const gain = ctx.createGain();

                    vibrato.frequency.setValueAtTime(28, now); // trino de bolilla
                    vibGain.gain.setValueAtTime(180, now);
                    vibrato.connect(vibGain);
                    vibGain.connect(osc.frequency);

                    osc.frequency.setValueAtTime(freq, now);

                    // 2 pulsos de silbato: Pii-piip
                    gain.gain.setValueAtTime(0.001, now);
                    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
                    gain.gain.setValueAtTime(0.18, now + 0.12);
                    gain.gain.linearRampToValueAtTime(0.02, now + 0.15);
                    gain.gain.linearRampToValueAtTime(0.22, now + 0.18);
                    gain.gain.setValueAtTime(0.22, now + 0.32);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    vibrato.start(now);
                    osc.start(now);
                    vibrato.stop(now + dur);
                    osc.stop(now + dur);
                });

            } else if (tipo === 'gol') {
                // Silenciado a pedido: evita notas de piano / órgano sintético aburrido
                return;

            } else if (tipo === 'reloj') {
                // Latido / Tic-tac tenso de cuenta regresiva
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

                gain.gain.setValueAtTime(0.24, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.065);
            }
        } catch (err) {
            console.warn("Audio synthesis error:", err);
        }
    }
    window.reproducirSonido = reproducirSonido;

    // Resumir AudioContext con cualquier interacción inicial del usuario
    ['click', 'keydown', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, () => {
            if (soundEnabled && audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }, { once: true, passive: true });
    });

})();
