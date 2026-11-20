export type FactionPath = 'intel' | 'amd';

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 'right' | 'left';
  temp: number; // 30°C to 100°C (100 = thermal throttle death)
  health: number; // max 4 lives / hearts
  hasDoubleJump: boolean;
  doubleJumpUsed: boolean;
  isDashing: boolean;
  dashCooldown: number;
  invincibleTimer: number;
  score: number;
  fpsCounter: number;
  // GPU Powerup Timers (frames remaining at 60fps)
  speedBoostTimer: number;
  invulnerableBonusTimer: number;
  tripleShotTimer: number;
  chronoTimer: number;
  // Checkpoint respawn coordinates
  checkpointX: number;
  checkpointY: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy?: number;
  radius: number;
  color: string;
  isEnemy: boolean;
  damage?: number;
}

export interface Enemy {
  id: number;
  type: 'lag' | 'thermal' | 'glitch' | 'miniboss' | 'boss' | 'secret_boss';
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  shootCooldown: number;
  patrolMinX: number;
  patrolMaxX: number;
  virusVariant?: 'pyroworm' | 'trojanphage' | 'cryptoparasite' | 'titan' | 'zeroday' | 'spectre_intel' | 'bottleneck_amd' | 'cache_guardian';
  factionTheme?: FactionPath;
}

export interface CollectibleItem {
  id: string;
  name: string;
  type:
    | 'cpu'
    | 'cooler'
    | 'motherboard'
    | 'ram'
    | 'storage'
    | 'psu'
    | 'gpu'
    | 'paste'
    | 'expo'
    | 'gpu_chip_speed'
    | 'gpu_chip_shield'
    | 'gpu_chip_overclock'
    | 'gpu_chip_chrono';
  categoryLabel: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  iconSymbol: string;
  collected: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'silicon' | 'copper' | 'neon' | 'pcie' | 'cryo' | 'intel_fortress' | 'amd_nexus' | 'moving' | 'bounce' | 'cryo_vent';
  moveAxis?: 'x' | 'y';
  moveRange?: number;
  moveSpeed?: number;
  originX?: number;
  originY?: number;
  prevX?: number;
  prevY?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface QuestionBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'question' | 'brick' | 'hidden';
  content: 'coin' | 'paste' | 'gpu_star' | 'gpu_speed' | 'gpu_overclock' | 'gpu_chrono' | '1up' | 'empty';
  coinsCount?: number;
  isHit: boolean;
  bumpOffsetY: number;
  bumpVy: number;
  revealed: boolean;
  shattered?: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale?: number;
}

export interface HiddenArea {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  discovered: boolean;
}

export interface CheckpointFlag {
  id: string;
  x: number;
  y: number;
  activated: boolean;
  label: string;
}

export interface LevelBlueprint {
  levelWidth: number;
  levelName: string;
  levelSubtitle: string;
  platforms: Platform[];
  blocks: QuestionBlock[];
  hiddenAreas: HiddenArea[];
  collectibles: CollectibleItem[];
  enemies: Enemy[];
  checkpoints: CheckpointFlag[];
  isSecretBoss?: boolean;
  factionPath?: FactionPath | null;
}

export function buildLevelBlueprint(
  lvl: number,
  playerScore: number,
  factionPath: FactionPath | null
): LevelBlueprint {
  if (lvl === 1) {
    return {
      levelWidth: 2600,
      levelName: 'Reino 1: Valle de Silicio & Latencias',
      levelSubtitle: 'Vence a los Bugs de Latencia y rescata el Procesador Base y la Placa Taichi',
      platforms: [
        { x: 0, y: 440, width: 2800, height: 60, type: 'silicon' },
        { x: 580, y: 520, width: 440, height: 24, type: 'neon' },
        { x: 1060, y: 520, width: 320, height: 24, type: 'neon' },
        { x: 880, y: 130, width: 110, height: 16, type: 'neon' },
        { x: 1040, y: 100, width: 120, height: 16, type: 'neon' },
        { x: 1200, y: 120, width: 120, height: 16, type: 'neon' },
        { x: 220, y: 350, width: 140, height: 18, type: 'silicon' },
        { x: 420, y: 280, width: 160, height: 18, type: 'silicon' },
        { x: 650, y: 220, width: 120, height: 18, type: 'silicon' },
        // Bounce pad to reach Cielos de Silicio easily!
        { x: 785, y: 426, width: 46, height: 14, type: 'bounce' },
        { x: 840, y: 320, width: 150, height: 18, type: 'silicon' },
        // Moving Data Bridge
        { x: 1030, y: 240, width: 140, height: 18, type: 'moving', moveAxis: 'x', moveRange: 90, moveSpeed: 1.4, originX: 1030, originY: 240 },
        { x: 1300, y: 330, width: 130, height: 18, type: 'silicon' },
        { x: 1520, y: 250, width: 160, height: 18, type: 'silicon' },
        { x: 1780, y: 200, width: 150, height: 18, type: 'silicon' },
        { x: 1840, y: 270, width: 240, height: 18, type: 'neon' },
        { x: 2020, y: 300, width: 140, height: 18, type: 'silicon' },
        { x: 2280, y: 340, width: 220, height: 18, type: 'silicon' }
      ],
      checkpoints: [
        { id: 'cp-1', x: 1350, y: 280, activated: false, label: 'Checkpoint Silicio' }
      ],
      blocks: [
        { id: 'b1-1', x: 240, y: 260, width: 32, height: 32, type: 'question', content: 'coin', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-2', x: 274, y: 260, width: 32, height: 32, type: 'brick', content: 'empty', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-3', x: 308, y: 260, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-4', x: 342, y: 260, width: 32, height: 32, type: 'brick', content: 'coin', coinsCount: 5, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-5', x: 376, y: 260, width: 32, height: 32, type: 'question', content: 'gpu_speed', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-6', x: 670, y: 130, width: 32, height: 32, type: 'question', content: 'coin', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-7', x: 704, y: 130, width: 32, height: 32, type: 'brick', content: 'empty', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-8', x: 860, y: 220, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-hid1', x: 880, y: 155, width: 32, height: 32, type: 'hidden', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: false },
        { id: 'b1-hid2', x: 1040, y: 140, width: 32, height: 32, type: 'hidden', content: 'gpu_overclock', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: false },
        { id: 'b1-sub1', x: 660, y: 440, width: 32, height: 32, type: 'question', content: 'coin', coinsCount: 8, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sub2', x: 780, y: 440, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sub3', x: 900, y: 440, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sky1', x: 1060, y: 40, width: 32, height: 32, type: 'question', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sec1', x: 1860, y: 200, width: 32, height: 32, type: 'question', content: 'coin', coinsCount: 10, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sec2', x: 1894, y: 200, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sec3', x: 1928, y: 200, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sec4', x: 1962, y: 200, width: 32, height: 32, type: 'question', content: 'gpu_overclock', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b1-sec5', x: 1996, y: 200, width: 32, height: 32, type: 'question', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true }
      ],
      hiddenAreas: [
        { id: 'sec-1-1', name: 'BÓVEDA OCULTA DE OVERCLOCK', x: 1840, y: 140, width: 220, height: 160, discovered: false },
        { id: 'sec-1-2', name: 'CONDUCTO CRYO SUBTERRÁNEO', x: 560, y: 460, width: 440, height: 90, discovered: false },
        { id: 'sec-1-3', name: 'CIELOS DE SILICIO', x: 880, y: 60, width: 400, height: 90, discovered: false }
      ],
      collectibles: [
        { id: 'comp-cpu', name: 'Chip Núcleo Maestro', type: 'cpu', categoryLabel: 'CPU Base (16C/32T)', x: 480, y: 235, width: 32, height: 32, color: '#ef4444', iconSymbol: 'CPU', collected: false },
        { id: 'comp-paste-1', name: 'Pasta Térmica Kryonaut Extreme', type: 'paste', categoryLabel: 'Refrigeración -25°C', x: 700, y: 180, width: 24, height: 24, color: '#38bdf8', iconSymbol: '❄', collected: false },
        { id: 'gpu-chip-speed-1', name: 'Chip GPU DLSS Turbo Boost', type: 'gpu_chip_speed', categoryLabel: 'Powerup GPU: +70% Velocidad', x: 1100, y: 195, width: 32, height: 32, color: '#06b6d4', iconSymbol: '⚡GPU', collected: false },
        { id: 'comp-mb', name: 'Placa Base Doble Salto', type: 'motherboard', categoryLabel: 'Placa Base (Doble Salto Activado)', x: 1580, y: 205, width: 32, height: 32, color: '#f59e0b', iconSymbol: 'MB', collected: false },
        { id: 'gpu-chip-shield-1', name: 'Chip GPU Ray-Shield Armor', type: 'gpu_chip_shield', categoryLabel: 'Powerup GPU: Invulnerabilidad', x: 1830, y: 155, width: 32, height: 32, color: '#10b981', iconSymbol: '🛡GPU', collected: false },
        { id: 'comp-ram', name: 'G.Skill Trident Z5 RGB 64GB DDR5', type: 'ram', categoryLabel: 'Memoria RAM', x: 2100, y: 255, width: 28, height: 28, color: '#a855f7', iconSymbol: 'RAM', collected: false }
      ],
      enemies: [
        { id: 1, type: 'lag', name: 'Virus Trojan-Lag v1.0', virusVariant: 'trojanphage', x: 450, y: 405, vx: 1.5, vy: 0, width: 32, height: 32, health: 2, maxHealth: 2, shootCooldown: 90, patrolMinX: 300, patrolMaxX: 600 },
        { id: 2, type: 'glitch', name: 'Virus Cripto-Parásito', virusVariant: 'cryptoparasite', x: 880, y: 285, vx: 2.0, vy: 0, width: 28, height: 28, health: 3, maxHealth: 3, shootCooldown: 80, patrolMinX: 840, patrolMaxX: 990 },
        { id: 3, type: 'thermal', name: 'Virus Pyro-Worm Throttling', virusVariant: 'pyroworm', x: 1340, y: 405, vx: 1.8, vy: 0, width: 32, height: 32, health: 3, maxHealth: 3, shootCooldown: 100, patrolMinX: 1200, patrolMaxX: 1600 },
        { id: 4, type: 'lag', name: 'Fago Corruptor de Driver', virusVariant: 'trojanphage', x: 1820, y: 165, vx: 2.2, vy: 0, width: 30, height: 30, health: 3, maxHealth: 3, shootCooldown: 70, patrolMinX: 1780, patrolMaxX: 1930 }
      ]
    };
  }

  if (lvl === 2) {
    return {
      levelWidth: 2800,
      levelName: 'Reino 2: El Cañón Térmico de Cobre',
      levelSubtitle: 'Evita el Throttling a 100°C usando Ventilas Criogénicas y rescata la Refrigeración Líquida',
      platforms: [
        { x: 0, y: 440, width: 3000, height: 60, type: 'copper' },
        { x: 700, y: 520, width: 450, height: 24, type: 'neon' },
        { x: 1100, y: 120, width: 300, height: 18, type: 'copper' },
        { x: 200, y: 360, width: 140, height: 18, type: 'copper' },
        { x: 400, y: 290, width: 150, height: 18, type: 'copper' },
        { x: 620, y: 230, width: 130, height: 18, type: 'copper' },
        // Cryo Vent cooling zone!
        { x: 760, y: 426, width: 64, height: 14, type: 'cryo_vent' },
        { x: 860, y: 310, width: 160, height: 18, type: 'copper' },
        { x: 1100, y: 240, width: 150, height: 18, type: 'moving', moveAxis: 'y', moveRange: 65, moveSpeed: 1.2, originX: 1100, originY: 240 },
        { x: 1340, y: 320, width: 170, height: 18, type: 'copper' },
        { x: 1600, y: 240, width: 180, height: 18, type: 'copper' },
        { x: 1850, y: 260, width: 220, height: 18, type: 'neon' },
        { x: 2100, y: 426, width: 48, height: 14, type: 'bounce' },
        { x: 2200, y: 220, width: 150, height: 18, type: 'copper' },
        { x: 2450, y: 340, width: 250, height: 18, type: 'copper' }
      ],
      checkpoints: [
        { id: 'cp-2', x: 1380, y: 270, activated: false, label: 'Checkpoint Térmico' }
      ],
      blocks: [
        { id: 'b2-1', x: 220, y: 270, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-2', x: 254, y: 270, width: 32, height: 32, type: 'brick', content: 'coin', coinsCount: 6, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-3', x: 288, y: 270, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-4', x: 440, y: 200, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-hid1', x: 640, y: 150, width: 32, height: 32, type: 'hidden', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: false },
        { id: 'b2-sub1', x: 750, y: 440, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-sub2', x: 880, y: 440, width: 32, height: 32, type: 'question', content: 'gpu_speed', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-sub3', x: 1010, y: 440, width: 32, height: 32, type: 'question', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-sec1', x: 1870, y: 190, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-sec2', x: 1904, y: 190, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b2-sec3', x: 1938, y: 190, width: 32, height: 32, type: 'question', content: 'coin', coinsCount: 8, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true }
      ],
      hiddenAreas: [
        { id: 'sec-2-1', name: 'CÁMARA CRIOGÉNICA DE REFRIGERACIÓN', x: 700, y: 460, width: 450, height: 90, discovered: false },
        { id: 'sec-2-2', name: 'GRUTA DE COBRE Y TITANIO', x: 1840, y: 140, width: 240, height: 160, discovered: false }
      ],
      collectibles: [
        { id: 'comp-cooler', name: 'Custom Liquid Cooling Loop 420mm', type: 'cooler', categoryLabel: 'Refrigeración Extrema', x: 670, y: 185, width: 32, height: 32, color: '#06b6d4', iconSymbol: 'AIO', collected: false },
        { id: 'gpu-chip-overclock-2', name: 'Chip GPU Tensor Overclock', type: 'gpu_chip_overclock', categoryLabel: 'Powerup GPU: Disparo Triple', x: 910, y: 265, width: 32, height: 32, color: '#f59e0b', iconSymbol: '💥GPU', collected: false },
        { id: 'gpu-chip-shield-2', name: 'Chip GPU Ray-Shield Armor', type: 'gpu_chip_shield', categoryLabel: 'Powerup GPU: Invulnerabilidad', x: 1390, y: 275, width: 32, height: 32, color: '#10b981', iconSymbol: '🛡GPU', collected: false },
        { id: 'comp-psu', name: 'Seasonic TX-1600W Titanium ATX 3.1', type: 'psu', categoryLabel: 'Fuente de Poder', x: 1680, y: 195, width: 32, height: 32, color: '#eab308', iconSymbol: 'PSU', collected: false },
        { id: 'gpu-chip-speed-2', name: 'Chip GPU DLSS Turbo Boost', type: 'gpu_chip_speed', categoryLabel: 'Powerup GPU: +70% Velocidad', x: 1950, y: 235, width: 32, height: 32, color: '#06b6d4', iconSymbol: '⚡GPU', collected: false },
        { id: 'comp-ssd', name: 'Crucial T705 4TB NVMe PCIe 5.0', type: 'storage', categoryLabel: 'SSD Ultra Rápido', x: 2250, y: 175, width: 30, height: 30, color: '#10b981', iconSymbol: 'M.2', collected: false }
      ],
      enemies: [
        { id: 11, type: 'thermal', name: 'Virus Pyro-Worm 95°C', virusVariant: 'pyroworm', x: 440, y: 250, vx: 2.2, vy: 0, width: 36, height: 36, health: 4, maxHealth: 4, shootCooldown: 60, patrolMinX: 400, patrolMaxX: 550 },
        { id: 12, type: 'thermal', name: 'Virus Calcinador VRM', virusVariant: 'pyroworm', x: 900, y: 400, vx: 2.5, vy: 0, width: 38, height: 38, health: 4, maxHealth: 4, shootCooldown: 50, patrolMinX: 800, patrolMaxX: 1200 },
        { id: 13, type: 'glitch', name: 'Virus Parásito Fuga de Watts', virusVariant: 'cryptoparasite', x: 1650, y: 200, vx: 2.0, vy: 0, width: 32, height: 32, health: 4, maxHealth: 4, shootCooldown: 65, patrolMinX: 1600, patrolMaxX: 1780 }
      ]
    };
  }

  if (lvl === 3) {
    return {
      levelWidth: 3000,
      levelName: 'Reino 3: Ciudadela de Ray Tracing',
      levelSubtitle: 'Consigue la Bestia RTX 5090 32GB y el Gabinete Acuario de Cristal',
      platforms: [
        { x: 0, y: 440, width: 3200, height: 60, type: 'neon' },
        { x: 740, y: 520, width: 480, height: 24, type: 'neon' },
        { x: 1250, y: 110, width: 320, height: 18, type: 'neon' },
        { x: 220, y: 350, width: 140, height: 18, type: 'neon' },
        { x: 440, y: 270, width: 160, height: 18, type: 'neon' },
        { x: 680, y: 200, width: 140, height: 18, type: 'neon' },
        { x: 920, y: 290, width: 170, height: 18, type: 'neon' },
        { x: 1180, y: 220, width: 150, height: 18, type: 'moving', moveAxis: 'x', moveRange: 110, moveSpeed: 1.7, originX: 1180, originY: 220 },
        { x: 1480, y: 310, width: 180, height: 18, type: 'neon' },
        { x: 1780, y: 230, width: 160, height: 18, type: 'neon' },
        { x: 1980, y: 426, width: 48, height: 14, type: 'bounce' },
        { x: 2100, y: 250, width: 220, height: 18, type: 'neon' },
        { x: 2360, y: 200, width: 180, height: 18, type: 'neon' },
        { x: 2650, y: 340, width: 300, height: 18, type: 'neon' }
      ],
      checkpoints: [
        { id: 'cp-3', x: 1530, y: 260, activated: false, label: 'Checkpoint Ray Tracing' }
      ],
      blocks: [
        { id: 'b3-1', x: 240, y: 260, width: 32, height: 32, type: 'question', content: 'gpu_overclock', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-2', x: 274, y: 260, width: 32, height: 32, type: 'brick', content: 'coin', coinsCount: 8, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-3', x: 308, y: 260, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-hid1', x: 700, y: 130, width: 32, height: 32, type: 'hidden', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: false },
        { id: 'b3-sub1', x: 800, y: 440, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-sub2', x: 920, y: 440, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-sub3', x: 1040, y: 440, width: 32, height: 32, type: 'question', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-sec1', x: 2120, y: 180, width: 32, height: 32, type: 'question', content: 'coin', coinsCount: 15, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-sec2', x: 2154, y: 180, width: 32, height: 32, type: 'question', content: 'gpu_chrono', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b3-sec3', x: 2188, y: 180, width: 32, height: 32, type: 'question', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true }
      ],
      hiddenAreas: [
        { id: 'sec-3-1', name: 'SÓTANO CUÁNTICO DE RAY TRACING', x: 740, y: 460, width: 480, height: 90, discovered: false },
        { id: 'sec-3-2', name: 'BÓVEDA HOLOGRÁFICA RTX SUPREMA', x: 2090, y: 130, width: 240, height: 160, discovered: false }
      ],
      collectibles: [
        { id: 'comp-case', name: 'Lian Li O11 Dynamic EVO Cristal', type: 'motherboard', categoryLabel: 'Chasis Acuario Cristal Templado', x: 730, y: 155, width: 32, height: 32, color: '#ec4899', iconSymbol: 'CASE', collected: false },
        { id: 'gpu-chip-overclock-3', name: 'Chip GPU Tensor Overclock', type: 'gpu_chip_overclock', categoryLabel: 'Powerup GPU: Disparo Triple', x: 970, y: 245, width: 32, height: 32, color: '#f59e0b', iconSymbol: '💥GPU', collected: false },
        { id: 'gpu-chip-speed-3', name: 'Chip GPU DLSS Turbo Boost', type: 'gpu_chip_speed', categoryLabel: 'Powerup GPU: +70% Velocidad', x: 1530, y: 265, width: 32, height: 32, color: '#06b6d4', iconSymbol: '⚡GPU', collected: false },
        { id: 'gpu-chip-shield-3', name: 'Chip GPU Ray-Shield Armor', type: 'gpu_chip_shield', categoryLabel: 'Powerup GPU: Invulnerabilidad', x: 2120, y: 225, width: 32, height: 32, color: '#10b981', iconSymbol: '🛡GPU', collected: false },
        { id: 'comp-gpu', name: 'NVIDIA GeForce RTX 5090 32GB GDDR7', type: 'gpu', categoryLabel: 'GPU Legendaria (+250 FPS)', x: 2420, y: 150, width: 36, height: 36, color: '#22c55e', iconSymbol: 'RTX', collected: false }
      ],
      enemies: [
        { id: 21, type: 'glitch', name: 'Virus Cripto-Minero VRAM', virusVariant: 'cryptoparasite', x: 480, y: 230, vx: 2.5, vy: 0, width: 34, height: 34, health: 5, maxHealth: 5, shootCooldown: 50, patrolMinX: 440, patrolMaxX: 600 },
        { id: 22, type: 'thermal', name: 'Virus Ray-Tracing Overdraw', virusVariant: 'pyroworm', x: 1220, y: 180, vx: 2.8, vy: 0, width: 38, height: 38, health: 5, maxHealth: 5, shootCooldown: 45, patrolMinX: 1200, patrolMaxX: 1360 },
        { id: 23, type: 'lag', name: 'Virus Fago G-Sync Corruption', virusVariant: 'trojanphage', x: 1800, y: 190, vx: 3.0, vy: 0, width: 36, height: 36, health: 6, maxHealth: 6, shootCooldown: 40, patrolMinX: 1780, patrolMaxX: 1940 }
      ]
    };
  }

  if (lvl === 4) {
    // NEW LEVEL 4: AUTOPISTA PCIe 5.0 & BÓVEDA DE MEMORIA
    return {
      levelWidth: 3200,
      levelName: 'Reino 4: Autopista PCIe 5.0 & Bóveda RAM',
      levelSubtitle: 'Supera los carriles de alta velocidad y derrota al Guardián Cache-Miss',
      platforms: [
        { x: 0, y: 440, width: 920, height: 60, type: 'pcie' },
        // Gap 1 with moving bus platform!
        { x: 960, y: 410, width: 160, height: 20, type: 'moving', moveAxis: 'x', moveRange: 130, moveSpeed: 2.2, originX: 960, originY: 410 },
        { x: 1280, y: 440, width: 800, height: 60, type: 'pcie' },
        // Gap 2 with double bounce / vertical bridge
        { x: 2140, y: 420, width: 150, height: 20, type: 'moving', moveAxis: 'y', moveRange: 90, moveSpeed: 1.8, originX: 2140, originY: 420 },
        { x: 2340, y: 440, width: 950, height: 60, type: 'pcie' },

        // Upper PCIe Lanes
        { x: 260, y: 340, width: 160, height: 18, type: 'pcie' },
        { x: 520, y: 260, width: 180, height: 18, type: 'pcie' },
        { x: 760, y: 426, width: 48, height: 14, type: 'bounce' },
        { x: 840, y: 170, width: 280, height: 18, type: 'neon' }, // Secret sky lane
        { x: 1420, y: 320, width: 170, height: 18, type: 'pcie' },
        { x: 1680, y: 230, width: 190, height: 18, type: 'pcie' },
        { x: 1940, y: 310, width: 120, height: 18, type: 'pcie' },
        { x: 2480, y: 300, width: 200, height: 18, type: 'pcie' },
        { x: 2740, y: 210, width: 160, height: 18, type: 'pcie' }
      ],
      checkpoints: [
        { id: 'cp-4', x: 1440, y: 270, activated: false, label: 'Checkpoint PCIe 5.0' }
      ],
      blocks: [
        { id: 'b4-1', x: 280, y: 245, width: 32, height: 32, type: 'question', content: 'gpu_chrono', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b4-2', x: 314, y: 245, width: 32, height: 32, type: 'brick', content: 'coin', coinsCount: 6, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b4-3', x: 560, y: 170, width: 32, height: 32, type: 'question', content: 'gpu_overclock', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b4-sky1', x: 880, y: 90, width: 32, height: 32, type: 'question', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b4-sky2', x: 920, y: 90, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b4-sky3', x: 960, y: 90, width: 32, height: 32, type: 'question', content: 'coin', coinsCount: 10, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b4-mid1', x: 1720, y: 140, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b4-hid1', x: 1760, y: 140, width: 32, height: 32, type: 'hidden', content: 'gpu_chrono', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: false },
        { id: 'b4-end1', x: 2540, y: 205, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true }
      ],
      hiddenAreas: [
        { id: 'sec-4-1', name: 'BÓVEDA GEN 5 DE LATENCIA CERO', x: 830, y: 70, width: 300, height: 120, discovered: false }
      ],
      collectibles: [
        { id: 'gpu-chip-chrono-4', name: 'Chip GPU Chrono-Sync (Tiempo Bala)', type: 'gpu_chip_chrono', categoryLabel: 'Powerup GPU: Ralentiza Enemigos 7s', x: 580, y: 215, width: 32, height: 32, color: '#a855f7', iconSymbol: '⏱GPU', collected: false },
        { id: 'comp-ram-cudimm', name: 'G.Skill Trident Z5 CUDIMM 9200MT/s', type: 'ram', categoryLabel: 'RAM Extrema Alta Frecuencia', x: 1020, y: 125, width: 32, height: 32, color: '#38bdf8', iconSymbol: 'DDR5', collected: false },
        { id: 'gpu-chip-speed-4', name: 'Chip GPU DLSS Turbo Boost', type: 'gpu_chip_speed', categoryLabel: 'Powerup GPU: +70% Velocidad', x: 1740, y: 185, width: 32, height: 32, color: '#06b6d4', iconSymbol: '⚡GPU', collected: false },
        { id: 'comp-ssd-gen5', name: 'Crucial T705 2TB PCIe 5.0 (14.5 GB/s)', type: 'storage', categoryLabel: 'SSD Máxima Velocidad', x: 2790, y: 165, width: 32, height: 32, color: '#10b981', iconSymbol: 'GEN5', collected: false }
      ],
      enemies: [
        { id: 41, type: 'lag', name: 'Virus Latencia DDR5', virusVariant: 'trojanphage', x: 400, y: 405, vx: 2.5, vy: 0, width: 34, height: 34, health: 4, maxHealth: 4, shootCooldown: 60, patrolMinX: 250, patrolMaxX: 700 },
        { id: 42, type: 'glitch', name: 'Parásito Bandwidth Leak', virusVariant: 'cryptoparasite', x: 1450, y: 405, vx: 2.8, vy: 0, width: 36, height: 36, health: 5, maxHealth: 5, shootCooldown: 55, patrolMinX: 1320, patrolMaxX: 1850 },
        { id: 43, type: 'thermal', name: 'Gusano Controlador Gen5', virusVariant: 'pyroworm', x: 1700, y: 190, vx: 2.4, vy: 0, width: 34, height: 34, health: 5, maxHealth: 5, shootCooldown: 55, patrolMinX: 1680, patrolMaxX: 1860 },
        // Mini-Boss Guardián Cache-Miss near the end of level 4
        { id: 44, type: 'miniboss', name: 'MINI-JEFE: GUARDIÁN CACHE-MISS', virusVariant: 'cache_guardian', x: 2600, y: 375, vx: 2.6, vy: 0, width: 56, height: 64, health: 14, maxHealth: 14, shootCooldown: 42, patrolMinX: 2400, patrolMaxX: 2950 }
      ]
    };
  }

  if (lvl === 5) {
    // NEW LEVEL 5: NÚCLEO CUÁNTICO & SUB-CERO LN2 (Leads to Intel vs AMD Fork!)
    return {
      levelWidth: 3400,
      levelName: 'Reino 5: Núcleo Cuántico Sub-Cero LN2',
      levelSubtitle: 'Enfría el Reactor con Nitrógeno Líquido y alcanza el Portal de la Gran Bifurcación (Intel vs AMD)',
      platforms: [
        { x: 0, y: 440, width: 820, height: 60, type: 'cryo' },
        { x: 420, y: 426, width: 70, height: 14, type: 'cryo_vent' },
        { x: 880, y: 390, width: 150, height: 18, type: 'moving', moveAxis: 'x', moveRange: 140, moveSpeed: 2.3, originX: 880, originY: 390 },
        { x: 1200, y: 440, width: 900, height: 60, type: 'cryo' },
        { x: 1580, y: 426, width: 70, height: 14, type: 'cryo_vent' },
        { x: 2150, y: 390, width: 150, height: 18, type: 'moving', moveAxis: 'y', moveRange: 110, moveSpeed: 2.0, originX: 2150, originY: 390 },
        { x: 2360, y: 440, width: 1100, height: 60, type: 'cryo' },
        { x: 2660, y: 426, width: 70, height: 14, type: 'cryo_vent' },

        // Aerial Cryo Towers
        { x: 240, y: 330, width: 140, height: 18, type: 'cryo' },
        { x: 480, y: 250, width: 150, height: 18, type: 'cryo' },
        { x: 660, y: 426, width: 48, height: 14, type: 'bounce' },
        { x: 760, y: 140, width: 280, height: 18, type: 'neon' },
        { x: 1320, y: 310, width: 160, height: 18, type: 'cryo' },
        { x: 1680, y: 230, width: 180, height: 18, type: 'cryo' },
        { x: 1920, y: 170, width: 180, height: 18, type: 'neon' },
        { x: 2450, y: 290, width: 190, height: 18, type: 'cryo' },
        { x: 2780, y: 210, width: 200, height: 18, type: 'cryo' }
      ],
      checkpoints: [
        { id: 'cp-5', x: 1660, y: 390, activated: false, label: 'Checkpoint Criogénico LN2' }
      ],
      blocks: [
        { id: 'b5-1', x: 260, y: 240, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b5-2', x: 520, y: 160, width: 32, height: 32, type: 'question', content: 'gpu_chrono', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b5-sky1', x: 820, y: 65, width: 32, height: 32, type: 'question', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b5-sky2', x: 860, y: 65, width: 32, height: 32, type: 'question', content: 'gpu_overclock', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b5-sky3', x: 900, y: 65, width: 32, height: 32, type: 'question', content: 'coin', coinsCount: 12, isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b5-mid1', x: 1720, y: 140, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'b5-hid1', x: 1980, y: 90, width: 32, height: 32, type: 'hidden', content: '1up', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: false },
        { id: 'b5-end1', x: 2520, y: 200, width: 32, height: 32, type: 'question', content: 'gpu_chrono', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true }
      ],
      hiddenAreas: [
        { id: 'sec-5-1', name: 'SANTUARIO DEL SILICIO DORADO LN2', x: 750, y: 50, width: 300, height: 110, discovered: false }
      ],
      collectibles: [
        { id: 'gpu-chip-overclock-5', name: 'Chip GPU Tensor Overclock', type: 'gpu_chip_overclock', categoryLabel: 'Powerup GPU: Disparo Triple', x: 540, y: 205, width: 32, height: 32, color: '#f59e0b', iconSymbol: '💥GPU', collected: false },
        { id: 'comp-aio-360', name: 'Arctic Liquid Freezer III 360mm', type: 'cooler', categoryLabel: 'Refrigeración Criogénica', x: 1380, y: 265, width: 32, height: 32, color: '#06b6d4', iconSymbol: 'LN2', collected: false },
        { id: 'gpu-chip-chrono-5', name: 'Chip GPU Chrono-Sync', type: 'gpu_chip_chrono', categoryLabel: 'Powerup GPU: Bullet Time 7s', x: 1980, y: 125, width: 32, height: 32, color: '#a855f7', iconSymbol: '⏱GPU', collected: false },
        { id: 'gpu-chip-shield-5', name: 'Chip GPU Ray-Shield Armor', type: 'gpu_chip_shield', categoryLabel: 'Powerup GPU: Escudo Total', x: 2520, y: 245, width: 32, height: 32, color: '#10b981', iconSymbol: '🛡GPU', collected: false },
        { id: 'comp-psu-1200', name: 'Seasonic Vertex GX-1200W Platinum', type: 'psu', categoryLabel: 'Energía Cuántica 1200W', x: 2850, y: 165, width: 32, height: 32, color: '#eab308', iconSymbol: '1200W', collected: false }
      ],
      enemies: [
        { id: 51, type: 'glitch', name: 'Espectro Sub-Zero', virusVariant: 'cryptoparasite', x: 300, y: 405, vx: 2.6, vy: 0, width: 34, height: 34, health: 5, maxHealth: 5, shootCooldown: 55, patrolMinX: 200, patrolMaxX: 600 },
        { id: 52, type: 'lag', name: 'Trojan Cuántico', virusVariant: 'trojanphage', x: 1350, y: 405, vx: 2.8, vy: 0, width: 36, height: 36, health: 5, maxHealth: 5, shootCooldown: 50, patrolMinX: 1240, patrolMaxX: 1750 },
        { id: 53, type: 'thermal', name: 'Fénix Térmico Inverso', virusVariant: 'pyroworm', x: 1740, y: 190, vx: 2.5, vy: 0, width: 36, height: 36, health: 6, maxHealth: 6, shootCooldown: 50, patrolMinX: 1680, patrolMaxX: 1860 },
        { id: 54, type: 'miniboss', name: 'MINI-JEFE: CENTINELA CRIO-ZERO', virusVariant: 'cache_guardian', x: 2820, y: 375, vx: 2.8, vy: 0, width: 60, height: 68, health: 16, maxHealth: 16, shootCooldown: 38, patrolMinX: 2550, patrolMaxX: 3150 }
      ]
    };
  }

  // LEVEL 6: FINAL FACTION CHOICE ARENA (INTEL vs AMD)
  const isSecretBoss = playerScore > 21000;
  const chosen = factionPath || 'amd';

  if (chosen === 'intel') {
    return {
      levelWidth: 1600,
      isSecretBoss,
      factionPath: 'intel',
      levelName: isSecretBoss
        ? '🔵 FASE SECRETA INTEL: FORTALEZA OVERCLOCK ZERO-DAY'
        : '🔵 Reino 6A (INTEL): La Fortaleza Azul LGA 1851',
      levelSubtitle: isSecretBoss
        ? '¡+21,000 PTS! Desata los 24 Núcleos Híbridos contra Titán Zero-Day Prime'
        : 'Armado con Core Ultra 9 285K: Derrota al Titán Spectre-Bot X285',
      platforms: [
        { x: 0, y: 440, width: 1600, height: 60, type: 'intel_fortress' },
        { x: 140, y: 340, width: 160, height: 18, type: 'intel_fortress' },
        { x: 390, y: 250, width: 170, height: 18, type: 'moving', moveAxis: 'x', moveRange: 80, moveSpeed: 1.8, originX: 390, originY: 250 },
        { x: 640, y: 180, width: 220, height: 18, type: 'intel_fortress' },
        { x: 960, y: 250, width: 170, height: 18, type: 'moving', moveAxis: 'x', moveRange: 80, moveSpeed: 1.8, originX: 960, originY: 250 },
        { x: 1220, y: 340, width: 160, height: 18, type: 'intel_fortress' },
        { x: 750, y: 426, width: 48, height: 14, type: 'bounce' }
      ],
      checkpoints: [],
      blocks: [
        { id: 'bi-1', x: 190, y: 230, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'bi-2', x: 680, y: 95, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'bi-3', x: 780, y: 95, width: 32, height: 32, type: 'question', content: 'gpu_overclock', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
        { id: 'bi-4', x: 1270, y: 230, width: 32, height: 32, type: 'question', content: 'gpu_chrono', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true }
      ],
      hiddenAreas: [],
      collectibles: [
        { id: 'intel-chip-1', name: 'Chip Intel Core Ultra 9 285K', type: 'cpu', categoryLabel: 'Alianza Azul: Cadencia Rápida + Doble Dash', x: 205, y: 295, width: 32, height: 32, color: '#3b82f6', iconSymbol: 'i9/U9', collected: false },
        { id: 'intel-shield-1', name: 'Chip GPU Ray-Shield Armor', type: 'gpu_chip_shield', categoryLabel: 'Escudo Total', x: 720, y: 135, width: 32, height: 32, color: '#10b981', iconSymbol: '🛡GPU', collected: false },
        { id: 'intel-oc-1', name: 'Chip GPU Tensor Overclock', type: 'gpu_chip_overclock', categoryLabel: 'Disparo Triple', x: 1000, y: 205, width: 32, height: 32, color: '#f59e0b', iconSymbol: '💥GPU', collected: false },
        { id: 'intel-chrono-1', name: 'Chip GPU Chrono-Sync', type: 'gpu_chip_chrono', categoryLabel: 'Tiempo Bala 7s', x: 1280, y: 295, width: 32, height: 32, color: '#a855f7', iconSymbol: '⏱GPU', collected: false }
      ],
      enemies: isSecretBoss
        ? [
            {
              id: 999,
              type: 'secret_boss',
              name: 'TITÁN VIRUS ZERO-DAY PRIME (EDICIÓN AZUL)',
              virusVariant: 'zeroday',
              factionTheme: 'intel',
              x: 980,
              y: 260,
              vx: 2.8,
              vy: 0,
              width: 98,
              height: 106,
              health: 40,
              maxHealth: 40,
              shootCooldown: 20,
              patrolMinX: 250,
              patrolMaxX: 1350
            }
          ]
        : [
            {
              id: 901,
              type: 'boss',
              name: 'TITÁN SPECTRE-BOT X285 [LGA 1851]',
              virusVariant: 'spectre_intel',
              factionTheme: 'intel',
              x: 960,
              y: 300,
              vx: 2.5,
              vy: 0,
              width: 86,
              height: 94,
              health: 28,
              maxHealth: 28,
              shootCooldown: 30,
              patrolMinX: 300,
              patrolMaxX: 1320
            }
          ]
    };
  }

  // AMD PATH (6B)
  return {
    levelWidth: 1600,
    isSecretBoss,
    factionPath: 'amd',
    levelName: isSecretBoss
      ? '🔴 FASE SECRETA AMD: NEXO ZEN 5 ZERO-DAY'
      : '🔴 Reino 6B (AMD): El Templo Carmesí 3D V-Cache',
    levelSubtitle: isSecretBoss
      ? '¡+21,000 PTS! Libera el poder de Ryzen 9800X3D contra Titán Zero-Day Prime'
      : 'Armado con Ryzen 7 9800X3D: Aniquila al Titán Cuello de Botella V-Cache',
    platforms: [
      { x: 0, y: 440, width: 1600, height: 60, type: 'amd_nexus' },
      { x: 160, y: 340, width: 170, height: 18, type: 'amd_nexus' },
      { x: 420, y: 260, width: 180, height: 18, type: 'amd_nexus' },
      { x: 680, y: 190, width: 210, height: 18, type: 'moving', moveAxis: 'y', moveRange: 50, moveSpeed: 1.5, originX: 680, originY: 190 },
      { x: 960, y: 260, width: 180, height: 18, type: 'amd_nexus' },
      { x: 1220, y: 340, width: 170, height: 18, type: 'amd_nexus' },
      { x: 540, y: 426, width: 64, height: 14, type: 'cryo_vent' },
      { x: 980, y: 426, width: 64, height: 14, type: 'cryo_vent' }
    ],
    checkpoints: [],
    blocks: [
      { id: 'ba-1', x: 210, y: 230, width: 32, height: 32, type: 'question', content: 'paste', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
      { id: 'ba-2', x: 480, y: 160, width: 32, height: 32, type: 'question', content: 'gpu_star', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
      { id: 'ba-3', x: 1020, y: 160, width: 32, height: 32, type: 'question', content: 'gpu_overclock', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true },
      { id: 'ba-4', x: 1280, y: 230, width: 32, height: 32, type: 'question', content: 'gpu_chrono', isHit: false, bumpOffsetY: 0, bumpVy: 0, revealed: true }
    ],
    hiddenAreas: [],
    collectibles: [
      { id: 'amd-chip-1', name: 'AMD Ryzen 7 9800X3D', type: 'cpu', categoryLabel: 'Legión Carmesí: Disparo Pesado + Enfriamiento 2x', x: 225, y: 295, width: 32, height: 32, color: '#ef4444', iconSymbol: 'X3D', collected: false },
      { id: 'amd-shield-1', name: 'Chip GPU Ray-Shield Armor', type: 'gpu_chip_shield', categoryLabel: 'Escudo Total', x: 495, y: 215, width: 32, height: 32, color: '#10b981', iconSymbol: '🛡GPU', collected: false },
      { id: 'amd-oc-1', name: 'Chip GPU Tensor Overclock', type: 'gpu_chip_overclock', categoryLabel: 'Disparo Triple', x: 1035, y: 215, width: 32, height: 32, color: '#f59e0b', iconSymbol: '💥GPU', collected: false },
      { id: 'amd-speed-1', name: 'Chip GPU DLSS Turbo Boost', type: 'gpu_chip_speed', categoryLabel: 'Super Velocidad', x: 1290, y: 295, width: 32, height: 32, color: '#06b6d4', iconSymbol: '⚡GPU', collected: false }
    ],
    enemies: isSecretBoss
      ? [
          {
            id: 999,
            type: 'secret_boss',
            name: 'TITÁN VIRUS ZERO-DAY PRIME (EDICIÓN ZEN 5)',
            virusVariant: 'zeroday',
            factionTheme: 'amd',
            x: 980,
            y: 260,
            vx: 2.8,
            vy: 0,
            width: 98,
            height: 106,
            health: 40,
            maxHealth: 40,
            shootCooldown: 20,
            patrolMinX: 250,
            patrolMaxX: 1350
          }
        ]
      : [
          {
            id: 902,
            type: 'boss',
            name: 'TITÁN CUELLO DE BOTELLA V-CACHE [AM5]',
            virusVariant: 'bottleneck_amd',
            factionTheme: 'amd',
            x: 960,
            y: 300,
            vx: 2.4,
            vy: 0,
            width: 86,
            height: 94,
            health: 28,
            maxHealth: 28,
            shootCooldown: 30,
            patrolMinX: 300,
            patrolMaxX: 1320
          }
        ]
  };
}
