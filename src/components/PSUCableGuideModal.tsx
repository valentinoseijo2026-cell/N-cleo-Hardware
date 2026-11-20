import React from 'react';
import {
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Cpu,
  Layers,
  Info,
  Sliders,
  Flame,
  Cable
} from 'lucide-react';
import { ComponentCategory, PCComponent, CurrencyConfig } from '../types';
import { calculateBuildStats, formatPrice } from '../utils/builderUtils';

interface PSUCableGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: Partial<Record<ComponentCategory, PCComponent>>;
  buildName: string;
  currency: CurrencyConfig;
}

export const PSUCableGuideModal: React.FC<PSUCableGuideModalProps> = ({
  isOpen,
  onClose,
  build,
  buildName,
  currency
}) => {
  if (!isOpen) return null;

  const stats = calculateBuildStats(build);
  const gpu = build.gpu;
  const cpu = build.cpu;
  const psu = build.psu;

  // Analysis of GPU connector
  const isHighTdpGpu = (gpu?.tdpWatts || 0) >= 285;
  const is12VHPWR = gpu?.name.includes('5090') || gpu?.name.includes('4090') || gpu?.name.includes('4080') || gpu?.name.includes('5080') || gpu?.name.includes('4070 Ti');
  const gpuTdp = gpu?.tdpWatts || 0;

  // Analysis of CPU EPS connector
  const isHighTdpCpu = (cpu?.tdpWatts || 0) >= 120;

  // Recommended PSU
  const recommendedWattage = stats.recommendedPsu;
  const chosenPsuWattage = psu ? parseInt(psu.name.match(/(\d{3,4})W/i)?.[1] || '0') : 0;
  const isPsuAdequate = chosenPsuWattage > 0 ? chosenPsuWattage >= recommendedWattage : true;

  // Ideal operating load percentage
  const loadPercentage = chosenPsuWattage > 0 ? Math.round((stats.systemTdp / chosenPsuWattage) * 100) : 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-red-950/70 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-wide">
                  GUÍA DE CABLES & FUENTE DE ALIMENTACIÓN
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ATX 3.0 / PCIe
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verificación de conectores, rieles de 12V y margen térmico para &quot;{buildName}&quot;.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-xs">
          {/* Wattage Overview Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Consumo Estimado (TDP)</span>
              <div className="text-lg font-mono font-black text-amber-400">
                ~{stats.systemTdp} W
              </div>
              <p className="text-[10px] text-slate-500">Pico máximo en estrés</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Fuente Sugerida</span>
              <div className="text-lg font-mono font-black text-emerald-400">
                {recommendedWattage} W+
              </div>
              <p className="text-[10px] text-slate-500">Con margen de seguridad del 40%</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Fuente Seleccionada</span>
              <div className="text-lg font-mono font-black text-cyan-400">
                {psu ? `${chosenPsuWattage || 'Custom'} W` : 'Sin seleccionar'}
              </div>
              <p className="text-[10px] text-slate-500">
                {chosenPsuWattage > 0
                  ? isPsuAdequate ? 'Capacidad Óptima' : 'Capacidad Ajustada'
                  : 'Revisa modelos sugeridos'}
              </p>
            </div>
          </div>

          {/* Efficiency Curve Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 font-mono">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Punto Dulce de Eficiencia (Curva 80 Plus Gold/Platinum)
              </span>
              <span className="font-mono text-emerald-400 font-bold">{loadPercentage}% de Carga</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(loadPercentage, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Las fuentes de poder operan con su máxima eficiencia y silencio cuando trabajan entre el <strong>50% y el 70%</strong> de su capacidad máxima. Al estar en este rango, los ventiladores permanecen en modo híbrido Zero-RPM la mayor parte del tiempo.
            </p>
          </div>

          {/* Connector Breakdown Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-white font-mono uppercase text-xs tracking-wider">
              Conectores Requeridos por tus Componentes
            </h4>

            {/* GPU Connector */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎮</span>
                  <span className="font-bold text-white">Alimentación de Tarjeta Gráfica (GPU)</span>
                </div>
                {is12VHPWR ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Conector 12V-2x6 / 12VHPWR (16 Pines)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {gpuTdp >= 220 ? '2x o 3x PCIe 8 Pines' : '1x PCIe 8 Pines'}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                {is12VHPWR ? (
                  <>
                    <p className="text-amber-300">
                      ⚡ <strong>Recomendación ATX 3.0 / 3.1:</strong> Tu tarjeta gráfica utiliza el estándar de 16 pines (12VHPWR / 12V-2x6). Se recomienda utilizar un cable nativo directo desde una fuente ATX 3.0 para evitar doblar adaptadores en pulpo.
                    </p>
                    <p className="text-slate-400">
                      Mantén al menos 3.5 cm de distancia recta antes de cualquier curvatura del cable hacia el vidrio templado.
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400">
                    💡 <strong>Regla de Cables Independientes:</strong> Si tu GPU requiere 2 o 3 conectores de 8 pines, utiliza <strong>cables individuales separados</strong> desde la fuente en lugar de un único cable en margarita (daisy-chain) para evitar caídas de voltaje en picos de consumo.
                  </p>
                )}
              </div>
            </div>

            {/* CPU Connector */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-white">Alimentación del Procesador (CPU EPS 12V)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {isHighTdpCpu ? '2x EPS 8 Pines (8+4 u 8+8)' : '1x EPS 8 Pines'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ubicados en la esquina superior izquierda de la placa madre. Para procesadores entusiastas como Ryzen 9 o Core i9, conectar ambos cables asegura estabilidad completa bajo cargas de render y overclocking.
              </p>
            </div>

            {/* Motherboard Main 24-Pin */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">Alimentación Principal de Placa Madre (ATX 24-Pin)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  1x Conector 24 Pines (20+4)
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Suministra energía a los carriles PCIe, chipsets, memoria RAM y puertos M.2 NVMe. Presiona con firmeza hasta escuchar el seguro trabar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400">Estándar ATX 3.1 & PCIe Gen 5 Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
};
