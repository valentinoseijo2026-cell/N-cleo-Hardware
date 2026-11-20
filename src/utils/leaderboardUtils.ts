import { LeaderboardEntry } from '../types';

export const LEADERBOARD_STORAGE_KEY = 'nucleo_legend_leaderboard';

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    playerName: 'LinusOverclocker_X',
    score: 13500,
    fpsAchieved: 480,
    levelReached: 4,
    componentsRescued: 7,
    date: '05 nov 2026',
    victory: true,
    rankTitle: 'Overclocker Supremo 👑'
  },
  {
    id: 'lead-2',
    playerName: 'SiliconGod_9950X',
    score: 11200,
    fpsAchieved: 410,
    levelReached: 4,
    componentsRescued: 7,
    date: '06 nov 2026',
    victory: true,
    rankTitle: 'Maestro del Silicio ⚡'
  },
  {
    id: 'lead-3',
    playerName: 'RTX_5090_Apex',
    score: 9400,
    fpsAchieved: 320,
    levelReached: 4,
    componentsRescued: 6,
    date: '06 nov 2026',
    victory: true,
    rankTitle: 'Cazador de Ray Tracing 💎'
  },
  {
    id: 'lead-4',
    playerName: 'SubZero_Liquid',
    score: 7850,
    fpsAchieved: 240,
    levelReached: 3,
    componentsRescued: 5,
    date: '07 nov 2026',
    victory: false,
    rankTitle: 'Especialista Criogénico ❄️'
  },
  {
    id: 'lead-5',
    playerName: 'VRAM_GlitchHunter',
    score: 6200,
    fpsAchieved: 190,
    levelReached: 3,
    componentsRescued: 4,
    date: '07 nov 2026',
    victory: false,
    rankTitle: 'Depurador de Glitches 🛠️'
  },
  {
    id: 'lead-6',
    playerName: 'Titanium_Watt',
    score: 4500,
    fpsAchieved: 144,
    levelReached: 2,
    componentsRescued: 3,
    date: '07 nov 2026',
    victory: false,
    rankTitle: 'Ensamblador Estable 🛡️'
  },
  {
    id: 'lead-7',
    playerName: 'NoobThermalPaste',
    score: 2800,
    fpsAchieved: 90,
    levelReached: 1,
    componentsRescued: 2,
    date: '07 nov 2026',
    victory: false,
    rankTitle: 'Iniciado del Silicio ⚙️'
  }
];

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_LEADERBOARD;
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
      return DEFAULT_LEADERBOARD;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.fpsAchieved - a.fpsAchieved;
      });
    }
    return DEFAULT_LEADERBOARD;
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

export function saveLeaderboardEntry(entry: Omit<LeaderboardEntry, 'id' | 'date'>): { entry: LeaderboardEntry; rank: number } {
  const current = getLeaderboard();
  const dateFormatted = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  const newEntry: LeaderboardEntry = {
    ...entry,
    id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: dateFormatted
  };

  const updated = [...current, newEntry].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.fpsAchieved - a.fpsAchieved;
  }).slice(0, 50); // Keep top 50 records

  const rank = updated.findIndex(e => e.id === newEntry.id) + 1;

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return { entry: newEntry, rank };
}

export function resetLeaderboardToDefaults(): LeaderboardEntry[] {
  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(DEFAULT_LEADERBOARD));
  } catch {}
  return DEFAULT_LEADERBOARD;
}

export function clearLeaderboard(): LeaderboardEntry[] {
  try {
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  } catch {}
  return [];
}

export function getRankTitle(
  score: number,
  victory: boolean,
  defeatedSecretBoss?: boolean,
  chosenPath?: 'intel' | 'amd' | null
): string {
  if (defeatedSecretBoss) {
    if (chosenPath === 'intel') return 'Destructor Zero-Day Azul 🔵👑';
    if (chosenPath === 'amd') return 'Destructor Zero-Day Carmesí 🔴👑';
    return 'Destructor de Zero-Day 👑👾';
  }
  if (victory && chosenPath === 'intel') return 'Arquitecto Azul Intel 🔵⚡';
  if (victory && chosenPath === 'amd') return 'Soberano Zen 5 AMD 🔴🔥';
  if (victory && score >= 21000) return 'Leyenda Zero-Day 🌟';
  if (victory && score >= 12000) return 'Overclocker Supremo 👑';
  if (victory) return 'Maestro de la PC Suprema ⚡';
  if (score >= 8000) return 'Cazador de Ray Tracing 💎';
  if (score >= 5000) return 'Especialista Criogénico ❄️';
  if (score >= 3000) return 'Ensamblador de Titanio 🛡️';
  return 'Iniciado del Silicio ⚙️';
}
