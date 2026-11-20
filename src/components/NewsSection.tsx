import React, { useState, useMemo } from 'react';
import { Search, Flame, Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import { NewsArticle, HardwareCategory } from '../types';

interface NewsSectionProps {
  articles: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onGoToBuilder: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  articles,
  onSelectArticle,
  bookmarks,
  onToggleBookmark,
  onGoToBuilder
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HardwareCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  const categories: { id: HardwareCategory; label: string }[] = [
    { id: 'all', label: 'Todas las Noticias' },
    { id: 'gpu', label: 'Tarjetas Gráficas' },
    { id: 'cpu', label: 'Procesadores' },
    { id: 'motherboard', label: 'Placas & RAM' },
    { id: 'storage', label: 'Almacenamiento' },
    { id: 'display', label: 'Monitores' }
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      if (showOnlyBookmarks && !bookmarks.includes(article.id)) return false;
      if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(q) ||
        article.subtitle.toLowerCase().includes(q) ||
        article.categoryLabel.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q)
      );
    });
  }, [articles, selectedCategory, searchQuery, showOnlyBookmarks, bookmarks]);

  const featuredArticle = useMemo(() => {
    return filteredArticles.find(a => a.isFeatured) || filteredArticles[0];
  }, [filteredArticles]);

  const secondaryArticles = useMemo(() => {
    if (!featuredArticle) return [];
    return filteredArticles.filter(a => a.id !== featuredArticle.id);
  }, [filteredArticles, featuredArticle]);

  return (
    <div className="space-y-10">
      {/* Search and Filter Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id && !showOnlyBookmarks;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setShowOnlyBookmarks(false);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          <button
            onClick={() => setShowOnlyBookmarks(!showOnlyBookmarks)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all flex items-center gap-1.5 ${
              showOnlyBookmarks
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarks ? 'fill-white' : ''}`} />
            Guardados ({bookmarks.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar noticias, RTX 50, Ryzen..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/90 text-white border border-slate-800 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="py-20 text-center space-y-3">
          <p className="text-slate-400 text-sm">No se encontraron artículos con los criterios seleccionados.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setShowOnlyBookmarks(false);
            }}
            className="text-xs font-semibold text-red-400 hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <>
          {/* Tier 1: Lead Story (Dominant Headline + Big Visual Anchor) */}
          {featuredArticle && !showOnlyBookmarks && (
            <article
              onClick={() => onSelectArticle(featuredArticle)}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 hover:border-red-500/50 transition-all duration-300 shadow-sm hover:shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              {/* Image side */}
              <div className="lg:col-span-7 relative overflow-hidden bg-slate-950 aspect-[16/10] lg:aspect-auto">
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.imageAlt}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-white border border-red-500/40">
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                  <span>Reportaje Destacado</span>
                </div>
              </div>

              {/* Text Side */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-red-400">{featuredArticle.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredArticle.date}</span>
                    <span aria-hidden="true">·</span>
                    <span>{featuredArticle.readTime}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white group-hover:text-red-400 transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {featuredArticle.subtitle}
                  </p>

                  {/* Highlights snippet */}
                  {featuredArticle.specsHighlight && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      {featuredArticle.specsHighlight.slice(0, 3).map((sh, idx) => (
                        <div key={idx} className="text-[11px] font-mono text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-750">
                          <span className="text-slate-400 mr-1">{sh.label}:</span>
                          <strong className="font-bold text-white">{sh.value}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">
                    Por {featuredArticle.author}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 group-hover:translate-x-1 transition-transform">
                    <span>Leer análisis completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Tier 2: Secondary Features Grid */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>{showOnlyBookmarks ? 'Artículos Guardados' : 'Últimas Novedades de Hardware'}</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {secondaryArticles.length + (showOnlyBookmarks ? (featuredArticle ? 1 : 0) : 0)} artículos
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showOnlyBookmarks && featuredArticle ? [featuredArticle, ...secondaryArticles] : secondaryArticles).map(article => {
                const isBookmarked = bookmarks.includes(article.id);
                return (
                  <article
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="group cursor-pointer rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-red-500/40 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-lg"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                        <img
                          src={article.imageUrl}
                          alt={article.imageAlt}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(article.id);
                          }}
                          className={`absolute top-3 right-3 p-1.5 rounded-md backdrop-blur-md transition-all ${
                            isBookmarked
                              ? 'bg-red-600 text-white'
                              : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-700/60'
                          }`}
                          title={isBookmarked ? 'Guardado' : 'Guardar'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-white' : ''}`} />
                        </button>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-red-400">{article.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span>{article.date}</span>
                        </div>

                        <h4 className="text-base font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h4>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {article.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                      <span>{article.readTime}</span>
                      <span className="font-semibold text-red-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Ver informe <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Builder Promo Section Banner */}
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-2xl text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span>Configurador Núcleo</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ¿Planeando armar tu PC? Configura con precios aproximados y prueba de cuellos de botella
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Selecciona componentes de un catálogo extendido, revisa compatibilidad en tiempo real, analiza FPS estimados y compara tu presupuesto en tu moneda local.
              </p>
            </div>
            <button
              onClick={onGoToBuilder}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-md shadow-red-600/30 transition-all whitespace-nowrap shrink-0 active:scale-98"
            >
              Ir a Armar tu PC
            </button>
          </div>
        </>
      )}
    </div>
  );
};
