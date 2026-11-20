import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Check, Zap, Layers, Info } from 'lucide-react';
import { PCComponent, ComponentCategory, CurrencyConfig } from '../types';
import { formatPrice } from '../utils/builderUtils';

interface ComponentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ComponentCategory | null;
  categoryName: string;
  allComponents: PCComponent[];
  selectedComponent: PCComponent | null;
  onSelectComponent: (component: PCComponent) => void;
  currency: CurrencyConfig;
}

export const ComponentPickerModal: React.FC<ComponentPickerModalProps> = ({
  isOpen,
  onClose,
  category,
  categoryName,
  allComponents,
  selectedComponent,
  onSelectComponent,
  currency
}) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categoryComponents = useMemo(() => {
    if (!category) return [];
    return allComponents.filter(c => c.category === category);
  }, [allComponents, category]);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(categoryComponents.map(c => c.brand)));
  }, [categoryComponents]);

  const filteredComponents = useMemo(() => {
    return categoryComponents.filter(comp => {
      if (tierFilter !== 'all' && comp.tier !== tierFilter) return false;
      if (brandFilter !== 'all' && comp.brand !== brandFilter) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.brand.toLowerCase().includes(q) ||
        comp.shortDesc.toLowerCase().includes(q) ||
        (comp.socket && comp.socket.toLowerCase().includes(q))
      );
    });
  }, [categoryComponents, tierFilter, brandFilter, search]);

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-3 sm:p-6 lg:p-8 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto z-10 text-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <h3 className="text-lg font-bold text-white">
                Seleccionar {categoryName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Catálogo de opciones disponibles con precios aproximados de referencia.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por modelo, socket, VRAM..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Brand Filter */}
          {uniqueBrands.length > 1 && (
            <select
              value={brandFilter}
              onChange={e => setBrandFilter(e.target.value)}
              className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
            >
              <option value="all">Todas las marcas</option>
              {uniqueBrands.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="text-xs bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
          >
            <option value="all">Todas las gamas</option>
            <option value="Ultra Económica">Ultra Económica</option>
            <option value="Entrada">Entrada</option>
            <option value="Gama Media">Gama Media</option>
            <option value="Gama Media-Alta">Gama Media-Alta</option>
            <option value="Gama Alta">Gama Alta</option>
            <option value="Entusiasta">Entusiasta</option>
          </select>
        </div>

        {/* List of Components */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredComponents.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No se encontraron componentes que coincidan con la búsqueda.
            </div>
          ) : (
            filteredComponents.map(comp => {
              const isSelected = selectedComponent?.id === comp.id;
              const formattedMin = formatPrice(comp.priceMinUSD, currency);
              const formattedMax = formatPrice(comp.priceMaxUSD, currency);

              return (
                <div
                  key={comp.id}
                  onClick={() => {
                    onSelectComponent(comp);
                    onClose();
                  }}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'border-red-500 bg-red-950/20'
                      : 'border-slate-800 bg-slate-800/40 hover:border-red-500/40'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-red-400 font-mono">
                        {comp.brand}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">
                        {comp.tier}
                      </span>
                      {comp.socket && (
                        <>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs font-mono font-medium text-amber-400">
                            Socket {comp.socket}
                          </span>
                        </>
                      )}
                      {comp.ramType && (
                        <>
                          <span className="text-xs text-slate-500">·</span>
                          <span className="text-xs font-mono font-medium text-emerald-400">
                            {comp.ramType}
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                      {comp.name}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {comp.shortDesc}
                    </p>

                    {/* Quick Specs Snippet */}
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-slate-400">
                      {Object.entries(comp.specs)
                        .slice(0, 3)
                        .map(([k, v]) => (
                          <span key={k} className="bg-slate-800 px-1.5 py-0.5 rounded">
                            {k}: <strong className="text-slate-200">{v}</strong>
                          </span>
                        ))}
                      {comp.tdpWatts > 0 && (
                        <span className="bg-slate-800 px-1.5 py-0.5 rounded flex items-center gap-0.5 text-amber-400">
                          <Zap className="w-3 h-3" />
                          {comp.tdpWatts}W TDP
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price and Select Action */}
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">
                        Precio Aprox.
                      </div>
                      <div className="text-sm font-bold text-white font-mono">
                        {formattedMin} - {formattedMax}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-700 text-white hover:bg-red-600'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Seleccionado
                        </>
                      ) : (
                        'Elegir'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
