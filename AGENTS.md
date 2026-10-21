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
