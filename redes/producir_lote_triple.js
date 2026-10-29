const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 ========================================================');
console.log('🚀 PRODUCCIÓN MAESTRA TRIPLE: TRIVIAS + DUELOS + RETOS');
console.log('🚀 ========================================================\n');

const startTime = Date.now();

// 1. TRIVIAS (8 estadios internacionales vírgenes)
console.log('\n========================================================');
console.log('🎬 ETAPA 1/3: PRODUCIENDO 8 TRIVIAS INTERNACIONALES');
console.log('========================================================\n');
const resTrivias = spawnSync(process.execPath, ['redes/crear_pack_batch.js', 'nuevos'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

if (resTrivias.status !== 0) {
    console.error('❌ Error fatal al producir trivias.');
    process.exit(1);
}

// 2. DUELOS DE CAPACIDAD (5 clásicos mundiales)
console.log('\n========================================================');
console.log('🎬 ETAPA 2/3: PRODUCIENDO 5 DUELOS DE CAPACIDAD INTERNACIONALES');
console.log('========================================================\n');
const resDuelos = spawnSync(process.execPath, ['redes/render_duelo.js', 'nuevos'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

if (resDuelos.status !== 0) {
    console.error('❌ Error fatal al producir duelos de capacidad.');
    process.exit(1);
}

// 3. RETOS DIARIOS (#08 México y #09 Italia)
console.log('\n========================================================');
console.log('🎬 ETAPA 3/3: PRODUCIENDO RETOS DIARIOS #08 Y #09');
console.log('========================================================\n');
const resRetos = spawnSync(process.execPath, ['redes/render_reto_diario.js', '8', '9'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

if (resRetos.status !== 0) {
    console.error('❌ Error fatal al producir retos diarios.');
    process.exit(1);
}

const totalMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
console.log(`\n🎉 ========================================================`);
console.log(`🎉 ¡PRODUCCIÓN TRIPLE COMPLETADA CON ÉXITO EN ${totalMin} MINUTOS!`);
console.log(`🎉 8 Trivias + 5 Duelos + 2 Retos Diarios (10 rondas)`);
console.log(`🎉 Total de 15 contenidos de alta calidad listos para publicar.`);
console.log(`🎉 ========================================================`);
