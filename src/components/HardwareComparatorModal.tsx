import React, { useState, useMemo, useEffect } from 'react';
import { X, SlidersHorizontal, ArrowRight, Zap, Check, ArrowRightLeft } from 'lucide-react';
import { PCComponent } from '../types';
import { COMPONENTS_DATABASE } from '../data/componentsData';

interface HardwareComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareComparatorModal: React.FC<HardwareComparatorModalProps> = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem('nucleo_comparator_used', 'true');
      } catch {}
    }
  }, [isOpen]);

  const [compType, setCompType] = useState<'gpu' | 'cpu'>('gpu');

  const pool = useMemo(() => {
    return COMPONENTS_DATABASE.filter(c => c.category === compType);
  }, [compType]);

  const [leftId, setLeftId] = useState<string>('gpu-rtx-4070-super-12gb');
  const [rightId, setRightId] = useState<string>('gpu-rx-7800-xt-16gb');

  const handleTypeChange = (type: 'gpu' | 'cpu') => {
    setCompType(type);
    const newPool = COMPONENTS_DATABASE.filter(c => c.category === type);
    if (newPool.length >= 2) {
      setLeftId(newPool[0].id);
      setRightId(newPool[1].id);
    }
  };

  const leftComp = useMemo(() => pool.find(c => c.id === leftId) || pool[0], [pool, leftId]);
  const rightComp = useMemo(() => pool.find(c => c.id === rightId) || pool[1] || pool[0], [pool, rightId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-3 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto z-10 text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-600/20 text-red-400">
              <SlidersHorizontal className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Comparador Cara a Cara
              </h3>
              <p className="text-xs text-slate-400">
                Compara especificaciones técnicas y precios aproximados de dos componentes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Switcher */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-center gap-2">
          <button
            onClick={() => handleTypeChange('gpu')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              compType === 'gpu'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Tarjetas Gráficas (GPU)
          </button>
          <button
            onClick={() => handleTypeChange('cpu')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              compType === 'cpu'
                ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            Procesadores (CPU)
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Component Selection Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase">Componente A</label>
              <select
                value={leftComp?.id}
                onChange={e => setLeftId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {pool.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (${c.priceMinUSD} - ${c.priceMaxUSD} USD)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400 uppercase">Componente B</label>
              <select
                value={rightComp?.id}
                onChange={e => setRightId(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {pool.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (${c.priceMinUSD} - ${c.priceMaxUSD} USD)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          {leftComp && rightComp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Left Card */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-850 space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {leftComp.brand} · {leftComp.tier}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {leftComp.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {leftComp.shortDesc}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Precio Estimado de Referencia
                  </div>
                  <div className="text-lg font-bold font-mono text-red-400">
                    ${leftComp.priceMinUSD} - ${leftComp.priceMaxUSD} USD
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Consumo: {leftComp.tdpWatts} W TDP
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    Especificaciones Detalladas
                  </span>
                  <div className="space-y-1 text-xs">
                    {Object.entries(leftComp.specs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between py-1 border-b border-slate-800"
                      >
                        <span className="text-slate-400">{k}</span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Card */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-850 space-y-4">
                <div>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {rightComp.brand} · {rightComp.tier}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {rightComp.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {rightComp.shortDesc}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Precio Estimado de Referencia
                  </div>
                  <div className="text-lg font-bold font-mono text-red-400">
                    ${rightComp.priceMinUSD} - ${rightComp.priceMaxUSD} USD
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Consumo: {rightComp.tdpWatts} W TDP
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">
                    Especificaciones Detalladas
                  </span>
                  <div className="space-y-1 text-xs">
                    {Object.entries(rightComp.specs).map(([k, v]) => (
                      <div
                        key={k}
                        className="flex justify-between py-1 border-b border-slate-800"
                      >
                        <span className="text-slate-400">{k}</span>
                        <span className="font-semibold text-slate-200 font-mono">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
