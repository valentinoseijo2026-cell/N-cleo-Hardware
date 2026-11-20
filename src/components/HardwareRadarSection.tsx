import React from 'react';
import { Calendar, Flame, AlertCircle, ArrowUpRight, Cpu, Tv, Layers } from 'lucide-react';
import { UPCOMING_HARDWARE_RADAR } from '../data/newsData';

interface HardwareRadarSectionProps {
  onGoToBuilder: () => void;
  onOpenWeeklyHub?: () => void;
}

export const HardwareRadarSection: React.FC<HardwareRadarSectionProps> = ({ onGoToBuilder, onOpenWeeklyHub }) => {
  return (
    <div className="space-y-8">
      {/* Title & Introduction */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider font-mono">
          <Flame className="w-4 h-4 text-red-500" />
          <span>Radar de Lanzamientos & Hoja de Ruta</span>
        </div>
        <h2 className="mt-1 text-2xl sm:text-3xl font-black text-white tracking-tight">
          Próximos Lanzamientos en la Industria de Hardware
        </h2>
        <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
          Seguimiento editorial de anuncios confirmados, filtraciones de cadenas de producción y ventanas estimadas de salida para GPUs, CPUs y placas base.
        </p>
      </div>

      {/* Weekly Hub Highlight Banner */}
      {onOpenWeeklyHub && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase">Ciclo Semanal Activo</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Rebajas de Silicio, Build de la Semana & Calculadora Eléctrica
              </h3>
              <p className="text-xs text-slate-300">
                Consulta los descuentos semanales de GPUs, SSDs y RAM actualizados automáticamente cada 7 días.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenWeeklyHub}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <span>Abrir Hub Semanal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Radar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {UPCOMING_HARDWARE_RADAR.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xs hover:border-red-500/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-500/20">
                  {item.type}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">
                {item.name}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {item.impact}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Segmento esperado:</span>
              <span className="font-semibold text-slate-200 font-mono">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Buying Advice Note */}
      <div className="p-5 rounded-xl border border-red-500/30 bg-red-950/15 text-xs text-slate-300 space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500" />
          ¿Conviene esperar a las nuevas generaciones o armar hoy?
        </div>
        <p>
          Si buscas estabilidad y la mejor relación costo-beneficio, el hardware actual maduro (como la plataforma AM5 con DDR5 y GPUs RTX 4070 / RX 7800 XT) cuenta con controladores probados y disponibilidad inmediata a precios estabilizados. Las nuevas generaciones suelen arribar con precios inflados durante sus primeros meses.
        </p>
        <div className="pt-2">
          <button
            onClick={onGoToBuilder}
            className="text-red-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            Configurar ensamble con precios actuales <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
