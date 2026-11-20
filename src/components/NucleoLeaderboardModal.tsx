import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  RotateCcw,
  X,
  Zap,
  Flame,
  CheckCircle2,
  Tv,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { LeaderboardEntry } from '../types';
import {
  getLeaderboard,
  resetLeaderboardToDefaults
} from '../utils/leaderboardUtils';

interface NucleoLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightId?: string | null;
  onPlayAgain?: () => void;
}

export const NucleoLeaderboardModal: React.FC<NucleoLeaderboardModalProps> = ({
  isOpen,
  onClose,
  highlightId,
  onPlayAgain
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() => getLeaderboard());
  const [filterMode, setFilterMode] = useState<'all' | 'victories'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  // Refresh whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEntries(getLeaderboard());
    }
  }, [isOpen]);

  const filteredEntries = useMemo(() => {
    let result = [...entries];
    if (filterMode === 'victories') {
      result = result.filter(e => e.victory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.playerName.toLowerCase().includes(q) ||
        e.rankTitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [entries, filterMode, searchQuery]);

  const stats = useMemo(() => {
    const topScore = entries.length > 0 ? Math.max(...entries.map(e => e.score)) : 0;
    const topFps = entries.length > 0 ? Math.max(...entries.map(e => e.fpsAchieved)) : 0;
    const victoriesCount = entries.filter(e => e.victory).length;
    return { topScore, topFps, victoriesCount, total: entries.length };
  }, [entries]);

  const handleReset = () => {
    const defaults = resetLeaderboardToDefaults();
    setEntries(defaults);
    setResetConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-red-950/70 shadow-2xl overflow-hidden">
        {/* Header Strip */}
        <div className="p-4 sm:p-5 border-b border-red-950/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Salón de la Fama · Núcleo Legend</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                TABLA DE LÍDERES GLOBAL
              </h2>
              <p className="text-xs text-slate-400">
                Las hazañas y puntuaciones más altas registradas en la aventura por la PC Suprema.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-3 gap-2 p-3 sm:p-4 bg-slate-950/50 border-b border-slate-800 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block truncate">Récord Máximo:</span>
              <strong className="text-amber-400 text-sm font-bold">{stats.topScore.toLocaleString()} pts</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block truncate">FPS Pico:</span>
              <strong className="text-emerald-400 text-sm font-bold">{stats.topFps} FPS</strong>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-red-500/30 flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-rose-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-slate-400 block truncate">Victorias:</span>
              <strong className="text-white text-sm font-bold">{stats.victoriesCount} de {stats.total}</strong>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3 sm:px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-colors ${
                filterMode === 'all'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todos ({entries.length})
            </button>
            <button
              onClick={() => setFilterMode('victories')}
              className={`px-3 py-1 rounded-lg font-mono font-bold transition-colors flex items-center gap-1 ${
                filterMode === 'victories'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Crown className="w-3 h-3 text-amber-300" />
              <span>Victorias ({stats.victoriesCount})</span>
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por jugador..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 focus:border-red-500 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        {/* Scrollable Leaderboard List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 custom-scrollbar">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <Trophy className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs">No se encontraron puntuaciones para esta búsqueda.</p>
            </div>
          ) : (
            filteredEntries.map((entry, idx) => {
              const isFirst = idx === 0 && filterMode === 'all';
              const isSecond = idx === 1 && filterMode === 'all';
              const isThird = idx === 2 && filterMode === 'all';
              const isHighlighted = highlightId === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isHighlighted
                      ? 'bg-red-950/40 border-red-500 ring-2 ring-red-500/50 shadow-lg shadow-red-500/20'
                      : isFirst
                      ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 shadow-md shadow-amber-500/10'
                      : isSecond
                      ? 'bg-slate-900/90 border-slate-700'
                      : isThird
                      ? 'bg-slate-900/90 border-amber-800/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Left: Rank & Player info */}
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-sm ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                          : isSecond
                          ? 'bg-slate-300 text-slate-950'
                          : isThird
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${idx + 1}`}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm font-bold truncate">
                          {entry.playerName}
                        </strong>
                        {isHighlighted && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-red-600 text-white animate-pulse">
                            ¡TÚ!
                          </span>
                        )}
                        {entry.victory ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-950 border border-emerald-500/50 text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            PC Suprema
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800">
                            Reino {entry.levelReached}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                        <span className="text-red-400 font-mono text-[10px]">{entry.rankTitle}</span>
                        <span>•</span>
                        <span className="text-slate-500 text-[10px]">{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score, FPS, and Components Stats */}
                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 font-mono text-right">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Puntuación:</span>
                      <strong className="text-amber-400 text-base font-black">
                        {entry.score.toLocaleString()}
                      </strong>
                    </div>

                    <div className="h-7 w-[1px] bg-slate-800" />

                    <div>
                      <span className="text-[10px] text-slate-400 block">Tasa FPS:</span>
                      <strong className="text-emerald-400 text-xs font-bold">
                        {entry.fpsAchieved} FPS
                      </strong>
                    </div>

                    <div className="h-7 w-[1px] bg-slate-800" />

                    <div>
                      <span className="text-[10px] text-slate-400 block">Piezas:</span>
                      <strong className="text-slate-300 text-xs font-bold">
                        {entry.componentsRescued}/{Math.max(7, entry.componentsRescued)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            {resetConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-rose-400 font-mono text-[11px]">¿Restablecer récords?</span>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px]"
                >
                  Sí, restablecer
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors"
                title="Restaura la tabla de líderes a los récords iniciales de fábrica"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer Récords de Fábrica</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onPlayAgain && (
              <button
                onClick={() => {
                  onClose();
                  onPlayAgain();
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-md shadow-red-600/30"
              >
                Jugar Partida Ahora
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
