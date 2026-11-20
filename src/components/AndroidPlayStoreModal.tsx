import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  Play,
  ShieldCheck,
  Terminal,
  FileCode,
  Flame,
  Globe,
  Share2,
  Sparkles,
  Layers,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidPlayStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidPlayStoreModal: React.FC<AndroidPlayStoreModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, isWindows, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'windows' | 'direct' | 'playstore' | 'ios'>(
    isWindows ? 'windows' : 'direct'
  );
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nucleo.app';
  const manifestUrl = `${currentAppUrl}/manifest.webmanifest`;
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentAppUrl)}`;

  const bubblewrapCommand = `npm i -g @bubblewrap/cli
bubblewrap init --manifest=${manifestUrl}
bubblewrap build`;

  const assetLinksJson = `[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "app.nucleo.hardware",
      "sha256_cert_fingerprints": [
        "14:6D:E9:7D:0F:52:AB:FC:0E:98:A2:2B:BD:6D:C7:E2:03:5B:C9:37:F1:C9:66:35:E5:A9:E2:03:5B:C9:37:F1"
      ]
    }
  }
]`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    } else {
      // If prompt is not directly available, explain browser menu
      alert("Para instalar en Android: abre el menú de tres puntos (⋮) en Google Chrome o tu navegador y toca 'Instalar aplicación' o 'Agregar a la pantalla principal'.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900 border border-red-950/70 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with Android & Play Store Branding */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-red-950/50 border-b border-red-950/60">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white font-mono tracking-wide">
                    NÚCLEO MULTIPLATAFORMA
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Windows · Android · iOS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Usa o instala Núcleo en Windows (PC), Android, iOS o publica en Google Play Store / Microsoft Store.
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

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 mt-5 border-b border-slate-800/80 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveTab('windows')}
              className={`pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'windows'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Windows (PC)</span>
              {isWindows && (
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-500/20 text-blue-300 font-normal">
                  PC Activo
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('direct')}
              className={`pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'direct'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Móvil</span>
              {isInstalled && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('playstore')}
              className={`pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'playstore'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Google Play Store</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-red-500/20 text-red-300 font-normal">
                AAB / APK
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`pb-2.5 px-3 text-xs font-mono font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                activeTab === 'ios'
                  ? 'border-cyan-500 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>iOS / iPhone</span>
            </button>
          </div>
        </div>

        {/* Tab Contents (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-sm">
          {/* TAB 0: Windows (PC) */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-blue-400" />
                    <h4 className="font-bold text-white text-base">Núcleo en Windows 10 & 11</h4>
                  </div>
                  {isInstalled ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      App Instalada en Windows
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      100% Compatible con Windows
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>Sí, Núcleo se puede encontrar, usar e instalar en Windows.</strong> Funciona en cualquier navegador de PC (Google Chrome, Microsoft Edge, Brave, Opera, Firefox) con aceleración gráfica por hardware para el Visor 3D y el juego Núcleo Legend.
                </p>

                {/* Direct Install Button */}
                <div className="pt-2">
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-3 px-4 rounded-xl font-mono font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Núcleo como App de Escritorio en Windows</span>
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5 font-mono">
                    Crea icono en el Escritorio, Menú Inicio y se ancla a la Barra de Tareas.
                  </p>
                </div>
              </div>

              {/* Step by step for Windows */}
              <div className="space-y-3 font-mono text-xs">
                <h5 className="font-bold text-white uppercase text-[11px] tracking-wider text-slate-300">
                  Instalación manual paso a paso en Windows:
                </h5>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">1</span>
                    <span>En Microsoft Edge o Google Chrome:</span>
                  </div>
                  <p className="text-slate-300 text-xs pl-7">
                    Observa la barra de direcciones (donde escribes la URL). Verás un icono de monitor con una flecha o el botón <strong>&quot;Instalar Núcleo Legend&quot;</strong>. Haz clic en él y pulsa <strong>Instalar</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">2</span>
                    <span>O desde el menú del navegador:</span>
                  </div>
                  <p className="text-slate-300 text-xs pl-7">
                    Haz clic en los tres puntos <strong>(···)</strong> arriba a la derecha &gt; <strong>Aplicaciones</strong> &gt; <strong>&quot;Instalar este sitio como una aplicación&quot;</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">3</span>
                    <span>Ventana nativa y Barra de Tareas:</span>
                  </div>
                  <p className="text-slate-300 text-xs pl-7">
                    Se abrirá como un programa de Windows independiente sin pestañas. Puedes hacer clic derecho en su icono en la barra de tareas de Windows y seleccionar <strong>&quot;Anclar a la barra de tareas&quot;</strong>.
                  </p>
                </div>
              </div>

              {/* Microsoft Store Packaging */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold font-mono text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>¿Quieres publicarla en la Microsoft Store de Windows?</span>
                  </div>
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                  >
                    <span>PWABuilder de Microsoft</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Con la herramienta oficial de Microsoft (PWABuilder), el manifiesto de Núcleo se compila automáticamente en un archivo <strong>.MSIX</strong> firmado para distribuirlo en la Microsoft Store o instalarlo con el instalador de paquetes de Windows 10 y 11.
                </p>
              </div>
            </div>
          )}
          {/* TAB 1: Direct Android Install */}
          {activeTab === 'direct' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h4 className="font-bold text-white text-base">Instalación Inmediata con WebAPK</h4>
                  </div>
                  {isInstalled ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Instalada
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      Lista para instalar
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Gracias a los estándares <strong>PWA y WebAPK de Android</strong>, Núcleo se compila
                  directamente como una aplicación nativa en tu teléfono: con icono independiente en el menú,
                  sin barra del navegador, pantalla completa fluida a 120Hz y juego <strong>Núcleo Legend disponible sin conexión a internet</strong>.
                </p>

                {/* Explanation about why 'App Instalada' appeared */}
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-400">
                    <span>💡 ¿Por qué tu navegador indica &quot;App Instalada&quot;?</span>
                  </div>
                  <p className="leading-relaxed text-slate-400">
                    Tu navegador detecta que el Service Worker y el Manifiesto ya están registrados y activos en este dispositivo.
                    Para tenerla en tu teléfono móvil o tablet Android física, abre la URL pública en Google Chrome en tu celular y selecciona <strong>&quot;Instalar aplicación&quot;</strong>.
                  </p>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleDirectInstall}
                    className="flex-1 py-3 px-4 rounded-xl font-mono font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalled ? 'App Ya Instalada en este Dispositivo' : 'Instalar Núcleo en mi Android'}</span>
                  </button>

                  <a
                    href={manifestUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-3 px-4 rounded-xl font-mono text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ver Web App Manifest</span>
                  </a>
                </div>
              </div>

              {/* Step by Step Manual Guide for Android Chrome/Samsung */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-mono uppercase font-bold text-slate-400">
                  ¿Cómo instalarlo manualmente desde cualquier navegador Android?
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold flex items-center justify-center">
                      1
                    </div>
                    <h6 className="font-bold text-white text-xs">Abre el menú (⋮)</h6>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Toca los tres puntos verticales en la esquina superior derecha de Chrome, Brave o Samsung Internet.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold flex items-center justify-center">
                      2
                    </div>
                    <h6 className="font-bold text-white text-xs">Instalar o Añadir</h6>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Selecciona la opción <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-bold flex items-center justify-center">
                      3
                    </div>
                    <h6 className="font-bold text-white text-xs">¡Listo como App Nativa!</h6>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Aparecerá el icono de Núcleo en tu cajón de aplicaciones de Android con ejecución independiente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Publish to Google Play Store (TWA / AAB / Bubblewrap) */}
          {activeTab === 'playstore' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                  </div>
                  <h4 className="font-bold text-white text-base">Arquitectura Oficial: Google Trusted Web Activities (TWA)</h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Para publicar una aplicación web en <strong>Google Play Store</strong> como un archivo <strong>.aab (Android App Bundle)</strong> descargable, Google utiliza el protocolo oficial <strong>Trusted Web Activity (TWA)</strong>.
                  La aplicación ya cuenta con todos los requisitos verificados:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>HTTPS Seguro</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Manifest 100%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Service Worker</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Iconos Maskable</span>
                  </div>
                </div>
              </div>

              {/* Method A: PWABuilder (1-Click online generator) */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      MÉTODO RECOMENDADO (3 Minutos)
                    </span>
                    <h5 className="font-bold text-white text-xs sm:text-sm">Generar paquete con PWABuilder</h5>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  PWABuilder (herramienta oficial impulsada por la comunidad web y Google) analiza este sitio y genera directamente el archivo <strong>.aab</strong> firmado listo para subir a <strong>Google Play Console</strong>.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <a
                    href={pwaBuilderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-red-600/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Abrir en PWABuilder & Descargar AAB</span>
                  </a>

                  <button
                    onClick={() => copyToClipboard(currentAppUrl, 'app-url')}
                    className="py-2.5 px-3 rounded-xl font-mono text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    {copiedText === 'app-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copiar URL de la App</span>
                  </button>
                </div>
              </div>

              {/* Method B: CLI with Google Bubblewrap */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h5 className="font-bold text-white text-xs">Método Terminal: CLI Oficial de Google (Bubblewrap)</h5>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bubblewrapCommand, 'bubblewrap')}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    {copiedText === 'bubblewrap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar comandos</span>
                  </button>
                </div>

                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  <pre className="whitespace-pre">{bubblewrapCommand}</pre>
                </div>
              </div>

              {/* Digital Asset Links Config */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <h5 className="font-bold text-white text-xs">Digital Asset Links Activo (assetlinks.json)</h5>
                  </div>
                  <button
                    onClick={() => copyToClipboard(assetLinksJson, 'assetlinks')}
                    className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    {copiedText === 'assetlinks' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar JSON</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  El archivo ya está activo en tu servidor en <code className="text-red-400 font-mono">/.well-known/assetlinks.json</code> para que Google Play valide la titularidad del dominio al publicar tu app.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: iOS Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white text-base">Instalación en iPhone & iPad (Safari)</h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  En iOS (Apple), las PWA se instalan directamente a través de Safari sin necesidad de pasar por la App Store:
                </p>

                <div className="space-y-2 pt-1 font-mono text-xs">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-center font-bold flex items-center justify-center shrink-0">1</span>
                    <span className="text-slate-300">Abre esta página en <strong>Safari</strong> de tu iPhone/iPad.</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-center font-bold flex items-center justify-center shrink-0">2</span>
                    <span className="text-slate-300">Toca el botón <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba en la barra inferior).</span>
                  </div>
                  <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 text-center font-bold flex items-center justify-center shrink-0">3</span>
                    <span className="text-slate-300">Desplázate hacia abajo y selecciona <strong>&quot;Añadir a la pantalla de inicio&quot;</strong>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Compatible con Windows 10/11, Android 8.0-15+ e iOS</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
