import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, ChevronDown, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidPlayStoreModal } from './AndroidPlayStoreModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'mobile';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, isWindows, install } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const label = isWindows ? 'App Windows' : isAndroid ? 'App Android' : 'Instalar App';
  const IconComponent = isWindows ? Monitor : Smartphone;

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`relative group flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all focus:outline-none bg-gradient-to-r from-red-600/20 via-emerald-600/20 to-teal-600/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 shadow-sm shadow-emerald-500/10 active:scale-98 ${className}`}
          title="Descargar, Instalar o Publicar App en Windows, Android o Play Store"
        >
          <IconComponent className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />

          <span className="hidden sm:inline">
            {label}
          </span>
          <span className="sm:hidden">
            App
          </span>

          {isInstalled && (
            <span className="px-1 py-0.2 rounded text-[9px] bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono hidden md:inline">
              PWA
            </span>
          )}

          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {variant === 'mobile' && (
        <button
          onClick={handleClick}
          className={`flex items-center gap-1 py-1 px-2 rounded text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors ${className}`}
        >
          <IconComponent className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>
      )}

      {/* Guide & Packaging Modal */}
      <AndroidPlayStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
