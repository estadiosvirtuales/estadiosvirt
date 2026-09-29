// ========================================================
// 🏆 ESTADIOSVIRTUALES.COM - MÓDULO: STORAGE & PREFERENCIAS
// ========================================================
// Este módulo maneja toda la persistencia de datos en localStorage
// Mantiene compatibilidad total con el código existente

(function() {
    'use strict';

    /**
     * Obtiene el ID del usuario actual (autenticado o guest)
     * @returns {string} ID del usuario
     */
    window.getUserId = function() {
        const u = obtenerUsuarioLogueado();
        return u ? u.id : 'guest';
    };

    /**
     * Obtiene una preferencia del usuario desde localStorage
     * @param {string} key - Clave de la preferencia
     * @param {string} def - Valor por defecto
     * @returns {string} Valor almacenado o valor por defecto
     */
    window.getPref = function(key, def) {
        const id = getUserId();
        return localStorage.getItem(key + '_' + id) || def;
    };

    /**
     * Guarda una preferencia del usuario en localStorage
     * @param {string} key - Clave de la preferencia
     * @param {string} val - Valor a guardar
     */
    window.setPref = function(key, val) {
        const id = getUserId();
        localStorage.setItem(key + '_' + id, val);
    };

    /**
     * Obtiene nombre para mostrar del usuario
     * Intenta primero con el apodo personalizado, luego nombre real, luego valor por defecto
     * @returns {string} Nombre a mostrar
     */
    window.obtenerNombreDisplay = function() {
        const customNick = getPref('ev_custom_nick', '');
        if (customNick) return customNick;
        
        const u = obtenerUsuarioLogueado();
        if (u) return u.name.split(' ')[0];
        
        return 'Jugador';
    };

})();
