import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Tag,
  Hammer,
  Zap,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  X,
  ExternalLink,
  ShieldCheck,
  Flame,
  ChevronRight,
  Layers,
  Leaf
} from 'lucide-react';
import {
  WeeklyMarketReport,
  WeeklyDealItem,
  WeeklyFeaturedBuild,
  WeeklyGameQuest,
  CurrencyConfig
} from '../types';
import {
  getWeeklyMarketReport,
  forceSyncWeeklyReport,
  getRemainingTimeUntilNextSync,
  calculateWeeklyPowerCost
} from '../utils/weeklyUpdateUtils';
import { formatPrice } from '../utils/builderUtils';

interface WeeklyHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyConfig;
  onLoadBuildPreset?: (componentIds: Partial<Record<string, string>>) => void;
  onPlayGame?: () => void;
  currentBuildTdpWatts?: number;
}

export const WeeklyHubModal: React.FC<WeeklyHubModalProps> = ({
  isOpen,
  onClose,
  currency,
  onLoadBuildPreset,
  onPlayGame,
  currentBuildTdpWatts = 450
}) => {
  const [report, setReport] = useState<WeeklyMarketReport>(() => getWeeklyMarketReport());
  const [activeTab, setActiveTab] = useState<'deals' | 'build' | 'power' | 'quest'>('deals');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Power calculator interactive state
  const [calcWatts, setCalcWatts] = useState<number>(currentBuildTdpWatts || 450);
  const [calcHoursPerWeek, setCalcHoursPerWeek] = useState<number>(25);
  const [costPerKwh, setCostPerKwh] = useState<number>(0.16);

  // Remaining time to next sync
  const [countdown, setCountdown] = useState(() =>
    getRemainingTimeUntilNextSync(report.nextSyncTimestamp)
  );

  useEffect(() => {
    if (currentBuildTdpWatts > 0) {
      setCalcWatts(currentBuildTdpWatts);
    }
  }, [currentBuildTdpWatts]);

  useEffect(() => {
    if (!isOpen) return;
    setReport(getWeeklyMarketReport());
    const interval = setInterval(() => {
      const freshReport = getWeeklyMarketReport();
      setReport(freshReport);
      setCountdown(getRemainingTimeUntilNextSync(freshReport.nextSyncTimestamp));
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen, report.nextSyncTimestamp]);

  if (!isOpen) return null;

  const handleForceSync = () => {
    setIsSyncing(true);
    try {
      // Audio feedback if audio context available
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      const fresh = forceSyncWeeklyReport();
      setReport(fresh);
      setCountdown(getRemainingTimeUntilNextSync(fresh.nextSyncTimestamp));
      setIsSyncing(false);
      setSyncFeedback('¡Datos y ofertas sincronizados con éxito!');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 700);
  };

  const powerCalc = calculateWeeklyPowerCost(calcWatts, calcHoursPerWeek, costPerKwh);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-950 border border-red-500/30 shadow-2xl shadow-red-950/40 text-slate-100 overflow-hidden">
        
        {/* Top Header Strip */}
        <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-r from-red-950/30 via-slate-900/50 to-slate-950 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg shadow-red-600/30 shrink-0 border border-red-400/40">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Hub Semanal de Hardware
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 uppercase">
                  {report.weekLabel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rotación semanal de ofertas, tendencias de mercado, build curada y desafío de juego
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync button with countdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 hidden sm:inline">Próxima rotación:</span>
              <span className="text-emerald-400 font-bold">{countdown.formatted}</span>
            </div>

            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs"
              title="Forzar actualización semanal ahora"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sync feedback toast */}
        {syncFeedback && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-4 py-2 text-xs font-medium text-emerald-300 flex items-center justify-between animate-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{syncFeedback}</span>
            </div>
          </div>
        )}

        {/* Market Trends Banner */}
        <div className="px-5 py-2.5 bg-slate-900/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-400 font-medium">Tendencia del ciclo:</span>
            
            <div className="flex items-center gap-1 font-mono font-bold text-emerald-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>GPUs: {report.gpuTrendPercent}%</span>
            </div>

            <div className="flex items-center gap-1 font-mono font-bold text-emerald-400">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>CPUs: {report.cpuTrendPercent}%</span>
            </div>

            <div className={`flex items-center gap-1 font-mono font-bold ${report.ramTrendPercent <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {report.ramTrendPercent <= 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              <span>RAM DDR5: {report.ramTrendPercent > 0 ? `+${report.ramTrendPercent}%` : `${report.ramTrendPercent}%`}</span>
            </div>
          </div>

          <p className="text-slate-400 text-[11px] truncate max-w-md hidden md:block">
            💡 {report.marketSentiment}
          </p>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 pt-3 pb-0 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-950">
          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'deals'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Ofertas Semanales ({report.deals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('build')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'build'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Build de la Semana</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-500/20 text-red-300 font-mono">
              -${report.featuredBuild.weeklySavingsUSD}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('power')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'power'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Calculadora de Consumo Eléctrico</span>
          </button>

          <button
            onClick={() => setActiveTab('quest')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'quest'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Desafío Semanal Núcleo Legend</span>
            {report.weeklyQuest.isCompleted ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: WEEKLY DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-500" />
                    Rebajas de Silicio y Descuentos del Ciclo Semanal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Precios verificados con distribuidores para compras de componentes individuales
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  Actualización: Cada lunes
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.deals.map(deal => (
                  <div
                    key={deal.id}
                    className="p-4 rounded-xl border border-slate-800/90 bg-slate-900/40 hover:border-red-500/40 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-500/20">
                          {deal.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Expira en {deal.expiresInDays} días
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white leading-snug">
                        {deal.name}
                      </h4>

                      <p className="text-xs text-slate-300">
                        {deal.specs}
                      </p>

                      <p className="text-[11px] text-slate-400 italic">
                        {deal.retailerNotice}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          {formatPrice(deal.dealPriceUSD, currency)}
                        </span>
                        <span className="text-xs text-slate-500 line-through font-mono">
                          {formatPrice(deal.originalPriceUSD, currency)}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                        -{deal.discountPercent}% OFF
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: FEATURED BUILD OF THE WEEK */}
          {activeTab === 'build' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/20 via-slate-900/60 to-slate-950 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-red-600 text-white shadow-xs">
                    {report.featuredBuild.tierBadge}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md font-bold">
                    Ahorro semanal: -{formatPrice(report.featuredBuild.weeklySavingsUSD, currency)}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {report.featuredBuild.title}
                  </h3>
                  <p className="text-sm text-red-300 font-medium mt-1">
                    {report.featuredBuild.subtitle}
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {report.featuredBuild.concept}
                  </p>
                </div>

                {/* Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {report.featuredBuild.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* Price and CTA */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400 font-mono">Presupuesto del ensamble en oferta:</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white font-mono">
                        {formatPrice(report.featuredBuild.totalDealUSD, currency)}
                      </span>
                      <span className="text-xs text-slate-500 line-through font-mono">
                        {formatPrice(report.featuredBuild.totalOriginalUSD, currency)}
                      </span>
                    </div>
                  </div>

                  {onLoadBuildPreset && (
                    <button
                      onClick={() => {
                        onLoadBuildPreset(report.featuredBuild.componentIds);
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-red-600/30 flex items-center gap-2"
                    >
                      <Hammer className="w-4 h-4" />
                      <span>Cargar esta Build en el Configurador</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POWER CONSUMPTION CALCULATOR */}
          {activeTab === 'power' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Calculadora de Consumo Eléctrico & Costo Operativo
                </h3>
                <p className="text-xs text-slate-400">
                  Calcula el gasto semanal y anual de tu PC según tus horas reales de uso y costo del kWh
                </p>
              </div>

              {/* Sliders Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Potencia del PC (TDP)</span>
                    <span className="text-red-400 font-mono font-bold">{calcWatts} Watts</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="1200"
                    step="25"
                    value={calcWatts}
                    onChange={e => setCalcWatts(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>150W (Eco)</span>
                    <span>650W (Media)</span>
                    <span>1200W (Ultra)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Horas de uso semanal</span>
                    <span className="text-amber-400 font-mono font-bold">{calcHoursPerWeek} h/semana</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    step="5"
                    value={calcHoursPerWeek}
                    onChange={e => setCalcHoursPerWeek(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5 h (Casual)</span>
                    <span>25 h (Gamer)</span>
                    <span>70 h (Hardcore)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-semibold">Costo tarifa eléctrica</span>
                    <span className="text-emerald-400 font-mono font-bold">${costPerKwh.toFixed(2)}/kWh</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.45"
                    step="0.01"
                    value={costPerKwh}
                    onChange={e => setCostPerKwh(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$0.05 (Baja)</span>
                    <span>$0.16 (Media)</span>
                    <span>$0.45 (Alta)</span>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Gasto Semanal</span>
                  <p className="text-xl font-black text-white font-mono mt-1">
                    {formatPrice(powerCalc.weeklyCostUSD, currency)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {powerCalc.weeklyKwh.toFixed(1)} kWh/sem
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Gasto Mensual</span>
                  <p className="text-xl font-black text-amber-400 font-mono mt-1">
                    {formatPrice(powerCalc.monthlyCostUSD, currency)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">Promedio 4.3 sem</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Gasto Anual</span>
                  <p className="text-xl font-black text-emerald-400 font-mono mt-1">
                    {formatPrice(powerCalc.yearlyCostUSD, currency)}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">52 semanas</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Huella CO₂ Estimada</span>
                  <p className="text-xl font-black text-cyan-400 font-mono mt-1">
                    {powerCalc.yearlyCo2Kg.toFixed(0)} kg
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">anual</span>
                </div>
              </div>

              {/* Advice */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 text-xs text-slate-300 flex items-start gap-3">
                <Leaf className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white">Consejos para reducir tu factura eléctrica:</span>
                  <p>
                    Activar undervolting en GPUs RTX 4000 o AMD RDNA3 puede reducir entre 40W y 80W de consumo con 0% de pérdida de FPS. Además, usar fuentes certificadas 80+ Gold o Platinum ahorra hasta un 12% adicional en disipación pasiva.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WEEKLY GAME QUEST */}
          {activeTab === 'quest' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/60 to-slate-950 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Misión Semanal #{report.weeklyQuest.weekNumber}
                  </span>
                  {report.weeklyQuest.isCompleted ? (
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      Misión Completada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                      <Clock className="w-4 h-4" />
                      En progreso esta semana
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">
                    {report.weeklyQuest.title}
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    {report.weeklyQuest.targetDescription}
                  </p>
                </div>

                {/* Reward Box */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono">Recompensa al completar:</span>
                    <p className="text-sm font-bold text-amber-300 mt-0.5">
                      {report.weeklyQuest.rewardTitle}
                    </p>
                  </div>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    +{report.weeklyQuest.rewardPoints.toLocaleString()} PTS
                  </span>
                </div>

                {/* Play CTA */}
                {onPlayGame && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        onPlayGame();
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs font-black transition-all shadow-md shadow-amber-600/20 flex items-center gap-2"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Jugar Núcleo Legend Ahora</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            🔄 Rotación semanal automática cada lunes (ciclos de 7 días) con actualización de ofertas y misión.
          </span>
          <span className="font-mono text-slate-500">
            ID de ciclo: W{report.weekNumber}-{report.year}
          </span>
        </div>

      </div>
    </div>
  );
};
