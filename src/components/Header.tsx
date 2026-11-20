import { Cpu, Sun, Moon, Hammer, Newspaper, Sparkles, SlidersHorizontal, Flame, User, Gamepad2, Smartphone, Leaf, Calendar, LayoutGrid } from 'lucide-react';
import { UserProfile, UserBuild } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { AVATAR_PRESETS } from '../utils/avatarUtils';
import { getISOWeekNumber } from '../utils/weeklyUpdateUtils';
import { ALL_MEDALS_CATALOG, evaluateUserMedals, calculateUserLevel } from '../utils/medalsUtils';

interface HeaderProps {
  currentTab: 'news' | 'builder' | 'radar' | 'game';
  setCurrentTab: (tab: 'news' | 'builder' | 'radar' | 'game') => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenComparator: () => void;
  onOpenProfile: () => void;
  onOpenWeeklyHub?: () => void;
  onToggleWidgets?: () => void;
  isWidgetsOpen?: boolean;
  userProfile?: UserProfile;
  savedBuilds?: UserBuild[];
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  toggleTheme,
  onOpenComparator,
  onOpenProfile,
  onOpenWeeklyHub,
  onToggleWidgets,
  isWidgetsOpen,
  userProfile,
  savedBuilds = []
}) => {
  const currentWeek = getISOWeekNumber().weekNumber;
  const activePreset = AVATAR_PRESETS.find(p => p.id === userProfile?.avatarPresetId);
  const equippedMedal = ALL_MEDALS_CATALOG.find(m => m.id === userProfile?.equippedMedalId);

  let topGameScore = 0;
  let checklistCount = 0;
  try {
    const rawLeaderboard = localStorage.getItem('nucleo_legend_leaderboard');
    if (rawLeaderboard) {
      const parsed = JSON.parse(rawLeaderboard);
      if (Array.isArray(parsed) && parsed.length > 0) {
        topGameScore = Math.max(...parsed.map((p: any) => p.score || 0));
      }
    }
    const rawChecklist = localStorage.getItem('nucleo_checklist_steps');
    if (rawChecklist) checklistCount = JSON.parse(rawChecklist).length;
  } catch {}

  const evaluatedMedals = userProfile
    ? evaluateUserMedals(userProfile, savedBuilds, topGameScore)
    : [];
  const levelInfo = calculateUserLevel(evaluatedMedals, savedBuilds.length, checklistCount, topGameScore);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/90 dark:bg-slate-950/90 bg-white/95 border-b border-red-950/40 dark:border-red-950/40 border-slate-200 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand wordmark in crimson red */}
          <button
            onClick={() => setCurrentTab('news')}
            className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform border border-red-500/30 shrink-0 bg-red-600">
              <img
                src="/assets/aistudio/image_08c4c239.png"
                alt="Logo Núcleo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
                NÚCLEO
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </div>
          </button>

          {/* Zone 2: Concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('news')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'news'
                  ? 'text-red-500 dark:text-red-400 font-bold border-b-2 border-red-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Noticias & Hardware
            </button>
            <button
              onClick={() => setCurrentTab('builder')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-2 ${
                currentTab === 'builder'
                  ? 'text-red-500 dark:text-red-400 font-bold border-b-2 border-red-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Armar tu PC</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 font-semibold">
                Precios Aprox.
              </span>
            </button>
            <button
              onClick={() => setCurrentTab('radar')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === 'radar'
                  ? 'text-red-500 dark:text-red-400 font-bold border-b-2 border-red-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Radar de Lanzamientos
            </button>
            <button
              onClick={() => setCurrentTab('game')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
                currentTab === 'game'
                  ? 'text-red-500 dark:text-red-400 font-bold border-b-2 border-red-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Núcleo Legend</span>
              <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold animate-pulse">
                Juego 2D
              </span>
            </button>
            <button
              onClick={onOpenComparator}
              className="whitespace-nowrap shrink-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-1 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-red-400" />
              <span>Comparador</span>
            </button>
          </nav>

          {/* Zone 3: Profile, CTA and theme toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema claro u oscuro"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Low Power Mode active indicator pill */}
            {userProfile?.lowPowerMode && (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1 py-1 px-2 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 text-[10px] font-mono font-bold transition-all"
                title="Modo de bajo consumo activo - Clic para ver preferencias"
              >
                <Leaf className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Eco</span>
              </button>
            )}

            {/* PWA / Android Play Store Install Trigger */}
            <PWAInstallButton variant="header" />

            {/* Weekly Hub Trigger with current cycle badge */}
            {onOpenWeeklyHub && (
              <button
                onClick={onOpenWeeklyHub}
                className="flex items-center gap-1.5 py-1 px-2 sm:px-2.5 rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/25 hover:bg-amber-100 dark:hover:bg-amber-950/45 text-amber-700 dark:text-amber-300 text-xs font-bold transition-all shadow-xs"
                title="Hub Semanal: Ofertas, Build curada y Calculadora de consumo"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">Semana {currentWeek}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400 animate-pulse" />
              </button>
            )}

            {/* Silicon Widgets Hub Trigger */}
            {onToggleWidgets && (
              <button
                onClick={onToggleWidgets}
                className={`flex items-center gap-1.5 py-1 px-2 sm:px-2.5 rounded-lg border transition-all text-xs font-bold shadow-xs ${
                  isWidgetsOpen
                    ? 'border-cyan-500 dark:border-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-200 ring-1 ring-cyan-400/40'
                    : 'border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/25 hover:bg-cyan-100 dark:hover:bg-cyan-950/45 text-cyan-700 dark:text-cyan-300'
                }`}
                title="Abrir o Minimizar Monitor de Widgets de Silicio"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span className="hidden sm:inline">Widgets</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
              </button>
            )}

            {/* Profile Avatar / Enthusiast Hub Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-slate-900 dark:text-slate-200 transition-colors focus:outline-none group"
              title="Abrir Perfil de Usuario & Favoritos"
            >
              <div className="relative">
                <div className={`w-6 h-6 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-red-400/50 shadow-xs ${activePreset ? `bg-gradient-to-br ${activePreset.gradient}` : 'bg-red-600'}`}>
                  {userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.gamerTag || 'Perfil'}
                      className="w-full h-full object-cover"
                    />
                  ) : activePreset ? (
                    <span className="text-[11px] leading-none select-none">{activePreset.icon}</span>
                  ) : (
                    <img
                      src="/assets/aistudio/image_08c4c239.png"
                      alt="Perfil"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                {userProfile?.preferredHardwareBrand && userProfile.preferredHardwareBrand !== 'all' && (
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                      userProfile.preferredHardwareBrand === 'amd'
                        ? 'bg-red-500'
                        : userProfile.preferredHardwareBrand === 'intel'
                        ? 'bg-blue-500'
                        : 'bg-emerald-500'
                    }`}
                    title={`Bando: ${userProfile.preferredHardwareBrand.toUpperCase()}`}
                  />
                )}
              </div>
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[110px] truncate flex items-center gap-1">
                  {equippedMedal && (
                    <span className="text-xs shrink-0 select-none" title={`Medalla equipada: ${equippedMedal.title}`}>
                      {equippedMedal.icon}
                    </span>
                  )}
                  <span className="truncate">{userProfile?.gamerTag || 'Perfil'}</span>
                </span>
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 shrink-0"
                  title={`Nivel ${levelInfo.level} · ${levelInfo.rankTitle} (${levelInfo.totalXp} XP)`}
                >
                  Nv.{levelInfo.level}
                </span>
              </div>
            </button>

            <button
              onClick={() => setCurrentTab('builder')}
              className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-lg shadow-md shadow-red-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 active:scale-98"
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>Configurar PC</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile nav bar strip */}
      <div className="flex md:hidden border-t border-red-950/30 dark:border-red-950/30 border-slate-200 px-3 py-2 justify-around bg-slate-950/80 dark:bg-slate-950/80 bg-slate-50 text-xs">
        <button
          onClick={() => setCurrentTab('news')}
          className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'news' ? 'text-red-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Newspaper className="w-3.5 h-3.5" />
          Noticias
        </button>
        <button
          onClick={() => setCurrentTab('builder')}
          className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'builder' ? 'text-red-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          Armar PC
        </button>
        <button
          onClick={() => setCurrentTab('radar')}
          className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'radar' ? 'text-red-500 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Radar
        </button>
        <button
          onClick={() => setCurrentTab('game')}
          className={`flex items-center gap-1 py-1 px-2 rounded font-medium ${
            currentTab === 'game' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
          Legend
        </button>
        <button
          onClick={onOpenProfile}
          className="flex items-center gap-1 py-1 px-2 rounded text-slate-400 font-medium hover:text-white"
        >
          <User className="w-3.5 h-3.5 text-red-400" />
          Perfil
        </button>
        <button
          onClick={onOpenComparator}
          className="flex items-center gap-1 py-1 px-2 rounded text-slate-400 font-medium"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Comparar
        </button>
        <PWAInstallButton variant="mobile" />
      </div>
    </header>
  );
};
