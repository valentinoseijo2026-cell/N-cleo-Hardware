import React, { useState } from 'react';
import {
  ArrowRightLeft,
  X,
  Zap,
  Gauge,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Tv,
  Cpu,
  Layers
} from 'lucide-react';
import { ComponentCategory, PCComponent, CurrencyConfig, BuildPreset } from '../types';
import { BUILD_PRESETS, COMPONENTS_DATABASE } from '../data/componentsData';
import {
  calculateBuildStats,
  formatPrice,
  calculateBottleneckAndFps
} from '../utils/builderUtils';

interface DualBuildVersusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBuild: Partial<Record<ComponentCategory, PCComponent>>;
  currentBuildName: string;
  currency: CurrencyConfig;
  onLoadBuild: (build: Partial<Record<ComponentCategory, PCComponent>>, name: string) => void;
}

export const DualBuildVersusModal: React.FC<DualBuildVersusModalProps> = ({
  isOpen,
  onClose,
  currentBuild,
  currentBuildName,
  currency,
  onLoadBuild
}) => {
  const [comparisonPresetId, setComparisonPresetId] = useState<string>(BUILD_PRESETS[4].id); // 4K Gaming Preset

  if (!isOpen) return null;

  // Build A (User's Current Build)
  const statsA = calculateBuildStats(currentBuild);
  const bottleneckA = calculateBottleneckAndFps(currentBuild.cpu, currentBuild.gpu);

  // Build B (Selected Preset)
  const selectedPreset = BUILD_PRESETS.find(p => p.id === comparisonPresetId) || BUILD_PRESETS[0];
  const buildB: Partial<Record<ComponentCategory, PCComponent>> = {};
  Object.entries(selectedPreset.componentIds).forEach(([cat, id]) => {
    const found = COMPONENTS_DATABASE.find(c => c.id === id);
    if (found) buildB[cat as ComponentCategory] = found;
  });
  const statsB = calculateBuildStats(buildB);
  const bottleneckB = calculateBottleneckAndFps(buildB.cpu, buildB.gpu);

  // Diff Calculations
  const priceDiffMin = statsB.minUSD - statsA.minUSD;
  const tdpDiff = statsB.systemTdp - statsA.systemTdp;

  const gpuScoreA = currentBuild.gpu?.perfScore || 60;
  const gpuScoreB = buildB.gpu?.perfScore || 60;
  const perfDiffPct = Math.round(((gpuScoreB - gpuScoreA) / Math.max(gpuScoreA, 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-red-950/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Comparador Cara a Cara (Dual Build)</h3>
              <p className="text-xs text-slate-400">
                Analiza las diferencias técnicas, rendimiento en juegos y costo entre dos configuraciones.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Comparison Preset Selector */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-300">
              Comparar tu ensamble actual contra:
            </span>
            <select
              value={comparisonPresetId}
              onChange={e => setComparisonPresetId(e.target.value)}
              className="bg-slate-900 border border-red-500/40 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
            >
              {BUILD_PRESETS.map(preset => (
                <option key={preset.id} value={preset.id}>
                  {preset.title} · ({preset.targetResolution}) - ${preset.estimatedPriceMin} USD
                </option>
              ))}
            </select>
          </div>

          {/* Quick Metrics Delta Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Diferencia de Rendimiento Gráfico
              </span>
              <strong
                className={`text-lg font-bold font-mono ${
                  perfDiffPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {perfDiffPct >= 0 ? `+${perfDiffPct}% más rápido` : `${perfDiffPct}% inferior`}
              </strong>
              <span className="text-[10px] text-slate-500 block">en el Ensamble B</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Diferencia de Presupuesto Aprox.
              </span>
              <strong
                className={`text-lg font-bold font-mono ${
                  priceDiffMin >= 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {priceDiffMin >= 0 ? `+${formatPrice(priceDiffMin, currency)}` : `${formatPrice(priceDiffMin, currency)}`}
              </strong>
              <span className="text-[10px] text-slate-500 block">precio minorista estimado</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">
                Diferencia de Energía (TDP)
              </span>
              <strong
                className={`text-lg font-bold font-mono ${
                  tdpDiff >= 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {tdpDiff >= 0 ? `+${tdpDiff}W más consumo` : `${tdpDiff}W menor`}
              </strong>
              <span className="text-[10px] text-slate-500 block">consumo térmico total</span>
            </div>
          </div>

          {/* Side-by-Side Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* BUILD A (CURRENT) */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    Ensamble A (Tu Configuración Actual)
                  </span>
                  <h4 className="text-base font-bold text-white truncate">{currentBuildName}</h4>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-400 font-mono">
                    {formatPrice(statsA.minUSD, currency)}
                  </span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">GPU:</span>
                  <strong className="text-white truncate max-w-[200px]">
                    {currentBuild.gpu?.name || 'Sin asignar'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">CPU:</span>
                  <strong className="text-white truncate max-w-[200px]">
                    {currentBuild.cpu?.name || 'Sin asignar'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">RAM & Socket:</span>
                  <strong className="text-slate-300">
                    {currentBuild.ram?.name.split('(')[0] || 'DDR5'} · {currentBuild.cpu?.socket || 'N/A'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Gabinete:</span>
                  <strong className="text-slate-300">
                    {currentBuild.case?.name.split('(')[0] || 'Fractal North'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Diagnóstico:</span>
                  <strong className="text-emerald-400 font-mono">
                    {bottleneckA?.status === 'balanced' ? 'Equilibrado' : 'Limitado'}
                  </strong>
                </div>
              </div>
            </div>

            {/* BUILD B (COMPARISON PRESET) */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-red-950/60 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-red-400 uppercase font-bold">
                    Ensamble B (Referencia Seleccionada)
                  </span>
                  <h4 className="text-base font-bold text-white truncate">{selectedPreset.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-red-400 font-mono">
                    {formatPrice(statsB.minUSD, currency)}
                  </span>
                </div>
              </div>

              {/* Key Specs */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">GPU:</span>
                  <strong className="text-white truncate max-w-[200px]">
                    {buildB.gpu?.name || 'Sin asignar'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">CPU:</span>
                  <strong className="text-white truncate max-w-[200px]">
                    {buildB.cpu?.name || 'Sin asignar'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">RAM & Socket:</span>
                  <strong className="text-slate-300">
                    {buildB.ram?.name.split('(')[0] || 'DDR5'} · {buildB.cpu?.socket || 'N/A'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Gabinete:</span>
                  <strong className="text-slate-300">
                    {buildB.case?.name.split('(')[0] || 'Lian Li O11'}
                  </strong>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">FPS Destacados:</span>
                  <strong className="text-emerald-400 font-mono">
                    {selectedPreset.fpsHighlights}
                  </strong>
                </div>
              </div>

              {/* Load preset button */}
              <button
                onClick={() => {
                  onLoadBuild(buildB, selectedPreset.title);
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-sm"
              >
                Cargar Ensamble B en mi Constructor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
