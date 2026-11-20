import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Fan,
  CircuitBoard,
  MemoryStick,
  Tv,
  HardDrive,
  Zap,
  Box,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  BookmarkCheck,
  Trash2,
  Sparkles,
  Info,
  Gauge,
  Sliders,
  Flame,
  ArrowRightLeft,
  Bot,
  Eye,
  EyeOff,
  Share2,
  DollarSign,
  Activity,
  Download,
  LineChart,
  TrendingDown,
  Users,
  Cable,
  Palette
} from 'lucide-react';
import {
  ComponentCategory,
  PCComponent,
  BuildPreset,
  CurrencyConfig,
  UserBuild,
  BuildHistoryEntry,
  UserProfile
} from '../types';
import { Star } from 'lucide-react';
import {
  COMPONENTS_DATABASE,
  BUILD_PRESETS,
  CURRENCIES
} from '../data/componentsData';
import {
  calculateBuildStats,
  checkCompatibility,
  formatPrice,
  calculateBottleneckAndFps,
  analyzeBudgetDistribution,
  calculateElectricityStats,
  checkClearance,
  generateExportBuild,
  generateHistoricalPriceData
} from '../utils/builderUtils';
import { ComponentPickerModal } from './ComponentPickerModal';
import { PC3DViewer } from './PC3DViewer';
import { PriceHistoryChart } from './PriceHistoryChart';
import { PerformanceEstimatesChart } from './PerformanceEstimatesChart';
import { SmartAutoBuilderModal } from './SmartAutoBuilderModal';
import { DualBuildVersusModal } from './DualBuildVersusModal';
import { RigShareCardModal } from './RigShareCardModal';
import { PSUCableGuideModal } from './PSUCableGuideModal';
import { CommunityShowcaseModal } from './CommunityShowcaseModal';

const CATEGORIES_CONFIG: {
  key: ComponentCategory;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { key: 'cpu', name: 'Procesador (CPU)', icon: Cpu, description: 'Cerebro de cálculo y frecuencias' },
  { key: 'cooler', name: 'Refrigeración', icon: Fan, description: 'Disipador por aire o líquida AIO' },
  { key: 'motherboard', name: 'Placa Base', icon: CircuitBoard, description: 'Zócalo, VRM y conectividad' },
  { key: 'ram', name: 'Memoria RAM', icon: MemoryStick, description: 'Velocidad MT/s y latencia CL' },
  { key: 'gpu', name: 'Tarjeta Gráfica (GPU)', icon: Tv, description: 'Fuerza gráfica, VRAM y DLSS/FSR' },
  { key: 'storage', name: 'Almacenamiento (SSD)', icon: HardDrive, description: 'NVMe PCIe Gen4 o Gen5' },
  { key: 'psu', name: 'Fuente de Poder (PSU)', icon: Zap, description: 'Vataje nominal y certificación' },
  { key: 'case', name: 'Gabinete (Chasis)', icon: Box, description: 'Flujo de aire y compatibilidad' }
];

interface PCBuilderSectionProps {
  onOpenAiChat: () => void;
  build: Partial<Record<ComponentCategory, PCComponent>>;
  setBuild: React.Dispatch<React.SetStateAction<Partial<Record<ComponentCategory, PCComponent>>>>;
  buildCustomName: string;
  setBuildCustomName: (name: string) => void;
  savedBuilds?: UserBuild[];
  setSavedBuilds?: React.Dispatch<React.SetStateAction<UserBuild[]>>;
  onRecordHistory?: (entry: BuildHistoryEntry) => void;
  userProfile?: UserProfile;
  onToggleFavoriteBuild?: (buildId: string) => void;
}

export const PCBuilderSection: React.FC<PCBuilderSectionProps> = ({
  onOpenAiChat,
  build,
  setBuild,
  buildCustomName,
  setBuildCustomName,
  savedBuilds: propSavedBuilds,
  setSavedBuilds: propSetSavedBuilds,
  onRecordHistory,
  userProfile,
  onToggleFavoriteBuild
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(
    () => CURRENCIES.find(c => c.code === userProfile?.defaultCurrencyCode) || CURRENCIES[0]
  );
  const [activeTierFilter, setActiveTierFilter] = useState<string>('all');
  const [activeToolTab, setActiveToolTab] = useState<'budget' | 'fps' | 'history' | 'electricity' | 'optimizer' | 'monitors' | 'export'>('budget');
  const [isAutoBuilderOpen, setIsAutoBuilderOpen] = useState(false);
  const [isVersusOpen, setIsVersusOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [isPsuGuideOpen, setIsPsuGuideOpen] = useState(false);
  const [isCommunityShowcaseOpen, setIsCommunityShowcaseOpen] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState<boolean>(true);
  const [showPriceHistory, setShowPriceHistory] = useState<boolean>(true);
  const [showPerformanceChart, setShowPerformanceChart] = useState<boolean>(true);
  const [fpsResolution, setFpsResolution] = useState<'1080p' | '1440p' | '4k'>('1440p');
  const [electricityHours, setElectricityHours] = useState<number>(4);
  const [electricityRate, setElectricityRate] = useState<number>(0.15);
  const [exportFormat, setExportFormat] = useState<'whatsapp' | 'reddit' | 'plain'>('whatsapp');
  const [exportCopied, setExportCopied] = useState<boolean>(false);

  const [pickerCategory, setPickerCategory] = useState<ComponentCategory | null>(null);

  // Fallback local saved builds if rendered standalone without App state
  const [localSavedBuilds, setLocalSavedBuilds] = useState<UserBuild[]>(() => {
    try {
      const stored = localStorage.getItem('nucleo_saved_builds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const savedBuilds = propSavedBuilds ?? localSavedBuilds;
  const setSavedBuilds = propSetSavedBuilds ?? setLocalSavedBuilds;

  const [copied, setCopied] = useState(false);
  const [saveSuccessName, setSaveSuccessName] = useState<string | null>(null);

  useEffect(() => {
    if (!propSetSavedBuilds) {
      try {
        localStorage.setItem('nucleo_saved_builds', JSON.stringify(savedBuilds));
      } catch {}
    }
  }, [savedBuilds, propSetSavedBuilds]);

  useEffect(() => {
    if (userProfile?.defaultCurrencyCode) {
      const matched = CURRENCIES.find(c => c.code === userProfile.defaultCurrencyCode);
      if (matched) setSelectedCurrency(matched);
    }
  }, [userProfile?.defaultCurrencyCode]);

  // Calculations
  const stats = calculateBuildStats(build);
  const compatibility = checkCompatibility(build);
  const selectedCount = Object.values(build).filter(Boolean).length;
  const bottleneckData = calculateBottleneckAndFps(build.cpu, build.gpu);
  const budgetTips = analyzeBudgetDistribution(build);

  const recordHistorySnapshot = (targetBuild: Partial<Record<ComponentCategory, PCComponent>>, name: string) => {
    if (!onRecordHistory) return;
    if (userProfile && userProfile.autoSaveBuilds === false) return;
    const count = Object.values(targetBuild).filter(Boolean).length;
    if (count === 0) return;
    const snapStats = calculateBuildStats(targetBuild);
    const summaryParts = [
      targetBuild.cpu?.name,
      targetBuild.gpu?.name,
      targetBuild.ram?.name
    ].filter(Boolean);
    onRecordHistory({
      id: 'hist-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      buildName: name,
      components: targetBuild,
      totalMinUSD: snapStats.minUSD,
      totalMaxUSD: snapStats.maxUSD,
      tdpWatts: snapStats.systemTdp,
      summary: summaryParts.length > 0 ? summaryParts.join(' · ') : `${count} componentes seleccionados`
    });
  };

  const handleSelectPreset = (preset: BuildPreset) => {
    const newBuild: Partial<Record<ComponentCategory, PCComponent>> = {};
    Object.entries(preset.componentIds).forEach(([cat, id]) => {
      const found = COMPONENTS_DATABASE.find(c => c.id === id);
      if (found) {
        newBuild[cat as ComponentCategory] = found;
      }
    });
    setBuild(newBuild);
    setBuildCustomName(preset.title);
    recordHistorySnapshot(newBuild, preset.title);
  };

  const handleRemoveComponent = (cat: ComponentCategory) => {
    setBuild(prev => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });
  };

  const handleClearBuild = () => {
    setBuild({});
  };

  const handleSaveBuild = () => {
    if (selectedCount === 0) return;
    const finalName = buildCustomName.trim() || 'Ensamble Núcleo';
    const newSaved: UserBuild = {
      id: 'build-' + Date.now(),
      name: finalName,
      createdAt: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      components: build
    };
    setSavedBuilds(prev => [newSaved, ...prev.slice(0, 9)]);
    recordHistorySnapshot(build, finalName);
    setSaveSuccessName(newSaved.name);
    setTimeout(() => setSaveSuccessName(null), 3000);
  };

  const handleLoadSavedBuild = (saved: UserBuild) => {
    setBuild(saved.components);
    setBuildCustomName(saved.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSavedBuild = (id: string) => {
    setSavedBuilds(prev => prev.filter(b => b.id !== id));
  };

  const handleCopySummary = () => {
    const lines = [
      `🔥 Presupuesto de Hardware (Estimado aprox.) - Núcleo`,
      `Ensamble: ${buildCustomName}`,
      `Rango Total Estimado: ${formatPrice(stats.minUSD, selectedCurrency)} - ${formatPrice(stats.maxUSD, selectedCurrency)}`,
      `Consumo Estimado (TDP): ~${stats.systemTdp} W (Fuente sugerida: ${stats.recommendedPsu}W+)`,
      `----------------------------------------`
    ];

    CATEGORIES_CONFIG.forEach(({ key, name }) => {
      const comp = build[key];
      if (comp) {
        lines.push(
          `• ${name}: ${comp.name} (~${formatPrice(comp.priceMinUSD, selectedCurrency)} - ${formatPrice(comp.priceMaxUSD, selectedCurrency)})`
        );
      } else {
        lines.push(`• ${name}: [Sin seleccionar]`);
      }
    });

    lines.push(`----------------------------------------`);
    lines.push(`Estado de Compatibilidad: ${compatibility.isCompatible ? '100% Compatible' : 'Revisar Advertencias'}`);
    if (bottleneckData) {
      lines.push(`Diagnóstico de Cuello de Botella: ${bottleneckData.summary}`);
    }
    lines.push(`* Nota: Precios referenciales aproximados para planificar presupuesto.`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredPresets = activeTierFilter === 'all'
    ? BUILD_PRESETS
    : BUILD_PRESETS.filter(p => p.tierCategory === activeTierFilter);

  const presetTiers = [
    { id: 'all', label: 'Todas las Gamas' },
    { id: 'Ultra Económica', label: 'Ultra Económica ($450)' },
    { id: 'Entrada Esports', label: 'Esports 1080p ($680)' },
    { id: 'Gama Media', label: 'Gama Media AM5 ($950)' },
    { id: 'Gama Media-Alta', label: '1440p Sweet Spot ($1,350)' },
    { id: 'Gama Alta 4K', label: 'Gama Alta 4K ($1,950)' },
    { id: 'Entusiasta Extrema', label: 'Entusiasta RTX 4090' },
    { id: 'Creador & IA', label: 'Creador & IA' }
  ];

  return (
    <div className="space-y-8">
      {/* Disclaimer Banner: Prices are approximate */}
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-200 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-red-600/20 text-red-400 shrink-0 mt-0.5 sm:mt-0">
            <Flame className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-xs leading-relaxed">
            <strong className="font-bold text-red-400">
              Precios Referenciales Aproximados:
            </strong>{' '}
            Los valores calculados representan estimaciones de mercado minorista (USD y conversión aproximada) para facilitarte la planificación de tu presupuesto antes de comprar en tu tienda local.
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs font-mono text-slate-400">Moneda:</span>
          <select
            value={selectedCurrency.code}
            onChange={e => {
              const found = CURRENCIES.find(c => c.code === e.target.value);
              if (found) setSelectedCurrency(found);
            }}
            className="text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-red-500 font-semibold"
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Enthusiast Quick Tools Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <button
          onClick={() => setIsAutoBuilderOpen(true)}
          className="p-3.5 rounded-xl border border-red-500/40 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 hover:border-red-500 text-left transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                <span>Generador Auto</span>
                <span className="text-[9px] font-mono font-bold uppercase bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded border border-red-500/30">
                  IA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Calcula el ensamble óptimo por presupuesto.
              </p>
            </div>
          </div>
          <span className="text-xs text-red-400 font-bold hidden sm:inline group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        <button
          onClick={() => setIsVersusOpen(true)}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-red-500/60 text-left transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-red-400 group-hover:scale-105 transition-transform">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                <span>Versus Cara a Cara</span>
                <span className="text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded border border-slate-700">
                  Dual
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Compara en FPS y precio con otra PC.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-bold hidden sm:inline group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        <button
          onClick={() => setIsShareCardOpen(true)}
          className="p-3.5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 hover:border-amber-400 text-left transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <span>Tarjeta HD (Rig Card)</span>
                <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                  Viral
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Póster para TikTok, Instagram y Discord.
              </p>
            </div>
          </div>
          <span className="text-xs text-amber-400 font-bold hidden sm:inline group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>

        <button
          onClick={() => setIsPsuGuideOpen(true)}
          className="p-3.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900 to-slate-900 hover:border-cyan-400 text-left transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <Cable className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors flex items-center gap-1.5">
                <span>Cables & Fuente (PSU)</span>
                <span className="text-[9px] font-mono font-bold uppercase bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                  ATX 3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verifica 12VHPWR y conectores EPS.
              </p>
            </div>
          </div>
          <span className="text-xs text-cyan-400 font-bold hidden sm:inline group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </div>

      {/* Community Showcase Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-red-950/30 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">
                SALA DE EXHIBICIÓN DE LA COMUNIDAD (RIGS SHOWCASE)
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Trending
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Explora los ensambles más votados por otros jugadores o publica el tuyo para recibir votos 🔥.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCommunityShowcaseOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Ver Ensambles de la Comunidad</span>
          <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
        </button>
      </div>

      {/* Pre-built Presets Strip for Every Tier */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-500" />
            <h3 className="text-base font-black text-white tracking-tight">
              Prearmadas Recomendadas por Gama
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Selecciona una plantilla lista para cargar componentes y presupuesto
          </span>
        </div>

        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {presetTiers.map(tier => (
            <button
              key={tier.id}
              onClick={() => setActiveTierFilter(tier.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all ${
                activeTierFilter === tier.id
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredPresets.map(preset => {
            const formattedMin = formatPrice(preset.estimatedPriceMin, selectedCurrency);
            const formattedMax = formatPrice(preset.estimatedPriceMax, selectedCurrency);

            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="group p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-red-500/60 hover:bg-slate-850 text-left transition-all flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-500/20">
                      {preset.badge}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {preset.targetResolution}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors mt-2">
                    {preset.title}
                  </h4>

                  <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                    {preset.subtitle}
                  </p>

                  <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-slate-950/60 px-2 py-1 rounded">
                    ⚡ {preset.fpsHighlights}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Estimado Aprox:</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {formattedMin} - {formattedMax}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visualizers Area: 3D Case & Interactive Price History Chart */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Gabinete 3D, Estimador de FPS (Recharts) & Precios
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShow3DViewer(!show3DViewer)}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
            >
              {show3DViewer ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-red-400" />
                  <span>Ocultar 3D</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Gabinete 3D</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowPerformanceChart(!showPerformanceChart)}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
            >
              {showPerformanceChart ? (
                <>
                  <Gauge className="w-3.5 h-3.5 text-red-400" />
                  <span>Ocultar FPS</span>
                </>
              ) : (
                <>
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span>Estimador de FPS</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowPriceHistory(!showPriceHistory)}
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
            >
              {showPriceHistory ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  <span>Ocultar Precios</span>
                </>
              ) : (
                <>
                  <LineChart className="w-3.5 h-3.5 text-slate-400" />
                  <span>Historial Precios</span>
                </>
              )}
            </button>
          </div>
        </div>

        {show3DViewer && (
          <PC3DViewer
            build={build}
            buildName={buildCustomName}
            onSelectCase={(caseComp) => setBuild(prev => ({ ...prev, case: caseComp }))}
            profileRgbMode={userProfile?.rgbLightingMode}
            profileSoundEnabled={userProfile?.soundEnabled}
            profileThemeAccent={userProfile?.themeAccent}
          />
        )}

        {showPerformanceChart && (
          <PerformanceEstimatesChart
            build={build}
            buildName={buildCustomName}
          />
        )}

        {showPriceHistory && (
          <PriceHistoryChart
            build={build}
            buildName={buildCustomName}
            currency={selectedCurrency}
          />
        )}
      </div>

      {/* Main Builder Grid: Slots (8 cols) + Diagnostics Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Component Slots List */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <input
                type="text"
                value={buildCustomName}
                onChange={e => setBuildCustomName(e.target.value)}
                className="text-base font-bold bg-transparent border-b border-dashed border-slate-700 text-white focus:outline-none focus:border-red-500 pb-0.5"
                placeholder="Nombre del ensamble"
              />
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400 font-mono">
                {selectedCount}/8 seleccionados
              </span>
              {selectedCount > 0 && (
                <button
                  onClick={handleClearBuild}
                  className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Vaciar
                </button>
              )}
            </div>
          </div>

          {CATEGORIES_CONFIG.map(({ key, name, icon: Icon, description }) => {
            const comp = build[key];

            return (
              <div
                key={key}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-750"
              >
                {/* Left side: Category Icon & Selected Component Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      comp
                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {name}
                      </span>
                      {comp && comp.socket && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-amber-500/10 text-amber-400 rounded">
                          {comp.socket}
                        </span>
                      )}
                      {comp && comp.ramType && (
                        <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded">
                          {comp.ramType}
                        </span>
                      )}
                    </div>

                    {comp ? (
                      <div className="mt-1">
                        <h4 className="text-sm font-bold text-white truncate">
                          {comp.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                          <span className="text-red-400 font-medium">{comp.tier}</span>
                          {comp.tdpWatts > 0 && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-amber-400">
                                {comp.tdpWatts}W TDP
                              </span>
                            </>
                          )}
                          <span>·</span>
                          <span className="line-clamp-1">{comp.recommendedFor}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {description} (Sin asignar)
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Approx Price & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  {comp ? (
                    <div className="sm:text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-mono">
                        Estimado Aprox.
                      </div>
                      <div className="text-sm font-bold font-mono text-white">
                        {formatPrice(comp.priceMinUSD, selectedCurrency)} -{' '}
                        {formatPrice(comp.priceMaxUSD, selectedCurrency)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-slate-500">
                      $0.00
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {comp && (
                      <button
                        onClick={() => handleRemoveComponent(key)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        title="Quitar componente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setPickerCategory(key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        comp
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          : 'bg-red-600 hover:bg-red-500 text-white shadow-xs shadow-red-600/30'
                      }`}
                    >
                      {comp ? 'Cambiar' : 'Seleccionar'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Diagnostics & Summary Panel (Right 4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-5">
            {/* Tool Tabs: Presupuesto | FPS | Electricidad | Asesor | Exportar */}
            {/* Tool Tabs: Costos | Historial | FPS | Monitores | Luz | Ahorro | Exportar */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 bg-slate-950 p-1 rounded-xl text-[10px] font-semibold text-center">
              <button
                onClick={() => setActiveToolTab('budget')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeToolTab === 'budget'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Costos
              </button>
              <button
                onClick={() => setActiveToolTab('history')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeToolTab === 'history'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Historial
              </button>
              <button
                onClick={() => setActiveToolTab('fps')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeToolTab === 'fps'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                FPS
              </button>
              <button
                onClick={() => setActiveToolTab('monitors')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeToolTab === 'monitors'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monitores
              </button>
              <button
                onClick={() => setActiveToolTab('electricity')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeToolTab === 'electricity'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Luz
              </button>
              <button
                onClick={() => setActiveToolTab('optimizer')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeToolTab === 'optimizer'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Ahorro
              </button>
              <button
                onClick={() => setActiveToolTab('export')}
                className={`py-1.5 rounded-lg transition-all ${
                  activeToolTab === 'export'
                    ? 'bg-red-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Exportar
              </button>
            </div>

            {/* TAB 1: BUDGET SUMMARY */}
            {activeToolTab === 'budget' && (
              <div className="space-y-5">
                <div>
                  <span className="text-xs uppercase font-mono font-semibold text-slate-400 tracking-wider">
                    Rango Total Estimado
                  </span>
                  <div className="mt-1">
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {stats.minUSD === 0
                        ? '$0'
                        : `${formatPrice(stats.minUSD, selectedCurrency)}`}
                    </div>
                    {stats.minUSD > 0 && (
                      <div className="text-xs text-red-400 font-mono mt-0.5">
                        Hasta aprox. {formatPrice(stats.maxUSD, selectedCurrency)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Power Specs */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Consumo Estimado (TDP)
                    </span>
                    <span className="font-mono font-bold text-white">
                      ~{stats.systemTdp} W
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Fuente Sugerida:</span>
                    <span className="font-mono font-bold text-red-400">
                      {stats.recommendedPsu}W o superior
                    </span>
                  </div>
                </div>

                {/* Compatibility Engine Alert */}
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Estado de Compatibilidad
                  </div>

                  {compatibility.isCompatible ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-300 leading-relaxed">
                        <strong>100% Compatible:</strong> No se detectaron conflictos de zócalo, memoria ni déficit de energía entre los componentes seleccionados.
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {compatibility.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300 leading-relaxed"
                        >
                          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {compatibility.warnings.map((warn, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300 leading-relaxed"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: INTERACTIVE RECHARTS PRICE HISTORY */}
            {activeToolTab === 'history' && (
              <div className="space-y-3">
                <PriceHistoryChart
                  build={build}
                  buildName={buildCustomName}
                  currency={selectedCurrency}
                />
              </div>
            )}

            {/* TAB 2: INTERACTIVE FPS SIMULATOR & RECHARTS BENCHMARKS */}
            {activeToolTab === 'fps' && (
              <div className="space-y-4">
                {/* Recharts Performance Visualizer Sub-Component */}
                <PerformanceEstimatesChart
                  build={build}
                  buildName={buildCustomName}
                  compact={true}
                />

                {/* Resolution Switcher */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-400 uppercase font-bold">
                    Resolución:
                  </span>
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg">
                    {(['1080p', '1440p', '4k'] as const).map(res => (
                      <button
                        key={res}
                        onClick={() => setFpsResolution(res)}
                        className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                          fpsResolution === res
                            ? 'bg-red-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {res.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-red-400" />
                      Balance CPU + GPU
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-red-500/15 text-red-400 rounded">
                      {bottleneckData?.status === 'balanced'
                        ? 'Equilibrado'
                        : bottleneckData?.status === 'cpu_bottleneck'
                        ? 'Límite CPU'
                        : 'Límite GPU'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {bottleneckData?.summary}
                  </p>
                </div>

                {/* Estimated Games with Dynamic Resolution Scaling */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide font-mono">
                    FPS Estimados ({fpsResolution.toUpperCase()})
                  </div>
                  {(() => {
                    const gpuScore = build.gpu?.perfScore || 65;
                    const cpuScore = build.cpu?.perfScore || 65;
                    const resMult = fpsResolution === '1080p' ? 1.0 : fpsResolution === '1440p' ? 0.72 : 0.44;

                    const games = [
                      {
                        name: 'Cyberpunk 2077 (Path Tracing)',
                        baseFps: 75,
                        quality: 'Ray Tracing Ultra + DLSS/FSR'
                      },
                      {
                        name: 'Black Myth: Wukong',
                        baseFps: 82,
                        quality: 'Cinematic / Ajustes Altos'
                      },
                      {
                        name: 'Counter-Strike 2 / Valorant',
                        baseFps: 340,
                        quality: 'Ultra Competitivo'
                      },
                      {
                        name: 'Call of Duty: Warzone',
                        baseFps: 125,
                        quality: 'Ajustes Competitivos'
                      },
                      {
                        name: 'Fortnite (Unreal Engine 5)',
                        baseFps: 140,
                        quality: 'Nanite + Lumen'
                      },
                      {
                        name: 'GTA V / GTA VI Ready',
                        baseFps: 130,
                        quality: 'Ajustes Muy Altos'
                      }
                    ];

                    return games.map((game, idx) => {
                      const estimatedFps = Math.round(
                        (game.baseFps * (gpuScore / 100) * 0.75 + (cpuScore / 100) * game.baseFps * 0.25) * resMult
                      );
                      const isHighFps = estimatedFps >= 120;
                      const isGoodFps = estimatedFps >= 60;

                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-semibold text-white">{game.name}</div>
                            <div className="text-[10px] text-slate-400">{game.quality}</div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`font-mono font-bold text-sm ${
                                isHighFps
                                  ? 'text-emerald-400'
                                  : isGoodFps
                                  ? 'text-red-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              ~{estimatedFps} FPS
                            </div>
                            <div className="text-[9px] text-slate-500 font-mono">
                              1% Low: ~{Math.round(estimatedFps * 0.72)}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* TAB 3: ELECTRICITY & ENERGY BILLING */}
            {activeToolTab === 'electricity' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Calculador de Consumo Eléctrico
                    </span>
                    <span className="font-mono text-amber-400 font-bold">~{stats.systemTdp}W TDP</span>
                  </div>

                  {/* Usage hours selector */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Horas de uso diario:</span>
                      <strong className="text-white font-mono">{electricityHours} horas / día</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="16"
                      value={electricityHours}
                      onChange={e => setElectricityHours(parseInt(e.target.value, 10))}
                      className="w-full accent-red-600 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>

                  {/* Electricity stats results */}
                  {(() => {
                    const eStats = calculateElectricityStats(stats.systemTdp, electricityHours, electricityRate);

                    return (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Consumo Mensual:</span>
                          <strong className="text-white font-mono text-sm">{eStats.monthlyKwh} kWh</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Factura Mensual Aprox:</span>
                          <strong className="text-emerald-400 font-mono text-sm">${eStats.monthlyCostUSD} USD</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Costo Anual:</span>
                          <strong className="text-white font-mono text-sm">${eStats.yearlyCostUSD} USD</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">SAI/UPS Sugerido:</span>
                          <strong className="text-amber-400 font-mono text-sm">{eStats.recommendedUpsVA} VA</strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                  *Cálculo estimado asumiendo un 85% de carga en juegos y tarifa estándar de $0.15 USD/kWh.
                </p>
              </div>
            )}

            {/* TAB 4: BUDGET OPTIMIZER */}
            {activeToolTab === 'optimizer' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-red-400" />
                  Consejos para Optimizar tu Dinero
                </div>

                {budgetTips.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 bg-slate-950/50 rounded-lg">
                    Selecciona más componentes para que el sistema analice la distribución de tu presupuesto.
                  </div>
                ) : (
                  budgetTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        tip.type === 'optimal'
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                          : 'bg-red-500/10 border-red-500/25 text-red-300'
                      }`}
                    >
                      {tip.text}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: IDEAL MONITOR RECOMMENDATIONS */}
            {activeToolTab === 'monitors' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Tv className="w-4 h-4 text-red-400" />
                      Monitor Ideal para tu GPU
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded">
                      {build.gpu?.name.split(' ')[0] || 'GPU'} Match
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Basado en la potencia de tu {build.gpu?.name || 'tarjeta gráfica'}, te sugerimos especificaciones óptimas para no desaprovechar tasa de refresco ni sufrir tearing.
                  </p>
                </div>

                {(() => {
                  const gpuScore = build.gpu?.perfScore || 65;
                  const isUltraGpu = gpuScore >= 90;
                  const isMidHighGpu = gpuScore >= 75 && gpuScore < 90;

                  const monitorSpecs = isUltraGpu
                    ? {
                        title: '4K QD-OLED / Mini-LED (32" o 27")',
                        res: '3840 x 2160 (4K UHD)',
                        hz: '144Hz - 240Hz (0.03ms)',
                        sync: 'G-Sync Compatible + FreeSync Premium Pro',
                        cable: 'DisplayPort 1.4 / 2.1 o HDMI 2.1 Ultra High Speed',
                        priceUSD: 750,
                        reason: 'Tu GPU genera suficiente tasa de cuadros para saturar un panel 4K con máxima fidelidad HDR.'
                      }
                    : isMidHighGpu
                    ? {
                        title: '1440p Fast-IPS QHD (27")',
                        res: '2560 x 1440 (2K QHD 16:9)',
                        hz: '165Hz - 240Hz (1ms GtG)',
                        sync: 'AMD FreeSync Premium / G-Sync Compatible',
                        cable: 'DisplayPort 1.4',
                        priceUSD: 240,
                        reason: 'El "Sweet Spot" competitivo. Densidad de píxeles nítida sin sacrificar tasas de cuadros ultra fluidas.'
                      }
                    : {
                        title: '1080p Esports Fast-IPS (24.5")',
                        res: '1920 x 1080 (FHD)',
                        hz: '144Hz - 180Hz (1ms)',
                        sync: 'AMD FreeSync',
                        cable: 'DisplayPort 1.2 / HDMI 2.0',
                        priceUSD: 140,
                        reason: 'Ideal para exprimir máxima fluidez en shooters competitivos y juegos esport sin sobrecosto.'
                      };

                  return (
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-red-950/60 space-y-2">
                        <span className="text-[10px] uppercase font-mono font-bold text-red-400">
                          Recomendación de Hardware
                        </span>
                        <h4 className="text-sm font-bold text-white">{monitorSpecs.title}</h4>
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Resolución:</span>
                            <strong className="text-white font-mono">{monitorSpecs.res}</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Refresco:</span>
                            <strong className="text-emerald-400 font-mono">{monitorSpecs.hz}</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Sincronización:</span>
                            <strong className="text-white">{monitorSpecs.sync}</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 block text-[10px]">Cable Recomendado:</span>
                            <strong className="text-amber-400">{monitorSpecs.cable}</strong>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 italic pt-1">
                          💡 {monitorSpecs.reason}
                        </p>
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Costo Estimado Monitor:</span>
                          <span className="font-mono font-bold text-white">
                            ~{formatPrice(monitorSpecs.priceUSD, selectedCurrency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 5: EXPORT & SHARE */}
            {activeToolTab === 'export' && (
              <div className="space-y-4">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setExportFormat('whatsapp')}
                    className={`flex-1 py-1 rounded font-medium transition-all ${
                      exportFormat === 'whatsapp' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setExportFormat('reddit')}
                    className={`flex-1 py-1 rounded font-medium transition-all ${
                      exportFormat === 'reddit' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    Reddit / Foros
                  </button>
                  <button
                    onClick={() => setExportFormat('plain')}
                    className={`flex-1 py-1 rounded font-medium transition-all ${
                      exportFormat === 'plain' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    Texto Plano
                  </button>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                  {generateExportBuild(build, buildCustomName, selectedCurrency, exportFormat)}
                </div>

                <button
                  onClick={() => {
                    const text = generateExportBuild(build, buildCustomName, selectedCurrency, exportFormat);
                    navigator.clipboard.writeText(text);
                    setExportCopied(true);
                    setTimeout(() => setExportCopied(false), 2000);
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/30"
                >
                  {exportCopied ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>¡Copiado para {exportFormat === 'whatsapp' ? 'WhatsApp' : 'Foros'}!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Copiar Formato {exportFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              {/* AI Assistant Direct Advice Button */}
              <button
                onClick={onOpenAiChat}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-white border border-red-500/30 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Bot className="w-4 h-4 text-red-400" />
                <span>Consultar a Núcleo AI sobre este ensamble</span>
              </button>

              {/* Rig Card Export & Share Button */}
              <button
                onClick={() => setIsShareCardOpen(true)}
                disabled={selectedCount === 0}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-600/25 active:scale-98 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>Crear Tarjeta de Colección (Rig Card HD)</span>
              </button>

              <button
                onClick={handleCopySummary}
                disabled={selectedCount === 0}
                className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>¡Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Resumen de Presupuesto</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSaveBuild}
                disabled={selectedCount === 0}
                className="w-full py-2 px-4 rounded-xl text-xs font-semibold border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <BookmarkCheck className="w-4 h-4 text-red-400" />
                <span>Guardar este Ensamble</span>
              </button>

              {saveSuccessName && (
                <div className="text-center text-xs text-emerald-400 animate-fadeIn">
                  Ensamble guardado en tu navegador con éxito.
                </div>
              )}
            </div>
          </div>

          {/* Saved Builds Shelf */}
          {savedBuilds.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Mis Ensambles Guardados ({savedBuilds.length})
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedBuilds.map(saved => {
                  const savedStats = calculateBuildStats(saved.components);
                  const isFav = userProfile?.favoriteBuildIds?.includes(saved.id);
                  return (
                    <div
                      key={saved.id}
                      className="p-2.5 rounded-lg border border-slate-800 bg-slate-800/40 hover:border-red-500/40 transition-colors flex items-center justify-between gap-2"
                    >
                      <button
                        onClick={() => handleLoadSavedBuild(saved)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {saved.name}
                        </div>
                        <div className="text-[11px] font-mono text-red-400">
                          {formatPrice(savedStats.minUSD, selectedCurrency)} · {saved.createdAt}
                        </div>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {onToggleFavoriteBuild && (
                          <button
                            onClick={() => onToggleFavoriteBuild(saved.id)}
                            className={`p-1 transition-colors ${
                              isFav ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                            }`}
                            title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos del perfil'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSavedBuild(saved.id)}
                          className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                          title="Eliminar ensamble"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Component Picker Modal */}
      <ComponentPickerModal
        isOpen={pickerCategory !== null}
        onClose={() => setPickerCategory(null)}
        category={pickerCategory}
        categoryName={
          CATEGORIES_CONFIG.find(c => c.key === pickerCategory)?.name || ''
        }
        allComponents={COMPONENTS_DATABASE}
        selectedComponent={pickerCategory ? build[pickerCategory] || null : null}
        onSelectComponent={component => {
          if (pickerCategory) {
            setBuild(prev => ({
              ...prev,
              [pickerCategory]: component
            }));
          }
        }}
        currency={selectedCurrency}
      />

      {/* Smart Auto Builder by Budget Modal */}
      <SmartAutoBuilderModal
        isOpen={isAutoBuilderOpen}
        onClose={() => setIsAutoBuilderOpen(false)}
        currency={selectedCurrency}
        onApplyBuild={(autoBuild, name) => {
          setBuild(autoBuild);
          setBuildCustomName(name);
          recordHistorySnapshot(autoBuild, name);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Dual Build (Versus Cara a Cara) Modal */}
      <DualBuildVersusModal
        isOpen={isVersusOpen}
        onClose={() => setIsVersusOpen(false)}
        currentBuild={build}
        currentBuildName={buildCustomName}
        currency={selectedCurrency}
        onLoadBuild={(versusBuild, name) => {
          setBuild(versusBuild);
          setBuildCustomName(name);
          recordHistorySnapshot(versusBuild, name);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Rig Share Card HD Modal */}
      <RigShareCardModal
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        build={build}
        buildName={buildCustomName}
        currency={selectedCurrency}
      />

      {/* PSU Cable & Power Guide Modal */}
      <PSUCableGuideModal
        isOpen={isPsuGuideOpen}
        onClose={() => setIsPsuGuideOpen(false)}
        build={build}
        buildName={buildCustomName}
        currency={selectedCurrency}
      />

      {/* Community Rigs Showcase Modal */}
      <CommunityShowcaseModal
        isOpen={isCommunityShowcaseOpen}
        onClose={() => setIsCommunityShowcaseOpen(false)}
        onLoadBuild={(commBuild, name) => {
          setBuild(commBuild);
          setBuildCustomName(name);
          recordHistorySnapshot(commBuild, name);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentBuild={build}
        currentBuildName={buildCustomName}
        currency={selectedCurrency}
        userProfile={userProfile}
      />
    </div>
  );
};
