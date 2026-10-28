# 🏟️ Estadios Virtuales — Guía de Arquitectura y Roles de Agente

Bienvenido al repositorio de **Estadios Virtuales** (`www.estadiosvirtuales.com`).
Este documento define la arquitectura general, las reglas técnicas del proyecto y la especialización de conversaciones para trabajar de manera óptima y modular en el IDE Antigravity.

---

## 📁 1. Arquitectura del Proyecto

- **Directorio de Desarrollo:** `c:\Users\Jonathan\Downloads\estadiosvirt-main`
- **Directorio de GitHub Desktop:** `C:\Users\Jonathan\Desktop\estadiosvirt`
- **Regla de Sincronización:** Cada modificación de código debe copiarse al repositorio de Desktop y commitearse con mensajes limpios y descriptivos:
  `& "C:\Users\Jonathan\AppData\Local\GitHubDesktop\app-3.6.7\resources\app\git\cmd\git.exe" commit -m "..."`

### Módulos Principales:
- `index.html`: Estructura principal, modales y layouts.
- `estilos.css`: Estilos visuales, temas oscuro/claro y adaptabilidad móvil (`@media (max-width: 768px)`).
- `js/guessr.js`: Motor de StadiumGuessr (vistas aéreas, Leaflet maps, scoring Haversine, cálculo RPC).
- `js/catalogo.js`: Base de estadios y filtros.
- `js/carrera.js`: Modo Carrera, química de planteles, sinergias de DT y desafíos.
- `js/perfil.js`: Cartas FUT, sobres, avatares y progresión de nivel XP.
- `js/audio.js`: Sintetizador Web Audio API para efectos de sonido nativos (whoosh, click, victoria, acierto).
- `redes/`: Herramientas de difusión para redes sociales (TikTok, Instagram, X/Twitter), generadores de videos verticales 9:16 Full HD (`redes/grabar_pack_tiktok.js`, `redes/render_video_*.js`), overlays y placas gráficas.
- `terminos.html` & `privacy.html`: Blindaje legal, descargo de marcas, nominative fair use y políticas de privacidad (AdSense, cookies DART, GDPR/ARCO).

---

## 🎯 2. Especialización de Conversaciones Recomendadas

Para mantener el contexto rápido, enfocado y profesional, se recomienda organizar el trabajo en estas conversaciones temáticas:

### 🛠️ Conversación 1: Código y Desarrollo Web
- **Propósito:** Corrección de bugs, responsive móvil, mejoras en Leaflet, Supabase, cartas FUT y commits a GitHub.
- **Archivos foco:** `index.html`, `estilos.css`, `js/*.js`.

### 🎬 Conversación 2: Difusión y Videos Virales (TikTok / Reels)
- **Propósito:** Generación de videos con tomas aéreas para la cuenta `@estadiosvirtuales` (17k seguidores), guiones, ganchos virales, copies y hashtags.
- **Archivos foco:** `redes/*`, descargas de videos, catálogo de estadios icónicos.

### 💰 Conversación 3: Monetización y Google AdSense
- **Propósito:** Aprobación e integración de Google AdSense, banners de visualización, optimización de ingresos (eCPM/RPM) sin interferir en la jugabilidad.
- **Archivos foco:** `index.html`, `privacy.html`, `terminos.html`, scripts de AdSense.

### 📈 Conversación 4: Campañas de Publicidad Paga (Ads)
- **Propósito:** Configuración de pauta en TikTok Ads o Meta Ads, segmentación geográfica (Argentina, España, México), embudo de conversión y cálculo de costo por usuario.

### 📊 Conversación 5: Comunidad, Torneos y Retención
- **Propósito:** Dinámicas para los 17.000 seguidores de TikTok: torneos 1v1 en salas privadas, Reto Diario semanal, copas comunitarias y ranking.

### 🌐 Conversación 6: SEO & Posicionamiento Orgánico en Google
- **Propósito:** Captación de tráfico orgánico no pago posicionando en Google con metaetiquetas Open Graph, Schema.org estructurado y sitemaps.
- **Archivos foco:** `index.html`, `sitemap.xml`, `robots.txt`.

---

## 🛡️ 3. Reglas Técnicas Inmutables
1. **Preservar estilos de escritorio al tocar celulares:** Cualquier cambio responsive debe limitarse a `@media (max-width: 768px)`.
2. **Audio nativo:** No depender de librerías externas de audio; usar el sintetizador procedural de `js/audio.js`.
3. **Legal Blindado:** Mantener siempre el disclaimer de no afiliación oficial (Fair Use) y enlaces a términos y privacidad.

---

## 🎬 4. Estándar Inmutable para Videos Verticales (TikTok / Reels / Shorts)
El canal cuenta con **3 formatos canónicos oficiales** de alta retención que deben respetarse rigurosamente:

### Formato 1: Trivia Individual («¿Qué estadio es y dónde queda?»)
Sigue de forma estricta la línea visual del **Olímpico de Roma / Spotify Camp Nou**:
1. **Encuadre y Layout de Video:**
   - Video 16:9 centrado (1080x608) sobre fondo difuminado cinemático (`boxblur=25:5,eq=brightness=-0.22`).
   - **Header flotante superior (`y=50`, 980px ancho):** Eyebrow `ESTADIOS VIRTUALES · STADIUMGUESSR`, Título en 2 líneas obligatorio:
     `¿QUÉ ESTADIO ES`
     `Y DÓNDE QUEDA?`
     y subtítulo en dorado (`¿En cuántos segundos podés adivinarlo?`).
   - **Pistas flotantes inferiores (`y=1330`, 94px alto):** Tarjetas con barra lateral de color iluminada, icono y texto grande.
   - **Cuenta regresiva 3, 2, 1 (`y=1340`).**
   - **Mapa Leaflet flotante inferior (`y=1320`, 960x460px):** OpenStreetMap con pin rojo del usuario, círculo verde del estadio con radio difuso, línea punteada roja, badge superior de puntaje/distancia (`🎯 ¡A [X] METROS! · [X] PUNTOS 🔥`) y badge inferior de ubicación (`📍 [Ciudad, País] · [ESTADIO]`). **Debe dejar libre y visible el video aéreo arriba**.
   - **Banner de revelación (`y=420`, centrado entre el header superior y el video) y Botón CTA (`y=1790`).**
   - **Motor:** `redes/crear_pack_batch.js` (25.0s).

### Formato 2: Duelo de Capacidad («¿Cuál es más grande?»)
1. **Encuadre y Layout:**
   - Pantalla dividida 50/50 vertical (top/bottom) para enfrentar dos canchas.
   - Campana de inicio a 1.0s, cuenta regresiva a 11-13s, revelación de capacidad con barras luminosas a 14.0s.
   - **Motor:** `redes/render_duelo.js` (20.0s).

### Formato 3: Reto Diario Oficial («5 Estadios · 25.000 Puntos»)
Muestra la jugabilidad real y auténtica de la web en ráfaga rápida:
1. **Encuadre y Layout (35.0s):**
   - Video 16:9 centrado (1080x608) sobre fondo difuminado cinemático (`y=656`).
   - **Header superior dinámico (`y=50`, 980px):** Contador de rondas con dots activos (`[🟩 R1] [🟩 R2] [⚪ R3]...`) y puntaje acumulado en vivo.
   - **5 rondas consecutivas de 6s cada una:** 0 a 3.5s pista flotante inferior (`y=1330`), 3.5 a 6.0s mapa Leaflet 960x460 (`y=1320`) con tiles 100% cargados, pin cayendo y distancia/puntos obtenidos.
   - **Pantalla final Wordle (30s a 35s, centrado vertical):** Modal auténtico con rango (`👑 GALÁCTICO ABSOLUTO`), puntuación total sobre 25.000, grilla de emojis (`🟩 🟩 🟩 🟩 🟩`), sección «ESTADIOS DE ESTE RETO» desglosando los 5 estadios y clubes de cada ronda (`[R1]`-`[R5]`) y llamado a la acción (`¿PODÉS SUPERAR MI PUNTAJE DE HOY? JUGALO GRATIS EN WWW.ESTADIOSVIRTUALES.COM`).
   - **Motor:** `redes/render_reto_diario.js` (35.0s).

---

## 🎵 5. Reglas de Audio y Portadas (Comunes a los 3 Formatos)
1. **Audio 100% Puro (PROHIBIDO EL WHOOSH / BARRIDO):**
   - **CERO sonidos de barrido / whoosh / ruido blanco** en todo el video.
   - Sonidos permitidos exclusivamente: campanas armónicas de pistas/rondas, ticks de tensión, pop del pin en el mapa y acordes de victoria triunfal.

2. **Portada Misterio (1080x1920 con Zona Segura 3:4):**
   - Retención máxima con cero spoilers (estrictamente prohibido poner los nombres de los estadios o ganadores).
   - Tipografía grande y visible en la cuadrícula de perfiles de TikTok e Instagram.

3. **Archivos de Salida en Disco:**
   - Destino según formato:
     - Trivia: `E:\Google earth studio\videos para mostrar\TRIVIAS\[PAIS]\[CATEGORIA]\[ESTADIO]\`
     - Duelos: `E:\Google earth studio\videos para mostrar\DUELO DE CAPACIDAD\[DUELO]\`
     - Reto Diario: `E:\Google earth studio\videos para mostrar\RETO DIARIO\[RETO]\`
   - Contenido exacto del pack: Video MP4, Portada JPG y `TEXTOS_PUBLICACION.txt` (4 variantes + comentarios fijados). Prohibido dejar archivos temporales.

4. **Frases Detonantes:**
   - *"hagamos videos para que estadio es y donde queda"* ➔ `redes/crear_pack_batch.js`.
   - *"vamos a hacer duelos de capacidad"* ➔ `redes/render_duelo.js`.
   - *"hagamos reto diario"* ➔ `redes/render_reto_diario.js`.
   - Jamás crear maquetas experimentales ni alterar las coordenadas del layout.
