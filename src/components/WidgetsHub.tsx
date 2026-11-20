import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  X,
  Minimize2,
  Maximize2,
  Cpu,
  Zap,
  Activity,
  Award,
  Flame,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Leaf,
  ChevronRight,
  TrendingDown,
  Gamepad2,
  Sparkles,
  Sliders,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import {
  UserProfile,
  ComponentCategory,
  PCComponent,
  UserBuild
} from '../types';
import {
  ALL_MEDALS_CATALOG,
  evaluateUserMedals,
  calculateUserLevel,
  playMechanicalClickSound,
  getDailyDropStatus
} from '../utils/medalsUtils';
import { AVATAR_PRESETS } from '../utils/avatarUtils';
import { getWeeklyMarketReport } from '../utils/weeklyUpdateUtils';

interface WidgetsHubProps {
  isOpen: boolean;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentBuild: Partial<Record<ComponentCategory, PCComponent>>;
  savedBuilds: UserBuild[];
  onNavigateTab: (tab: 'news' | 'builder' | 'radar' | 'game') => void;
  onOpenProfile: () => void;
  onOpenCodes: () => void;
  onOpenWeeklyHub?: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

export const WidgetsHub: React.FC<WidgetsHubProps> = ({
  isOpen,
  onClose,
  isMinimized,
  onToggleMinimize,
  userProfile,
  setUserProfile,
  currentBuild,
  savedBuilds,
  onNavigateTab,
  onOpenProfile,
  onOpenCodes,
  onOpenWeeklyHub,
  isDark,
  toggleTheme
}) => {
  const [activeWidgetTab, setActiveWidgetTab] = useState<'all' | 'telemetry' | 'gamer' | 'deals' | 'controls'>('all');

  // Calculate current build power
  const currentTdpWatts = Object.values(currentBuild).reduce(
    (acc, comp) => acc + (comp?.tdpWatts || 0),
    0
  );
  const psuWattage = Object.values(currentBuild).find(c => c?.category === 'psu')?.tdpWatts || 850;
  const powerUsagePercent = Math.min(100, Math.round((currentTdpWatts / psuWattage) * 100));

  // Leaderboard record
  let topGameScore = 0;
  let hasZeroDayDefeated = false;
  try {
    const rawLb = localStorage.getItem('nucleo_legend_leaderboard');
    if (rawLb) {
      const parsed = JSON.parse(rawLb);
      if (Array.isArray(parsed) && parsed.length > 0) {
        topGameScore = Math.max(...parsed.map((p: any) => p.score || 0));
        hasZeroDayDefeated = parsed.some((e: any) => e.defeatedSecretBoss || (e.score || 0) >= 21000);
      }
    }
  } catch {}

  let checklistCount = 0;
  try {
    const rawCl = localStorage.getItem('nucleo_checklist_steps');
    if (rawCl) checklistCount = JSON.parse(rawCl).length;
  } catch {}

  const evaluatedMedals = evaluateUserMedals(userProfile, savedBuilds, topGameScore);
  const levelInfo = calculateUserLevel(evaluatedMedals, savedBuilds.length, checklistCount, topGameScore);
  const equippedMedal = ALL_MEDALS_CATALOG.find(m => m.id === userProfile.equippedMedalId);
  const activePreset = AVATAR_PRESETS.find(p => p.id === userProfile.avatarPresetId);
  const weeklyReport = getWeeklyMarketReport();
  const bestDeal = weeklyReport.deals[0];
  const dailyDrop = getDailyDropStatus();

  if (!isOpen) return null;

  // Render Compact Minimized Dock Pill
  if (isMinimized) {
    return (
      <aside aria-label="Barra compacta de widgets" className="fixed bottom-6 left-6 z-40 animate-fadeIn">
        <button
          onClick={onToggleMinimize}
          className="group flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 text-slate-100 shadow-xl shadow-cyan-500/10 hover:border-cyan-400 hover:scale-102 transition-all cursor-pointer"
          title="Abrir Monitor de Widgets de Silicio"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30 group-hover:rotate-12 transition-transform">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {currentTdpWatts > 0 ? `${currentTdpWatts}W` : '460W'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">Nv.{levelInfo.level}</span>
              {equippedMedal && (
                <>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs">{equippedMedal.icon}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-800 text-[10px] font-mono text-cyan-300">
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Widgets</span>
          </div>
        </button>
      </aside>
    );
  }

  // Render Full Expanded Widgets Hub Overlay
  return (
    <aside aria-label="Centro de widgets de hardware y telemetría" className="fixed bottom-6 left-6 z-40 max-w-sm sm:max-w-md w-full animate-fadeIn">
      <div className="rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col max-h-[82vh] transition-all">
        {/* Hub Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border-b border-cyan-500/20 flex items-center justify-between text-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shadow-sm shadow-cyan-500/20">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-black font-mono tracking-tight text-white flex items-center gap-1.5">
                  <span>WIDGETS NÚCLEO</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  En Vivo
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Telemetría de ensamble y estado de silicio</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMinimize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Minimizar a pastilla compacta"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Cerrar widgets"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-mono overflow-x-auto">
          {[
            { id: 'all', label: 'Todo' },
            { id: 'telemetry', label: 'Hardware' },
            { id: 'gamer', label: 'Perfil' },
            { id: 'deals', label: 'Oferta' },
            { id: 'controls', label: 'Control' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveWidgetTab(tab.id as any);
                playMechanicalClickSound();
              }}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                activeWidgetTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Widgets Grid */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto max-h-[60vh] text-slate-100">
          {/* WIDGET 1: LIVE HARDWARE & POWER TELEMETRY */}
          {(activeWidgetTab === 'all' || activeWidgetTab === 'telemetry') && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow-sm space-y-2.5 relative group hover:border-cyan-500/40 transition-all">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telemetría de Ensamble</span>
                </span>
                <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                  {currentBuild.gpu?.name ? 'Ensamble Activo' : 'Preset Sugerido'}
                </span>
              </div>

              {/* CPU & GPU Specs summary */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 block">CPU</span>
                  <strong className="text-white truncate block text-[11px]">
                    {currentBuild.cpu?.name || 'Ryzen 7 7800X3D'}
                  </strong>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                    ~{currentBuild.cpu?.tdpWatts || 120}W TDP
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span className="text-[9px] text-slate-500 block">GPU</span>
                  <strong className="text-white truncate block text-[11px]">
                    {currentBuild.gpu?.name || 'RTX 4070 Super'}
                  </strong>
                  <span className="text-[10px] text-cyan-400 font-semibold block mt-0.5">
                    ~{currentBuild.gpu?.tdpWatts || 220}W TDP
                  </span>
                </div>
              </div>

              {/* Power Draw Bar */}
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Consumo Estimado:</span>
                  <span className="text-amber-300 font-bold">
                    {currentTdpWatts > 0 ? currentTdpWatts : 460}W / {psuWattage}W PSU ({powerUsagePercent || 54}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${powerUsagePercent || 54}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-slate-500">
                  <span>Carga Reposo ~38°C</span>
                  <span>Flujo Balanceado ~1200 RPM</span>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('builder')}
                className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 hover:text-cyan-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Configurar en el Taller</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* WIDGET 2: GAMER PROFILE & ACTIVE MEDAL SHOWCASE */}
          {(activeWidgetTab === 'all' || activeWidgetTab === 'gamer') && (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/30 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border border-amber-500/40 overflow-hidden shrink-0 ${activePreset ? `bg-gradient-to-br ${activePreset.gradient}` : 'bg-amber-500/20 text-amber-400'}`}>
                    {userProfile.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-lg" />
                    ) : activePreset ? (
                      <span className="text-base leading-none">{activePreset.icon}</span>
                    ) : (
                      '⚡'
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <span>{userProfile.gamerTag}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Nv.{levelInfo.level}
                      </span>
                    </h5>
                    <p className="text-[10px] text-slate-400 font-mono">{levelInfo.rankTitle}</p>
                  </div>
                </div>

                {equippedMedal && (
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40" title={`Medalla activa: ${equippedMedal.title}`}>
                    <span className="text-lg">{equippedMedal.icon}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-300 max-w-[80px] truncate">{equippedMedal.title}</span>
                  </div>
                )}
              </div>

              {/* XP Progress Bar */}
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Progreso a Nivel {levelInfo.level + 1}:</span>
                  <span className="text-amber-400 font-bold">{levelInfo.currentLevelXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, levelInfo.progressPercent)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenProfile}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors text-center cursor-pointer"
                >
                  Ver Perfil
                </button>
                <button
                  onClick={onOpenCodes}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Canjear códigos secretos y medallas"
                >
                  <span>Códigos</span>
                  {dailyDrop.canClaim ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="¡Caja diaria de XP disponible!" />
                  ) : null}
                </button>
              </div>
            </div>
          )}

          {/* WIDGET 3: WEEKLY FLASH DEAL RADAR */}
          {(activeWidgetTab === 'all' || activeWidgetTab === 'deals') && (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-950 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Oferta Flash de la Semana</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold font-mono">
                  -{bestDeal?.discountPercent || 22}% OFF
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <strong className="text-xs text-white block truncate font-mono">
                    {bestDeal?.name || 'Kingston Fury Beast 32GB DDR5-6000'}
                  </strong>
                  <span className="text-[10px] text-slate-400 block">{bestDeal?.specs || '2x16GB CL30 Expo/XMP'}</span>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-[10px] text-slate-500 line-through block">${bestDeal?.originalPriceUSD || 119}</span>
                  <span className="text-xs font-bold text-emerald-400">${bestDeal?.dealPriceUSD || 92} USD</span>
                </div>
              </div>

              {onOpenWeeklyHub && (
                <button
                  onClick={onOpenWeeklyHub}
                  className="w-full py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Ver Ofertas Completas</span>
                  <Clock className="w-3 h-3 text-emerald-400" />
                </button>
              )}
            </div>
          )}

          {/* WIDGET 4: NÚCLEO LEGEND ARCADE LAUNCHER */}
          {(activeWidgetTab === 'all' || activeWidgetTab === 'gamer') && (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-red-950/30 via-slate-900 to-slate-950 border border-red-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Núcleo Legend Arcade</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold font-mono border border-amber-500/30">
                  Récord: {topGameScore > 0 ? `${topGameScore} pts` : 'Iniciado'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Campaña 6 Reinos:</span>
                <span className={`font-bold flex items-center gap-1 ${hasZeroDayDefeated ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {hasZeroDayDefeated ? '👑 Zero-Day Erradicado' : '⚔️ Reinos + Ruta Intel/AMD'}
                </span>
              </div>

              <button
                onClick={() => onNavigateTab('game')}
                className="w-full py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-red-600/30 active:scale-95"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Lanzar Partida 2D</span>
              </button>
            </div>
          )}

          {/* WIDGET 5: QUICK CONTROL CENTER */}
          {(activeWidgetTab === 'all' || activeWidgetTab === 'controls') && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-mono font-bold block">Controles Rápidos del Sistema:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setUserProfile(prev => ({ ...prev, lowPowerMode: !prev.lowPowerMode }));
                    playMechanicalClickSound();
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    userProfile.lowPowerMode
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title="Activar / Desactivar modo de bajo consumo"
                >
                  <Leaf className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-[10px] font-mono font-bold block">{userProfile.lowPowerMode ? 'Eco ON' : 'Eco OFF'}</span>
                </button>

                <button
                  onClick={() => {
                    setUserProfile(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
                    playMechanicalClickSound();
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    userProfile.soundEnabled
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                  title="Efectos de audio del sistema"
                >
                  {userProfile.soundEnabled ? <Volume2 className="w-4 h-4 mx-auto mb-1" /> : <VolumeX className="w-4 h-4 mx-auto mb-1" />}
                  <span className="text-[10px] font-mono font-bold block">{userProfile.soundEnabled ? 'Audio ON' : 'Mute'}</span>
                </button>

                <button
                  onClick={() => {
                    toggleTheme();
                    playMechanicalClickSound();
                  }}
                  className="p-2 rounded-lg bg-slate-950/60 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 text-center transition-all"
                  title="Cambiar tema de la interfaz"
                >
                  {isDark ? <Sun className="w-4 h-4 mx-auto mb-1 text-amber-400" /> : <Moon className="w-4 h-4 mx-auto mb-1 text-slate-400" />}
                  <span className="text-[10px] font-mono font-bold block">{isDark ? 'Oscuro' : 'Claro'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
