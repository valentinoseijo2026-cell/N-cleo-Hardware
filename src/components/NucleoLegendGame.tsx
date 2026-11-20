import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Gamepad2,
  Flame,
  Zap,
  Shield,
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Tv,
  ArrowRight,
  Info,
  Smartphone,
  Tablet,
  Crown,
  CheckCircle2,
  Medal,
  Heart,
  Timer,
  GitBranch,
  Cpu
} from 'lucide-react';
import { ComponentCategory, PCComponent } from '../types';
import { COMPONENTS_DATABASE } from '../data/componentsData';
import { NucleoLeaderboardModal } from './NucleoLeaderboardModal';
import {
  getLeaderboard,
  saveLeaderboardEntry,
  getRankTitle
} from '../utils/leaderboardUtils';
import { setWeeklyQuestCompleted } from '../utils/weeklyUpdateUtils';
import {
  FactionPath,
  Player,
  Projectile,
  Enemy,
  CollectibleItem,
  Platform,
  Particle,
  QuestionBlock,
  FloatingText,
  HiddenArea,
  CheckpointFlag,
  buildLevelBlueprint
} from '../utils/nucleoLegendLevels';

interface NucleoLegendGameProps {
  onGoToBuilderWithSupremePC?: (build: Partial<Record<ComponentCategory, PCComponent>>) => void;
}

export const NucleoLegendGame: React.FC<NucleoLegendGameProps> = ({
  onGoToBuilderWithSupremePC
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High level game states
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'paused' | 'choosing_path' | 'gameover' | 'victory'>('intro');
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [chosenFaction, setChosenFaction] = useState<FactionPath | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [crtEffect, setCrtEffect] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [currentFpsDisplay, setCurrentFpsDisplay] = useState<number>(45);
  const [collectedComponents, setCollectedComponents] = useState<string[]>([]);
  const [playerTemp, setPlayerTemp] = useState<number>(38);
  const [playerHealth, setPlayerHealth] = useState<number>(4);
  const [comboDisplay, setComboDisplay] = useState<{ count: number; mult: number }>({ count: 0, mult: 1 });
  const [maxComboDisplay, setMaxComboDisplay] = useState<number>(1);

  // Refs synced with React state for stable 60fps loop access
  const currentLevelRef = useRef<number>(1);
  const chosenFactionRef = useRef<FactionPath | null>(null);

  // Tablet & Mobile touch controls options
  const [touchControlsEnabled, setTouchControlsEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
    }
    return true;
  });
  const [touchControlSize, setTouchControlSize] = useState<'phone' | 'tablet'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'tablet';
    }
    return 'phone';
  });

  // Active GPU Powerup Timers displayed on HUD (seconds remaining)
  const [activePowerups, setActivePowerups] = useState<{
    speed: number;
    shield: number;
    tripleShot: number;
    chrono: number;
  }>({
    speed: 0,
    shield: 0,
    tripleShot: 0,
    chrono: 0
  });

  // Global Leaderboard states (stored in localStorage)
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [submissionName, setSubmissionName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedProfile = localStorage.getItem('nucleo_user_profile');
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed.gamerTag) return parsed.gamerTag;
        }
        const savedTag = localStorage.getItem('nucleo_player_tag');
        if (savedTag) return savedTag;
      } catch {}
    }
    return 'Entusiasta_01';
  });
  const [hasSubmittedScore, setHasSubmittedScore] = useState<boolean>(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const [defeatedSecretBoss, setDefeatedSecretBoss] = useState<boolean>(false);
  const [isSecretBossBattle, setIsSecretBossBattle] = useState<boolean>(false);
  const [topScoresPreview, setTopScoresPreview] = useState(() => getLeaderboard().slice(0, 5));

  const refreshTopScores = useCallback(() => {
    setTopScoresPreview(getLeaderboard().slice(0, 5));
  }, []);

  const handleSubmitScore = useCallback(() => {
    const finalName = submissionName.trim() || 'Ensamblador_Anónimo';
    try {
      localStorage.setItem('nucleo_player_tag', finalName);
    } catch {}

    const title = getRankTitle(score, gameState === 'victory', defeatedSecretBoss, chosenFaction);
    const { entry, rank } = saveLeaderboardEntry({
      playerName: finalName,
      score: score,
      fpsAchieved: currentFpsDisplay,
      levelReached: currentLevel,
      componentsRescued: collectedComponents.length,
      victory: gameState === 'victory',
      rankTitle: title
    });

    setLastSubmittedId(entry.id);
    setSubmittedRank(rank);
    setHasSubmittedScore(true);
    refreshTopScores();
  }, [submissionName, score, gameState, currentFpsDisplay, currentLevel, collectedComponents.length, defeatedSecretBoss, chosenFaction, refreshTopScores]);

  // Web Audio Context reference for retro procedural synthesizer SFX
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playRetroSound = useCallback((
    type: 'jump' | 'shoot' | 'pickup' | 'hit' | 'victory' | 'dash' | 'gameover' | 'powerup' | 'coin' | 'block_hit' | 'stomp' | 'break_block' | 'secret' | 'secret_boss_roar' | 'bounce' | 'chrono'
  ) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'jump') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'bounce') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.18);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'chrono') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.38);
      } else if (type === 'shoot') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'pickup') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.06);
        osc.frequency.setValueAtTime(659.25, now + 0.12);
        osc.frequency.setValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.36);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'block_hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.09);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.09);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'stomp') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.13);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.13);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'break_block') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.16);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'secret') {
        osc.type = 'sine';
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
        notes.forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, now + idx * 0.065);
        });
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.52);
        osc.start(now);
        osc.stop(now + 0.52);
      } else if (type === 'powerup') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.06);
        osc.frequency.setValueAtTime(783.99, now + 0.12);
        osc.frequency.setValueAtTime(1046.5, now + 0.18);
        osc.frequency.setValueAtTime(1318.5, now + 0.24);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.42);
      } else if (type === 'dash') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.18);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'victory') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.15);
        osc.frequency.setValueAtTime(783.99, now + 0.3);
        osc.frequency.setValueAtTime(1046.5, now + 0.45);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.85);
        osc.start(now);
        osc.stop(now + 0.85);
      } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'secret_boss_roar') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.35);
        osc.frequency.linearRampToValueAtTime(160, now + 0.65);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.95);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.95);
        osc.start(now);
        osc.stop(now + 0.95);
      }
    } catch {
      // Audio fallback silent
    }
  }, [soundEnabled]);

  // Keys active state map
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Game internal mutable state (kept in refs for 60fps loop performance)
  const gameData = useRef<{
    player: Player;
    cameraX: number;
    projectiles: Projectile[];
    enemies: Enemy[];
    collectibles: CollectibleItem[];
    platforms: Platform[];
    particles: Particle[];
    blocks: QuestionBlock[];
    floatingTexts: FloatingText[];
    hiddenAreas: HiddenArea[];
    checkpoints: CheckpointFlag[];
    secretDiscoveredTimer: number;
    secretDiscoveredName: string;
    levelWidth: number;
    levelName: string;
    levelSubtitle: string;
    animFrame: number;
    defeatedSecretBoss: boolean;
    isSecretBossActive: boolean;
    combo: number;
    comboTimer: number;
    maxCombo: number;
  }>({
    player: {
      x: 80,
      y: 350,
      vx: 0,
      vy: 0,
      width: 28,
      height: 38,
      isGrounded: false,
      facing: 'right',
      temp: 38,
      health: 4,
      hasDoubleJump: false,
      doubleJumpUsed: false,
      isDashing: false,
      dashCooldown: 0,
      invincibleTimer: 0,
      score: 0,
      fpsCounter: 45,
      speedBoostTimer: 0,
      invulnerableBonusTimer: 0,
      tripleShotTimer: 0,
      chronoTimer: 0,
      checkpointX: 80,
      checkpointY: 350
    },
    cameraX: 0,
    projectiles: [],
    enemies: [],
    collectibles: [],
    platforms: [],
    particles: [],
    blocks: [],
    floatingTexts: [],
    hiddenAreas: [],
    checkpoints: [],
    secretDiscoveredTimer: 0,
    secretDiscoveredName: '',
    levelWidth: 2600,
    levelName: 'Reino 1: Valle de Silicio & Latencias',
    levelSubtitle: 'Vence a los Bugs de Latencia y rescata el Procesador Base y la Placa Taichi',
    animFrame: 0,
    defeatedSecretBoss: false,
    isSecretBossActive: false,
    combo: 0,
    comboTimer: 0,
    maxCombo: 1
  });

  // Floating text / score popup spawner
  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string = '#fbbf24', scale: number = 1) => {
    gameData.current.floatingTexts.push({
      id: Math.random(),
      x,
      y,
      text,
      color,
      life: 48,
      maxLife: 48,
      vy: -1.8,
      scale
    });
  }, []);

  // Combo scoring helper
  const registerComboPoints = useCallback((basePoints: number, x?: number, y?: number): number => {
    const gd = gameData.current;
    gd.combo += 1;
    gd.comboTimer = 210; // 3.5 seconds at 60fps
    const mult = Math.min(5, Math.floor(gd.combo / 2) + 1);
    const prevMax = gd.maxCombo;
    gd.maxCombo = Math.max(gd.maxCombo, mult);
    setComboDisplay({ count: gd.combo, mult });
    setMaxComboDisplay(gd.maxCombo);

    if (mult >= 5 && prevMax < 5) {
      try {
        localStorage.setItem('nucleo_legend_max_combo', '5');
      } catch {}
      if (x !== undefined && y !== undefined) {
        spawnFloatingText(x, y - 34, '🔥 ¡COMBO OVERCLOCK x5! 🔥', '#f59e0b', 1.35);
      }
    }
    return Math.round(basePoints * mult);
  }, [spawnFloatingText]);

  // Level Generator backed by buildLevelBlueprint
  const initLevel = useCallback((lvl: number, factionOverride?: FactionPath | null) => {
    const gd = gameData.current;
    const activeFaction = factionOverride !== undefined ? factionOverride : chosenFactionRef.current;

    if (factionOverride !== undefined) {
      chosenFactionRef.current = factionOverride;
      setChosenFaction(factionOverride);
    }

    currentLevelRef.current = lvl;
    setCurrentLevel(lvl);

    const bp = buildLevelBlueprint(lvl, gd.player.score, activeFaction);

    gd.projectiles = [];
    gd.particles = [];
    gd.floatingTexts = [];
    gd.secretDiscoveredTimer = 0;
    gd.secretDiscoveredName = '';
    gd.cameraX = 0;

    gd.levelWidth = bp.levelWidth;
    gd.levelName = bp.levelName;
    gd.levelSubtitle = bp.levelSubtitle;
    gd.platforms = bp.platforms.map(pl => ({ ...pl, prevX: pl.x, prevY: pl.y }));
    gd.blocks = bp.blocks.map(b => ({ ...b }));
    gd.hiddenAreas = bp.hiddenAreas.map(h => ({ ...h }));
    gd.collectibles = bp.collectibles.map(c => ({ ...c }));
    gd.enemies = bp.enemies.map(e => ({ ...e }));
    gd.checkpoints = bp.checkpoints.map(cp => ({ ...cp }));
    gd.isSecretBossActive = !!bp.isSecretBoss;
    setIsSecretBossBattle(!!bp.isSecretBoss);

    const p = gd.player;
    p.x = 80;
    p.y = 350;
    p.vx = 0;
    p.vy = 0;
    p.temp = 38;
    p.health = 4;
    p.invincibleTimer = 0;
    p.speedBoostTimer = 0;
    p.invulnerableBonusTimer = 0;
    p.tripleShotTimer = 0;
    p.chronoTimer = 0;
    p.checkpointX = 80;
    p.checkpointY = 350;
    if (lvl >= 2) {
      p.hasDoubleJump = true;
    }

    setPlayerHealth(4);
    setPlayerTemp(38);
    setActivePowerups({ speed: 0, shield: 0, tripleShot: 0, chrono: 0 });

    if (lvl === 6 && bp.isSecretBoss) {
      gd.secretDiscoveredTimer = 240;
      gd.secretDiscoveredName = `👑 ¡JEFE SECRETO ZERO-DAY (${activeFaction === 'intel' ? 'INTEL' : 'AMD'}) DESPERTADO! 👑`;
      playRetroSound('secret_boss_roar');
    } else if (lvl === 6 && activeFaction) {
      gd.secretDiscoveredTimer = 180;
      gd.secretDiscoveredName = activeFaction === 'intel'
        ? '🔵 ALIANZA AZUL INTEL CORE ULTRA ACTIVADA'
        : '🔴 LEGIÓN CARMESÍ AMD 3D V-CACHE ACTIVADA';
      playRetroSound('powerup');
    }
  }, [playRetroSound]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyP') {
        setGameState(prev => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    let animId = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastGameLoopTime = 0;

    const loop = () => {
      const isLowPower = typeof document !== 'undefined' && document.documentElement.classList.contains('low-power-mode');
      const now = performance.now();
      if (isLowPower && now - lastGameLoopTime < 32) {
        animId = requestAnimationFrame(loop);
        return;
      }
      lastGameLoopTime = now;

      const gd = gameData.current;
      const player = gd.player;
      const keys = keysRef.current;
      const activeLvl = currentLevelRef.current;
      const activeFaction = chosenFactionRef.current;
      const isIntelPerk = activeLvl === 6 && activeFaction === 'intel';
      const isAmdPerk = activeLvl === 6 && activeFaction === 'amd';

      // =======================================================================
      // 0. MOVING PLATFORMS & COMBO TIMER UPDATE
      // =======================================================================
      gd.animFrame++;
      if (gd.comboTimer > 0) {
        gd.comboTimer--;
        if (gd.comboTimer <= 0) {
          gd.combo = 0;
          setComboDisplay({ count: 0, mult: 1 });
        }
      }

      for (const plat of gd.platforms) {
        if (plat.type === 'moving') {
          plat.prevX = plat.x;
          plat.prevY = plat.y;
          const phase = gd.animFrame * 0.025 * (plat.moveSpeed || 1);
          const range = plat.moveRange || 80;
          if (plat.moveAxis === 'y') {
            plat.y = (plat.originY ?? plat.y) + Math.sin(phase) * range;
          } else {
            plat.x = (plat.originX ?? plat.x) + Math.sin(phase) * range;
          }
        }
      }

      // =======================================================================
      // 1. PLAYER PHYSICS & CONTROLS
      // =======================================================================
      const isSpeedBoosted = player.speedBoostTimer > 0;
      const baseSpeed = (player.hasDoubleJump ? 5.8 : 5.0) + (isIntelPerk ? 0.6 : 0);
      const moveSpeed = isSpeedBoosted ? baseSpeed * 1.65 : baseSpeed;

      if (keys['ArrowLeft'] || keys['KeyA']) {
        player.vx = -moveSpeed;
        player.facing = 'left';
        if (isSpeedBoosted && Math.random() < 0.5) {
          gd.particles.push({
            x: player.x + player.width,
            y: player.y + Math.random() * player.height,
            vx: Math.random() * 2 + 1,
            vy: (Math.random() - 0.5) * 2,
            life: 14,
            maxLife: 14,
            color: '#06b6d4',
            size: 3
          });
        }
      } else if (keys['ArrowRight'] || keys['KeyD']) {
        player.vx = moveSpeed;
        player.facing = 'right';
        if (isSpeedBoosted && Math.random() < 0.5) {
          gd.particles.push({
            x: player.x,
            y: player.y + Math.random() * player.height,
            vx: -(Math.random() * 2 + 1),
            vy: (Math.random() - 0.5) * 2,
            life: 14,
            maxLife: 14,
            color: '#06b6d4',
            size: 3
          });
        }
      } else {
        player.vx *= 0.78;
      }

      // Jump & Double Jump (AMD gets Super Jump boost in Realm 6)
      const jumpPower = isAmdPerk ? -13.8 : -12.5;
      if (keys['ArrowUp'] || keys['KeyW'] || keys['Space']) {
        if (player.isGrounded) {
          player.vy = jumpPower;
          player.isGrounded = false;
          playRetroSound('jump');
          keys['Space'] = false;
          keys['ArrowUp'] = false;
          keys['KeyW'] = false;
        } else if (player.hasDoubleJump && !player.doubleJumpUsed) {
          player.vy = jumpPower + 1.0;
          player.doubleJumpUsed = true;
          playRetroSound('jump');
          keys['Space'] = false;
          keys['ArrowUp'] = false;
          keys['KeyW'] = false;

          for (let i = 0; i < 8; i++) {
            gd.particles.push({
              x: player.x + player.width / 2,
              y: player.y + player.height,
              vx: (Math.random() - 0.5) * 4,
              vy: Math.random() * 2 + 1,
              life: 18,
              maxLife: 18,
              color: isAmdPerk ? '#f59e0b' : '#38bdf8',
              size: 3
            });
          }
        }
      }

      // Attack (Key J or Key X) with Intel Rapid Speed / AMD Heavy 2x Damage Perks
      if (keys['KeyJ'] || keys['KeyX']) {
        keys['KeyJ'] = false;
        keys['KeyX'] = false;
        playRetroSound('shoot');

        const shotSpeedVal = isIntelPerk ? 16.5 : 13;
        const pSpeed = player.facing === 'right' ? shotSpeedVal : -shotSpeedVal;
        const startX = player.x + (player.facing === 'right' ? player.width + 4 : -8);
        const startY = player.y + player.height / 2 - 2;
        const shotDamage = isAmdPerk ? 2 : 1;
        const shotRadius = isAmdPerk ? 7.5 : 5;
        const shotColor = isIntelPerk
          ? '#38bdf8'
          : isAmdPerk
          ? '#f97316'
          : player.facing === 'right'
          ? '#ef4444'
          : '#f59e0b';

        if (player.tripleShotTimer > 0) {
          gd.projectiles.push({
            x: startX,
            y: startY,
            vx: pSpeed,
            vy: 0,
            radius: shotRadius + 1,
            color: isIntelPerk ? '#60a5fa' : '#f59e0b',
            isEnemy: false,
            damage: shotDamage
          });
          gd.projectiles.push({
            x: startX,
            y: startY - 3,
            vx: pSpeed * 0.95,
            vy: -2.4,
            radius: shotRadius,
            color: isIntelPerk ? '#38bdf8' : '#ec4899',
            isEnemy: false,
            damage: shotDamage
          });
          gd.projectiles.push({
            x: startX,
            y: startY + 3,
            vx: pSpeed * 0.95,
            vy: 2.4,
            radius: shotRadius,
            color: '#06b6d4',
            isEnemy: false,
            damage: shotDamage
          });
        } else {
          gd.projectiles.push({
            x: startX,
            y: startY,
            vx: pSpeed,
            vy: 0,
            radius: shotRadius,
            color: shotColor,
            isEnemy: false,
            damage: shotDamage
          });
        }
      }

      // Dash (Key K or Shift) - Intel halves Dash cooldown!
      if ((keys['KeyK'] || keys['ShiftLeft'] || keys['ShiftRight']) && player.dashCooldown <= 0) {
        const baseCooldown = isSpeedBoosted ? 24 : 45;
        player.dashCooldown = isIntelPerk ? Math.round(baseCooldown * 0.5) : baseCooldown;
        player.vx = player.facing === 'right' ? (isSpeedBoosted ? 20 : 16) : (isSpeedBoosted ? -20 : -16);
        player.invincibleTimer = 18;
        playRetroSound('dash');

        for (let i = 0; i < 14; i++) {
          gd.particles.push({
            x: player.x + Math.random() * player.width,
            y: player.y + Math.random() * player.height,
            vx: -player.vx * 0.25 + (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 20,
            maxLife: 20,
            color: isIntelPerk ? '#60a5fa' : isSpeedBoosted ? '#06b6d4' : '#38bdf8',
            size: 4
          });
        }
      }

      if (player.dashCooldown > 0) player.dashCooldown--;
      if (player.invincibleTimer > 0) player.invincibleTimer--;
      if (player.speedBoostTimer > 0) player.speedBoostTimer--;
      if (player.invulnerableBonusTimer > 0) player.invulnerableBonusTimer--;
      if (player.tripleShotTimer > 0) player.tripleShotTimer--;
      if (player.chronoTimer > 0) player.chronoTimer--;

      // Gravity
      player.vy += 0.65;
      if (player.vy > 14) player.vy = 14;

      // Update position
      player.x += player.vx;
      player.y += player.vy;

      // Platform Collisions + Bounce + Cryo Vent + Moving Carry
      player.isGrounded = false;
      for (const plat of gd.platforms) {
        // Cryo Vent cooling zone check (vertical column up to 85px above vent)
        if (plat.type === 'cryo_vent') {
          if (
            player.x + player.width > plat.x - 6 &&
            player.x < plat.x + plat.width + 6 &&
            player.y + player.height >= plat.y - 85 &&
            player.y <= plat.y + plat.height
          ) {
            player.temp = Math.max(30, player.temp - 0.6);
            if (gd.animFrame % 12 === 0) {
              gd.particles.push({
                x: plat.x + Math.random() * plat.width,
                y: plat.y - 4,
                vx: (Math.random() - 0.5) * 1.2,
                vy: -2.2 - Math.random() * 1.5,
                life: 22,
                maxLife: 22,
                color: '#38bdf8',
                size: 3
              });
            }
          }
        }

        // Standard top collision
        if (
          player.x + player.width > plat.x &&
          player.x < plat.x + plat.width &&
          player.y + player.height >= plat.y &&
          player.y + player.height <= plat.y + 20 &&
          player.vy >= 0
        ) {
          if (plat.type === 'bounce') {
            player.y = plat.y - player.height - 2;
            player.vy = -17.5;
            player.isGrounded = false;
            player.doubleJumpUsed = false;
            playRetroSound('bounce');
            spawnFloatingText(plat.x + plat.width / 2, plat.y - 18, '▲ SALTO TURBO', '#38bdf8', 1.1);
            for (let b = 0; b < 12; b++) {
              gd.particles.push({
                x: plat.x + Math.random() * plat.width,
                y: plat.y,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 5 - 2,
                life: 18,
                maxLife: 18,
                color: b % 2 === 0 ? '#38bdf8' : '#fbbf24',
                size: 3.5
              });
            }
          } else {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
            player.doubleJumpUsed = false;

            // Carry player horizontally along moving platforms
            if (plat.type === 'moving' && plat.prevX !== undefined) {
              player.x += plat.x - plat.prevX;
            }
          }
        }
      }

      // Checkpoint Flag Check
      for (const cp of gd.checkpoints) {
        if (!cp.activated) {
          if (
            player.x + player.width > cp.x - 10 &&
            player.x < cp.x + 36 &&
            player.y + player.height > cp.y - 45 &&
            player.y < cp.y + 60
          ) {
            cp.activated = true;
            player.checkpointX = cp.x;
            player.checkpointY = cp.y - player.height - 4;
            player.score += 400;
            setScore(player.score);
            playRetroSound('secret');
            spawnFloatingText(cp.x + 12, cp.y - 32, '⚑ CHECKPOINT ACTIVADO +400', '#10b981', 1.3);
            for (let c = 0; c < 18; c++) {
              gd.particles.push({
                x: cp.x + 10,
                y: cp.y - 15,
                vx: (Math.random() - 0.5) * 7,
                vy: -Math.random() * 6 - 1,
                life: 24,
                maxLife: 24,
                color: c % 2 === 0 ? '#10b981' : '#fbbf24',
                size: 3.5
              });
            }
          }
        }
      }

      // Update block spring bumping animation
      for (const blk of gd.blocks) {
        if (blk.bumpOffsetY !== 0 || blk.bumpVy !== 0) {
          blk.bumpOffsetY += blk.bumpVy;
          blk.bumpVy += 0.9;
          if (blk.bumpOffsetY >= 0) {
            blk.bumpOffsetY = 0;
            blk.bumpVy = 0;
          }
        }
      }

      // Block Collisions (Landing on top & Head bumping from below)
      for (const blk of gd.blocks) {
        if (blk.shattered) continue;
        const bx = blk.x;
        const by = blk.y + blk.bumpOffsetY;
        const bw = blk.width;
        const bh = blk.height;

        if (blk.revealed || blk.type !== 'hidden') {
          if (
            player.x + player.width > bx + 3 &&
            player.x < bx + bw - 3 &&
            player.y + player.height >= by &&
            player.y + player.height <= by + 16 &&
            player.vy >= 0
          ) {
            player.y = by - player.height;
            player.vy = 0;
            player.isGrounded = true;
            player.doubleJumpUsed = false;
          }
        }

        if (
          player.vy < 0 &&
          player.x + player.width > bx + 4 &&
          player.x < bx + bw - 4 &&
          player.y <= by + bh &&
          player.y >= by + 6
        ) {
          player.y = by + bh;
          player.vy = 2.4;

          blk.bumpOffsetY = -9;
          blk.bumpVy = 2.4;

          if (!blk.revealed && blk.type === 'hidden') {
            blk.revealed = true;
            playRetroSound('secret');
            spawnFloatingText(bx + bw / 2, by - 16, '¡BLOQUE OCULTO!', '#38bdf8', 1.25);
          }

          if (blk.type === 'brick') {
            if (player.speedBoostTimer > 0 || player.invulnerableBonusTimer > 0) {
              blk.shattered = true;
              playRetroSound('break_block');
              const pts = registerComboPoints(100, bx + bw / 2, by);
              player.score += pts;
              setScore(player.score);
              spawnFloatingText(bx + bw / 2, by - 10, `+${pts} 💥`, '#f59e0b', 1.1);
              for (let i = 0; i < 10; i++) {
                gd.particles.push({
                  x: bx + bw / 2,
                  y: by + bh / 2,
                  vx: (Math.random() - 0.5) * 8,
                  vy: -Math.random() * 6 - 2,
                  life: 25,
                  maxLife: 25,
                  color: '#b45309',
                  size: 4
                });
              }
            } else {
              playRetroSound('block_hit');
            }
          }

          if (blk.content !== 'empty') {
            if (blk.content === 'coin') {
              playRetroSound('coin');
              const pts = registerComboPoints(150, bx + bw / 2, by);
              player.score += pts;
              player.fpsCounter += 8;
              setScore(player.score);
              setCurrentFpsDisplay(player.fpsCounter);
              spawnFloatingText(bx + bw / 2, by - 24, `+${pts} 🪙`, '#fbbf24', 1.25);

              for (let i = 0; i < 6; i++) {
                gd.particles.push({
                  x: bx + bw / 2,
                  y: by - 10,
                  vx: (Math.random() - 0.5) * 4,
                  vy: -Math.random() * 5 - 3,
                  life: 20,
                  maxLife: 20,
                  color: '#fbbf24',
                  size: 4
                });
              }

              if (blk.coinsCount && blk.coinsCount > 1) {
                blk.coinsCount--;
              } else {
                blk.isHit = true;
                blk.content = 'empty';
              }
            } else if (blk.content === 'paste') {
              playRetroSound('powerup');
              player.temp = Math.max(30, player.temp - 25);
              player.health = Math.min(4, player.health + 1);
              setPlayerHealth(player.health);
              player.score += 500;
              setScore(player.score);
              spawnFloatingText(bx + bw / 2, by - 28, '❄ PASTA CRYO +1 HP', '#38bdf8', 1.35);
              blk.isHit = true;
              blk.content = 'empty';
            } else if (blk.content === 'gpu_star') {
              playRetroSound('powerup');
              player.invulnerableBonusTimer = 720;
              player.speedBoostTimer = 720;
              player.score += 1000;
              setScore(player.score);
              spawnFloatingText(bx + bw / 2, by - 28, '★ ESTRELLA GPU DLSS ★', '#ec4899', 1.45);
              blk.isHit = true;
              blk.content = 'empty';
            } else if (blk.content === 'gpu_speed') {
              playRetroSound('powerup');
              player.speedBoostTimer = 600;
              player.score += 750;
              setScore(player.score);
              spawnFloatingText(bx + bw / 2, by - 28, '⚡ DLSS TURBO SPEED', '#06b6d4', 1.35);
              blk.isHit = true;
              blk.content = 'empty';
            } else if (blk.content === 'gpu_overclock') {
              playRetroSound('powerup');
              player.tripleShotTimer = 600;
              player.score += 750;
              setScore(player.score);
              spawnFloatingText(bx + bw / 2, by - 28, '💥 TENSOR OVERCLOCK', '#f59e0b', 1.35);
              blk.isHit = true;
              blk.content = 'empty';
            } else if (blk.content === 'gpu_chrono') {
              playRetroSound('chrono');
              player.chronoTimer = 420; // 7 seconds bullet time
              player.score += 850;
              setScore(player.score);
              spawnFloatingText(bx + bw / 2, by - 28, '⏱ CHRONO-SYNC 0.35x', '#a855f7', 1.4);
              blk.isHit = true;
              blk.content = 'empty';
            } else if (blk.content === '1up') {
              playRetroSound('powerup');
              player.health = Math.min(4, player.health + 1);
              setPlayerHealth(player.health);
              player.score += 1500;
              setScore(player.score);
              spawnFloatingText(bx + bw / 2, by - 28, '❤ 1-UP NÚCLEO ❤', '#10b981', 1.45);
              blk.isHit = true;
              blk.content = 'empty';
            }
          } else {
            playRetroSound('block_hit');
          }
        }
      }

      // Check Hidden Areas discovery
      for (const area of gd.hiddenAreas) {
        if (!area.discovered) {
          if (
            player.x + player.width > area.x &&
            player.x < area.x + area.width &&
            player.y + player.height > area.y &&
            player.y < area.y + area.height
          ) {
            area.discovered = true;
            gd.secretDiscoveredTimer = 180;
            gd.secretDiscoveredName = area.name;
            playRetroSound('secret');
            player.score += 1500;
            player.fpsCounter += 50;
            setScore(player.score);
            setCurrentFpsDisplay(player.fpsCounter);
            spawnFloatingText(player.x, player.y - 35, `✨ ¡${area.name}! +1500`, '#eab308', 1.4);

            for (let p = 0; p < 24; p++) {
              gd.particles.push({
                x: player.x + player.width / 2,
                y: player.y,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 7 - 2,
                life: 30,
                maxLife: 30,
                color: p % 2 === 0 ? '#fbbf24' : '#38bdf8',
                size: 4
              });
            }
          }
        }
      }

      // Floating text update
      for (let i = gd.floatingTexts.length - 1; i >= 0; i--) {
        const ft = gd.floatingTexts[i];
        ft.y += ft.vy;
        ft.life--;
        if (ft.life <= 0) {
          gd.floatingTexts.splice(i, 1);
        }
      }
      if (gd.secretDiscoveredTimer > 0) {
        gd.secretDiscoveredTimer--;
      }

      if (player.x < 10) player.x = 10;

      // Thermal passive cooling (AMD legion cools 2x faster in Realm 6)
      if (player.temp > 35) {
        const coolFactor = (player.invulnerableBonusTimer > 0 ? 0.04 : 0.015) * (isAmdPerk ? 2.0 : 1.0);
        player.temp -= coolFactor;
      }

      // Camera Follow Smooth Lerp
      const targetCamX = player.x - 300;
      gd.cameraX += (targetCamX - gd.cameraX) * 0.08;
      if (gd.cameraX < 0) gd.cameraX = 0;
      if (gd.cameraX > gd.levelWidth - canvas.width) gd.cameraX = gd.levelWidth - canvas.width;

      // Helper for Victory Completion
      const triggerBossVictory = (isSecret: boolean, faction: FactionPath | null) => {
        if (isSecret) {
          gd.defeatedSecretBoss = true;
          setDefeatedSecretBoss(true);
        }
        try {
          if (faction === 'intel') localStorage.setItem('nucleo_legend_intel_win', 'true');
          if (faction === 'amd') localStorage.setItem('nucleo_legend_amd_win', 'true');
          setWeeklyQuestCompleted(player.score);
        } catch {}
        playRetroSound('victory');
        setGameState('victory');
      };

      // =======================================================================
      // 2. PROJECTILES LOGIC (with Chrono-Sync slow-mo on enemy projectiles)
      // =======================================================================
      const isChronoActive = player.chronoTimer > 0;
      for (let i = gd.projectiles.length - 1; i >= 0; i--) {
        const pr = gd.projectiles[i];
        const timeScale = pr.isEnemy && isChronoActive ? 0.35 : 1.0;
        pr.x += pr.vx * timeScale;
        pr.y += (pr.vy || 0) * timeScale;

        if (pr.x < gd.cameraX - 100 || pr.x > gd.cameraX + canvas.width + 100 || pr.y < -50 || pr.y > 600) {
          gd.projectiles.splice(i, 1);
          continue;
        }

        if (!pr.isEnemy) {
          let hitEnemy = false;
          for (let eIdx = gd.enemies.length - 1; eIdx >= 0; eIdx--) {
            const enemy = gd.enemies[eIdx];
            if (
              pr.x > enemy.x &&
              pr.x < enemy.x + enemy.width &&
              pr.y > enemy.y &&
              pr.y < enemy.y + enemy.height
            ) {
              enemy.health -= pr.damage || 1;
              hitEnemy = true;
              playRetroSound('hit');

              for (let p = 0; p < 6; p++) {
                gd.particles.push({
                  x: pr.x,
                  y: pr.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  life: 14,
                  maxLife: 14,
                  color: pr.color,
                  size: 3
                });
              }

              if (enemy.health <= 0) {
                const isSecret = enemy.type === 'secret_boss';
                const isBoss = enemy.type === 'boss' || isSecret;
                const isMiniBoss = enemy.type === 'miniboss';
                const basePts = isSecret ? 10000 : isBoss ? 5000 : isMiniBoss ? 2500 : 250;
                const gainedPts = registerComboPoints(basePts, enemy.x + enemy.width / 2, enemy.y);

                player.score += gainedPts;
                player.fpsCounter += isSecret ? 350 : isBoss ? 200 : isMiniBoss ? 100 : 15;
                setScore(player.score);
                setCurrentFpsDisplay(player.fpsCounter);

                spawnFloatingText(
                  enemy.x + enemy.width / 2,
                  enemy.y - 12,
                  isSecret
                    ? `¡TITÁN ZERO-DAY ANIQUILADO! +${gainedPts}`
                    : isBoss
                    ? `¡TITÁN ELIMINADO! +${gainedPts}`
                    : isMiniBoss
                    ? `¡MINI-JEFE VENCIDO! +${gainedPts}`
                    : `+${gainedPts}`,
                  isSecret ? '#10b981' : isBoss ? '#a855f7' : isMiniBoss ? '#38bdf8' : '#fbbf24',
                  isBoss || isMiniBoss ? 1.35 : 1
                );

                for (let p = 0; p < (isBoss ? 35 : isMiniBoss ? 24 : 18); p++) {
                  gd.particles.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height / 2,
                    vx: (Math.random() - 0.5) * (isBoss ? 14 : 9),
                    vy: (Math.random() - 0.5) * (isBoss ? 14 : 9),
                    life: 28,
                    maxLife: 28,
                    color: isSecret ? '#10b981' : isBoss ? '#a855f7' : isMiniBoss ? '#38bdf8' : '#f59e0b',
                    size: 5
                  });
                }

                gd.enemies.splice(eIdx, 1);

                if (isBoss) {
                  triggerBossVictory(isSecret, activeFaction);
                  return;
                }
              }
              break;
            }
          }
          if (hitEnemy) {
            gd.projectiles.splice(i, 1);
            continue;
          }
        } else {
          // Enemy Projectile hitting Player
          if (
            pr.x > player.x &&
            pr.x < player.x + player.width &&
            pr.y > player.y &&
            pr.y < player.y + player.height
          ) {
            if (player.invulnerableBonusTimer > 0) {
              playRetroSound('hit');
              for (let p = 0; p < 8; p++) {
                gd.particles.push({
                  x: pr.x,
                  y: pr.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  life: 15,
                  maxLife: 15,
                  color: '#10b981',
                  size: 4
                });
              }
              gd.projectiles.splice(i, 1);
              continue;
            }

            if (player.invincibleTimer <= 0) {
              player.temp += 14;
              player.health--;
              setPlayerHealth(Math.max(0, player.health));
              player.invincibleTimer = 35;
              playRetroSound('hit');
              gd.projectiles.splice(i, 1);

              if (player.temp >= 100 || player.health <= 0) {
                playRetroSound('gameover');
                setGameState('gameover');
                return;
              }
              continue;
            }
          }
        }
      }

      // =======================================================================
      // 3. ENEMIES BEHAVIOR & SHOOTING
      // =======================================================================
      const enemyTimeScale = isChronoActive ? 0.35 : 1.0;
      for (let eIdx = gd.enemies.length - 1; eIdx >= 0; eIdx--) {
        const enemy = gd.enemies[eIdx];
        enemy.x += enemy.vx * enemyTimeScale;
        if (enemy.x <= enemy.patrolMinX || enemy.x + enemy.width >= enemy.patrolMaxX) {
          enemy.vx *= -1;
        }

        // Enemy Shooting AI
        if (!isChronoActive || gd.animFrame % 3 === 0) {
          enemy.shootCooldown--;
        }
        if (enemy.shootCooldown <= 0) {
          const isSecretBoss = enemy.type === 'secret_boss';
          const isNormalBoss = enemy.type === 'boss';
          const isMiniBoss = enemy.type === 'miniboss';
          enemy.shootCooldown = isSecretBoss ? 22 : isNormalBoss ? 32 : isMiniBoss ? 44 : 75;

          const dist = Math.abs((enemy.x + enemy.width / 2) - (player.x + player.width / 2));
          if (dist < 700) {
            const dir = player.x < enemy.x ? -1 : 1;
            const originX = enemy.x + (dir < 0 ? -6 : enemy.width + 6);
            const originY = enemy.y + enemy.height / 2;

            if (isSecretBoss || enemy.virusVariant === 'spectre_intel') {
              const spreadAngles = isSecretBoss ? [-0.24, 0, 0.24] : [-0.14, 0.14];
              for (const ang of spreadAngles) {
                const speed = isSecretBoss ? 7.0 : 7.8;
                gd.projectiles.push({
                  x: originX,
                  y: originY,
                  vx: Math.cos(ang) * dir * speed,
                  vy: Math.sin(ang) * speed,
                  radius: 7,
                  color: isSecretBoss ? '#10b981' : '#3b82f6',
                  isEnemy: true
                });
              }
            } else {
              gd.projectiles.push({
                x: originX,
                y: originY,
                vx: dir * (isNormalBoss ? 7.5 : isMiniBoss ? 6.0 : 4.5),
                vy: 0,
                radius: isNormalBoss ? 7 : isMiniBoss ? 5.5 : 4,
                color: enemy.virusVariant === 'bottleneck_amd'
                  ? '#ef4444'
                  : isMiniBoss
                  ? '#38bdf8'
                  : enemy.type === 'thermal'
                  ? '#ea580c'
                  : enemy.type === 'glitch'
                  ? '#10b981'
                  : '#a855f7',
                isEnemy: true
              });
            }
          }
        }

        // Enemy Body Touching Player
        if (
          player.x + player.width > enemy.x + 3 &&
          player.x < enemy.x + enemy.width - 3 &&
          player.y + player.height > enemy.y &&
          player.y < enemy.y + enemy.height
        ) {
          const isStomp = player.vy > 0 && player.y + player.height <= enemy.y + 18;
          if (isStomp && enemy.type !== 'boss' && enemy.type !== 'secret_boss') {
            enemy.health -= isAmdPerk ? 3 : 2;
            playRetroSound('stomp');
            player.vy = (keys['ArrowUp'] || keys['KeyW'] || keys['Space']) ? -12 : -8.5;
            player.isGrounded = false;
            player.doubleJumpUsed = false;

            const stompPts = registerComboPoints(300, enemy.x + enemy.width / 2, enemy.y);
            player.score += stompPts;
            setScore(player.score);
            spawnFloatingText(enemy.x + enemy.width / 2, enemy.y - 14, `¡STOMP! +${stompPts}`, '#22c55e', 1.25);

            for (let p = 0; p < 10; p++) {
              gd.particles.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 4,
                life: 14,
                maxLife: 14,
                color: '#22c55e',
                size: 3
              });
            }

            if (enemy.health <= 0) {
              gd.enemies.splice(eIdx, 1);
            }
            continue;
          }

          if (player.invulnerableBonusTimer > 0) {
            enemy.health -= 2;
            enemy.vx = player.x < enemy.x ? 4 : -4;
            playRetroSound('hit');
            for (let p = 0; p < 10; p++) {
              gd.particles.push({
                x: (player.x + enemy.x) / 2,
                y: (player.y + enemy.y) / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 16,
                maxLife: 16,
                color: '#10b981',
                size: 4
              });
            }
            if (enemy.health <= 0) {
              const isSecret = enemy.type === 'secret_boss';
              const isBoss = enemy.type === 'boss' || isSecret;
              const isMiniBoss = enemy.type === 'miniboss';
              const pts = registerComboPoints(isSecret ? 10000 : isBoss ? 5000 : isMiniBoss ? 2500 : 250, enemy.x, enemy.y);
              player.score += pts;
              player.fpsCounter += isSecret ? 350 : isBoss ? 200 : isMiniBoss ? 100 : 15;
              setScore(player.score);
              setCurrentFpsDisplay(player.fpsCounter);
              gd.enemies.splice(eIdx, 1);
              if (isBoss) {
                triggerBossVictory(isSecret, activeFaction);
                return;
              }
            }
          } else if (player.invincibleTimer <= 0) {
            player.temp += 16;
            player.health--;
            setPlayerHealth(Math.max(0, player.health));
            player.invincibleTimer = 40;
            player.vy = -7;
            player.vx = player.x < enemy.x ? -7 : 7;
            playRetroSound('hit');

            if (player.temp >= 100 || player.health <= 0) {
              playRetroSound('gameover');
              setGameState('gameover');
              return;
            }
          }
        }
      }

      // =======================================================================
      // 4. COLLECTIBLES & LEGENDARY PC COMPONENTS & GPU CHIP POWERUPS
      // =======================================================================
      for (const item of gd.collectibles) {
        if (!item.collected) {
          if (
            player.x + player.width > item.x &&
            player.x < item.x + item.width &&
            player.y + player.height > item.y &&
            player.y < item.y + item.height
          ) {
            item.collected = true;

            if (item.type === 'paste') {
              player.temp = Math.max(30, player.temp - 25);
              player.score += 500;
              player.fpsCounter += 45;
              playRetroSound('pickup');
            } else if (item.type === 'motherboard') {
              player.hasDoubleJump = true;
              player.score += 500;
              player.fpsCounter += 45;
              playRetroSound('pickup');
            } else if (item.type === 'gpu_chip_speed') {
              player.speedBoostTimer = 480;
              player.score += 750;
              player.fpsCounter += 60;
              playRetroSound('powerup');
              spawnFloatingText(item.x, item.y - 16, '⚡ GPU TURBO SPEED', '#06b6d4', 1.25);
            } else if (item.type === 'gpu_chip_shield') {
              player.invulnerableBonusTimer = 480;
              player.score += 750;
              player.fpsCounter += 40;
              playRetroSound('powerup');
              spawnFloatingText(item.x, item.y - 16, '🛡 GPU ESCUDO TOTAL', '#10b981', 1.25);
            } else if (item.type === 'gpu_chip_overclock') {
              player.tripleShotTimer = 480;
              player.score += 750;
              player.fpsCounter += 80;
              playRetroSound('powerup');
              spawnFloatingText(item.x, item.y - 16, '💥 TENSOR TRIPLE', '#f59e0b', 1.25);
            } else if (item.type === 'gpu_chip_chrono') {
              player.chronoTimer = 420;
              player.score += 850;
              player.fpsCounter += 90;
              playRetroSound('chrono');
              spawnFloatingText(item.x, item.y - 16, '⏱ CHRONO-SYNC 7s', '#a855f7', 1.3);
            } else {
              player.score += 500;
              player.fpsCounter += 45;
              playRetroSound('pickup');
              spawnFloatingText(item.x, item.y - 16, `★ ${item.iconSymbol} +500`, item.color, 1.2);
            }

            setScore(player.score);
            setCurrentFpsDisplay(player.fpsCounter);

            if (!item.type.startsWith('gpu_chip_')) {
              setCollectedComponents(prev => (prev.includes(item.name) ? prev : [...prev, item.name]));
            }

            for (let p = 0; p < 18; p++) {
              gd.particles.push({
                x: item.x + item.width / 2,
                y: item.y + item.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 22,
                maxLife: 22,
                color: item.color,
                size: item.type.startsWith('gpu_chip_') ? 5 : 4
              });
            }
          }
        }
      }

      // Sync active powerups to React HUD state every 6 frames
      if (gd.animFrame % 6 === 0) {
        setActivePowerups({
          speed: Math.ceil(player.speedBoostTimer / 60),
          shield: Math.ceil(player.invulnerableBonusTimer / 60),
          tripleShot: Math.ceil(player.tripleShotTimer / 60),
          chrono: Math.ceil(player.chronoTimer / 60)
        });
      }

      // Level Complete Check: Reached right portal
      if (player.x >= gd.levelWidth - 120) {
        if (activeLvl < 5) {
          playRetroSound('victory');
          initLevel(activeLvl + 1);
          return;
        } else if (activeLvl === 5) {
          // LEVEL 5 COMPLETE -> OPEN INTEL vs AMD FACTION FORK!
          playRetroSound('secret');
          setGameState('choosing_path');
          return;
        }
      }

      // Fall off bottom pit check (uses activated Checkpoint!)
      if (player.y > 600) {
        player.health--;
        setPlayerHealth(Math.max(0, player.health));
        player.temp += 22;
        player.x = player.checkpointX > 80 ? player.checkpointX : Math.max(80, player.x - 200);
        player.y = player.checkpointX > 80 ? player.checkpointY : 260;
        player.vy = 0;
        player.vx = 0;
        playRetroSound('hit');

        if (player.health <= 0 || player.temp >= 100) {
          playRetroSound('gameover');
          setGameState('gameover');
          return;
        }
      }

      setPlayerTemp(Math.round(player.temp));

      // =======================================================================
      // 5. PARTICLES UPDATE
      // =======================================================================
      for (let i = gd.particles.length - 1; i >= 0; i--) {
        const pt = gd.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) {
          gd.particles.splice(i, 1);
        }
      }

      // =======================================================================
      // 6. RENDER FRAME
      // =======================================================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // (A) Realm-Themed Tech Grid Background
      ctx.save();
      const bgMap: Record<number, string> = {
        1: '#05070d',
        2: '#120806',
        3: '#090514',
        4: '#040d14',
        5: '#030e1a',
        6: activeFaction === 'intel' ? '#030b1c' : '#160508'
      };
      ctx.fillStyle = bgMap[activeLvl] || '#05070d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = activeLvl === 6
        ? (activeFaction === 'intel' ? 'rgba(59, 130, 246, 0.14)' : 'rgba(239, 68, 68, 0.14)')
        : activeLvl === 5
        ? 'rgba(56, 189, 248, 0.1)'
        : activeLvl === 4
        ? 'rgba(16, 185, 129, 0.1)'
        : '#111827';
      ctx.lineWidth = 1;
      const gridOffset = -(gd.cameraX * 0.25) % 40;
      for (let x = gridOffset; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // (B) Camera Transform
      ctx.translate(-Math.round(gd.cameraX), 0);

      // (B.1) Draw Hidden Areas Holographic Glitch Barriers
      for (const area of gd.hiddenAreas) {
        ctx.save();
        if (!area.discovered) {
          ctx.fillStyle = 'rgba(6, 182, 212, 0.16)';
          ctx.fillRect(area.x, area.y, area.width, area.height);

          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(area.x, area.y, area.width, area.height);

          ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
          ctx.lineWidth = 2;
          for (let sx = area.x - area.height; sx < area.x + area.width; sx += 24) {
            ctx.beginPath();
            ctx.moveTo(sx, area.y);
            ctx.lineTo(sx + area.height, area.y + area.height);
            ctx.stroke();
          }

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('CAMINO SECRETO // DESCONOCIDO', area.x + area.width / 2, area.y + 20);
        } else {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
          ctx.fillRect(area.x, area.y, area.width, area.height);
          ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(area.x, area.y, area.width, area.height);
        }
        ctx.restore();
      }

      // (B.2) Draw Question Blocks & Modifiers
      for (const blk of gd.blocks) {
        if (blk.shattered) continue;

        if (blk.type === 'hidden' && !blk.revealed) {
          if (Math.sin(Date.now() * 0.003 + blk.x) > 0.95) {
            ctx.save();
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.fillRect(blk.x, blk.y, blk.width, blk.height);
            ctx.restore();
          }
          continue;
        }

        const bx = blk.x;
        const by = blk.y + blk.bumpOffsetY;
        const bw = blk.width;
        const bh = blk.height;

        ctx.save();
        if (blk.type === 'question') {
          if (blk.isHit) {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(bx, by, bw, bh);
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, by, bw, bh);
            ctx.fillStyle = '#334155';
            ctx.fillRect(bx + 4, by + 4, bw - 8, bh - 8);
          } else {
            const pulse = Math.sin(Date.now() * 0.007 + bx) * 0.15 + 0.85;
            const grad = ctx.createLinearGradient(bx, by, bx, by + bh);
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.5, '#f59e0b');
            grad.addColorStop(1, '#b45309');
            ctx.fillStyle = grad;
            ctx.fillRect(bx, by, bw, bh);

            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 10 * pulse;
            ctx.strokeRect(bx, by, bw, bh);
            ctx.shadowBlur = 0;

            const qOffsetY = Math.sin(Date.now() * 0.006) * 1.5;
            ctx.fillStyle = '#451a03';
            ctx.font = '900 18px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', bx + bw / 2 + 1, by + bh / 2 + qOffsetY + 1);
            ctx.fillStyle = '#ffffff';
            ctx.fillText('?', bx + bw / 2, by + bh / 2 + qOffsetY);
          }
        } else if (blk.type === 'brick') {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx, by, bw, bh);
        } else if (blk.type === 'hidden' && blk.revealed) {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(bx, by, bw, bh);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 16px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('★', bx + bw / 2, by + bh / 2);
        }
        ctx.restore();
      }

      // (B.3) Draw Platforms (including moving, bounce, cryo_vent, pcie, cryo, intel, amd)
      const nowMs = Date.now();
      for (const plat of gd.platforms) {
        ctx.save();
        if (plat.type === 'bounce') {
          const springPulse = Math.sin(nowMs * 0.01) * 2;
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(plat.x, plat.y + 4, plat.width, plat.height - 4);
          ctx.fillStyle = '#fbbf24';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.fillRect(plat.x - 2, plat.y + springPulse * 0.4, plat.width + 4, 5);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 0;
          ctx.fillText('▲▲', plat.x + plat.width / 2, plat.y - 3);
        } else if (plat.type === 'cryo_vent') {
          ctx.fillStyle = '#0c4a6e';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
          // Rising mist aura
          const mistGrad = ctx.createLinearGradient(0, plat.y - 80, 0, plat.y);
          mistGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
          mistGrad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
          ctx.fillStyle = mistGrad;
          ctx.fillRect(plat.x, plat.y - 80, plat.width, 80);
          ctx.fillStyle = '#bae6fd';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('❄ CRYO', plat.x + plat.width / 2, plat.y - 6);
        } else if (plat.type === 'moving') {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 8;
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#22d3ee';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(plat.moveAxis === 'y' ? '⬍ BUS' : '⬌ BUS', plat.x + plat.width / 2, plat.y + 13);
        } else if (plat.type === 'silicon') {
          ctx.fillStyle = '#0a0f18';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 1;
          for (let gx = plat.x + 20; gx < plat.x + plat.width - 20; gx += 45) {
            ctx.strokeRect(gx, plat.y + 6, 12, 6);
          }
        } else if (plat.type === 'copper') {
          ctx.fillStyle = '#1c0f0a';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#f97316';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
        } else if (plat.type === 'pcie') {
          ctx.fillStyle = '#06151c';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
          ctx.fillStyle = '#fbbf24';
          for (let gx = plat.x + 12; gx < plat.x + plat.width - 12; gx += 28) {
            ctx.fillRect(gx, plat.y + 7, 10, 3);
          }
        } else if (plat.type === 'cryo') {
          ctx.fillStyle = '#071b2e';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
        } else if (plat.type === 'intel_fortress') {
          ctx.fillStyle = '#071636';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#3b82f6';
          ctx.shadowColor = '#3b82f6';
          ctx.shadowBlur = 8;
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
        } else if (plat.type === 'amd_nexus') {
          ctx.fillStyle = '#220709';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
        } else {
          ctx.fillStyle = '#0c071a';
          ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(plat.x, plat.y, plat.width, 3);
        }
        ctx.restore();
      }

      // (B.4) Draw Checkpoints
      for (const cp of gd.checkpoints) {
        ctx.save();
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(cp.x, cp.y - 44, 4, 48);
        ctx.fillStyle = cp.activated ? '#10b981' : '#f59e0b';
        ctx.shadowColor = cp.activated ? '#10b981' : '#f59e0b';
        ctx.shadowBlur = cp.activated ? 12 : 4;
        ctx.beginPath();
        ctx.moveTo(cp.x + 4, cp.y - 44);
        ctx.lineTo(cp.x + 28, cp.y - 34);
        ctx.lineTo(cp.x + 4, cp.y - 24);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = cp.activated ? '#6ee7b7' : '#fde68a';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(cp.activated ? '✓ SAVED' : 'CHECK', cp.x + 12, cp.y - 50);
        ctx.restore();
      }

      // (B.5) Level Exit Portal Gate (Levels 1-5; Level 5 portal is the Intel vs AMD Crossroads!)
      if (activeLvl < 6) {
        const portalX = gd.levelWidth - 100;
        const isForkPortal = activeLvl === 5;
        ctx.save();
        ctx.strokeStyle = isForkPortal ? '#a855f7' : '#22c55e';
        ctx.lineWidth = 3;
        ctx.shadowColor = isForkPortal ? '#a855f7' : '#22c55e';
        ctx.shadowBlur = 14;
        ctx.strokeRect(portalX, 330, 52, 110);
        ctx.fillStyle = isForkPortal ? 'rgba(168, 85, 247, 0.25)' : 'rgba(34, 197, 94, 0.2)';
        ctx.fillRect(portalX, 330, 52, 110);
        ctx.shadowBlur = 0;
        ctx.fillStyle = isForkPortal ? '#e879f9' : '#22c55e';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(isForkPortal ? 'INTEL / AMD' : 'PORTAL', portalX + 26, 320);
        ctx.restore();
      }

      // (B.6) Draw Collectibles & Virtual GPU Chips
      for (const item of gd.collectibles) {
        if (!item.collected) {
          const bounce = Math.sin(nowMs * 0.006 + (item.x % 10)) * 4;
          ctx.save();

          if (item.type.startsWith('gpu_chip_')) {
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 12;

            ctx.fillRect(item.x, item.y + bounce, item.width, item.height);
            ctx.strokeRect(item.x, item.y + bounce, item.width, item.height);

            ctx.fillStyle = '#fbbf24';
            for (let px = item.x + 4; px < item.x + item.width - 3; px += 6) {
              ctx.fillRect(px, item.y + bounce - 2, 3, 2);
              ctx.fillRect(px, item.y + bounce + item.height, 3, 2);
            }

            ctx.fillStyle = item.color;
            ctx.fillRect(item.x + 5, item.y + bounce + 5, item.width - 10, item.height - 10);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            ctx.fillText(item.iconSymbol, item.x + item.width / 2, item.y + bounce + item.height / 2 + 3);
          } else {
            ctx.fillStyle = item.color;
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(item.x, item.y + bounce, item.width, item.height);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            ctx.fillText(item.iconSymbol, item.x + item.width / 2, item.y + bounce + item.height / 2 + 3);
          }
          ctx.restore();
        }
      }

      // (B.7) Draw Projectiles
      for (const pr of gd.projectiles) {
        ctx.save();
        ctx.fillStyle = pr.color;
        ctx.shadowColor = pr.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, pr.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // (B.8) Draw Enemies, Mini-Bosses & Faction/Secret Bosses
      for (const enemy of gd.enemies) {
        ctx.save();
        const ecx = enemy.x + enemy.width / 2;
        const ecy = enemy.y + enemy.height / 2;
        const hpPct = Math.max(0, enemy.health / enemy.maxHealth);
        const timeSec = nowMs * 0.001;

        if (enemy.type === 'secret_boss') {
          const isEnraged = hpPct <= 0.5;
          const rad = enemy.width * 0.42;

          const auraPulse = Math.sin(nowMs * 0.008) * 8;
          ctx.shadowColor = isEnraged ? '#ef4444' : '#10b981';
          ctx.shadowBlur = 24 + auraPulse;
          ctx.fillStyle = isEnraged ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
          ctx.beginPath();
          ctx.arc(ecx, ecy, rad + 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          const numSpikes = 16;
          const rot1 = timeSec * 0.8;
          for (let s = 0; s < numSpikes; s++) {
            const ang = (s * (Math.PI * 2) / numSpikes) + rot1;
            const spikeLen = rad + 16 + Math.sin(timeSec * 6 + s) * 4;
            ctx.strokeStyle = isEnraged ? '#ef4444' : '#10b981';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(ecx + Math.cos(ang) * (rad * 0.8), ecy + Math.sin(ang) * (rad * 0.8));
            ctx.lineTo(ecx + Math.cos(ang) * spikeLen, ecy + Math.sin(ang) * spikeLen);
            ctx.stroke();
          }

          const grad = ctx.createRadialGradient(ecx - rad * 0.3, ecy - rad * 0.3, 4, ecx, ecy, rad);
          grad.addColorStop(0, isEnraged ? '#fca5a5' : '#86efac');
          grad.addColorStop(0.5, isEnraged ? '#ef4444' : '#10b981');
          grad.addColorStop(1, '#09090b');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ecx, ecy, rad, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(ecx, ecy - 4, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = isEnraged ? '#ef4444' : '#10b981';
          ctx.beginPath();
          ctx.arc(ecx, ecy - 4, 7, 0, Math.PI * 2);
          ctx.fill();

          const barW = enemy.width + 36;
          const barX = ecx - barW / 2;
          const barY = enemy.y - 28;
          ctx.fillStyle = '#09090b';
          ctx.fillRect(barX - 2, barY - 2, barW + 4, 14);
          ctx.fillStyle = isEnraged ? '#ef4444' : '#10b981';
          ctx.fillRect(barX, barY, barW * hpPct, 10);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${enemy.name} (${enemy.health}/${enemy.maxHealth})`, ecx, barY - 6);
        } else if (enemy.type === 'boss') {
          const isIntelBoss = enemy.virusVariant === 'spectre_intel';
          const rad = enemy.width * 0.42;
          const primaryColor = isIntelBoss ? '#3b82f6' : '#ef4444';
          const secondaryColor = isIntelBoss ? '#38bdf8' : '#f59e0b';

          for (let sat = 0; sat < 2; sat++) {
            const satAng = timeSec * 2.6 + sat * Math.PI;
            ctx.fillStyle = secondaryColor;
            ctx.beginPath();
            ctx.arc(ecx + Math.cos(satAng) * (rad + 18), ecy + Math.sin(satAng) * (rad + 14), 5, 0, Math.PI * 2);
            ctx.fill();
          }

          for (let s = 0; s < 12; s++) {
            const ang = (s * (Math.PI * 2) / 12) + timeSec * 0.6;
            const sx2 = ecx + Math.cos(ang) * (rad + 12);
            const sy2 = ecy + Math.sin(ang) * (rad + 12);
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(ecx + Math.cos(ang) * (rad * 0.8), ecy + Math.sin(ang) * (rad * 0.8));
            ctx.lineTo(sx2, sy2);
            ctx.stroke();
            ctx.fillStyle = secondaryColor;
            ctx.beginPath();
            ctx.arc(sx2, sy2, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          const grad = ctx.createRadialGradient(ecx - rad * 0.3, ecy - rad * 0.3, 3, ecx, ecy, rad);
          grad.addColorStop(0, isIntelBoss ? '#93c5fd' : '#fca5a5');
          grad.addColorStop(0.55, primaryColor);
          grad.addColorStop(1, isIntelBoss ? '#1e3a8a' : '#450a0a');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ecx, ecy, rad, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fef08a';
          ctx.fillRect(ecx - 16, ecy - 6, 32, 8);
          ctx.fillStyle = primaryColor;
          ctx.fillRect(ecx - 6, ecy - 6, 12, 8);

          const barW = enemy.width + 26;
          const barX = ecx - barW / 2;
          const barY = enemy.y - 22;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(barX, barY, barW, 8);
          ctx.fillStyle = primaryColor;
          ctx.fillRect(barX, barY, barW * hpPct, 8);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${enemy.name} (${enemy.health}/${enemy.maxHealth})`, ecx, barY - 5);
        } else if (enemy.type === 'miniboss') {
          const rad = enemy.width * 0.44;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          for (let h = 0; h < 6; h++) {
            const ang = (h * Math.PI) / 3 + timeSec;
            const hx = ecx + Math.cos(ang) * rad;
            const hy = ecy + Math.sin(ang) * rad;
            if (h === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.fillStyle = '#0c4a6e';
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(ecx - 10, ecy - 4, 20, 6);

          const barW = enemy.width + 16;
          const barX = ecx - barW / 2;
          const barY = enemy.y - 16;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(barX, barY, barW, 6);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(barX, barY, barW * hpPct, 6);
          ctx.fillStyle = '#bae6fd';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${enemy.name} (${enemy.health}/${enemy.maxHealth})`, ecx, barY - 4);
        } else {
          const vrad = enemy.width * 0.42;
          const pulse = Math.sin(nowMs * 0.007 + enemy.id) * 1.8;
          const variant = enemy.virusVariant || (enemy.type === 'thermal' ? 'pyroworm' : enemy.type === 'lag' ? 'trojanphage' : 'cryptoparasite');

          if (variant === 'pyroworm') {
            for (let s = 0; s < 8; s++) {
              const ang = (s * (Math.PI * 2) / 8) + (nowMs * 0.002);
              const sx2 = ecx + Math.cos(ang) * (vrad + 6 + pulse);
              const sy2 = ecy + Math.sin(ang) * (vrad + 6 + pulse);
              ctx.strokeStyle = '#ea580c';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(ecx + Math.cos(ang) * (vrad * 0.7), ecy + Math.sin(ang) * (vrad * 0.7));
              ctx.lineTo(sx2, sy2);
              ctx.stroke();
            }
            const vgrad = ctx.createRadialGradient(ecx - 3, ecy - 3, 2, ecx, ecy, vrad);
            vgrad.addColorStop(0, '#fef08a');
            vgrad.addColorStop(0.5, '#ea580c');
            vgrad.addColorStop(1, '#7c2d12');
            ctx.fillStyle = vgrad;
            ctx.beginPath();
            ctx.arc(ecx, ecy, vrad, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(ecx - 6, ecy - 3, 4, 3);
            ctx.fillRect(ecx + 2, ecy - 3, 4, 3);
          } else if (variant === 'trojanphage') {
            ctx.fillStyle = '#7c3aed';
            ctx.beginPath();
            for (let h = 0; h < 6; h++) {
              const hang = (h * Math.PI) / 3;
              const hx = ecx + Math.cos(hang) * vrad;
              const hy = (ecy - 3) + Math.sin(hang) * vrad;
              if (h === 0) ctx.moveTo(hx, hy);
              else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#c084fc';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(ecx - 5, ecy - 4, 3, 2);
            ctx.fillRect(ecx + 2, ecy - 4, 3, 2);
          } else {
            const vgrad = ctx.createRadialGradient(ecx - 2, ecy - 2, 2, ecx, ecy, vrad);
            vgrad.addColorStop(0, '#86efac');
            vgrad.addColorStop(0.5, '#10b981');
            vgrad.addColorStop(1, '#064e3b');
            ctx.fillStyle = vgrad;
            ctx.beginPath();
            ctx.arc(ecx, ecy, vrad, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ecx, ecy - 1, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(ecx - 1, ecy - 4, 2, 6);
          }

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
          ctx.fillStyle = enemy.type === 'thermal' ? '#ea580c' : enemy.type === 'glitch' ? '#10b981' : '#a855f7';
          ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * hpPct, 4);
        }
        ctx.restore();
      }

      // (B.9) Draw Particles
      for (const pt of gd.particles) {
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // (B.10) Draw Player (Cyber Assembler Hero with Intel / AMD Realm 6 Suit Colors!)
      ctx.save();
      if (player.speedBoostTimer > 0 && Math.abs(player.vx) > 0.5) {
        ctx.fillStyle = 'rgba(6, 182, 212, 0.32)';
        const trailOffset = player.facing === 'right' ? -12 : 12;
        ctx.fillRect(player.x + trailOffset, player.y + 4, player.width, player.height - 8);
      }
      if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 4) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      const px = player.x;
      const py = player.y;
      const isRight = player.facing === 'right';
      const isMoving = Math.abs(player.vx) > 0.3;
      const legStride = (player.isGrounded && isMoving) ? Math.sin(nowMs * 0.016) * 5 : 0;
      const idleBob = (player.isGrounded && !isMoving) ? Math.sin(nowMs * 0.005) * 1 : 0;
      const charY = py - idleBob;

      const jacketColor = player.speedBoostTimer > 0
        ? '#0891b2'
        : player.invulnerableBonusTimer > 0
        ? '#f59e0b'
        : isIntelPerk
        ? '#2563eb'
        : isAmdPerk
        ? '#dc2626'
        : '#dc2626';
      const jacketTrim = player.speedBoostTimer > 0
        ? '#22d3ee'
        : player.invulnerableBonusTimer > 0
        ? '#fef08a'
        : isIntelPerk
        ? '#60a5fa'
        : isAmdPerk
        ? '#fbbf24'
        : '#ef4444';

      const packX = isRight ? px + 2 : px + player.width - 9;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(packX, charY + 12, 7, 14);
      ctx.fillStyle = jacketTrim;
      ctx.fillRect(packX + 1, charY + 14, 5, 2);
      ctx.fillRect(packX + 1, charY + 18, 5, 2);

      const hipY = charY + 24;
      const leg1X = px + 8 + legStride;
      const leg2X = px + 18 - legStride;
      const boot1Y = !player.isGrounded ? (player.vy < 0 ? charY + 31 : charY + 35) : charY + 34;
      const boot2Y = !player.isGrounded ? (player.vy < 0 ? charY + 33 : charY + 35) : charY + 34;

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px + 10, hipY);
      ctx.lineTo(leg1X, boot1Y - 1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(px + 16, hipY);
      ctx.lineTo(leg2X, boot2Y - 1);
      ctx.stroke();

      ctx.fillStyle = '#09090b';
      ctx.fillRect(leg1X - 3, boot1Y - 2, 7, 5);
      ctx.fillRect(leg2X - 3, boot2Y - 2, 7, 5);
      ctx.fillStyle = jacketTrim;
      ctx.fillRect(leg1X - 3, boot1Y + 2, 7, 2);
      ctx.fillRect(leg2X - 3, boot2Y + 2, 7, 2);

      // Torso
      ctx.fillStyle = jacketColor;
      ctx.fillRect(px + 6, charY + 12, 16, 12);
      ctx.fillStyle = jacketTrim;
      ctx.fillRect(px + 13, charY + 12, 2, 12);

      // Head
      const headCenterX = isRight ? px + 15 : px + 13;
      const headCenterY = charY + 7;
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#3f2717';
      ctx.beginPath();
      ctx.arc(headCenterX, headCenterY - 1, 6, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();

      // Visor / Scouter
      ctx.fillStyle = player.tripleShotTimer > 0 ? '#fbbf24' : isIntelPerk ? '#60a5fa' : isAmdPerk ? '#fbbf24' : '#38bdf8';
      ctx.fillRect(isRight ? headCenterX - 1 : headCenterX - 3, headCenterY - 2, 4, 2.5);

      // Blaster
      const armShoulderX = isRight ? px + 17 : px + 11;
      const armShoulderY = charY + 14;
      const muzzleDir = isRight ? 1 : -1;
      const muzzleX = armShoulderX + muzzleDir * 12;
      const muzzleY = armShoulderY + 2;

      ctx.strokeStyle = jacketColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(armShoulderX, armShoulderY);
      ctx.lineTo(muzzleX - muzzleDir * 4, muzzleY);
      ctx.stroke();

      ctx.fillStyle = '#334155';
      ctx.fillRect(muzzleX - (isRight ? 4 : 0), muzzleY - 2, 7, 4);
      ctx.fillStyle = player.tripleShotTimer > 0 ? '#fbbf24' : isIntelPerk ? '#60a5fa' : isAmdPerk ? '#f97316' : '#38bdf8';
      ctx.fillRect(isRight ? muzzleX + 3 : muzzleX - 4, muzzleY - 1.5, 3, 3);

      // Shield Forcefield Aura
      if (player.invulnerableBonusTimer > 0) {
        ctx.strokeStyle = '#10b981';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(px + player.width / 2, charY + player.height / 2, player.height / 2 + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      // (B.11) Floating Texts
      for (const ft of gd.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
        ctx.font = `900 ${Math.round(14 * (ft.scale || 1))}px monospace`;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // Camera restore

      // (C) Chrono-Sync Bullet Time Screen Tint
      if (isChronoActive) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
        ctx.fillStyle = 'rgba(88, 28, 135, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // (D) Secret Discovery / Faction Banner Overlay
      if (gd.secretDiscoveredTimer > 0) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, gd.secretDiscoveredTimer / 20);
        const bw = Math.min(canvas.width - 40, 520);
        const bh = 36;
        const bx = (canvas.width - bw) / 2;
        const by = 14;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`✨ ${gd.secretDiscoveredName} ✨`, canvas.width / 2, by + bh / 2);
        ctx.restore();
      }

      // (E) Optional CRT Retro Scanline Overlay
      if (crtEffect) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
        for (let y = 0; y < canvas.height; y += 4) {
          ctx.fillRect(0, y, canvas.width, 1.5);
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, crtEffect, playRetroSound, initLevel, registerComboPoints, spawnFloatingText]);

  const startGame = (startLvl: number = 1) => {
    const gd = gameData.current;
    gd.player.score = startLvl > 1 ? (startLvl - 1) * 2000 : 0;
    gd.player.fpsCounter = startLvl > 1 ? 45 + (startLvl - 1) * 40 : 45;
    gd.player.hasDoubleJump = startLvl > 1;
    gd.combo = 0;
    gd.comboTimer = 0;
    gd.maxCombo = 1;
    gd.defeatedSecretBoss = false;

    setChosenFaction(null);
    chosenFactionRef.current = null;
    setDefeatedSecretBoss(false);
    setComboDisplay({ count: 0, mult: 1 });
    setMaxComboDisplay(1);
    setScore(gd.player.score);
    setCurrentFpsDisplay(gd.player.fpsCounter);
    setCollectedComponents([]);
    setHasSubmittedScore(false);
    setSubmittedRank(null);

    initLevel(startLvl, null);
    setGameState('playing');
  };

  const handleOpenCrossroadsDirect = () => {
    const gd = gameData.current;
    if (gd.player.score < 8500) {
      gd.player.score = 8500;
      gd.player.fpsCounter = 240;
    }
    gd.player.hasDoubleJump = true;
    gd.combo = 0;
    gd.comboTimer = 0;
    gd.maxCombo = 1;
    gd.defeatedSecretBoss = false;
    setDefeatedSecretBoss(false);
    setScore(gd.player.score);
    setCurrentFpsDisplay(gd.player.fpsCounter);
    setHasSubmittedScore(false);
    setSubmittedRank(null);
    setGameState('choosing_path');
  };

  const handleChooseFaction = (faction: FactionPath) => {
    setHasSubmittedScore(false);
    setSubmittedRank(null);
    setDefeatedSecretBoss(false);
    gameData.current.defeatedSecretBoss = false;
    initLevel(6, faction);
    setGameState('playing');
  };

  const handleApplySupremeBuild = () => {
    const supremeBuild: Partial<Record<ComponentCategory, PCComponent>> = {};
    const isIntel = chosenFaction === 'intel';

    const cpu = isIntel
      ? COMPONENTS_DATABASE.find(c => c.id === 'cpu-core-ultra-9-285k') || COMPONENTS_DATABASE[0]
      : COMPONENTS_DATABASE.find(c => c.id === 'cpu-r7-9800x3d') || COMPONENTS_DATABASE[0];

    const mb = isIntel
      ? COMPONENTS_DATABASE.find(c => c.id === 'mb-z890-msi-carbon') || COMPONENTS_DATABASE[2]
      : COMPONENTS_DATABASE.find(c => c.id === 'mb-x870-asus-tuf') || COMPONENTS_DATABASE[2];

    const ram = isIntel
      ? COMPONENTS_DATABASE.find(c => c.id === 'ram-ddr5-32gb-7200-rgb') || COMPONENTS_DATABASE[3]
      : COMPONENTS_DATABASE.find(c => c.id === 'ram-ddr5-32gb-6000-cl30') || COMPONENTS_DATABASE[3];

    const gpu = COMPONENTS_DATABASE.find(c => c.id === 'gpu-rtx-4090-24gb') || COMPONENTS_DATABASE[4];
    const cooler = COMPONENTS_DATABASE.find(c => c.id === 'cooler-arctic-liquid-iii-360') || COMPONENTS_DATABASE[1];
    const storage = COMPONENTS_DATABASE.find(c => c.id === 'ssd-crucial-t705-2tb-gen5') || COMPONENTS_DATABASE[5];
    const psu = COMPONENTS_DATABASE.find(c => c.id === 'psu-seasonic-vertex-gx1200') || COMPONENTS_DATABASE[6];
    const pcCase = COMPONENTS_DATABASE.find(c => c.id === 'case-lian-li-o11-dynamic-evo') || COMPONENTS_DATABASE[7];

    supremeBuild.cpu = cpu;
    supremeBuild.gpu = gpu;
    supremeBuild.motherboard = mb;
    supremeBuild.cooler = cooler;
    supremeBuild.ram = ram;
    supremeBuild.storage = storage;
    supremeBuild.psu = psu;
    supremeBuild.case = pcCase;

    if (onGoToBuilderWithSupremePC) {
      onGoToBuilderWithSupremePC(supremeBuild);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="pb-4 border-b border-red-950/40 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-red-500" />
            <span>Mini-Aventura Retro 2D · 6 Reinos + Camino Intel vs AMD</span>
          </div>
          <h1 className="mt-1.5 text-3xl sm:text-4xl font-black text-white tracking-tight">
            NÚCLEO LEGEND: Guerra del Silicio
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Supera 6 reinos con plataformas móviles, ventilas criogénicas, combos x5, Mini-Jefes y elige tu alianza final entre <strong>Intel Core Ultra</strong> o <strong>AMD Ryzen X3D</strong>.
          </p>
        </div>

        {/* Global Stats Strip & Leaderboard Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-4 bg-slate-900/90 px-4 py-2 rounded-xl border border-red-950/50 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">FPS en Juego:</span>
              <strong className="text-emerald-400 font-mono font-bold text-sm">
                {currentFpsDisplay} FPS
              </strong>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">Puntuación:</span>
              <strong className="text-white font-mono font-bold text-sm">
                {score.toLocaleString()} pts
              </strong>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div>
              <span className="text-[10px] text-slate-400 font-mono block">Combo Máx:</span>
              <strong className="text-amber-400 font-mono font-bold text-sm">
                x{maxComboDisplay}
              </strong>
            </div>
            <div className="h-6 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono block">Jefe Secreto (&gt;21k):</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                score > 21000
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {score > 21000 ? '👑 ¡DESBLOQUEADO!' : `${score.toLocaleString()}/21,000`}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-red-500/30 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-mono font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95 whitespace-nowrap"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Tabla de Líderes</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Screen Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-red-950/70 bg-slate-950 shadow-2xl">
        {/* HUD Overlay Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-2.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Hearts / Health */}
            <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Heart
                  key={idx}
                  className={`w-3.5 h-3.5 transition-all ${
                    idx < playerHealth
                      ? 'text-rose-500 fill-rose-500 drop-shadow'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Temp Gauge */}
            <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Flame className={`w-4 h-4 ${playerTemp > 75 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
              <div className="space-y-0.5">
                <div className="flex justify-between gap-1 text-[10px] font-mono">
                  <span className="text-slate-400">Temp:</span>
                  <strong className={playerTemp > 75 ? 'text-rose-400' : 'text-slate-200'}>
                    {playerTemp}°C
                  </strong>
                </div>
                <div className="w-16 sm:w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      playerTemp > 80 ? 'bg-rose-500' : playerTemp > 60 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, (playerTemp - 30) * 1.4))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Level Label */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/30 text-xs font-mono font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Reino {currentLevel}/6</span>
            </div>

            {/* Faction Badge in Level 6 */}
            {currentLevel === 6 && chosenFaction && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold whitespace-nowrap ${
                chosenFaction === 'intel'
                  ? 'bg-blue-950/90 border-blue-500 text-blue-300'
                  : 'bg-red-950/90 border-red-500 text-red-300'
              }`}>
                <Cpu className="w-3.5 h-3.5" />
                <span>{chosenFaction === 'intel' ? 'INTEL AZUL' : 'AMD CARMESÍ'}</span>
              </div>
            )}

            {currentLevel === 6 && isSecretBossBattle && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-emerald-400/70 bg-emerald-950/90 text-[11px] font-mono font-bold text-emerald-300 animate-pulse whitespace-nowrap">
                <span>👑 JEFE ZERO-DAY</span>
              </div>
            )}

            {/* Dynamic Combo Counter */}
            {comboDisplay.count >= 2 && (
              <div className="flex items-center gap-1 bg-amber-950/90 border border-amber-400 px-2.5 py-1 rounded-xl text-[11px] font-mono font-black text-amber-300 animate-bounce whitespace-nowrap">
                <span>🔥 COMBO x{comboDisplay.mult}</span>
              </div>
            )}

            {/* Active GPU Chip Powerups Status Badges */}
            {activePowerups.speed > 0 && (
              <div className="flex items-center gap-1 bg-cyan-950/90 border border-cyan-500/70 px-2 py-1 rounded-xl text-[11px] font-mono font-bold text-cyan-300 animate-pulse whitespace-nowrap">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{activePowerups.speed}s</span>
              </div>
            )}
            {activePowerups.shield > 0 && (
              <div className="flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/70 px-2 py-1 rounded-xl text-[11px] font-mono font-bold text-emerald-300 animate-pulse whitespace-nowrap">
                <Shield className="w-3 h-3 text-emerald-400" />
                <span>{activePowerups.shield}s</span>
              </div>
            )}
            {activePowerups.tripleShot > 0 && (
              <div className="flex items-center gap-1 bg-amber-950/90 border border-amber-500/70 px-2 py-1 rounded-xl text-[11px] font-mono font-bold text-amber-300 animate-pulse whitespace-nowrap">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>3X:{activePowerups.tripleShot}s</span>
              </div>
            )}
            {activePowerups.chrono > 0 && (
              <div className="flex items-center gap-1 bg-purple-950/90 border border-purple-500/70 px-2 py-1 rounded-xl text-[11px] font-mono font-bold text-purple-300 animate-pulse whitespace-nowrap">
                <Timer className="w-3 h-3 text-purple-400" />
                <span>CHRONO:{activePowerups.chrono}s</span>
              </div>
            )}
          </div>

          {/* Quick Controls & Sound Toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <button
              onClick={() => setTouchControlsEnabled(!touchControlsEnabled)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors whitespace-nowrap ${
                touchControlsEnabled
                  ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                  : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Táctil {touchControlsEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 hover:text-white transition-colors whitespace-nowrap"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ranking</span>
            </button>
            <button
              onClick={() => setCrtEffect(!crtEffect)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors whitespace-nowrap ${
                crtEffect
                  ? 'border-red-500 bg-red-950/40 text-red-400'
                  : 'border-slate-800 bg-slate-900/90 text-slate-400 hover:text-white'
              }`}
            >
              CRT {crtEffect ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white"
              title={soundEnabled ? 'Silenciar sonido' : 'Activar sonido'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-red-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* 2D HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          className="w-full h-[360px] sm:h-[480px] block cursor-crosshair bg-slate-950"
        />

        {/* START / INTRO MODAL SCREEN */}
        {gameState === 'intro' && (
          <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-center overflow-y-auto">
            <div className="max-w-xl space-y-3.5 my-auto">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-red-400 tracking-widest block">
                  Expansión 2.0 · 6 Reinos + Gran Encrucijada Final
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  NÚCLEO LEGEND: INTEL vs AMD
                </h2>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Explora <strong>6 Reinos</strong> con puentes móviles, ventilas criogénicas, Chip Chrono-Sync, Checkpoints y Mini-Jefes. Al final del Reino 5, elige tu alianza definitiva entre <strong>Intel Core Ultra</strong> o <strong>AMD Ryzen X3D</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left font-mono text-[10px]">
                <div className="p-2 rounded-xl bg-cyan-950/35 border border-cyan-500/40">
                  <div className="text-cyan-400 font-bold">⚡ Plataformas</div>
                  <p className="text-slate-300 text-[9px] mt-0.5">Puentes móviles, Jump Pads y Ventilas Cryo.</p>
                </div>
                <div className="p-2 rounded-xl bg-purple-950/35 border border-purple-500/40">
                  <div className="text-purple-400 font-bold">⏱ Chrono-Sync</div>
                  <p className="text-slate-300 text-[9px] mt-0.5">Tiempo bala 0.35x sobre virus y balas por 7s.</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-950/35 border border-amber-500/40">
                  <div className="text-amber-400 font-bold">🔥 Combo x5</div>
                  <p className="text-slate-300 text-[9px] mt-0.5">Encadena bajas y pisoteos para multiplicar pts.</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-950/35 border border-emerald-500/40">
                  <div className="text-emerald-400 font-bold">⚑ Checkpoints</div>
                  <p className="text-slate-300 text-[9px] mt-0.5">Banderas de guardado y 4 vidas máximas.</p>
                </div>
              </div>

              {/* Controls Reference */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-mono text-left">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] sm:text-[11px]">
                  <div>• Moverse: <strong className="text-white">A / D</strong> o <strong className="text-white">◄ / ►</strong></div>
                  <div>• Saltar / Doble: <strong className="text-white">Espacio</strong> o <strong className="text-white">W</strong></div>
                  <div>• Disparo: <strong className="text-white">J</strong> o <strong className="text-white">X</strong></div>
                  <div>• Dash Térmico: <strong className="text-white">K</strong> o <strong className="text-white">Shift</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    onClick={() => startGame(1)}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 whitespace-nowrap"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Campaña Completa (6 Reinos)</span>
                  </button>

                  <button
                    onClick={handleOpenCrossroadsDirect}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
                  >
                    <GitBranch className="w-4 h-4" />
                    <span>Ir a Encrucijada (Intel vs AMD)</span>
                  </button>
                </div>

                {/* Quick Realm Selector */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 mr-1">Saltar a Reino:</span>
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => startGame(lvl)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 hover:text-white transition-colors"
                    >
                      R{lvl}
                    </button>
                  ))}
                  <button
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1"
                  >
                    <Trophy className="w-3 h-3" />
                    <span>Ranking</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CHOOSING PATH MODAL: INTEL vs AMD (End of Realm 5 or Direct Entry) */}
        {gameState === 'choosing_path' && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-2xl w-full space-y-4 my-auto text-center">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/50 text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Gran Bifurcación Final · Reino 6</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                  ELIGE TU CAMINO: INTEL o AMD
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Cada facción altera el mapa del Reino 6, desbloquea habilidades únicas de combate, un Jefe exclusivo y su propia <strong>PC Suprema</strong> de recompensa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {/* INTEL PATH */}
                <button
                  onClick={() => handleChooseFaction('intel')}
                  className="group p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 border-2 border-blue-500/60 hover:border-blue-400 text-left space-y-2.5 transition-all hover:scale-[1.02] shadow-xl shadow-blue-950/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-mono font-black">
                      🔵 CAMINO 6A · INTEL
                    </span>
                    <span className="text-[10px] font-mono text-blue-300">LGA 1851 · Z890</span>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-blue-300 transition-colors">
                    Fortaleza Azul Core Ultra 9
                  </h3>
                  <ul className="text-[11px] font-mono text-slate-300 space-y-1">
                    <li>• <strong className="text-blue-300">Dash Híbrido:</strong> 50% menos enfriamiento.</li>
                    <li>• <strong className="text-blue-300">Láser Eléctrico:</strong> Proyectiles ultrarrápidos.</li>
                    <li>• <strong className="text-amber-300">Jefe:</strong> Titán Spectre-Bot X285.</li>
                    <li>• <strong className="text-emerald-300">Premio:</strong> PC Suprema Intel 285K + RTX 4090.</li>
                  </ul>
                  <div className="pt-1 flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>Elegir Alianza Azul</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* AMD PATH */}
                <button
                  onClick={() => handleChooseFaction('amd')}
                  className="group p-4 rounded-2xl bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-950 border-2 border-red-500/60 hover:border-red-400 text-left space-y-2.5 transition-all hover:scale-[1.02] shadow-xl shadow-red-950/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-mono font-black">
                      🔴 CAMINO 6B · AMD
                    </span>
                    <span className="text-[10px] font-mono text-red-300">AM5 · 3D V-Cache</span>
                  </div>
                  <h3 className="text-lg font-black text-white group-hover:text-red-300 transition-colors">
                    Templo Carmesí Ryzen X3D
                  </h3>
                  <ul className="text-[11px] font-mono text-slate-300 space-y-1">
                    <li>• <strong className="text-red-300">Impacto V-Cache:</strong> Proyectiles 2x Daño.</li>
                    <li>• <strong className="text-red-300">Crio-Súper Salto:</strong> 2x enfriamiento + +10% salto.</li>
                    <li>• <strong className="text-amber-300">Jefe:</strong> Titán Cuello de Botella V-Cache.</li>
                    <li>• <strong className="text-emerald-300">Premio:</strong> PC Suprema AMD 9800X3D + RTX 4090.</li>
                  </ul>
                  <div className="pt-1 flex items-center justify-between text-xs font-bold text-red-400">
                    <span>Elegir Legión Carmesí</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PAUSED MODAL SCREEN */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 text-center">
            <div className="max-w-xs space-y-4">
              <h3 className="text-2xl font-black text-white">JUEGO EN PAUSA</h3>
              <p className="text-xs text-slate-400">Presiona P o el botón para reanudar la partida.</p>
              <button
                onClick={() => setGameState('playing')}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Continuar
              </button>
              <button
                onClick={() => setIsLeaderboardOpen(true)}
                className="w-full py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-amber-300 font-mono text-xs font-bold flex items-center justify-center gap-2"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Tabla de Líderes</span>
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-center overflow-y-auto">
            <div className="max-w-md w-full space-y-3.5 my-auto">
              <div className="text-rose-500 font-mono text-2xl sm:text-3xl font-black">
                ⚠ THERMAL THROTTLING 100°C
              </div>
              <h3 className="text-lg font-bold text-white">Tu ensamble se ha sobrecalentado</h3>
              <p className="text-xs text-slate-400">
                Llegaste al Reino {currentLevel}/6. Usa los chips GPU Chrono-Sync y las ventilas criogénicas para sobrevivir.
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Puntuación:</span>
                  <strong className="text-amber-400 text-sm">{score.toLocaleString()}</strong>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">FPS Finales:</span>
                  <strong className="text-emerald-400 text-sm">{currentFpsDisplay}</strong>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Combo Máx:</span>
                  <strong className="text-cyan-400 text-sm">x{maxComboDisplay}</strong>
                </div>
              </div>

              {/* Leaderboard Submission Box */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-red-950/80 text-xs font-mono space-y-2 text-left">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Registrar en Tabla de Líderes</span>
                  </span>
                  {submittedRank !== null && (
                    <span className="text-emerald-400 font-bold">¡Top #{submittedRank}!</span>
                  )}
                </div>

                {!hasSubmittedScore ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tu GamerTag / Nombre"
                      value={submissionName}
                      onChange={e => setSubmissionName(e.target.value)}
                      maxLength={20}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-red-500 text-xs text-white placeholder-slate-500 outline-none font-mono"
                    />
                    <button
                      onClick={handleSubmitScore}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition-colors whitespace-nowrap"
                    >
                      Guardar Récord
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Récord registrado con éxito</span>
                    </div>
                    <button onClick={() => setIsLeaderboardOpen(true)} className="text-white underline font-bold">
                      Ver Ranking
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => startGame(currentLevel)}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Reino {currentLevel}</span>
                </button>
                <button
                  onClick={() => startGame(1)}
                  className="py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono font-semibold whitespace-nowrap"
                >
                  Reiniciar desde Reino 1
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VICTORY SCREEN */}
        {gameState === 'victory' && (
          <div className={`absolute inset-0 z-30 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 text-center overflow-y-auto ${
            chosenFaction === 'intel'
              ? 'bg-gradient-to-b from-slate-950/95 via-blue-950/85 to-slate-950/95'
              : 'bg-gradient-to-b from-slate-950/95 via-red-950/85 to-slate-950/95'
          }`}>
            <div className="max-w-md w-full space-y-3.5 my-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy className="w-7 h-7" />
              </div>

              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold tracking-widest border ${
                  chosenFaction === 'intel'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                    : 'bg-red-500/20 text-red-300 border-red-400/40'
                }`}>
                  {chosenFaction === 'intel' ? '🔵 VICTORIA ALIANZA INTEL AZUL' : '🔴 VICTORIA LEGIÓN AMD CARMESÍ'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
                  {defeatedSecretBoss
                    ? '👑 ¡TITÁN ZERO-DAY ANIQUILADO! 👑'
                    : chosenFaction === 'intel'
                    ? '¡PC SUPREMA INTEL FORJADA!'
                    : '¡PC SUPREMA AMD X3D FORJADA!'}
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {defeatedSecretBoss
                    ? '¡Has derrotado al Jefe Secreto Titán Virus Zero-Day Prime (+21,000 pts) y coronado tu facción!'
                    : chosenFaction === 'intel'
                    ? 'La Fortaleza Azul LGA 1851 ha sido liberada con el poder de Core Ultra 9 285K.'
                    : 'El Templo Carmesí AM5 domina el silicio gracias a la potencia de Ryzen 7 9800X3D.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">FPS:</span>
                  <strong className="text-emerald-400 text-sm">999+ FPS</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Puntos:</span>
                  <strong className="text-amber-400 text-sm">{score.toLocaleString()}</strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Combo Máx:</span>
                  <strong className="text-cyan-400 text-sm">x{maxComboDisplay}</strong>
                </div>
              </div>

              {/* Leaderboard Submission Box */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/40 text-xs font-mono space-y-2 text-left">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Inscribir en el Salón de la Fama</span>
                  </span>
                  {submittedRank !== null && (
                    <span className="text-amber-400 font-bold">¡Top #{submittedRank}!</span>
                  )}
                </div>

                {!hasSubmittedScore ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tu GamerTag / Nombre"
                      value={submissionName}
                      onChange={e => setSubmissionName(e.target.value)}
                      maxLength={20}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder-slate-500 outline-none font-mono"
                    />
                    <button
                      onClick={handleSubmitScore}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shrink-0 whitespace-nowrap"
                    >
                      Inscribir Récord
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>¡Victoria registrada en el Top #{submittedRank}!</span>
                    </div>
                    <button onClick={() => setIsLeaderboardOpen(true)} className="text-white underline font-bold">
                      Ver Ranking
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-1">
                {onGoToBuilderWithSupremePC && (
                  <button
                    onClick={handleApplySupremeBuild}
                    className={`w-full py-2.5 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg whitespace-nowrap ${
                      chosenFaction === 'intel'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-600/30'
                        : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/30'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    <span>
                      Cargar PC Suprema {chosenFaction === 'intel' ? 'INTEL' : 'AMD'} en Constructor & Visor 3D
                    </span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleChooseFaction(chosenFaction === 'intel' ? 'amd' : 'intel')}
                    className="py-2 px-3 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/50 text-purple-200 text-xs font-mono font-bold whitespace-nowrap"
                  >
                    {chosenFaction === 'intel' ? '🔴 Jugar Camino AMD' : '🔵 Jugar Camino Intel'}
                  </button>
                  <button
                    onClick={() => startGame(1)}
                    className="py-2 px-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold whitespace-nowrap"
                  >
                    Nueva Campaña
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Modal */}
      <NucleoLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => {
          setIsLeaderboardOpen(false);
          refreshTopScores();
        }}
        highlightId={lastSubmittedId}
        onPlayAgain={() => startGame(1)}
      />

      {/* On-Screen Virtual Controls for Tablet & Mobile */}
      {touchControlsEnabled && (
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/90 border border-red-950/60 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2 font-mono font-bold text-slate-300">
              <Gamepad2 className="w-4 h-4 text-red-400" />
              <span>Controles Táctiles ({touchControlSize === 'tablet' ? 'Modo Tablet Grande' : 'Modo Celular'})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTouchControlSize(prev => (prev === 'tablet' ? 'phone' : 'tablet'))}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                {touchControlSize === 'tablet' ? (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pasar a Móvil</span>
                  </>
                ) : (
                  <>
                    <Tablet className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Pasar a Tablet</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setTouchControlsEnabled(false)}
                className="px-2 py-1 rounded-lg text-[11px] font-mono text-slate-400 hover:text-white"
              >
                ✕ Ocultar
              </button>
            </div>
          </div>

          {touchControlSize === 'tablet' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none touch-none">
              <div className="flex items-center justify-around bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyA'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyA'] = false; }}
                  onTouchCancel={() => { keysRef.current['KeyA'] = false; }}
                  onMouseDown={() => { keysRef.current['KeyA'] = true; }}
                  onMouseUp={() => { keysRef.current['KeyA'] = false; }}
                  onMouseLeave={() => { keysRef.current['KeyA'] = false; }}
                  className="w-16 h-16 rounded-2xl bg-slate-800 active:bg-red-600 active:scale-95 text-white font-black flex flex-col items-center justify-center text-lg shadow-lg border border-slate-700 transition-transform"
                >
                  <span>◀</span>
                  <span className="text-[9px] font-mono font-normal text-slate-300">Izq</span>
                </button>

                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['Space'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current['Space'] = false; }}
                  onTouchCancel={() => { keysRef.current['Space'] = false; }}
                  onMouseDown={() => { keysRef.current['Space'] = true; }}
                  onMouseUp={() => { keysRef.current['Space'] = false; }}
                  className="w-16 h-16 rounded-2xl bg-slate-800 active:bg-cyan-600 active:scale-95 text-white font-black flex flex-col items-center justify-center text-lg shadow-lg border border-slate-700 transition-transform"
                >
                  <span>▲</span>
                  <span className="text-[9px] font-mono font-normal text-slate-300">Salto</span>
                </button>

                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyD'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyD'] = false; }}
                  onTouchCancel={() => { keysRef.current['KeyD'] = false; }}
                  onMouseDown={() => { keysRef.current['KeyD'] = true; }}
                  onMouseUp={() => { keysRef.current['KeyD'] = false; }}
                  onMouseLeave={() => { keysRef.current['KeyD'] = false; }}
                  className="w-16 h-16 rounded-2xl bg-slate-800 active:bg-red-600 active:scale-95 text-white font-black flex flex-col items-center justify-center text-lg shadow-lg border border-slate-700 transition-transform"
                >
                  <span>▶</span>
                  <span className="text-[9px] font-mono font-normal text-slate-300">Der</span>
                </button>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyJ'] = true; }}
                  onMouseDown={() => { keysRef.current['KeyJ'] = true; }}
                  className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center shadow-lg shadow-red-600/30 transition-transform"
                >
                  <span className="text-base">💥</span>
                  <span>DISPARAR (J)</span>
                </button>

                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyK'] = true; }}
                  onMouseDown={() => { keysRef.current['KeyK'] = true; }}
                  className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center shadow-lg shadow-cyan-600/30 transition-transform"
                >
                  <span className="text-base">⚡</span>
                  <span>DASH TURBO (K)</span>
                </button>

                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['Space'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current['Space'] = false; }}
                  onMouseDown={() => { keysRef.current['Space'] = true; }}
                  onMouseUp={() => { keysRef.current['Space'] = false; }}
                  className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 active:scale-95 text-white font-bold text-xs flex flex-col items-center justify-center shadow-lg shadow-emerald-600/30 transition-transform"
                >
                  <span className="text-base">🚀</span>
                  <span>DOBLE SALTO</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 select-none touch-none">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/70 p-2 sm:p-3 rounded-2xl border border-slate-800 justify-center">
                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyA'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyA'] = false; }}
                  onTouchCancel={() => { keysRef.current['KeyA'] = false; }}
                  onMouseDown={() => { keysRef.current['KeyA'] = true; }}
                  onMouseUp={() => { keysRef.current['KeyA'] = false; }}
                  onMouseLeave={() => { keysRef.current['KeyA'] = false; }}
                  className="w-12 h-12 rounded-xl bg-slate-800 active:bg-red-600 active:scale-95 text-white font-bold flex items-center justify-center text-sm shadow-md"
                >
                  ◀
                </button>
                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['Space'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current['Space'] = false; }}
                  onTouchCancel={() => { keysRef.current['Space'] = false; }}
                  onMouseDown={() => { keysRef.current['Space'] = true; }}
                  onMouseUp={() => { keysRef.current['Space'] = false; }}
                  className="w-12 h-12 rounded-xl bg-slate-800 active:bg-cyan-600 active:scale-95 text-white font-bold flex items-center justify-center text-sm shadow-md"
                >
                  ▲
                </button>
                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyD'] = true; }}
                  onTouchEnd={(e) => { e.preventDefault(); keysRef.current['KeyD'] = false; }}
                  onTouchCancel={() => { keysRef.current['KeyD'] = false; }}
                  onMouseDown={() => { keysRef.current['KeyD'] = true; }}
                  onMouseUp={() => { keysRef.current['KeyD'] = false; }}
                  onMouseLeave={() => { keysRef.current['KeyD'] = false; }}
                  className="w-12 h-12 rounded-xl bg-slate-800 active:bg-red-600 active:scale-95 text-white font-bold flex items-center justify-center text-sm shadow-md"
                >
                  ▶
                </button>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/70 p-2 sm:p-3 rounded-2xl border border-slate-800 justify-center">
                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyJ'] = true; }}
                  onMouseDown={() => { keysRef.current['KeyJ'] = true; }}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 active:scale-95 text-white font-bold text-xs shadow-md"
                >
                  💥 Disparo
                </button>
                <button
                  onTouchStart={(e) => { e.preventDefault(); keysRef.current['KeyK'] = true; }}
                  onMouseDown={() => { keysRef.current['KeyK'] = true; }}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 active:scale-95 text-white font-bold text-xs shadow-md"
                >
                  ⚡ Dash
                </button>
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-400 font-mono text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3 text-red-400" />
            <span>Mantén pulsado ◀ o ▶ para correr, ▲ para saltar (o doble salto), y 💥 para disparar al Titán.</span>
          </div>
        </div>
      )}

      {/* Top 5 Hall of Fame Arcade Preview */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950 border border-red-950/70 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                  Salón de la Fama · Top 5 Global
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold whitespace-nowrap">
                  Local Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Puntuaciones y récords de FPS guardados en tu navegador.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 transition-all shadow-md group whitespace-nowrap"
          >
            <Medal className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>Ver Tabla Completa</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="space-y-2">
          {topScoresPreview.map((entry, index) => {
            const isGold = index === 0;
            const isSilver = index === 1;
            const isBronze = index === 2;
            const isCurrentRun = entry.id === lastSubmittedId;

            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                  isCurrentRun
                    ? 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-900/20'
                    : isGold
                    ? 'bg-amber-950/20 border-amber-500/30'
                    : isSilver
                    ? 'bg-slate-800/40 border-slate-600/40'
                    : isBronze
                    ? 'bg-amber-950/10 border-amber-800/30'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isGold
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : isSilver
                        ? 'bg-slate-300/20 text-slate-200 border border-slate-400/30'
                        : isBronze
                        ? 'bg-amber-700/20 text-amber-400 border border-amber-700/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isGold ? '🥇' : isSilver ? '🥈' : isBronze ? '🥉' : `#${index + 1}`}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs sm:text-sm text-white truncate">
                        {entry.playerName}
                      </span>
                      {entry.victory && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
                          👑 Victoria
                        </span>
                      )}
                      {isCurrentRun && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-500/20 text-red-300 border border-red-500/40 font-semibold shrink-0">
                          Tu récord
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span className="text-amber-400/90">{entry.rankTitle}</span>
                      <span>•</span>
                      <span>Reino {entry.levelReached}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-right">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Rendimiento</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {entry.fpsAchieved} FPS
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Puntos</span>
                    <span className="text-xs sm:text-sm font-mono font-black text-amber-400 tracking-tight">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded 6-Realm Lore & Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-red-400">Reino 1</span>
          <h4 className="text-xs font-bold text-white">Valle de Silicio</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Rescata el Chip Maestro y la Placa Doble Salto. Aprovecha los Jump Pads y los puentes de datos.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Reino 2</span>
          <h4 className="text-xs font-bold text-white">Cañón Térmico de Cobre</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pasa por las Ventilas Cryo para enfriar tu CPU y consigue la Líquida 420mm y Fuente Titanium.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-rose-400">Reino 3</span>
          <h4 className="text-xs font-bold text-white">Ciudadela Ray Tracing</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Encuentra la RTX 5090 32GB y el primer Chip Chrono-Sync para ralentizar la lluvia de glitches.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-emerald-400">Reino 4</span>
          <h4 className="text-xs font-bold text-white">Autopista PCIe 5.0 & RAM</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Cruza carriles móviles de Gen 5 y derrota al Mini-Jefe Guardián Cache-Miss.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">Reino 5</span>
          <h4 className="text-xs font-bold text-white">Núcleo Cuántico LN2</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Vence al Centinela Crio-Zero y entra al Portal de la Bifurcación para escoger tu facción.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-red-950/60 border border-purple-500/40 space-y-1.5">
          <span className="text-[10px] font-mono uppercase font-bold text-purple-300">Reino 6A / 6B · Decisión Final</span>
          <h4 className="text-xs font-bold text-white">🔵 Alianza Intel vs 🔴 Legión AMD</h4>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Elige entre <strong>Core Ultra 9 285K</strong> (Dash rápido) o <strong>Ryzen 7 9800X3D</strong> (Daño 2x) para desbloquear su PC Suprema y medalla exclusiva.
          </p>
        </div>
      </div>
    </div>
  );
};
