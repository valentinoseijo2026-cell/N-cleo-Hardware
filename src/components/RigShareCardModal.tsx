import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Smartphone,
  Tv,
  Palette,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { ComponentCategory, PCComponent, CurrencyConfig } from '../types';
import {
  RigCardOptions,
  drawRigCardToCanvas,
  downloadCanvasImage,
  encodeBuildToHash
} from '../utils/shareUtils';

interface RigShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  build: Partial<Record<ComponentCategory, PCComponent>>;
  buildName: string;
  currency: CurrencyConfig;
  gamerTag?: string;
}

export const RigShareCardModal: React.FC<RigShareCardModalProps> = ({
  isOpen,
  onClose,
  build,
  buildName,
  currency,
  gamerTag
}) => {
  const [aspectRatio, setAspectRatio] = useState<'story' | 'post'>('story');
  const [themeStyle, setThemeStyle] = useState<'crimson' | 'cyberpunk' | 'stealth' | 'snow' | 'emerald'>('crimson');
  const [copiedLink, setCopiedLink] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const redrawCard = useCallback(() => {
    if (!canvasRef.current) return;
    const options: RigCardOptions = {
      build,
      buildName,
      currency,
      themeStyle,
      aspectRatio,
      gamerTag: gamerTag || 'Entusiasta'
    };
    drawRigCardToCanvas(canvasRef.current, options);
  }, [build, buildName, currency, themeStyle, aspectRatio, gamerTag]);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow canvas DOM node to be ready
      const t = setTimeout(() => {
        redrawCard();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, redrawCard]);

  if (!isOpen) return null;

  const shareHash = encodeBuildToHash(build, buildName);
  const shareableUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}${shareHash}`
    : `https://nucleo.app/${shareHash}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const sanitizedName = buildName.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const filename = `nucleo_${sanitizedName}_${aspectRatio}.png`;
    downloadCanvasImage(canvasRef.current, filename);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Mira este ensamble que configuré en Núcleo Hardware!\n"${buildName}"\nÁbrelo aquí con specs y 3D en vivo: ${shareableUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(
      `Acabo de armar y simular esta bestia en @nucleo_app: "${buildName}". ¿Qué opinan de las specs? #PCGaming #PCBuild`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareableUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-red-950/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/40 border-b border-red-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/30 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-wide">
                  TARJETA DE ENSAMBLE DE COLECCIÓN
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  Rig Card HD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Exporta un póster de alta definición con tus especificaciones o comparte tu enlace directo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Preview, Right Controls */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Card Canvas Preview (Left 7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl border border-slate-800/80 p-4 shadow-inner min-h-[380px]">
            <div
              className={`relative overflow-hidden rounded-xl border border-slate-700 shadow-2xl transition-all ${
                aspectRatio === 'story'
                  ? 'max-h-[500px] aspect-[9/16]'
                  : 'max-h-[320px] aspect-[16/9] w-full'
              }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block"
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono mt-3">
              Renderizado por Canvas en 1200x675 / 1080x1920 Ultra-HD
            </span>
          </div>

          {/* Controls Panel (Right 5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Aspect Ratio Switch */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider block">
                Formato de Tarjeta
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAspectRatio('story')}
                  className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    aspectRatio === 'story'
                      ? 'bg-red-950/40 border-red-500 text-red-400 shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Historia / Reel (9:16)</span>
                </button>
                <button
                  onClick={() => setAspectRatio('post')}
                  className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    aspectRatio === 'post'
                      ? 'bg-red-950/40 border-red-500 text-red-400 shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>Post / Discord (16:9)</span>
                </button>
              </div>
            </div>

            {/* Theme Palette Switch */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-red-400" />
                <span>Estilo Visual del Póster</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'crimson', name: 'Carmesí', color: '#ef4444' },
                  { id: 'cyberpunk', name: 'Cyberpunk', color: '#06b6d4' },
                  { id: 'emerald', name: 'GeForce', color: '#10b981' },
                  { id: 'stealth', name: 'Titanio', color: '#f59e0b' },
                  { id: 'snow', name: 'Blanco Nieve', color: '#e2e8f0' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setThemeStyle(t.id as any)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 ${
                      themeStyle === t.id
                        ? 'bg-slate-800 border-white text-white shadow-sm ring-1 ring-white/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: t.color }}
                    />
                    <span className="text-xs font-bold truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action 1: Download Image */}
            <button
              onClick={handleDownload}
              className="w-full py-3 px-4 rounded-xl font-mono font-bold text-sm text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Imagen PNG (Ultra HD)</span>
            </button>

            {/* Action 2: Copy Direct Link with Build State */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                Enlace Directo para Compartir:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-white transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Al abrir este enlace en cualquier celular o PC, el configurador cargará automáticamente todos tus componentes seleccionados.
              </p>
            </div>

            {/* Action 3: Social Sharing Links */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block">
                Compartir Directamente
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShareWhatsApp}
                  className="py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  onClick={handleShareTwitter}
                  className="py-2 px-3 rounded-xl bg-sky-950/40 hover:bg-sky-950/60 border border-sky-500/30 text-sky-400 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Twitter / X</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
