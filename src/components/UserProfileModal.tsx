import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Star,
  History,
  Palette,
  CheckCircle2,
  X,
  Trash2,
  RotateCcw,
  Sparkles,
  Zap,
  Cpu,
  Tv,
  Check,
  ShieldCheck,
  Wrench,
  Sliders,
  Battery,
  BatteryCharging,
  BatteryLow,
  ZapOff,
  Leaf,
  Trophy,
  Camera,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Crown,
  Monitor,
  Flame,
  Layers,
  Activity,
  Award,
  Key,
  Gift,
  Lock,
  Unlock,
  CheckCheck,
  HelpCircle,
  Volume2,
  VolumeX,
  Search,
  Share2,
  Copy,
  FileText
} from 'lucide-react';
import { useBatteryStatus } from '../hooks/useBatteryStatus';
import {
  UserProfile,
  BuildHistoryEntry,
  UserBuild,
  CurrencyConfig,
  ComponentCategory,
  PCComponent,
  AppThemeAccent
} from '../types';
import { CURRENCIES } from '../data/componentsData';
import { formatPrice } from '../utils/builderUtils';
import { AVATAR_PRESETS, HONORIFIC_TITLES, compressAvatarImage } from '../utils/avatarUtils';
import {
  evaluateUserMedals,
  redeemSecretCode,
  playMedalFanfareSound,
  playEquipSound,
  playMechanicalClickSound,
  playFanSimulationTone,
  calculateUserLevel,
  restoreAllUserMedalsAndCodes,
  MedalItem,
  ALL_MEDALS_CATALOG,
  SECRET_CODES_CLUES,
  getDailyDropStatus,
  claimDailyDrop
} from '../utils/medalsUtils';

export type ProfileModalTab = 'identity' | 'hardware' | 'preferences' | 'favorites' | 'history' | 'guide' | 'achievements' | 'codigos' | 'tools';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  savedBuilds: UserBuild[];
  onLoadBuild: (build: Partial<Record<ComponentCategory, PCComponent>>, name: string) => void;
  onDeleteSavedBuild: (id: string) => void;
  historyEntries: BuildHistoryEntry[];
  onClearHistory: () => void;
  currentCurrency: CurrencyConfig;
  initialTab?: ProfileModalTab;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
  savedBuilds,
  onLoadBuild,
  onDeleteSavedBuild,
  historyEntries,
  onClearHistory,
  currentCurrency,
  initialTab = 'identity'
}) => {
  const [activeTab, setActiveTab] = useState<ProfileModalTab>(initialTab);
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagInput, setTagInput] = useState(userProfile.gamerTag);
  const [bioInput, setBioInput] = useState(userProfile.bio);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const batteryStatus = useBatteryStatus();

  // Secret codes redemption state
  const [codeInput, setCodeInput] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    unlockedMedal?: MedalItem;
  } | null>(null);
  const [medalsFilter, setMedalsFilter] = useState<'all' | 'unlocked' | 'locked' | 'secret'>('all');
  const [medalsSearch, setMedalsSearch] = useState('');

  // Tools & Acoustic Lab states
  const [fanRpm, setFanRpm] = useState<number>(1200);
  const [isTestingFan, setIsTestingFan] = useState<boolean>(false);
  const [cardCopyFeedback, setCardCopyFeedback] = useState<string | null>(null);

  // Dynamic calculation of community & hardware achievements / medals
  let topGameScore = 0;
  try {
    const rawScores = localStorage.getItem('nucleo_legend_leaderboard');
    if (rawScores) {
      const parsed = JSON.parse(rawScores);
      if (Array.isArray(parsed) && parsed.length > 0) {
        topGameScore = Math.max(...parsed.map((p: any) => p.score || 0));
      }
    }
  } catch {}

  const evaluatedMedals = evaluateUserMedals(userProfile, savedBuilds, topGameScore);
  const equippedMedal = evaluatedMedals.find(m => m.id === userProfile.equippedMedalId && m.unlocked);
  const unlockedCount = evaluatedMedals.filter(m => m.unlocked).length;

  const handleEquipMedal = (medalId: string) => {
    const medal = evaluatedMedals.find(m => m.id === medalId);
    if (!medal?.unlocked) return;

    const isCurrentlyEquipped = userProfile.equippedMedalId === medalId;
    const newEquippedId = isCurrentlyEquipped ? undefined : medalId;

    setUserProfile(prev => ({
      ...prev,
      equippedMedalId: newEquippedId
    }));

    playEquipSound();
    if (isCurrentlyEquipped) {
      setUploadFeedback(`Medalla "${medal.title}" retirada del perfil.`);
    } else {
      setUploadFeedback(`¡Medalla "${medal.title}" equipada con éxito en tu perfil! 👑`);
    }
    setTimeout(() => setUploadFeedback(null), 3200);
  };

  const handleRedeemCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const result = redeemSecretCode(codeInput, userProfile);

    if (result.success && result.medalId) {
      const targetMedalId = result.medalId;
      const baseCatalogMedal = ALL_MEDALS_CATALOG.find(m => m.id === targetMedalId);
      const targetMedal: MedalItem | undefined = baseCatalogMedal
        ? { ...baseCatalogMedal, unlocked: true }
        : evaluatedMedals.find(m => m.id === targetMedalId);

      setUserProfile(prev => {
        const normalizedCode = targetMedalId === 'secret-2026' ? '2026' : codeInput.trim().toUpperCase();
        const nextCodes = Array.from(new Set([...(prev.redeemedCodes || []), normalizedCode]));
        const nextMedals = Array.from(new Set([...(prev.unlockedMedals || []), targetMedalId]));
        return {
          ...prev,
          redeemedCodes: nextCodes,
          unlockedMedals: nextMedals,
          equippedMedalId: targetMedalId // Auto-equip the new secret medal!
        };
      });

      playMedalFanfareSound();
      setCodeFeedback({
        type: 'success',
        message: result.message,
        unlockedMedal: targetMedal
      });
      setCodeInput('');
    } else if (result.alreadyRedeemed) {
      setCodeFeedback({
        type: 'info',
        message: result.message
      });
    } else {
      setCodeFeedback({
        type: 'error',
        message: result.message
      });
    }
  };

  // Physical assembly checklist state
  const [checkedSteps, setCheckedSteps] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('nucleo_checklist_steps');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleStep = (stepIdx: number) => {
    setCheckedSteps(prev => {
      const next = prev.includes(stepIdx) ? prev.filter(s => s !== stepIdx) : [...prev, stepIdx];
      try {
        localStorage.setItem('nucleo_checklist_steps', JSON.stringify(next));
      } catch {}
      return next;
    });
    // Propagate XP/level change immediately to Header & Widgets
    setUserProfile(prev => ({ ...prev }));
  };

  const levelInfo = calculateUserLevel(evaluatedMedals, savedBuilds.length, checkedSteps.length, topGameScore);

  const [dailyStatus, setDailyStatus] = useState(() => getDailyDropStatus());

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsEditingTag(false);
      setCodeFeedback(null);
      setDailyStatus(getDailyDropStatus());
      setTagInput(userProfile.gamerTag);
      setBioInput(userProfile.bio);
      try {
        const stored = localStorage.getItem('nucleo_checklist_steps');
        if (stored) {
          setCheckedSteps(JSON.parse(stored));
        }
      } catch {}
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isEditingTag) {
      setTagInput(userProfile.gamerTag);
    }
  }, [userProfile.gamerTag, isEditingTag]);

  useEffect(() => {
    setBioInput(userProfile.bio);
  }, [userProfile.bio]);

  const handleClaimDailyDrop = () => {
    const result = claimDailyDrop();
    setDailyStatus(getDailyDropStatus());
    if (result.success) {
      playMedalFanfareSound();
      setUploadFeedback(`🎁 ${result.message} ¡Nivel y XP actualizados!`);
      setUserProfile(prev => ({ ...prev }));
    } else {
      setUploadFeedback(result.message);
    }
    setTimeout(() => setUploadFeedback(null), 4500);
  };

  const handleRestoreAllMedals = () => {
    const restored = restoreAllUserMedalsAndCodes(userProfile);
    setUserProfile(restored);
    playMedalFanfareSound();
    setUploadFeedback(`¡Todas tus medallas (${ALL_MEDALS_CATALOG.length}/${ALL_MEDALS_CATALOG.length}) y códigos secretos han sido restaurados con éxito en tu perfil!`);
    setTimeout(() => setUploadFeedback(null), 5000);
  };

  const handleTestFanAudio = (rpmOverride?: number) => {
    const rpmToPlay = rpmOverride !== undefined ? rpmOverride : fanRpm;
    setIsTestingFan(true);
    playFanSimulationTone(rpmToPlay, 1.8);
    try {
      localStorage.setItem('nucleo_acoustic_lab_tested', 'true');
    } catch {}
    // Refresh medals & XP immediately so Ingeniero Acústico unlocks live
    setUserProfile(prev => ({ ...prev }));
    setTimeout(() => setIsTestingFan(false), 1800);
  };

  const handleCopyRigMarkdown = async (targetBuild?: UserBuild) => {
    const buildToExport = targetBuild || savedBuilds[0];
    const medalName = equippedMedal ? `${equippedMedal.icon} ${equippedMedal.title}` : 'Ninguna';
    
    let specsText = '';
    if (buildToExport) {
      specsText = Object.entries(buildToExport.components)
        .filter(([, comp]) => Boolean(comp))
        .map(([cat, comp]) => `- **${cat.toUpperCase()}**: ${comp?.name} (${comp?.specs ? Object.entries(comp.specs).map(([k, v]) => `${k}: ${v}`).slice(0, 2).join(', ') : ''})`)
        .join('\n');
    } else {
      specsText = '- No hay componentes guardados aún en este perfil.';
    }

    const text = `🎮 **NÚCLEO RIG CARD** 🎮
👤 **Usuario**: ${userProfile.gamerTag} (Nivel ${levelInfo.level} · ${levelInfo.rankTitle})
🏅 **Medalla Activa**: ${medalName}
🏆 **Récord Arcade**: ${topGameScore} pts
🖥️ **Resolución Preferida**: ${userProfile.preferredResolution}
💻 **Ensamble**: ${buildToExport?.name || 'Ensamble Principal'}
${specsText}
⚡ **Configurado en**: Núcleo 2026 - Plataforma de Hardware & Ensambles`;

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('Clipboard API unavailable');
      }
      playMechanicalClickSound();
      setCardCopyFeedback('¡Ficha copiada al portapapeles con formato Markdown!');
      setTimeout(() => setCardCopyFeedback(null), 3000);
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (copied) {
          playMechanicalClickSound();
          setCardCopyFeedback('¡Ficha copiada al portapapeles con formato Markdown!');
        } else {
          setCardCopyFeedback('No se pudo copiar automáticamente; permite el acceso al portapapeles.');
        }
      } catch {
        setCardCopyFeedback('No se pudo copiar al portapapeles en este navegador.');
      }
      setTimeout(() => setCardCopyFeedback(null), 3500);
    }
  };

  if (!isOpen) return null;

  const handleSaveTag = () => {
    const cleanTag = tagInput.trim();
    if (cleanTag) {
      setUserProfile(prev => ({ ...prev, gamerTag: cleanTag }));
      setTagInput(cleanTag);
    } else {
      setTagInput(userProfile.gamerTag || 'Ensamblador Núcleo');
    }
    setIsEditingTag(false);
  };

  const handleSaveBio = () => {
    setUserProfile(prev => ({ ...prev, bio: bioInput.trim() }));
    setUploadFeedback('¡Biografía actualizada con éxito!');
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedDataUrl = await compressAvatarImage(file, 256, 0.88);
      setUserProfile(prev => ({
        ...prev,
        avatarUrl: compressedDataUrl,
        avatarPresetId: undefined
      }));
      setUploadFeedback('¡Foto de perfil actualizada y optimizada con éxito!');
      setTimeout(() => setUploadFeedback(null), 3500);
    } catch (err: any) {
      setUploadFeedback(err.message || 'Error al procesar la imagen.');
      setTimeout(() => setUploadFeedback(null), 4000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyCustomUrl = () => {
    const url = customUrlInput.trim();
    if (!url) return;
    setUserProfile(prev => ({
      ...prev,
      avatarUrl: url,
      avatarPresetId: undefined
    }));
    setCustomUrlInput('');
    setUploadFeedback('¡Imagen desde URL aplicada correctamente!');
    setTimeout(() => setUploadFeedback(null), 3500);
  };

  const handleSelectPreset = (presetId: string) => {
    setUserProfile(prev => ({
      ...prev,
      avatarPresetId: presetId,
      avatarUrl: undefined
    }));
    setUploadFeedback(`¡Avatar preset "${AVATAR_PRESETS.find(p => p.id === presetId)?.name}" seleccionado!`);
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  const handleResetDefaultAvatar = () => {
    setUserProfile(prev => ({
      ...prev,
      avatarUrl: undefined,
      avatarPresetId: undefined
    }));
    setUploadFeedback('Foto restablecida al emblema oficial de Núcleo.');
    setTimeout(() => setUploadFeedback(null), 3000);
  };

  const favoriteBuilds = savedBuilds.filter(b => userProfile.favoriteBuildIds.includes(b.id));

  const toggleFavorite = (buildId: string) => {
    setUserProfile(prev => {
      const exists = prev.favoriteBuildIds.includes(buildId);
      const updated = exists
        ? prev.favoriteBuildIds.filter(id => id !== buildId)
        : [...prev.favoriteBuildIds, buildId];
      return { ...prev, favoriteBuildIds: updated };
    });
  };

  const activePreset = AVATAR_PRESETS.find(p => p.id === userProfile.avatarPresetId);

  const assemblySteps = [
    {
      title: '1. Preparación de la mesa y fuente de poder',
      desc: 'Coloca la fuente de poder en el chasis con el ventilador apuntando hacia la rejilla de toma de aire exterior y atorníllala con los 4 tornillos hexagonales.'
    },
    {
      title: '2. Montaje del Procesador en la Placa Madre (Fuera del gabinete)',
      desc: 'Coloca la placa sobre su caja de cartón. Levanta la palanca del zócalo (AM5 o LGA1851), alinea el triángulo dorado de la CPU con el triángulo del zócalo sin forzar y baja la palanca.'
    },
    {
      title: '3. Instalación de las memorias RAM en Dual Channel',
      desc: 'Abre las pestañas de las ranuras DIMM 2 y 4 (A2 y B2). Presiona con firmeza en ambos extremos hasta escuchar un "click" claro.'
    },
    {
      title: '4. Montaje de la unidad SSD NVMe M.2',
      desc: 'Retira el disipador metálico M.2 de la placa madre, inserta la unidad NVMe a 30 grados, atorníllala suavemente y retira el film protector de plástico de la almohadilla térmica antes de volver a colocar el disipador.'
    },
    {
      title: '5. Montaje del Disipador o Bomba AIO con Pasta Térmica',
      desc: 'Aplica una pequeña gota de pasta térmica del tamaño de un guisante (o 5 puntos) en el centro del procesador y ajusta los tornillos en cruz para una presión homogénea.'
    },
    {
      title: '6. Instalación de la Placa Madre en el Gabinete',
      desc: 'Verifica que los separadores de latón (standoffs) coincidan con el formato ATX/mATX de tu placa. Introduce el panel I/O trasero y atornilla suavemente sin apretar en exceso.'
    },
    {
      title: '7. Conexión de cables de alimentación principales',
      desc: 'Conecta el cable ATX principal de 24 pines y los cables EPS de 8 pines de la CPU en la parte superior izquierda.'
    },
    {
      title: '8. Instalación de la Tarjeta Gráfica (GPU)',
      desc: 'Retira las tapas PCIe traseras correspondientes, inserta la GPU en la primera ranura PCIe x16 hasta escuchar el click del seguro y conecta el cable 12V-2x6 o PCIe asegurando que encaje hasta el fondo.'
    },
    {
      title: '9. Primer encendido y activación de EXPO / XMP en BIOS',
      desc: 'Presiona el botón de encendido, pulsa SUPR o F2 para entrar en la BIOS y activa el perfil EXPO (AMD) o XMP (Intel) para que tu memoria RAM funcione a su velocidad máxima nominal.'
    }
  ];

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-red-950/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Hidden File Picker for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Profile Hero Header Banner */}
        <div className="relative bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-red-950/50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 transition-colors border border-slate-800"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Interactive Avatar Badge */}
            <div className="relative group shrink-0">
              <div className={`w-20 h-20 rounded-2xl p-1 shadow-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
                activePreset
                  ? `bg-gradient-to-br ${activePreset.gradient} shadow-lg`
                  : 'bg-gradient-to-br from-red-600 via-rose-600 to-amber-600 shadow-red-600/30'
              }`}>
                <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative">
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Avatar de Usuario"
                      className="w-full h-full object-cover"
                    />
                  ) : activePreset ? (
                    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${activePreset.gradient} text-white`}>
                      <span className="text-2xl drop-shadow-md">{activePreset.icon}</span>
                    </div>
                  ) : (
                    <img
                      src="/assets/aistudio/image_08c4c239.png"
                      alt="Emblema Núcleo"
                      className="w-14 h-14 object-contain"
                    />
                  )}

                  {/* Hover Overlay to change picture */}
                  <button
                    onClick={() => {
                      setActiveTab('identity');
                      fileInputRef.current?.click();
                    }}
                    className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity text-white text-[10px] font-bold"
                    title="Subir nueva foto"
                  >
                    <Camera className="w-4 h-4 text-red-400" />
                    <span>Cambiar</span>
                  </button>
                </div>
              </div>

              {/* Status Online Indicator with Camera Trigger */}
              <button
                onClick={() => setActiveTab('identity')}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-slate-900 flex items-center justify-center text-white transition-all shadow-md"
                title="Personalizar imagen y título"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            {/* User Credentials, Honorific Title & Brand Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isEditingTag ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveTag();
                        if (e.key === 'Escape') {
                          setTagInput(userProfile.gamerTag);
                          setIsEditingTag(false);
                        }
                      }}
                      maxLength={24}
                      className="text-base font-bold bg-slate-950 border border-red-500 rounded px-2.5 py-0.5 text-white focus:outline-none font-mono"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTag}
                      className="px-2.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      Guardar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate font-mono">
                      {userProfile.gamerTag || 'Ensamblador Núcleo'}
                    </h2>
                    <button
                      onClick={() => {
                        setTagInput(userProfile.gamerTag);
                        setIsEditingTag(true);
                      }}
                      className="text-slate-400 hover:text-red-400 text-xs px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800"
                      title="Editar nombre"
                    >
                      ✎ Editar
                    </button>
                  </div>
                )}

                {/* Honorific Title Badge */}
                <span className="text-[10px] uppercase font-mono font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  {userProfile.title || 'Arquitecto de Silicio'}
                </span>

                {/* Brand Allegiance Pill */}
                {userProfile.preferredHardwareBrand && (
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    userProfile.preferredHardwareBrand === 'amd'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                      : userProfile.preferredHardwareBrand === 'intel'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-500/50'
                      : userProfile.preferredHardwareBrand === 'nvidia'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                  }`}>
                    <span>
                      {userProfile.preferredHardwareBrand === 'amd' ? '🔴 AMD Team Red'
                        : userProfile.preferredHardwareBrand === 'intel' ? '🔵 Intel Team Blue'
                        : userProfile.preferredHardwareBrand === 'nvidia' ? '🟢 GeForce Team Green'
                        : '⚡ All-Star Multi-Marca'}
                    </span>
                  </span>
                )}

                {/* Equipped Medal Pill Showcase */}
                {equippedMedal ? (
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/50 bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 flex items-center gap-1.5 transition-all shadow-xs group"
                    title="Medalla equipada en tu perfil. Clic para ver tus medallas."
                  >
                    <span>{equippedMedal.icon}</span>
                    <span className="truncate max-w-[150px]">{equippedMedal.title}</span>
                    <span className="text-[9px] bg-amber-500/30 text-amber-200 px-1 rounded font-mono">👑 En Perfil</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-dashed border-slate-700 bg-slate-900/50 hover:border-amber-500/50 hover:text-amber-300 text-slate-400 flex items-center gap-1 transition-all"
                    title="Equipar una medalla ganada en tu perfil"
                  >
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>+ Equipar Medalla</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
                {userProfile.bio || 'Configura tu biografía y tus especificaciones para que la comunidad conozca tu ensamble.'}
              </p>

              {/* Silicon Stats Strip */}
              <div className="flex items-center gap-3 sm:gap-4 mt-2.5 text-xs text-slate-400 flex-wrap">
                <div>
                  <strong className="text-white font-mono">{savedBuilds.length}</strong> Ensambles Creados
                </div>
                <div>•</div>
                <div>
                  <strong className="text-white font-mono">{favoriteBuilds.length}</strong> Favoritos
                </div>
                <div>•</div>
                <div>
                  <strong className="text-amber-400 font-mono">{topGameScore > 0 ? `${topGameScore} pts` : 'Iniciado'}</strong> Récord Arcade
                </div>
                <div>•</div>
                <div>
                  <strong className="text-emerald-400 font-mono">{unlockedCount}</strong> Medallas Ganadas
                </div>
              </div>

              {/* Level & XP Progression Strip */}
              <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 max-w-xl">
                <div className="flex items-center justify-between text-xs mb-1.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 text-xs px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                      Nivel {levelInfo.level}
                    </span>
                    <span className="font-bold text-slate-200">{levelInfo.rankTitle}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    <strong className="text-amber-400">{levelInfo.currentLevelXp}</strong> / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-full rounded-full transition-all duration-700 shadow-xs"
                    style={{ width: `${Math.max(5, levelInfo.progressPercent)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>Total acumulado: {levelInfo.totalXp} XP</span>
                  <span className="text-amber-400/90 font-semibold">+{levelInfo.nextLevelXp - levelInfo.currentLevelXp} XP para Nivel {levelInfo.level + 1}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {uploadFeedback && (
            <div className="mt-3 p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadFeedback}</span>
            </div>
          )}

          {/* Card Copy feedback banner */}
          {cardCopyFeedback && (
            <div className="mt-3 p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <Copy className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{cardCopyFeedback}</span>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('identity')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'identity'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-red-400" />
            <span>Foto & Identidad</span>
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'hardware'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware & Marca</span>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'preferences'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Temas & Batería</span>
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'favorites'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Favoritos ({favoriteBuilds.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial ({historyEntries.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'guide'
                ? 'border-red-500 text-red-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Guía de Montaje ({checkedSteps.length}/9)</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'achievements'
                ? 'border-amber-500 text-amber-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Medallas ({unlockedCount}/{evaluatedMedals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'tools'
                ? 'border-cyan-500 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Herramientas & Acústica</span>
          </button>
          <button
            onClick={() => setActiveTab('codigos')}
            className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'codigos'
                ? 'border-purple-500 text-purple-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-purple-400" />
            <span>Códigos</span>
            {(dailyStatus.canClaim || !(userProfile.redeemedCodes || []).includes('2026')) && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

          {/* TAB: FOTO & IDENTIDAD (PROFILE PICTURE & PROFILE CONFIGS) */}
          {activeTab === 'identity' && (
            <div className="space-y-5 text-xs">
              {/* Profile Picture Management Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                    <Camera className="w-4 h-4 text-red-400" />
                    <span>Foto de Perfil & Avatar de Ensamblador</span>
                  </span>
                  {(userProfile.avatarUrl || userProfile.avatarPresetId) && (
                    <button
                      onClick={handleResetDefaultAvatar}
                      className="text-[11px] text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restablecer imagen</span>
                    </button>
                  )}
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Personaliza tu imagen de perfil subiendo cualquier fotografía desde tu computadora, ingresando un enlace directo o seleccionando uno de los avatares insignia de la comunidad.
                </p>

                {/* Upload Action Strip */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-600/20 active:scale-98 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Procesando...' : 'Subir Imagen desde mi Dispositivo'}</span>
                  </button>

                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1">
                      <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="url"
                        placeholder="O pega URL de imagen (https://...)"
                        value={customUrlInput}
                        onChange={e => setCustomUrlInput(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                      />
                    </div>
                    <button
                      onClick={handleApplyCustomUrl}
                      disabled={!customUrlInput.trim()}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shrink-0 transition-colors disabled:opacity-40"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Preset Avatar Gallery */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-mono font-bold text-slate-300 block">
                    O elige un Avatar Insignia Oficial de Ensamblador:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {AVATAR_PRESETS.map(preset => {
                      const isSelected = userProfile.avatarPresetId === preset.id && !userProfile.avatarUrl;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'border-red-500 bg-red-950/30 ring-1 ring-red-500 shadow-md shadow-red-500/20'
                              : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-gradient-to-br ${preset.gradient} text-white shrink-0 shadow-sm`}>
                            {preset.icon}
                          </div>
                          <div className="min-w-0">
                            <strong className="text-white text-[11px] block truncate">
                              {preset.name}
                            </strong>
                            <span className="text-[9px] text-slate-400 font-mono block">
                              {preset.category}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Identity & Credentials Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <User className="w-4 h-4 text-red-400" />
                  <span>Credenciales & Título Honorífico</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* GamerTag Input */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block font-mono">
                      GamerTag / Alias en la Comunidad:
                    </label>
                    <input
                      type="text"
                      value={userProfile.gamerTag}
                      onChange={e => {
                        const val = e.target.value;
                        setUserProfile(prev => ({ ...prev, gamerTag: val }));
                        setTagInput(val);
                      }}
                      onBlur={() => {
                        const clean = userProfile.gamerTag.trim();
                        if (!clean) {
                          setUserProfile(prev => ({ ...prev, gamerTag: 'Ensamblador Núcleo' }));
                          setTagInput('Ensamblador Núcleo');
                        } else if (clean !== userProfile.gamerTag) {
                          setUserProfile(prev => ({ ...prev, gamerTag: clean }));
                          setTagInput(clean);
                        }
                      }}
                      maxLength={24}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  {/* Honorific Title Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 block font-mono">
                      Título Honorífico de Ensamblador:
                    </label>
                    <select
                      value={userProfile.title}
                      onChange={e => setUserProfile(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none font-bold"
                    >
                      {HONORIFIC_TITLES.map(title => (
                        <option key={title} value={title}>
                          {title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Bio & Current PC specs */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] text-slate-400 block font-mono">
                      Biografía / Especificaciones de tu Rig Actual:
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {bioInput.length}/180 caracteres
                    </span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={180}
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    placeholder="Ejemplo: AMD Ryzen 9 9950X3D + RTX 5090 32GB | Custom Loop 360mm | Entusiasta del Silicio"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-red-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none leading-relaxed"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400">
                      {bioInput.trim() !== userProfile.bio.trim() ? '● Tienes cambios sin guardar' : '✓ Biografía sincronizada'}
                    </span>
                    <button
                      onClick={handleSaveBio}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
                    >
                      Guardar Biografía
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HARDWARE & MARCA PREFERIDA */}
          {activeTab === 'hardware' && (
            <div className="space-y-4 text-xs">
              {/* Brand Allegiance Card */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Cpu className="w-4 h-4 text-red-400" />
                  <span>Alianza de Fabricante Preferido (Hardware Loyalty)</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Elige qué ecosistema de hardware te representa mejor para mostrar tu insignia en tu perfil y en la comunidad.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {[
                    {
                      id: 'amd',
                      name: 'AMD Ryzen & Radeon',
                      team: 'Team Red',
                      color: 'border-rose-500 bg-rose-950/20 text-rose-300',
                      desc: 'Arquitectura Zen 5, 3D V-Cache y liderazgo en eficiencia de silicio.'
                    },
                    {
                      id: 'intel',
                      name: 'Intel Core Ultra & Arc',
                      team: 'Team Blue',
                      color: 'border-blue-500 bg-blue-950/20 text-blue-300',
                      desc: 'Procesadores híbridos P-Core/E-Core, alto IPC e instrucción AVX-512.'
                    },
                    {
                      id: 'nvidia',
                      name: 'NVIDIA GeForce RTX',
                      team: 'Team Green',
                      color: 'border-emerald-500 bg-emerald-950/20 text-emerald-300',
                      desc: 'DLSS 4, Ray Tracing completo de vanguardia y aceleración de IA Tensor.'
                    },
                    {
                      id: 'all',
                      name: 'All-Star Multi-Marca',
                      team: 'Neutral',
                      color: 'border-amber-500 bg-amber-950/20 text-amber-300',
                      desc: 'Lo mejor de cada casa para obtener la máxima tasa de cuadros por segundo.'
                    }
                  ].map(brand => {
                    const isSelected = userProfile.preferredHardwareBrand === brand.id;
                    return (
                      <button
                        key={brand.id}
                        onClick={() =>
                          setUserProfile(prev => ({
                            ...prev,
                            preferredHardwareBrand: brand.id as any
                          }))
                        }
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${brand.color} ring-1 shadow-md`
                            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-white text-xs block">{brand.name}</strong>
                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-slate-950/70 border border-slate-700">
                            {brand.team}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {brand.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Gaming Resolution & Benchmark FPS Target */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>Resolución de Referencia para Benchmarks</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Configura tu objetivo de juego para que el estimador de cuellos de botella calcule los FPS en tu resolución favorita.
                </p>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: '1080p', label: '1080p FHD', desc: 'Esports 240Hz+ / CPU Bound' },
                    { id: '1440p', label: '1440p QHD', desc: 'Punto dulce ideal (165Hz)' },
                    { id: '4K', label: '4K UHD', desc: 'Ultra Cinematic / GPU Bound' }
                  ].map(res => (
                    <button
                      key={res.id}
                      onClick={() =>
                        setUserProfile(prev => ({
                          ...prev,
                          preferredResolution: res.id as any
                        }))
                      }
                      className={`p-3 rounded-xl border text-center transition-all ${
                        userProfile.preferredResolution === res.id
                          ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300 ring-1 ring-cyan-500 font-bold'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <strong className="block text-white text-xs">{res.label}</strong>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{res.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* RGB Lighting Mode & Simulator Overlays */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Estilo de Iluminación RGB del Chasis & Perfil</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'rainbow', name: 'Arcoíris Dinámico', icon: '🌈' },
                    { id: 'breathing', name: 'Respiración Neón', icon: '💫' },
                    { id: 'static', name: 'Estático Aura', icon: '✨' },
                    { id: 'off', name: 'Modo Stealth (Sin RGB)', icon: '🌙' }
                  ].map(rgb => (
                    <button
                      key={rgb.id}
                      onClick={() =>
                        setUserProfile(prev => ({
                          ...prev,
                          rgbLightingMode: rgb.id as any
                        }))
                      }
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                        (userProfile.rgbLightingMode || 'rainbow') === rgb.id
                          ? 'border-amber-400 bg-amber-950/30 text-amber-300 font-bold ring-1 ring-amber-400'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{rgb.icon}</span>
                      <strong className="text-[11px] block">{rgb.name}</strong>
                    </button>
                  ))}
                </div>

                {/* Show FPS overlay toggle */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-white font-medium text-xs block">
                      Mostrar Contador de FPS en el Visor 3D:
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Superpone los cuadros por segundo estimados sobre el chasis.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={userProfile.showFpsOverlay ?? true}
                    onChange={e =>
                      setUserProfile(prev => ({ ...prev, showFpsOverlay: e.target.checked }))
                    }
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: THEMES & BATTERY (TEMAS & BATERÍA) */}
          {activeTab === 'preferences' && (
            <div className="space-y-5 text-xs">
              {/* Theme Accents */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Palette className="w-4 h-4 text-red-400" />
                  <span>Acento Visual de la Plataforma</span>
                </span>
                <p className="text-slate-400 text-[11px]">
                  Elige la paleta cromática principal de Núcleo para iluminaciones 3D, badges y botones.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {[
                    { id: 'red', name: 'Rojo Núcleo', color: '#ef4444', desc: 'Insignia Carmesí' },
                    { id: 'cyberpunk', name: 'Cyberpunk', color: '#06b6d4', desc: 'Neón Cyan & Rosa' },
                    { id: 'stealth', name: 'Stealth Titanio', color: '#64748b', desc: 'Monocromo Oscuro' },
                    { id: 'white', name: 'Blanco Nieve', color: '#f8fafc', desc: 'Pure Ice' },
                    { id: 'emerald', name: 'GeForce Emerald', color: '#10b981', desc: 'Verde Tóxico' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() =>
                        setUserProfile(prev => ({ ...prev, themeAccent: theme.id as AppThemeAccent }))
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        userProfile.themeAccent === theme.id
                          ? 'border-white bg-slate-800 shadow-md ring-1 ring-white/50'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-900'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-md mb-2 shadow-sm" style={{ backgroundColor: theme.color }} />
                      <strong className="text-white text-[11px] block">{theme.name}</strong>
                      <span className="text-[10px] text-slate-400">{theme.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional Preferences */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Sliders className="w-4 h-4 text-red-400" />
                  <span>Preferencias del Sistema</span>
                </span>

                <div className="space-y-3 pt-1">
                  {/* Default Currency */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-white font-medium block">Moneda de Referencia:</span>
                      <span className="text-[11px] text-slate-400">Conversión monetaria para precios aproximados</span>
                    </div>
                    <select
                      value={userProfile.defaultCurrencyCode}
                      onChange={e =>
                        setUserProfile(prev => ({ ...prev, defaultCurrencyCode: e.target.value }))
                      }
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-mono font-bold"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) - {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-white font-medium block">Efectos de Sonido (Web Audio):</span>
                      <span className="text-[11px] text-slate-400">Chimes procedurales al interactuar con el 3D</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.soundEnabled}
                      onChange={e =>
                        setUserProfile(prev => ({ ...prev, soundEnabled: e.target.checked }))
                      }
                      className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                    />
                  </div>

                  {/* Auto-save */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium block">Historial Automático:</span>
                      <span className="text-[11px] text-slate-400">Registrar automáticamente variaciones en el historial</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={userProfile.autoSaveBuilds}
                      onChange={e =>
                        setUserProfile(prev => ({ ...prev, autoSaveBuilds: e.target.checked }))
                      }
                      className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* LOW POWER & BATTERY SAVER MODE */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 via-slate-950/80 to-slate-900 border border-emerald-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      {userProfile.lowPowerMode ? <Leaf className="w-4 h-4" /> : <Battery className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs sm:text-sm block">
                        Modo de Bajo Consumo (Ahorro de Batería)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Reduce animaciones, efectos de desenfoque GPU y ciclos de CPU
                      </span>
                    </div>
                  </div>

                  {/* Real-time Battery Status Badge */}
                  {batteryStatus.isSupported ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900 border border-slate-700 shrink-0">
                      {batteryStatus.charging ? (
                        <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      ) : batteryStatus.isLow ? (
                        <BatteryLow className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                      ) : (
                        <Battery className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className="text-white font-bold">{batteryStatus.level}%</span>
                      <span className="text-slate-400 text-[10px]">
                        ({batteryStatus.charging ? 'Cargando' : 'Batería'})
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                      Ahorro GPU & CPU
                    </span>
                  )}
                </div>

                {/* Primary Toggle Switch */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-white font-semibold text-xs block">
                      Activar Modo de Bajo Consumo:
                    </span>
                    <p className="text-[11px] text-slate-400 max-w-md mt-0.5 leading-relaxed">
                      Optimiza el rendimiento en laptops y celulares: suspende la rotación continua de ventiladores en el Visor 3D, desactiva desenfoques pesados y reduce partículas en Núcleo Legend.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setUserProfile(prev => ({ ...prev, lowPowerMode: !prev.lowPowerMode }))
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      userProfile.lowPowerMode ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        userProfile.lowPowerMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Auto-detect option when battery <= 20% */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ZapOff className="w-3.5 h-3.5 text-amber-400" />
                    <div>
                      <span className="text-white font-medium text-[11px] block">
                        Activación automática con batería baja (&le; 20%)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Entra en modo ecológico automáticamente al desconectar o cuando quede poca energía.
                      </span>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={userProfile.batterySaverAutoDetect ?? true}
                    onChange={e =>
                      setUserProfile(prev => ({
                        ...prev,
                        batterySaverAutoDetect: e.target.checked
                      }))
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: FAVORITES & SAVED BUILDS */}
          {activeTab === 'favorites' && (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Ensambles Favoritos ({favoriteBuilds.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">Acceso prioritario</span>
                </div>

                {favoriteBuilds.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                    <Star className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">No tienes ensambles favoritos aún</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Marca la estrella (★) en cualquiera de tus ensambles guardados abajo o en el configurador para destacarlos aquí.
                    </p>
                  </div>
                ) : (
                  favoriteBuilds.map(b => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 hover:border-amber-400/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <h4 className="text-sm font-bold text-white">{b.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(b.createdAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {b.components.gpu && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              GPU: {b.components.gpu.name}
                            </span>
                          )}
                          {b.components.cpu && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              CPU: {b.components.cpu.name}
                            </span>
                          )}
                          {b.components.case && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              Case: {b.components.case.name.split('(')[0]}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => {
                            onLoadBuild(b.components, b.name);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Cargar</span>
                        </button>
                        <button
                          onClick={() => toggleFavorite(b.id)}
                          className="p-1.5 rounded-lg text-amber-400 hover:text-slate-300 bg-slate-900 border border-slate-800"
                          title="Quitar de favoritos"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* All Saved Builds Section (Allows starring & deleting directly inside Profile) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Todos tus Ensambles Guardados ({savedBuilds.length})</span>
                  <span className="text-[10px] text-slate-500 font-normal normal-case">Gestiona favoritos o elimina</span>
                </h4>

                {savedBuilds.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-3">
                    Todavía no guardaste ningún ensamble desde el configurador.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedBuilds.map(b => {
                      const isFav = userProfile.favoriteBuildIds.includes(b.id);
                      return (
                        <div
                          key={`all-${b.id}`}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <strong className="text-white truncate">{b.name}</strong>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {new Date(b.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {b.components.cpu?.name || 'Sin CPU'} · {b.components.gpu?.name || 'Sin GPU'}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                            <button
                              onClick={() => toggleFavorite(b.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isFav
                                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-amber-400'
                              }`}
                              title={isFav ? 'Quitar de favoritos' : 'Marcar como favorito'}
                            >
                              <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                            </button>
                            <button
                              onClick={() => {
                                onLoadBuild(b.components, b.name);
                                onClose();
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-white font-semibold flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Cargar</span>
                            </button>
                            <button
                              onClick={() => onDeleteSavedBuild(b.id)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                              title="Eliminar ensamble"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CONFIGURATION HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs text-slate-400">
                  Historial cronológico de cambios y ensambles explorados
                </span>
                {historyEntries.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpiar historial</span>
                  </button>
                )}
              </div>

              {historyEntries.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  Tu historial está vacío. A medida que pruebes y modifiques ensambles, aparecerán aquí automáticamente.
                </div>
              ) : (
                historyEntries.map(entry => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <h4 className="font-bold text-white truncate">{entry.buildName}</h4>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {entry.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {entry.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-300">
                        <span>Consumo: ~{entry.tdpWatts}W</span>
                        <span>•</span>
                        <span className="text-red-400 font-bold">
                          {formatPrice(entry.totalMinUSD, currentCurrency)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onLoadBuild(entry.components, entry.buildName);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-500 hover:bg-slate-800 text-white font-medium shrink-0 flex items-center gap-1 transition-all"
                    >
                      <RotateCcw className="w-3 h-3 text-red-400" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: PHYSICAL ASSEMBLY GUIDE CHECKLIST */}
          {activeTab === 'guide' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-xs text-red-300 leading-relaxed">
                <strong>Guía de Ensamblaje en Mesa de Trabajo:</strong> Sigue esta lista de verificación paso a paso al armar tus componentes físicos para evitar doblar pines o dañar pistas por estática.
              </div>

              <div className="space-y-2 mt-2">
                {assemblySteps.map((step, idx) => {
                  const isChecked = checkedSteps.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by div
                        className="mt-0.5 accent-emerald-500 rounded cursor-pointer"
                      />
                      <div>
                        <h4 className={`text-xs font-bold ${isChecked ? 'text-emerald-300 line-through' : 'text-white'}`}>
                          {step.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: ACHIEVEMENTS & MEDALS */}
          {activeTab === 'achievements' && (
            <div className="space-y-4">
              {/* Progress Summary Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Trophy className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm font-mono flex items-center gap-2">
                      <span>Colección de Medallas de Ensamblador</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.2 rounded-full">
                        {unlockedCount} / {evaluatedMedals.length} Ganadas
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      Gana medallas en el taller, arcade o canjeando códigos secretos. ¡Elige una medalla para lucirla en tu perfil y Header!
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                  <button
                    onClick={handleRestoreAllMedals}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    title="Devolver y restaurar todas las medallas desbloqueadas en tu perfil"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recuperar Medallas</span>
                  </button>

                  <div className="flex flex-col items-end">
                    <div className="w-32 bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(unlockedCount / evaluatedMedals.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">
                      {Math.round((unlockedCount / evaluatedMedals.length) * 100)}% Completado
                    </span>
                  </div>
                </div>
              </div>

              {/* Equipped Medal Quick Notice */}
              {equippedMedal ? (
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-950 border border-amber-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl drop-shadow">{equippedMedal.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Medalla Equipada: {equippedMedal.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          👑 Activa en tu Perfil
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">Esta medalla se muestra junto a tu GamerTag y en la barra superior.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEquipMedal(equippedMedal.id)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors shrink-0"
                  >
                    Desequipar
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>No tienes ninguna medalla equipada en tu perfil todavía. ¡Selecciona una de tus medallas ganadas abajo para lucirla!</span>
                  </div>
                </div>
              )}

              {/* Search Bar & Filter Tabs */}
              <div className="space-y-2.5 border-b border-slate-800/80 pb-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={medalsSearch}
                    onChange={e => setMedalsSearch(e.target.value)}
                    placeholder="Buscar medalla por nombre, insignia o requisito..."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {medalsSearch && (
                    <button
                      onClick={() => setMedalsSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs flex-wrap">
                  <button
                    onClick={() => setMedalsFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                      medalsFilter === 'all'
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todas ({evaluatedMedals.length})
                  </button>
                  <button
                    onClick={() => setMedalsFilter('unlocked')}
                    className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                      medalsFilter === 'unlocked'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Ganadas ({unlockedCount})
                  </button>
                  <button
                    onClick={() => setMedalsFilter('locked')}
                    className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                      medalsFilter === 'locked'
                        ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Bloqueadas ({evaluatedMedals.length - unlockedCount})
                  </button>
                  <button
                    onClick={() => setMedalsFilter('secret')}
                    className={`px-2.5 py-1 rounded-lg font-mono transition-all ${
                      medalsFilter === 'secret'
                        ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Secretas & Códigos ({evaluatedMedals.filter(m => m.isSecret).length})
                  </button>
                </div>
              </div>

              {/* Medals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evaluatedMedals
                  .filter(m => {
                    if (medalsFilter === 'unlocked') return m.unlocked;
                    if (medalsFilter === 'locked') return !m.unlocked;
                    if (medalsFilter === 'secret') return m.isSecret;
                    return true;
                  })
                  .filter(m => {
                    if (!medalsSearch.trim()) return true;
                    const q = medalsSearch.toLowerCase();
                    return (
                      m.title.toLowerCase().includes(q) ||
                      m.desc.toLowerCase().includes(q) ||
                      m.badge.toLowerCase().includes(q) ||
                      m.requirementHint.toLowerCase().includes(q)
                    );
                  })
                  .map(medal => {
                    const isEquipped = userProfile.equippedMedalId === medal.id;

                    return (
                      <div
                        key={medal.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                          medal.unlocked
                            ? isEquipped
                              ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                              : 'bg-slate-900/60 border-slate-700/80 hover:border-amber-500/40'
                            : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Medal Icon Badge */}
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                              medal.unlocked
                                ? `bg-gradient-to-br ${medal.bgGradient} border ${medal.border} ${medal.glowColor} shadow-md`
                                : 'bg-slate-800 border border-slate-700 grayscale'
                            }`}
                          >
                            {medal.unlocked ? medal.icon : <Lock className="w-5 h-5 text-slate-500" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <h5 className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                                <span>{medal.title}</span>
                                {isEquipped && <span className="text-[10px] text-amber-400 font-mono">👑</span>}
                              </h5>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold shrink-0 ${
                                  medal.unlocked
                                    ? isEquipped
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-500'
                                }`}
                              >
                                {medal.badge}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                              {medal.desc}
                            </p>

                            {!medal.unlocked && (
                              <p className="text-[10px] text-amber-400/90 font-mono mt-1.5 flex items-center gap-1">
                                <HelpCircle className="w-3 h-3 shrink-0" />
                                <span>{medal.requirementHint}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Equip Action Button */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">
                            {medal.unlocked ? (
                              <span className="text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Ganada
                              </span>
                            ) : (
                              <span className="text-slate-500 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Bloqueada
                              </span>
                            )}
                          </span>

                          {medal.unlocked ? (
                            <button
                              onClick={() => handleEquipMedal(medal.id)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                isEquipped
                                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm shadow-amber-500/30'
                                  : 'bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40'
                              }`}
                            >
                              <span>{isEquipped ? '👑 Equipada' : '⚡ Equipar en Perfil'}</span>
                            </button>
                          ) : medal.isSecret && medal.id !== 'secret-valen' ? (
                            <button
                              onClick={() => setActiveTab('codigos')}
                              className="px-2.5 py-1 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-500/30 text-[10px] font-mono transition-colors flex items-center gap-1"
                            >
                              <Key className="w-3 h-3 text-purple-400" />
                              <span>Ir a Canjear Código</span>
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB: CÓDIGOS SECRETOS */}
          {activeTab === 'codigos' && (
            <div className="space-y-5 text-xs">
              {/* Header Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <span>Bóveda de Canje de Códigos Secretos</span>
                      <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.2 rounded-full uppercase">
                        Silicio Especial
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Introduce claves y códigos promocionales para desbloquear medallas exclusivas, reliquias y títulos míticos para tu perfil.
                    </p>
                  </div>
                </div>
              </div>

              {/* Drop Diario de Silicio (Caja Diaria & Racha) */}
              <div className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-md shadow-amber-500/20 animate-pulse">
                    📦✨
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono font-bold text-sm text-white flex items-center gap-1.5">
                        <span>Suministro Diario de Silicio</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Racha: {dailyStatus.streakDays} día{dailyStatus.streakDays === 1 ? '' : 's'}
                        </span>
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {dailyStatus.canClaim
                        ? `¡Caja disponible hoy! Reclama +${dailyStatus.todayRewardXp} XP y sube de rango en el silicio.`
                        : '✓ Recompensa de hoy reclamada. Tu racha está protegida hasta mañana.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClaimDailyDrop}
                  disabled={!dailyStatus.canClaim}
                  className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer ${
                    dailyStatus.canClaim
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/30 hover:scale-102'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 opacity-70 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  <span>{dailyStatus.canClaim ? `Reclamar +${dailyStatus.todayRewardXp} XP` : 'Reclamado Hoy ✓'}</span>
                </button>
              </div>

              {/* Code Redemption Input Form */}
              <form onSubmit={handleRedeemCode} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <label className="block text-slate-300 font-bold font-mono text-xs">
                  Ingresa tu Código Secreto:
                </label>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={codeInput}
                      onChange={e => setCodeInput(e.target.value)}
                      placeholder="Escribe el código secreto aquí... (ej. 2026)"
                      className="w-full bg-slate-900 border border-purple-500/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 uppercase tracking-widest focus:outline-none transition-all"
                      maxLength={20}
                    />
                    <Key className="w-4 h-4 text-purple-400 absolute right-3 top-3 pointer-events-none" />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-mono font-bold text-xs transition-all shadow-md shadow-purple-600/30 shrink-0 flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Canjear Código</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-slate-400">
                    💡 <span className="text-slate-300">Descifra los enigmas del tablón de pistas inferior e introduce tus respuestas arriba.</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleRestoreAllMedals}
                    className="text-purple-300 hover:text-purple-200 underline font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                    title="Restaurar todos los códigos y medallas en tu perfil"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restaurar todos mis códigos</span>
                  </button>
                </div>
              </form>

              {/* Feedback Alert */}
              {codeFeedback && (
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    codeFeedback.type === 'success'
                      ? 'bg-purple-950/40 border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20'
                      : codeFeedback.type === 'info'
                      ? 'bg-blue-950/40 border-blue-400 text-blue-200'
                      : 'bg-rose-950/40 border-rose-400 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl shrink-0">
                      {codeFeedback.type === 'success' ? '🔮' : codeFeedback.type === 'info' ? 'ℹ️' : '⚠️'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h5 className="font-bold text-xs font-mono">
                        {codeFeedback.type === 'success' ? '¡FELICITACIONES! CÓDIGO RECONOCIDO' : codeFeedback.type === 'info' ? 'CÓDIGO YA REGISTRADO' : 'ERROR AL CANJEAR'}
                      </h5>
                      <p className="text-[11px] leading-relaxed">
                        {codeFeedback.message}
                      </p>

                      {codeFeedback.type === 'success' && (() => {
                        const targetId = codeFeedback.unlockedMedal?.id || 'secret-2026';
                        const isEquippedNow = userProfile.equippedMedalId === targetId;
                        return (
                          <div className="pt-2 flex items-center gap-2 flex-wrap">
                            {isEquippedNow ? (
                              <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
                                <span>👑 Ya Equipada en tu Perfil</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEquipMedal(targetId)}
                                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-md shadow-amber-500/30 flex items-center gap-1.5"
                              >
                                <span>👑 Equipar en mi Perfil Ahora</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setActiveTab('achievements')}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
                            >
                              Ver en Medallas
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Secret 2026 Medal Showcase Card */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Medalla Especial de Código: "2026"
                  </span>
                  {(userProfile.redeemedCodes || []).includes('2026') ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ Desbloqueada
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      🔒 Por Canjear
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-slate-950/60 border border-purple-500/20">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-600 to-indigo-700 flex items-center justify-center text-3xl shadow-lg shadow-purple-600/30 border border-purple-400/40 shrink-0">
                    🔮
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-sm text-white font-mono flex items-center gap-2">
                      <span>Viajero del Silicio 2026</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        Mítica
                      </span>
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      La insignia secreta que conmemora el lanzamiento oficial de Núcleo en el año 2026. Equípala para lucir una estela cuántica púrpura en tu perfil.
                    </p>
                  </div>
                </div>

                {(userProfile.redeemedCodes || []).includes('2026') && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleEquipMedal('secret-2026')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        userProfile.equippedMedalId === 'secret-2026'
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm shadow-amber-500/30'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm shadow-purple-600/30'
                      }`}
                    >
                      {userProfile.equippedMedalId === 'secret-2026' ? '👑 Medalla 2026 Equipada' : '⚡ Equipar Medalla 2026'}
                    </button>
                  </div>
                )}
              </div>

              {/* 20 Enigmatic Clues Section (Clues ONLY, no codes revealed!) */}
              <div className="p-4 rounded-xl border border-purple-500/30 bg-slate-900/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-400" />
                    <h5 className="font-bold text-xs text-white font-mono">
                      Tablón de Pistas de Códigos Secretos ({SECRET_CODES_CLUES.length} Enigmas)
                    </h5>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono">
                    {SECRET_CODES_CLUES.filter(c => evaluatedMedals.some(m => m.title === c.rewardTitle && m.unlocked)).length} / {SECRET_CODES_CLUES.length} Descifrados
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lee atentamente cada pista de la cultura de hardware y ensamblaje. Si descubres la palabra o clave correspondiente, escríbela en el canjeador de arriba para reclamar la medalla mítica.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {SECRET_CODES_CLUES.map((item, idx) => {
                    const isSolved = evaluatedMedals.some(m => m.title === item.rewardTitle && m.unlocked);

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                          isSolved
                            ? 'bg-purple-950/20 border-purple-500/40 text-purple-200'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-purple-400 font-bold">Pista #{idx + 1} · {item.category}</span>
                            <span className="text-slate-500 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">{item.tier}</span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-snug">
                            {item.clue}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400 flex items-center gap-1">
                            <span>Recompensa:</span>
                            <span className="text-white font-semibold">{item.rewardIcon} {item.rewardTitle}</span>
                          </span>

                          {isSolved ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Canjeado
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Bloqueado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Redeemed Codes History */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-2">
                <h5 className="font-bold text-xs text-slate-300 font-mono flex items-center gap-1.5">
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Códigos Canjeados en tu Perfil ({userProfile.redeemedCodes?.length || 0})
                </h5>

                {userProfile.redeemedCodes && userProfile.redeemedCodes.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {userProfile.redeemedCodes.map((c, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between font-mono text-[11px]"
                      >
                        <span className="text-purple-300 font-bold">{c}</span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Canjeado y Guardado
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Aún no has canjeado ningún código. ¡Escribe <strong>2026</strong> arriba para obtener tu primera medalla secreta!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB: HERRAMIENTAS & ACÚSTICA (ACOUSTIC LAB & RIG SHOWCASE CARD) */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              {/* SECTION 1: FAN CURVE & ACOUSTIC LAB */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                      <Volume2 className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm font-mono flex items-center gap-2">
                        <span>Laboratorio Acústico & Curva de Ventiladores</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.2 rounded-full">
                          Simulador Web Audio
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Prueba la acústica de tu PC según la velocidad de giro (RPM) y estima los decibelios de tu chasis.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTestFanAudio()}
                    disabled={isTestingFan}
                    className={`px-3.5 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 transition-all shadow-md ${
                      isTestingFan
                        ? 'bg-cyan-500 text-slate-950 animate-pulse'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30 active:scale-95'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isTestingFan ? 'Sintetizando Audio...' : '🔊 Probar Acústica'}</span>
                  </button>
                </div>

                {/* RPM Gauge and Slider */}
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Velocidad de Giro:</span>
                    <span className="text-cyan-400 font-bold text-sm">{fanRpm} RPM</span>
                  </div>

                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="50"
                    value={fanRpm}
                    onChange={e => setFanRpm(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />

                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>500 RPM (Silencioso)</span>
                    <span>1750 RPM (Balanceado)</span>
                    <span>3000 RPM (Turbina LN2)</span>
                  </div>
                </div>

                {/* Preset Profiles */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-300 font-mono">Perfiles Acústicos Rápidos:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: '0-dB Silencioso', rpm: 600, dba: '16 dBA', desc: 'Inaudible en reposo', icon: '🌙' },
                      { name: 'Equilibrado', rpm: 1200, dba: '24 dBA', desc: 'Flujo constante', icon: '⚖️' },
                      { name: 'Modo Gamer', rpm: 2000, dba: '36 dBA', desc: 'Presión positiva', icon: '🎮' },
                      { name: 'Turbina Overclock', rpm: 3000, dba: '48 dBA', desc: 'Refrigeración extrema', icon: '🚀' }
                    ].map(p => (
                      <button
                        key={p.rpm}
                        onClick={() => {
                          setFanRpm(p.rpm);
                          handleTestFanAudio(p.rpm);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all font-mono ${
                          fanRpm === p.rpm
                            ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-sm shadow-cyan-500/20'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{p.icon} {p.name}</span>
                          <span className="text-cyan-300 text-[10px]">{p.dba}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Decibel Meter & Acoustic Health */}
                <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Nivel de Presión Sonora Estimado:</span>
                    <strong className={`font-mono ${
                      fanRpm < 1000 ? 'text-emerald-400' : fanRpm < 2200 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      ~{Math.round(15 + (fanRpm / 3000) * 33)} dBA
                    </strong>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {fanRpm < 1000
                      ? '🟢 Confort Auditivo Óptimo (Apto para dormitorios)'
                      : fanRpm < 2200
                      ? '🟡 Nivel Típico con Auriculares'
                      : '🔴 Flujo Agresivo de Disipación'}
                  </span>
                </div>
              </div>

              {/* SECTION 2: RIG SHOWCASE CARD GENERATOR */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs sm:text-sm font-mono flex items-center gap-2">
                        <span>Tarjeta Gamer de Ensamble (Rig Showcase)</span>
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.2 rounded-full">
                          Exportador Social
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Genera una ficha estilizada con tus medallas y componentes para compartir en Discord, Reddit o foros de PC.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyRigMarkdown()}
                      className="px-3 py-1.5 rounded-xl font-bold font-mono text-xs bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/30 active:scale-95 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Ficha Markdown</span>
                    </button>
                  </div>
                </div>

                {/* Rig Card Live Preview */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/30 border border-purple-500/40 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-4 flex-wrap relative z-10">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl p-0.5 shadow-md ${
                        activePreset ? `bg-gradient-to-br ${activePreset.gradient}` : 'bg-gradient-to-br from-purple-600 to-red-600'
                      }`}>
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
                          {userProfile.avatarUrl ? (
                            <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : activePreset ? (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${activePreset.gradient} text-white`}>
                              <span className="text-xl">{activePreset.icon}</span>
                            </div>
                          ) : (
                            <img src="/assets/aistudio/image_08c4c239.png" alt="Emblema Núcleo" className="w-8 h-8 object-contain" />
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-white text-base">{userProfile.gamerTag}</h5>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            Nv.{levelInfo.level} · {levelInfo.rankTitle}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {userProfile.bio || 'Arquitecto y entusiasta de hardware.'}
                        </p>
                      </div>
                    </div>

                    {equippedMedal && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/50 shadow-xs">
                        <span className="text-xl">{equippedMedal.icon}</span>
                        <div>
                          <div className="text-[10px] uppercase font-mono text-amber-400 font-bold">Medalla Activa</div>
                          <div className="text-xs font-bold text-white">{equippedMedal.title}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Build Specs Preview */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">PROCESADOR</span>
                      <strong className="text-white text-[11px] truncate block">
                        {savedBuilds[0]?.components.cpu?.name || 'Sin CPU guardado'}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">TARJETA GRÁFICA</span>
                      <strong className="text-emerald-400 text-[11px] truncate block">
                        {savedBuilds[0]?.components.gpu?.name || 'Sin GPU guardada'}
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">RESOLUCIÓN</span>
                      <strong className="text-cyan-400 text-[11px] block">
                        {userProfile.preferredResolution} Nativa
                      </strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">RÉCORD ARCADE</span>
                      <strong className="text-amber-400 text-[11px] block">
                        {topGameScore > 0 ? `${topGameScore} pts` : 'Iniciado'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
