// stage.js - Configurazione dei livelli per Space Invaders
// Ogni livello definisce:
//  - alienRowCount: numero di righe di alieni
//  - alienColumnCount: numero di alieni per riga
//  - alienSpeedFactor: moltiplicatore di velocità degli alieni
//  - alienDropDistance: pixel di discesa al cambio di direzione
//  - alienShootInterval: intervallo (ms) tra i tiri degli alieni
const stageConfig = [
  { level: 1, alienRowCount: 3, alienColumnCount: 8, alienSpeedFactor: 1.0, alienDropDistance: 10, alienShootInterval: 3000 },
  { level: 2, alienRowCount: 3, alienColumnCount: 10, alienSpeedFactor: 1.1, alienDropDistance: 10, alienShootInterval: 2800 },
  { level: 3, alienRowCount: 4, alienColumnCount: 10, alienSpeedFactor: 1.2, alienDropDistance: 12, alienShootInterval: 2600 },
  { level: 4, alienRowCount: 4, alienColumnCount: 11, alienSpeedFactor: 1.3, alienDropDistance: 12, alienShootInterval: 2400 },
  { level: 5, alienRowCount: 4, alienColumnCount: 12, alienSpeedFactor: 1.4, alienDropDistance: 14, alienShootInterval: 2200 },
  { level: 6, alienRowCount: 5, alienColumnCount: 12, alienSpeedFactor: 1.5, alienDropDistance: 14, alienShootInterval: 2000 },
  { level: 7, alienRowCount: 5, alienColumnCount: 13, alienSpeedFactor: 1.6, alienDropDistance: 16, alienShootInterval: 1800 },
  { level: 8, alienRowCount: 5, alienColumnCount: 14, alienSpeedFactor: 1.7, alienDropDistance: 16, alienShootInterval: 1600 },
  { level: 9, alienRowCount: 6, alienColumnCount: 14, alienSpeedFactor: 1.8, alienDropDistance: 18, alienShootInterval: 1400 },
  { level: 10, alienRowCount: 6, alienColumnCount: 15, alienSpeedFactor: 2.0, alienDropDistance: 18, alienShootInterval: 1200 }
];
console.log("stage.js caricato:", stageConfig);
