import React, { useState, useEffect } from 'react';
import {
  Flame,
  Star,
  Users,
  Sparkles,
  ExternalLink,
  PlusCircle,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  Cpu,
  Layers,
  ArrowRight,
  Send,
  Trophy
} from 'lucide-react';
import { ComponentCategory, PCComponent, CurrencyConfig, UserProfile } from '../types';
import { COMPONENTS_DATABASE, BUILD_PRESETS } from '../data/componentsData';
import { formatPrice } from '../utils/builderUtils';

export interface CommunityRig {
  id: string;
  title: string;
  author: string;
  description: string;
  likes: number;
  tags: string[];
  tierLabel: string;
  componentIds: Partial<Record<ComponentCategory, string>>;
  date: string;
}

const LEGACY_COMPONENT_ID_MAP: Record<string, string> = {
  'cpu-7800x3d': 'cpu-r7-7800x3d',
  'cpu-7600x': 'cpu-r5-7600x',
  'cpu-14900k': 'cpu-core-ultra-9-285k',
  'gpu-4090': 'gpu-rtx-4090-24gb',
  'gpu-rx7800xt': 'gpu-rx-7800-xt-16gb',
  'gpu-4060': 'gpu-rtx-4060-8gb',
  'mb-x670e-taichi': 'mb-x870-asus-tuf',
  'mb-z790-aorus': 'mb-z890-msi-carbon',
  'ram-ddr5-32-6000': 'ram-ddr5-32gb-6000-cl30',
  'ram-ddr5-64-6000': 'ram-ddr5-64gb-6400',
  'ssd-nvme-2tb-pcie4': 'ssd-samsung-990-pro-2tb',
  'ssd-nvme-1tb-pcie4': 'ssd-wd-black-sn770-1tb',
  'ssd-nvme-4tb-pcie4': 'ssd-crucial-t705-2tb-gen5',
  'cool-aio-360-kraken': 'cooler-nzxt-kraken-elite-360',
  'cool-aio-420-liquid': 'cooler-arctic-liquid-iii-360',
  'cool-air-peerless': 'cooler-deepcool-ak620',
  'psu-1000w-gold': 'psu-corsair-rm1000x-shift',
  'psu-750w-gold': 'psu-corsair-rm750e-atx3',
  'psu-1200w-platinum': 'psu-seasonic-vertex-gx1200',
  'psu-650w-bronze': 'psu-evga-600-bronze',
  'case-lianli-o11': 'case-lian-li-o11-dynamic-evo',
  'case-nzxt-h5-flow': 'case-corsair-4000d-airflow'
};

function migrateRigIds(rig: CommunityRig): CommunityRig {
  const migratedIds: Partial<Record<ComponentCategory, string>> = {};
  Object.entries(rig.componentIds).forEach(([cat, id]) => {
    if (!id) return;
    migratedIds[cat as ComponentCategory] = LEGACY_COMPONENT_ID_MAP[id] || id;
  });
  return { ...rig, componentIds: migratedIds };
}

const DEFAULT_COMMUNITY_RIGS: CommunityRig[] = [
  {
    id: 'rig-snow-white-titan',
    title: 'El Titán Blanco Nieve 4K',
    author: 'SnowWhite_Enthusiast',
    description: 'Ensamble de estética nórdica pura. RTX 4090 combinada con el Ryzen 7 7800X3D y refrigeración líquida de 360mm en un chasis O11 Dynamic EVO.',
    likes: 342,
    tags: ['Blanca Nieve', 'Gama Alta 4K', 'Silenciosa'],
    tierLabel: 'Entusiasta 4K',
    componentIds: {
      cpu: 'cpu-r7-7800x3d',
      gpu: 'gpu-rtx-4090-24gb',
      motherboard: 'mb-x870-asus-tuf',
      ram: 'ram-ddr5-32gb-6000-cl30',
      storage: 'ssd-samsung-990-pro-2tb',
      cooler: 'cooler-nzxt-kraken-elite-360',
      psu: 'psu-corsair-rm1000x-shift',
      case: 'case-lian-li-o11-dynamic-evo'
    },
    date: 'Hace 2 días'
  },
  {
    id: 'rig-sweet-spot-am5',
    title: 'El Rey Calidad/Precio 1440p',
    author: 'BudgetOverclocker',
    description: 'La combinación definitiva para jugar a más de 120 FPS en resolución 1440p sin malgastar presupuesto. Ryzen 5 7600X + RX 7800 XT de 16GB.',
    likes: 289,
    tags: ['Calidad/Precio', '1440p', 'AM5'],
    tierLabel: 'Gama Media-Alta',
    componentIds: {
      cpu: 'cpu-r5-7600x',
      gpu: 'gpu-rx-7800-xt-16gb',
      motherboard: 'mb-b650-tomahawk',
      ram: 'ram-ddr5-32gb-6000-cl30',
      storage: 'ssd-wd-black-sn770-1tb',
      cooler: 'cooler-deepcool-ak620',
      psu: 'psu-corsair-rm750e-atx3',
      case: 'case-fractal-north'
    },
    date: 'Hace 4 días'
  },
  {
    id: 'rig-ai-workstation-beast',
    title: 'Estación de Render 3D & LLM Local',
    author: 'SiliconAI_Architect',
    description: 'Diseñada para entrenar modelos locales, render en Blender y gaming extremo en 4K con 64GB DDR5 y la potente RTX 4090 de 24GB VRAM.',
    likes: 215,
    tags: ['Creador & IA', 'Render 3D', '64GB'],
    tierLabel: 'Creador Extremo',
    componentIds: {
      cpu: 'cpu-core-ultra-9-285k',
      gpu: 'gpu-rtx-4090-24gb',
      motherboard: 'mb-z890-msi-carbon',
      ram: 'ram-ddr5-64gb-6400',
      storage: 'ssd-crucial-t705-2tb-gen5',
      cooler: 'cooler-arctic-liquid-iii-360',
      psu: 'psu-seasonic-vertex-gx1200',
      case: 'case-lian-li-o11-dynamic-evo'
    },
    date: 'Hace 1 semana'
  },
  {
    id: 'rig-esports-budget-240hz',
    title: 'Monstruo Esports 240Hz ($850)',
    author: 'TenZ_Reflexes',
    description: 'Máximos fotogramas por segundo en Valorant, CS2 y Fortnite. Baja latencia en memorias y gran flujo de aire con disipación doble torre.',
    likes: 178,
    tags: ['Esports', 'Económica', '240Hz'],
    tierLabel: 'Competitiva',
    componentIds: {
      cpu: 'cpu-r5-7600x',
      gpu: 'gpu-rtx-4060-8gb',
      motherboard: 'mb-b650-tomahawk',
      ram: 'ram-ddr5-32gb-6000-cl30',
      storage: 'ssd-wd-black-sn770-1tb',
      cooler: 'cooler-deepcool-ak620',
      psu: 'psu-evga-600-bronze',
      case: 'case-corsair-4000d-airflow'
    },
    date: 'Hace 1 semana'
  }
];

interface CommunityShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadBuild: (build: Partial<Record<ComponentCategory, PCComponent>>, buildName: string) => void;
  currentBuild: Partial<Record<ComponentCategory, PCComponent>>;
  currentBuildName: string;
  currency: CurrencyConfig;
  userProfile?: UserProfile;
}

export const CommunityShowcaseModal: React.FC<CommunityShowcaseModalProps> = ({
  isOpen,
  onClose,
  onLoadBuild,
  currentBuild,
  currentBuildName,
  currency,
  userProfile
}) => {
  const [rigs, setRigs] = useState<CommunityRig[]>(() => {
    try {
      const stored = localStorage.getItem('nucleo_community_rigs');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(migrateRigIds);
        }
      }
    } catch {}
    return DEFAULT_COMMUNITY_RIGS;
  });

  const [upvotedIds, setUpvotedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nucleo_upvoted_rigs');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPublishingOpen, setIsPublishingOpen] = useState(false);
  const [publishDescription, setPublishDescription] = useState('');
  const [publishTag, setPublishTag] = useState('Personalizada');
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('nucleo_community_rigs', JSON.stringify(rigs));
    } catch {}
  }, [rigs]);

  useEffect(() => {
    try {
      localStorage.setItem('nucleo_upvoted_rigs', JSON.stringify(upvotedIds));
    } catch {}
  }, [upvotedIds]);

  if (!isOpen) return null;

  const handleToggleLike = (rigId: string) => {
    const hasLiked = upvotedIds.includes(rigId);
    setUpvotedIds(prev => (hasLiked ? prev.filter(id => id !== rigId) : [...prev, rigId]));
    setRigs(prev =>
      prev.map(r => {
        if (r.id === rigId) {
          return { ...r, likes: hasLiked ? r.likes - 1 : r.likes + 1 };
        }
        return r;
      })
    );
  };

  const handleLoadRigToConfigurator = (rig: CommunityRig) => {
    const reconstructed: Partial<Record<ComponentCategory, PCComponent>> = {};
    Object.entries(rig.componentIds).forEach(([cat, id]) => {
      const found = COMPONENTS_DATABASE.find(c => c.id === id);
      if (found) {
        reconstructed[cat as ComponentCategory] = found;
      }
    });
    onLoadBuild(reconstructed, rig.title);
    onClose();
  };

  const handlePublishMyRig = (e: React.FormEvent) => {
    e.preventDefault();
    const ids: Partial<Record<ComponentCategory, string>> = {};
    Object.entries(currentBuild).forEach(([cat, comp]) => {
      if (comp) ids[cat as ComponentCategory] = comp.id;
    });

    const newRig: CommunityRig = {
      id: `rig-user-${Date.now()}`,
      title: currentBuildName || 'Ensamble de la Comunidad',
      author: userProfile?.gamerTag || 'Entusiasta_Anónimo',
      description: publishDescription.trim() || 'Configuración balanceada armada y testeada en Núcleo Hardware.',
      likes: 1,
      tags: [publishTag, 'Comunidad'],
      tierLabel: 'Comunidad',
      componentIds: ids,
      date: 'Recién publicado'
    };

    setRigs(prev => [newRig, ...prev]);
    setUpvotedIds(prev => [...prev, newRig.id]);
    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setIsPublishingOpen(false);
      setPublishDescription('');
    }, 1500);
  };

  const filteredRigs = rigs.filter(r => {
    const matchesTag = filterTag === 'all' || r.tags.some(t => t.toLowerCase().includes(filterTag.toLowerCase()));
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-red-950/70 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border-b border-red-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-wide">
                  SALA DE EXHIBICIÓN DE LA COMUNIDAD
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Rigs Showcase
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Descubre, vota o carga ensambles reales creados por otros entusiastas de la comunidad.
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

        {/* Filter Strip & Publish Trigger */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por título, autor o piezas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Tag filters */}
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none"
            >
              <option value="all">Todas las Categorías</option>
              <option value="4K">4K Ultra</option>
              <option value="1440p">1440p Sweet Spot</option>
              <option value="Blanca">Blanca Nieve</option>
              <option value="Económica">Económica / Calidad</option>
              <option value="IA">Creador & IA</option>
            </select>

            {/* Publish My Build Button */}
            <button
              onClick={() => setIsPublishingOpen(!isPublishingOpen)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Publicar Mi Ensamble</span>
            </button>
          </div>
        </div>

        {/* Inline Publish Form Drawer */}
        {isPublishingOpen && (
          <form onSubmit={handlePublishMyRig} className="p-4 bg-slate-900 border-b border-red-950/60 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono text-red-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publicar: &quot;{currentBuildName}&quot;</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsPublishingOpen(false)}
                className="text-slate-500 hover:text-white text-xs font-mono"
              >
                Cancelar
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Descripción o Consejo del Ensamble</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pensada para jugar en 1440p con temperaturas heladas..."
                  value={publishDescription}
                  onChange={e => setPublishDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase">Etiqueta Principal</label>
                <select
                  value={publishTag}
                  onChange={e => setPublishTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  <option value="1440p">1440p Sweet Spot</option>
                  <option value="4K">Gama Alta 4K</option>
                  <option value="Blanca">Blanca Nieve</option>
                  <option value="Económica">Económica</option>
                  <option value="IA">Creador & IA</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-mono">
                Se publicará bajo tu alias: <strong className="text-white">{userProfile?.gamerTag || 'Entusiasta'}</strong>
              </span>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg font-mono font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
              >
                {publishedSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>¡Ensamble Publicado!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Confirmar y Enviar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Rig Cards List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {filteredRigs.map((rig, idx) => {
            const hasLiked = upvotedIds.includes(rig.id);
            const cpu = COMPONENTS_DATABASE.find(c => c.id === rig.componentIds.cpu);
            const gpu = COMPONENTS_DATABASE.find(c => c.id === rig.componentIds.gpu);
            const ram = COMPONENTS_DATABASE.find(c => c.id === rig.componentIds.ram);
            const cooler = COMPONENTS_DATABASE.find(c => c.id === rig.componentIds.cooler);

            return (
              <div
                key={rig.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      #{idx + 1}
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-red-400 transition-colors">
                      {rig.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-red-500/10 text-red-300 border border-red-500/30">
                      {rig.tierLabel}
                    </span>
                    {rig.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {rig.description}
                  </p>

                  {/* Components snippet */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-300 font-mono flex-wrap pt-1">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-red-400 font-semibold">
                      {cpu ? cpu.name : 'CPU Custom'}
                    </span>
                    <span>+</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-semibold">
                      {gpu ? gpu.name : 'GPU Custom'}
                    </span>
                    <span>+</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {ram ? ram.name : 'RAM DDR5'}
                    </span>
                    <span>+</span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {cooler ? cooler.name : 'Cooler'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                    <span>Por: <strong className="text-slate-300">{rig.author}</strong></span>
                    <span>•</span>
                    <span>{rig.date}</span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Upvote button */}
                  <button
                    onClick={() => handleToggleLike(rig.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      hasLiked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${hasLiked ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                    <span>{rig.likes}</span>
                  </button>

                  {/* Load Build button */}
                  <button
                    onClick={() => handleLoadRigToConfigurator(rig)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-slate-800 hover:bg-red-600 border border-slate-700 hover:border-red-500 transition-all shadow-sm active:scale-95 group/btn"
                  >
                    <span>Cargar en mi PC</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
