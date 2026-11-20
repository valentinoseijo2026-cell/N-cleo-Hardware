import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NewsSection } from './components/NewsSection';
import { PCBuilderSection } from './components/PCBuilderSection';
import { HardwareRadarSection } from './components/HardwareRadarSection';
import { ArticleModal } from './components/ArticleModal';
import { HardwareComparatorModal } from './components/HardwareComparatorModal';
import { AIAssistantChat } from './components/AIAssistantChat';
import { UserProfileModal } from './components/UserProfileModal';
import { NucleoLegendGame } from './components/NucleoLegendGame';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NEWS_ARTICLES } from './data/newsData';
import { WeeklyHubModal } from './components/WeeklyHubModal';
import { WidgetsHub } from './components/WidgetsHub';
import {
  NewsArticle,
  ComponentCategory,
  PCComponent,
  UserProfile,
  BuildHistoryEntry,
  UserBuild
} from './types';
import { BUILD_PRESETS, COMPONENTS_DATABASE, CURRENCIES } from './data/componentsData';
import { Hammer, Newspaper, Cpu, Zap, Activity, Flame, Bot, Sparkles, Gamepad2, Calendar } from 'lucide-react';
import { useBatteryStatus } from './hooks/useBatteryStatus';
import { decodeBuildFromHash } from './utils/shareUtils';
import { restoreAllUserMedalsAndCodes } from './utils/medalsUtils';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'news' | 'builder' | 'radar' | 'game'>('news');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'identity' | 'hardware' | 'preferences' | 'favorites' | 'history' | 'guide' | 'achievements' | 'codigos' | 'tools'>('identity');
  const [isWeeklyHubOpen, setIsWeeklyHubOpen] = useState(false);

  const openProfileAtTab = (tab: 'identity' | 'hardware' | 'preferences' | 'favorites' | 'history' | 'guide' | 'achievements' | 'codigos' | 'tools' = 'identity') => {
    setProfileInitialTab(tab);
    setIsProfileOpen(true);
  };

  // Widgets Hub state (open by default, minimizable to sleek dock pill)
  const [isWidgetsOpen, setIsWidgetsOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('nucleo_widgets_open');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isWidgetsMinimized, setIsWidgetsMinimized] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('nucleo_widgets_minimized');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nucleo_widgets_open', String(isWidgetsOpen));
    } catch {}
  }, [isWidgetsOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('nucleo_widgets_minimized', String(isWidgetsMinimized));
    } catch {}
  }, [isWidgetsMinimized]);

  // Battery status hook for auto low-power mode
  const battery = useBatteryStatus();

  // Global shared build state so the 3D Viewer, Builder, and AI Assistant are synced
  const [buildCustomName, setBuildCustomName] = useState('Mi Ensamble Personalizado');
  const [build, setBuild] = useState<Partial<Record<ComponentCategory, PCComponent>>>(() => {
    // Check if initial URL hash has a shared build
    if (typeof window !== 'undefined' && window.location.hash.includes('#build=')) {
      const decoded = decodeBuildFromHash(window.location.hash);
      if (decoded && Object.keys(decoded.build).length > 0) {
        return decoded.build;
      }
    }

    const defaultPreset = BUILD_PRESETS[3]; // Sweet Spot 1440p
    const initial: Partial<Record<ComponentCategory, PCComponent>> = {};
    Object.entries(defaultPreset.componentIds).forEach(([cat, id]) => {
      const found = COMPONENTS_DATABASE.find(c => c.id === id);
      if (found) {
        initial[cat as ComponentCategory] = found;
      }
    });
    return initial;
  });

  // Check URL hash for shared build updates
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('#build=')) {
      const decoded = decodeBuildFromHash(window.location.hash);
      if (decoded && Object.keys(decoded.build).length > 0) {
        setBuild(decoded.build);
        setBuildCustomName(decoded.buildName);
        setCurrentTab('builder');
      }
    }
  }, []);

  // Theme management (Dark by default, togglable)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('nucleo_theme');
      if (stored) return stored === 'dark';
      return true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem('nucleo_theme', 'dark');
      } catch {}
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('nucleo_theme', 'light');
      } catch {}
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // User Profile state with guaranteed restored medals and secret codes
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const defaultProfile: UserProfile = {
      gamerTag: 'Entusiasta_01',
      avatarSeed: 'spade',
      bio: 'Arquitecto de silicio, overclocking y refrigeración líquida personalizada.',
      title: 'Arquitecto de Silicio',
      favoriteBuildIds: [],
      themeAccent: 'red',
      defaultCurrencyCode: 'USD',
      soundEnabled: true,
      autoSaveBuilds: true,
      preferredResolution: '1440p',
      lowPowerMode: false,
      batterySaverAutoDetect: true
    };
    try {
      const stored = localStorage.getItem('nucleo_user_profile');
      const loaded = stored ? { ...defaultProfile, ...JSON.parse(stored) } : defaultProfile;
      return restoreAllUserMedalsAndCodes(loaded);
    } catch {
      return restoreAllUserMedalsAndCodes(defaultProfile);
    }
  });

  // Sync low-power-mode class and themeAccent data-accent on HTML root element
  useEffect(() => {
    const root = document.documentElement;
    if (userProfile.lowPowerMode) {
      root.classList.add('low-power-mode');
    } else {
      root.classList.remove('low-power-mode');
    }
    root.setAttribute('data-accent', userProfile.themeAccent || 'red');
  }, [userProfile.lowPowerMode, userProfile.themeAccent]);

  // Automatic battery saver detection if enabled and battery is critically low (<= 20% on discharge)
  useEffect(() => {
    if (
      userProfile.batterySaverAutoDetect &&
      battery.isSupported &&
      battery.isLow &&
      !battery.charging &&
      !userProfile.lowPowerMode
    ) {
      setUserProfile(prev => ({ ...prev, lowPowerMode: true }));
    }
  }, [battery.isSupported, battery.isLow, battery.charging, userProfile.batterySaverAutoDetect, userProfile.lowPowerMode]);

  useEffect(() => {
    try {
      localStorage.setItem('nucleo_user_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  // History timeline of builds
  const [historyEntries, setHistoryEntries] = useState<BuildHistoryEntry[]>(() => {
    try {
      const stored = localStorage.getItem('nucleo_build_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nucleo_build_history', JSON.stringify(historyEntries));
    } catch {}
  }, [historyEntries]);

  // Unified Saved Builds in localStorage
  const [savedBuilds, setSavedBuilds] = useState<UserBuild[]>(() => {
    try {
      const stored = localStorage.getItem('nucleo_saved_builds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nucleo_saved_builds', JSON.stringify(savedBuilds));
    } catch {}
  }, [savedBuilds]);

  const handleRecordHistory = (entry: BuildHistoryEntry) => {
    setHistoryEntries(prev => [entry, ...prev.slice(0, 19)]);
  };

  const handleClearHistory = () => {
    setHistoryEntries([]);
    try {
      localStorage.removeItem('nucleo_build_history');
    } catch {}
  };

  const handleDeleteSavedBuild = (id: string) => {
    setSavedBuilds(prev => {
      const updated = prev.filter(b => b.id !== id);
      try {
        localStorage.setItem('nucleo_saved_builds', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setUserProfile(prev => ({
      ...prev,
      favoriteBuildIds: prev.favoriteBuildIds.filter(favId => favId !== id)
    }));
  };

  const handleToggleFavoriteBuild = (buildId: string) => {
    setUserProfile(prev => {
      const exists = prev.favoriteBuildIds.includes(buildId);
      const updated = exists
        ? prev.favoriteBuildIds.filter(id => id !== buildId)
        : [...prev.favoriteBuildIds, buildId];
      return { ...prev, favoriteBuildIds: updated };
    });
  };

  // Bookmarks management
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('nucleo_bookmarks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string) => {
    setBookmarks(prev => {
      const updated = prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id];
      try {
        localStorage.setItem('nucleo_bookmarks', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleLoadBuild = (loadedBuild: Partial<Record<ComponentCategory, PCComponent>>, name: string) => {
    setBuild(loadedBuild);
    setBuildCustomName(name);
    setCurrentTab('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadWeeklyBuild = (componentIds: Partial<Record<string, string>>) => {
    const newBuild: Partial<Record<ComponentCategory, PCComponent>> = {};
    Object.entries(componentIds).forEach(([cat, id]) => {
      const found = COMPONENTS_DATABASE.find(c => c.id === id);
      if (found) {
        newBuild[cat as ComponentCategory] = found;
      }
    });
    setBuild(newBuild);
    setBuildCustomName('Build de la Semana');
    setCurrentTab('builder');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentBuildTdpWatts = Object.values(build).reduce(
    (acc, c) => acc + (c ? c.tdpWatts : 0),
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 transition-colors selection:bg-red-600/30 selection:text-red-200">
      {/* Subtle crimson tech grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-45 tech-grid-pattern z-0" />

      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenComparator={() => setIsComparatorOpen(true)}
        onOpenProfile={() => openProfileAtTab('identity')}
        onOpenWeeklyHub={() => setIsWeeklyHubOpen(true)}
        onToggleWidgets={() => setIsWidgetsOpen(prev => !prev)}
        isWidgetsOpen={isWidgetsOpen}
        userProfile={userProfile}
        savedBuilds={savedBuilds}
      />

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Editorial Sub-Header / Hero on News Tab */}
        {currentTab === 'news' && (
          <div className="mb-10 pb-6 border-b border-red-950/40">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span>Laboratorio Técnico & Cobertura de Silicio</span>
                </div>
                <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
                  El pulso del hardware de PC.
                </h1>
                <p className="mt-2.5 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  Lanzamientos de GPUs, comparativas de microarquitecturas de CPUs, visualizador 3D de gabinetes y soporte inteligente con IA.
                </p>
              </div>

              {/* Quick Metrics Strip */}
              <div className="flex items-center gap-3 sm:gap-5 self-start md:self-auto bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-red-950/50 text-xs shadow-md">
                <div>
                  <div className="font-mono font-bold text-white text-sm">RTX 50 · Zen 5</div>
                  <div className="text-slate-400 text-[11px]">Última generación</div>
                </div>
                <div className="h-7 w-[1px] bg-slate-800" />
                <div>
                  <div className="font-mono font-bold text-red-400 text-sm">Visor 3D + IA</div>
                  <div className="text-slate-400 text-[11px]">Soporte en tiempo real</div>
                </div>
                <div className="h-7 w-[1px] bg-slate-800" />
                <button
                  onClick={() => setIsWeeklyHubOpen(true)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-600/25 to-red-600/25 hover:from-amber-600/40 hover:to-red-600/40 border border-amber-500/40 text-amber-300 font-bold transition-all shadow-xs"
                  title="Ver ofertas y rotación de silicio de la semana"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ofertas Semanales</span>
                </button>
                <button
                  onClick={() => setCurrentTab('game')}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-red-600/30 to-rose-600/30 hover:from-red-600/50 hover:to-rose-600/50 border border-red-500/40 text-red-300 font-bold transition-all shadow-xs"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>Jugar Núcleo Legend</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Builder View Sub-Header */}
        {currentTab === 'builder' && (
          <div className="mb-8 pb-6 border-b border-red-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-red-500" />
                  <span>Configurador de Ensambles & Precios Aproximados</span>
                </div>
                <h1 className="mt-1.5 text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Arma tu Computadora
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Selecciona piezas de un catálogo extendido, revisa el gabinete en 3D interactivo, analiza cuellos de botella y consulta a la IA especializada.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsAiChatOpen(true)}
                  className="text-xs font-bold text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 transition-colors shadow-sm shadow-red-600/30"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Soporte IA</span>
                </button>
                <button
                  onClick={() => setCurrentTab('news')}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/40 transition-colors"
                >
                  <Newspaper className="w-3.5 h-3.5 text-red-400" />
                  <span>Noticias</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Router */}
        {currentTab === 'news' && (
          <NewsSection
            articles={NEWS_ARTICLES}
            onSelectArticle={article => setSelectedArticle(article)}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onGoToBuilder={() => {
              setCurrentTab('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'builder' && (
          <PCBuilderSection
            onOpenAiChat={() => setIsAiChatOpen(true)}
            build={build}
            setBuild={setBuild}
            buildCustomName={buildCustomName}
            setBuildCustomName={setBuildCustomName}
            savedBuilds={savedBuilds}
            setSavedBuilds={setSavedBuilds}
            onRecordHistory={handleRecordHistory}
            userProfile={userProfile}
            onToggleFavoriteBuild={handleToggleFavoriteBuild}
          />
        )}

        {currentTab === 'radar' && (
          <HardwareRadarSection
            onGoToBuilder={() => {
              setCurrentTab('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenWeeklyHub={() => setIsWeeklyHubOpen(true)}
          />
        )}

        {currentTab === 'game' && (
          <NucleoLegendGame
            onGoToBuilderWithSupremePC={supremeBuild => {
              setBuild(supremeBuild);
              const isIntel = supremeBuild.cpu?.brand === 'Intel' || supremeBuild.cpu?.id?.includes('285k');
              setBuildCustomName(
                isIntel
                  ? 'PC Suprema INTEL (Core Ultra 9 285K · RTX 4090)'
                  : 'PC Suprema AMD (Ryzen 7 9800X3D · RTX 4090)'
              );
              setCurrentTab('builder');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Floating AI Chatbot Quick Trigger (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAiChatOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 transition-all"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950 animate-pulse" />
          </div>
          <span className="tracking-wide">Núcleo AI · Soporte</span>
        </button>
      </div>

      {/* AI Assistant Chat Drawer */}
      <AIAssistantChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        currentBuild={build}
      />

      {/* Full Article Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        isBookmarked={selectedArticle ? bookmarks.includes(selectedArticle.id) : false}
        onToggleBookmark={toggleBookmark}
      />

      {/* Hardware Comparator Modal */}
      <HardwareComparatorModal
        isOpen={isComparatorOpen}
        onClose={() => setIsComparatorOpen(false)}
      />

      {/* User Profile & Enthusiast Hub Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        initialTab={profileInitialTab}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        savedBuilds={savedBuilds}
        onLoadBuild={handleLoadBuild}
        onDeleteSavedBuild={handleDeleteSavedBuild}
        historyEntries={historyEntries}
        onClearHistory={handleClearHistory}
        currentCurrency={
          CURRENCIES.find(c => c.code === userProfile.defaultCurrencyCode) || CURRENCIES[0]
        }
      />

      {/* Weekly Hub, Flash Deals & Power Calculator Modal */}
      <WeeklyHubModal
        isOpen={isWeeklyHubOpen}
        onClose={() => setIsWeeklyHubOpen(false)}
        currency={
          CURRENCIES.find(c => c.code === userProfile.defaultCurrencyCode) || CURRENCIES[0]
        }
        onLoadBuildPreset={handleLoadWeeklyBuild}
        onPlayGame={() => setCurrentTab('game')}
        currentBuildTdpWatts={currentBuildTdpWatts}
      />

      {/* Live Silicon Widgets Hub (Hardware Telemetry, Gamer Rank & Quick Controls) */}
      <WidgetsHub
        isOpen={isWidgetsOpen}
        onClose={() => setIsWidgetsOpen(false)}
        isMinimized={isWidgetsMinimized}
        onToggleMinimize={() => setIsWidgetsMinimized(prev => !prev)}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        currentBuild={build}
        savedBuilds={savedBuilds}
        onNavigateTab={tab => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProfile={() => openProfileAtTab('identity')}
        onOpenCodes={() => openProfileAtTab('codigos')}
        onOpenWeeklyHub={() => setIsWeeklyHubOpen(true)}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* Footer */}
      <Footer onTabChange={tab => setCurrentTab(tab)} />

      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  );
}
