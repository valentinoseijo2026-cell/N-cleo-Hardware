import React, { useState } from 'react';
import {
  Sparkles,
  DollarSign,
  Gamepad2,
  Tv,
  Film,
  X,
  Check,
  Zap,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { PCComponent, ComponentCategory, CurrencyConfig } from '../types';
import { COMPONENTS_DATABASE } from '../data/componentsData';
import { formatPrice } from '../utils/builderUtils';

interface SmartAutoBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBuild: (build: Partial<Record<ComponentCategory, PCComponent>>, name: string) => void;
  currency: CurrencyConfig;
}

export const SmartAutoBuilderModal: React.FC<SmartAutoBuilderModalProps> = ({
  isOpen,
  onClose,
  onApplyBuild,
  currency
}) => {
  const [budgetUSD, setBudgetUSD] = useState<number>(1200);
  const [objective, setObjective] = useState<'esports' | '1440p' | '4k' | 'creator'>('1440p');

  if (!isOpen) return null;

  // Auto-builder optimization algorithm
  const generateOptimalBuild = () => {
    // 1. Budget breakdown weights by objective
    // Esports: Higher CPU weight
    // 4K: Highest GPU weight (~50%)
    // Creator: High CPU + RAM weight
    let gpuWeight = 0.44;
    let cpuWeight = 0.24;

    if (objective === '4k') {
      gpuWeight = 0.52;
      cpuWeight = 0.18;
    } else if (objective === 'esports') {
      gpuWeight = 0.36;
      cpuWeight = 0.32;
    } else if (objective === 'creator') {
      gpuWeight = 0.38;
      cpuWeight = 0.28;
    }

    const targetGpuPrice = budgetUSD * gpuWeight;
    const targetCpuPrice = budgetUSD * cpuWeight;

    // Pick best GPU under or close to target
    const gpus = COMPONENTS_DATABASE.filter(c => c.category === 'gpu').sort(
      (a, b) => b.priceMinUSD - a.priceMinUSD
    );
    const selectedGpu =
      gpus.find(g => g.priceMinUSD <= targetGpuPrice * 1.15) || gpus[gpus.length - 1];

    // Pick best CPU under or close to target
    const cpus = COMPONENTS_DATABASE.filter(c => c.category === 'cpu').sort(
      (a, b) => b.priceMinUSD - a.priceMinUSD
    );
    const selectedCpu =
      cpus.find(c => c.priceMinUSD <= targetCpuPrice * 1.15) || cpus[cpus.length - 1];

    // Pick matching motherboard by socket
    const mbs = COMPONENTS_DATABASE.filter(
      c => c.category === 'motherboard' && c.socket === selectedCpu.socket
    ).sort((a, b) => a.priceMinUSD - b.priceMinUSD);
    const selectedMb = mbs[Math.min(1, mbs.length - 1)] || mbs[0];

    // Pick matching RAM by socket (AM5/LGA1851 require DDR5)
    const requiredRam = selectedCpu.socket === 'AM5' || selectedCpu.socket === 'LGA1851' ? 'DDR5' : 'DDR4';
    const rams = COMPONENTS_DATABASE.filter(
      c => c.category === 'ram' && c.ramType === requiredRam
    ).sort((a, b) => (objective === 'creator' ? b.priceMinUSD - a.priceMinUSD : a.priceMinUSD - b.priceMinUSD));
    const selectedRam = rams[0];

    // Storage
    const storages = COMPONENTS_DATABASE.filter(c => c.category === 'storage').sort(
      (a, b) => a.priceMinUSD - b.priceMinUSD
    );
    const selectedStorage = budgetUSD >= 1400 ? storages[storages.length - 1] : storages[0];

    // Cooler based on CPU TDP
    const coolers = COMPONENTS_DATABASE.filter(c => c.category === 'cooler');
    const selectedCooler =
      selectedCpu.tdpWatts >= 160
        ? coolers.find(c => c.name.toLowerCase().includes('liquid') || c.name.toLowerCase().includes('kraken')) || coolers[0]
        : coolers.find(c => c.name.toLowerCase().includes('peerless') || c.name.toLowerCase().includes('assassin')) || coolers[0];

    // PSU based on combined TDP + 150W margin
    const estimatedTdp = selectedCpu.tdpWatts + selectedGpu.tdpWatts + 60;
    const psus = COMPONENTS_DATABASE.filter(c => c.category === 'psu').sort(
      (a, b) => a.priceMinUSD - b.priceMinUSD
    );
    const selectedPsu =
      psus.find(p => {
        const match = p.name.match(/(\d{3,4})W/i);
        const w = match ? parseInt(match[1], 10) : 650;
        return w >= estimatedTdp + 150;
      }) || psus[psus.length - 1];

    // Case
    const cases = COMPONENTS_DATABASE.filter(c => c.category === 'case');
    const selectedCase =
      budgetUSD >= 1600
        ? cases.find(c => c.id === 'case-fractal-north' || c.id === 'case-lian-li-o11-dynamic-evo') || cases[0]
        : cases.find(c => c.id === 'case-montech-air-903-max') || cases[0];

    return {
      build: {
        cpu: selectedCpu,
        gpu: selectedGpu,
        motherboard: selectedMb,
        ram: selectedRam,
        storage: selectedStorage,
        cooler: selectedCooler,
        psu: selectedPsu,
        case: selectedCase
      },
      name: `Auto-Ensamble ${objective.toUpperCase()} ($${budgetUSD} USD)`
    };
  };

  const optimalResult = generateOptimalBuild();
  const buildItems = Object.values(optimalResult.build);
  const totalMin = buildItems.reduce((acc, c) => acc + (c?.priceMinUSD || 0), 0);
  const totalMax = buildItems.reduce((acc, c) => acc + (c?.priceMaxUSD || 0), 0);

  const handleApply = () => {
    onApplyBuild(optimalResult.build, optimalResult.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-red-950/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Generador Inteligente por Presupuesto</h3>
              <p className="text-xs text-slate-400">
                Calcula la configuración matemáticamente más equilibrada del mercado.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Budget Range Slider */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Tu Presupuesto Máximo Objetivo:
              </span>
              <span className="text-xl font-black text-white font-mono">
                ${budgetUSD} USD{' '}
                <span className="text-xs font-normal text-slate-400">
                  (~{formatPrice(budgetUSD, currency)})
                </span>
              </span>
            </div>

            <input
              type="range"
              min="500"
              max="3500"
              step="50"
              value={budgetUSD}
              onChange={e => setBudgetUSD(parseInt(e.target.value, 10))}
              className="w-full accent-red-600 h-2 bg-slate-800 rounded cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$500 USD (Económico)</span>
              <span>$1.500 USD (Gama Alta)</span>
              <span>$3.500 USD (Entusiasta)</span>
            </div>
          </div>

          {/* Objective Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              ¿Cuál es tu objetivo prioritario?
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: '1440p', label: '1440p AAA', icon: Tv, desc: 'Equilibrio perfecto' },
                { id: '4k', label: '4K Ray Tracing', icon: Gamepad2, desc: 'Prioridad máxima a GPU' },
                { id: 'esports', label: 'Esports 240Hz+', icon: Zap, desc: 'Prioridad a CPU rápida' },
                { id: 'creator', label: 'Edición / IA', icon: Film, desc: 'Más núcleos y RAM' }
              ].map(item => {
                const Icon = item.icon;
                const isSel = objective === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setObjective(item.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSel
                        ? 'bg-red-950/40 border-red-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSel ? 'text-red-400' : 'text-slate-500'}`} />
                    <strong className="block text-xs font-bold">{item.label}</strong>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resulting Optimal Build Preview */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-red-950/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider font-mono">
                Configuración Generada
              </span>
              <span className="text-sm font-bold text-white font-mono">
                Total Aprox: ~${totalMin} - ${totalMax} USD
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">GPU:</span>
                <strong className="text-white truncate block">{optimalResult.build.gpu?.name}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">CPU:</span>
                <strong className="text-white truncate block">{optimalResult.build.cpu?.name}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Placa Base:</span>
                <strong className="text-white truncate block">{optimalResult.build.motherboard?.name}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Fuente & Case:</span>
                <strong className="text-white truncate block">
                  {optimalResult.build.psu?.name.split('(')[0]} · {optimalResult.build.case?.name.split('(')[0]}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleApply}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-600/30 active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>Cargar este Ensamble en el Constructor y Visor 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
};
