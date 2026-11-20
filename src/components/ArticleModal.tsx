import React, { useEffect } from 'react';
import { X, Bookmark, Share2, Check, ArrowUpRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { NewsArticle } from '../types';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  isBookmarked,
  onToggleBookmark
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex justify-center p-3 sm:p-6 lg:p-8 animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto z-10 text-slate-100">
        {/* Header Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-red-400 font-bold">{article.categoryLabel}</span>
            <span>·</span>
            <span>{article.date}</span>
            <span>·</span>
            <span>{article.readTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2 rounded-lg transition-colors border ${
                isBookmarked
                  ? 'bg-red-500/15 text-red-400 border-red-500/40'
                  : 'text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'Guardado en lecturas' : 'Guardar artículo'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-red-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
              title="Copiar enlace"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors ml-1"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          {/* Title and Deck */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              {article.title}
            </h1>
            <p className="mt-3 text-lg text-slate-300 font-normal leading-relaxed">
              {article.subtitle}
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-400 border-b border-slate-800/80 pb-4">
              <span>Por <strong className="text-slate-200 font-medium">{article.author}</strong></span>
              {article.estimatedPrice && (
                <>
                  <span>·</span>
                  <span className="font-mono text-red-400 font-bold">
                    Precio Estimado de Referencia: {article.estimatedPrice}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
            <img
              src={article.imageUrl}
              alt={article.imageAlt}
              className="w-full h-72 sm:h-96 object-cover"
              referrerPolicy="no-referrer"
            />
            <p className="px-4 py-2.5 text-xs text-slate-400 bg-slate-900 border-t border-slate-800 italic">
              {article.imageAlt}
            </p>
          </div>

          {/* Key Specs Card Grid */}
          {article.specsHighlight && article.specsHighlight.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                <span>Especificaciones Clave & Datos de Referencia</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {article.specsHighlight.map((spec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-750"
                  >
                    <div className="text-xs text-slate-400">{spec.label}</div>
                    <div className="mt-1 text-sm font-bold text-white font-mono">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Article Text Content */}
          <div className="space-y-5 text-slate-300 leading-relaxed text-base">
            {article.content.map((paragraph, index) => (
              <p key={index} className="leading-7">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Benchmarks Section if available */}
          {article.benchmarks && article.benchmarks.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Rendimiento en Laboratorio & Benchmarks</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pruebas estandarizadas a resolución nativa con ajustes gráficos ultra sostenidos.
                </p>
              </div>

              {article.benchmarks.map((bench, bIdx) => {
                const maxScore = Math.max(...bench.items.map(it => it.score));
                return (
                  <div key={bIdx} className="space-y-2.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span>{bench.title}</span>
                      <span className="font-mono text-slate-500">{bench.unit}</span>
                    </div>

                    <div className="space-y-2">
                      {bench.items.map((item, itemIdx) => {
                        const pct = Math.round((item.score / maxScore) * 100);
                        return (
                          <div key={itemIdx} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className={item.isHighlight ? 'font-bold text-red-400' : 'text-slate-400'}>
                                {item.label}
                              </span>
                              <span className="font-mono font-bold text-white">
                                {item.score} {bench.unit}
                              </span>
                            </div>
                            <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.isHighlight
                                    ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500'
                                    : 'bg-slate-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pros & Cons */}
          {(article.pros || article.cons) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.pros && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Puntos Fuertes
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {article.pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {article.cons && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Puntos a Considerar
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {article.cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">−</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer regarding prices and availability */}
          <div className="text-xs text-slate-500 border-t border-slate-800 pt-4 flex items-center justify-between">
            <span>Fuente y análisis: Equipo técnico de Núcleo Hardware Lab.</span>
            <span>Precios aproximados de referencia global.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
