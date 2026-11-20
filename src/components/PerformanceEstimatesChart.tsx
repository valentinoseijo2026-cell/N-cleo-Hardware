import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Gauge,
  Zap,
  Tv,
  Gamepad2,
  Sliders,
  Sparkles,
  Info,
  CheckCircle2,
  Flame,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import { PCComponent, ComponentCategory } from '../types';
import {
  generatePerformanceEstimates,
  PerformanceBenchmarkItem,
  SyntheticBenchmarkReport
} from '../utils/builderUtils';

interface PerformanceEstimatesChartProps {
  build: Partial<Record<ComponentCategory, PCComponent>>;
  buildName?: string;
  compact?: boolean;
}

export const PerformanceEstimatesChart: React.FC<PerformanceEstimatesChartProps> = ({
  build,
  buildName = 'Mi Ensamble',
  compact = false
}) => {
  const [upscaling, setUpscaling] = useState<boolean>(true); // DLSS / FSR Calidad
  const [viewMode, setViewMode] = useState<'all' | '1080p' | '1440p' | '4k' | 'synthetic'>('all');

  const report: SyntheticBenchmarkReport = useMemo(() => {
    return generatePerformanceEstimates(build, upscaling);
  }, [build, upscaling]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return report.items.map(item => {
      // Shorten game title for chart axis
      const shortName = item.game.split('(')[0].trim().replace('Counter-Strike 2 / Valorant', 'CS2 / Valorant');
      return {
        name: shortName,
        fullName: item.game,
        category: item.category,
        quality: item.quality,
        '1080p': item.fps1080p,
        '1440p': item.fps1440p,
        '4K': item.fps4k,
        low1080: item.low1Pct1080p,
        low1440: item.low1Pct1440p,
        low4k: item.low1Pct4k,
        ms1080: item.frameTimeMs1080p,
        ms1440: item.frameTimeMs1440p,
        ms4k: item.frameTimeMs4k
      };
    });
  }, [report]);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md border border-red-500/40 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs space-y-2.5 z-50">
          <div className="pb-1.5 border-b border-slate-800">
            <span className="text-[10px] uppercase font-mono font-bold text-red-400 block">
              {data.category}
            </span>
            <h4 className="font-bold text-white text-sm">{data.fullName}</h4>
            <span className="text-[10px] text-slate-400 block">{data.quality}</span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800/80">
              <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                1080p FHD:
              </span>
              <div className="text-right">
                <strong className="text-white text-xs">{data['1080p']} FPS</strong>
                <span className="text-[10px] text-slate-400 block">1% Low: ~{data.low1080} FPS ({data.ms1080}ms)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800/80">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                1440p QHD:
              </span>
              <div className="text-right">
                <strong className="text-white text-xs">{data['1440p']} FPS</strong>
                <span className="text-[10px] text-slate-400 block">1% Low: ~{data.low1440} FPS ({data.ms1440}ms)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800/80">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                4K UHD:
              </span>
              <div className="text-right">
                <strong className="text-white text-xs">{data['4K']} FPS</strong>
                <span className="text-[10px] text-slate-400 block">1% Low: ~{data.low4k} FPS ({data.ms4k}ms)</span>
              </div>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Fluidez:</span>
            <span className="font-semibold text-emerald-400">
              {data['1440p'] >= 144
                ? '⚡ 144Hz+ Competitivo'
                : data['1440p'] >= 60
                ? '✓ 60 FPS Estable'
                : '⚠ Requiere FSR/DLSS'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full rounded-2xl border border-red-950/60 bg-slate-900/90 shadow-xl overflow-hidden ${compact ? 'p-4' : 'p-5 sm:p-6'} space-y-5`}>
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
              <Gauge className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Estimaciones de Rendimiento Sintético & Gaming</span>
            </h3>
            <span
              className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border"
              style={{
                color: report.tierColor,
                borderColor: `${report.tierColor}40`,
                backgroundColor: `${report.tierColor}15`
              }}
            >
              {report.tierLabel}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Proyección gráfica en base a benchmarks sintéticos ponderados de GPU + CPU + RAM.
          </p>
        </div>

        {/* Upscaling Toggle (DLSS / FSR) */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-slate-300 font-medium">DLSS 3 / FSR 3:</span>
          <button
            onClick={() => setUpscaling(!upscaling)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
              upscaling
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {upscaling ? 'Activado (Calidad)' : 'Nativo'}
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-cyan-400 uppercase font-mono font-bold block">
            Media 1080p FHD
          </span>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            ~{report.avgFps1080p} <span className="text-xs font-normal text-slate-400">FPS</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Ultra / Competitivo</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block">
            Media 1440p QHD
          </span>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            ~{report.avgFps1440p} <span className="text-xs font-normal text-slate-400">FPS</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Sweet Spot 2K</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-rose-400 uppercase font-mono font-bold block">
            Media 4K UHD
          </span>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            ~{report.avgFps4k} <span className="text-xs font-normal text-slate-400">FPS</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Trazado Rayos / Ultra</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <span className="text-[10px] text-purple-400 uppercase font-mono font-bold block">
            3DMark TimeSpy
          </span>
          <div className="text-xl font-black text-white font-mono mt-0.5">
            {new Intl.NumberFormat('es-ES').format(report.timeSpyScore)} <span className="text-xs font-normal text-slate-400">pts</span>
          </div>
          <span className="text-[10px] text-slate-500 block">Graphics Score</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold block">
            Monitor Sugerido
          </span>
          <div className="text-lg font-black text-white font-mono mt-0.5">
            {report.recommendedResolution} · {report.targetMonitorHz}Hz
          </div>
          <span className="text-[10px] text-slate-500 block">Sincronización óptima</span>
        </div>
      </div>

      {/* Resolution & Mode Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'all'
                ? 'bg-red-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas las Resoluciones
          </button>
          <button
            onClick={() => setViewMode('1080p')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === '1080p'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solo 1080p
          </button>
          <button
            onClick={() => setViewMode('1440p')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === '1440p'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solo 1440p
          </button>
          <button
            onClick={() => setViewMode('4k')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === '4k'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solo 4K
          </button>
          <button
            onClick={() => setViewMode('synthetic')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              viewMode === 'synthetic'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sintéticos & CPU
          </button>
        </div>

        {/* Legend notes */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-500 inline-block" />
            Línea 60 FPS (Mínimo Fluido)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
            Línea 144 FPS (Esports)
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      {viewMode !== 'synthetic' ? (
        <div className="w-full h-80 sm:h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis
                dataKey="name"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[0, 'auto']}
                unit=" fps"
              />

              <Tooltip content={<CustomTooltip />} />
              
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />

              {/* Reference Lines for Gamer Standards */}
              <ReferenceLine
                y={60}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: '60 FPS', fill: '#10b981', fontSize: 10, position: 'right' }}
              />
              <ReferenceLine
                y={144}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: '144 FPS', fill: '#f59e0b', fontSize: 10, position: 'right' }}
              />

              {/* Grouped Bars for 1080p, 1440p, 4K */}
              {(viewMode === 'all' || viewMode === '1080p') && (
                <Bar
                  dataKey="1080p"
                  name="1080p FHD"
                  fill="#06b6d4"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              )}

              {(viewMode === 'all' || viewMode === '1440p') && (
                <Bar
                  dataKey="1440p"
                  name="1440p QHD"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              )}

              {(viewMode === 'all' || viewMode === '4k') && (
                <Bar
                  dataKey="4K"
                  name="4K UHD"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Synthetic Benchmarks Panel (3DMark TimeSpy, FireStrike, Cinebench) */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* 3DMark TimeSpy */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-purple-400" />
                3DMark TimeSpy (DirectX 12)
              </span>
              <span className="text-xs font-mono font-bold text-purple-400">
                {new Intl.NumberFormat('es-ES').format(report.timeSpyScore)} pts
              </span>
            </div>
            {/* Progress meter */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((report.timeSpyScore / 36000) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Prueba sintética estándar de renderizado en resolución 1440p. La RTX 4090 ronda los 36.000 puntos y la RTX 4070 unos 18.000 puntos.
            </p>
          </div>

          {/* 3DMark FireStrike */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-rose-400" />
                3DMark FireStrike (DirectX 11)
              </span>
              <span className="text-xs font-mono font-bold text-rose-400">
                {new Intl.NumberFormat('es-ES').format(report.fireStrikeScore)} pts
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-rose-600 to-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((report.fireStrikeScore / 55000) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mide la tasa de relleno de texturas e iluminación en rasterizado tradicional para juegos competitivos a altos fotogramas.
            </p>
          </div>

          {/* Cinebench R23 Multi-Core */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                Cinebench R23 (CPU Multi-Core)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {new Intl.NumberFormat('es-ES').format(report.cinebenchScore)} pts
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((report.cinebenchScore / 40000) * 100))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Capacidad de cálculo multihilo del procesador para evitar caídas de fotogramas (1% Lows) y tareas de render o edición de vídeo.
            </p>
          </div>
        </div>
      )}

      {/* Component Attribution Footer Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            Valores calculados para: <strong className="text-white">{build.gpu?.name || 'GPU Integrada'}</strong> + <strong className="text-white">{build.cpu?.name || 'CPU Estándar'}</strong>
          </span>
        </div>
        <span className="text-slate-500 font-mono text-[10px]">
          *Estimaciones basadas en promedios normalizados con drivers actualizados.
        </span>
      </div>
    </div>
  );
};
