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
Todo video de trivia individual que se produzca DEBE seguir de forma estricta e innegociable la línea visual del **Olímpico de Roma / Spotify Camp Nou**:

1. **Encuadre y Layout de Video:**
   - Video 16:9 centrado (1080x608) sobre fondo difuminado cinemático (`boxblur=25:5,eq=brightness=-0.22`).
   - **Header flotante superior (`y=50`, 980px ancho):** Eyebrow `ESTADIOS VIRTUALES · STADIUMGUESSR`, Título en 2 líneas obligatorio:
     `¿QUÉ ESTADIO ES`
     `Y DÓNDE QUEDA?`
     y subtítulo en dorado (`¿En cuántos segundos podés adivinarlo?`).
   - **Pistas flotantes inferiores (`y=1330`, 94px alto):** Tarjetas con barra lateral de color iluminada, icono y texto grande.
   - **Cuenta regresiva 3, 2, 1 (`y=1340`).**
   - **Mapa Leaflet flotante inferior (`y=1320`, 960x460px):** OpenStreetMap con pin rojo del usuario, círculo verde del estadio con radio difuso, línea punteada roja, badge superior de puntaje/distancia (`🎯 ¡A [X] METROS! · [X] PUNTOS 🔥`) y badge inferior de ubicación (`📍 [Ciudad, País] · [ESTADIO]`). **Debe dejar libre y visible el video aéreo arriba**.
   - **Banner de revelación (`y=1240`) y Botón CTA (`y=1805`).**

2. **Audio 100% Puro (PROHIBIDO EL WHOOSH / BARRIDO):**
   - **CERO sonidos de barrido / whoosh / ruido blanco** en todo el video (ni al inicio a los 0.2s, ni al pase de mapa a los 19.4s, ni al final).
   - Sonidos permitidos exclusivamente: campanas de pistas (3.5s, 7.5s, 11.5s), ticks de cuenta regresiva (16s-19s), pop del pin (19.6s) y fanfarria tonal de acordes (20.0s).

3. **Portada Misterio (1080x1920 con Zona Segura 3:4):**
   - Badge obligatorio: `ESTADIO...` (estrictamente prohibido poner el nombre del club o estadio en la insignia).
   - Título en 2 líneas: `¿QUÉ ESTADIO ES / Y DÓNDE QUEDA?`.
   - Caja de pista 100% libre de spoilers (solo capacidad, año, ciudad o hitos sin nombrar al club ni al estadio).

4. **Archivos de Salida en Disco:**
   - Destino: `E:\Google earth studio\videos para mostrar\[PAIS]\[ESTADIO]\`
   - Contenido exacto del pack:
     - `Estadio_[Nombre].mp4`
     - `Portada_Estadio_[Nombre].jpg`
     - `TEXTOS_PUBLICACION.txt` (4 variantes: Tiempo, Folclore, Geoguessr, Corta TikTok + comentarios fijados).
   - Prohibido dejar archivos temporales (.png de overlays, snapshots, .wav) en la carpeta final o en la raíz.

5. **Motor Canónico y Frases Clave:**
   - **Frase detonante:** *"hagamos videos para que estadio es y donde queda"* ➔ Interpretar de forma automática como este estándar de `AGENTS.md` y usar exclusivamente `crear_pack_batch.js`.
   - **Frase detonante para duelos:** *"vamos a hacer duelos de capacidad"* ➔ Usar estrictamente el motor oficial de `redes/render_duelo.js` (20.0s, split screen top/bottom, campana de inicio a 1.0s, cuenta regresiva 11-13s, revelación a 14.0s, audio puro sin barridos/whooshes), idéntico a los duelos ya guardados en `E:\Google earth studio\videos para mostrar\DUELO DE CAPACIDAD\`.
   - Jamás crear maquetas experimentales ni alterar las coordenadas del layout.
