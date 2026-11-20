import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export const Footer: React.FC<{
  onTabChange: (tab: 'news' | 'builder' | 'radar' | 'game') => void;
}> = ({ onTabChange }) => {
  return (
    <footer className="mt-20 border-t border-red-950/40 bg-slate-950 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-md shadow-red-600/30 border border-red-500/30 shrink-0 bg-red-600">
                <img
                  src="/assets/aistudio/image_08c4c239.png"
                  alt="Logo Núcleo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-base font-black tracking-tight text-white">
                NÚCLEO
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Plataforma digital especializada en noticias de hardware de PC, análisis de silicio, banco de pruebas y configurador de presupuestos con estimaciones aproximadas de mercado.
            </p>
          </div>

          {/* Quick Nav */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px] font-mono">
              Navegación
            </div>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => onTabChange('news')}
                  className="hover:text-red-400 transition-colors"
                >
                  Noticias & Hardware
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('builder')}
                  className="hover:text-red-400 transition-colors font-medium text-slate-200"
                >
                  Armar tu PC (Precios Aprox.)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('radar')}
                  className="hover:text-red-400 transition-colors"
                >
                  Radar de Próximos Lanzamientos
                </button>
              </li>
              <li>
                <button
                  onClick={() => onTabChange('game')}
                  className="hover:text-amber-400 transition-colors font-bold text-amber-400/90 flex items-center gap-1"
                >
                  <span>🎮 Núcleo Legend (Juego 2D)</span>
                </button>
              </li>
              <li className="pt-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  <span>📱 App Android / Play Store lista</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Disclaimer Col */}
          <div className="space-y-2">
            <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px] font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              Aviso de Precios
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Los precios mostrados son estimaciones aproximadas basadas en MSRP internacional y cotizaciones comerciales promedio. No constituyen ofertas de venta directa.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Núcleo Hardware. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-red-500/80 font-mono">Silicon Architecture & Benchmark Intelligence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
