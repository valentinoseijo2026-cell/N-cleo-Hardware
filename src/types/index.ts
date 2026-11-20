export type HardwareCategory = 'all' | 'gpu' | 'cpu' | 'motherboard' | 'storage' | 'cooling' | 'display';

export interface ArticleBenchmark {
  title: string;
  unit: string;
  items: {
    label: string;
    score: number;
    isHighlight?: boolean;
    color?: string;
  }[];
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  category: HardwareCategory;
  categoryLabel: string;
  author: string;
  date: string;
  readTime: string;
  imageUrl: string;
  imageAlt: string;
  summary: string;
  content: string[];
  specsHighlight?: { label: string; value: string }[];
  benchmarks?: ArticleBenchmark[];
  pros?: string[];
  cons?: string[];
  estimatedPrice?: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export type ComponentCategory =
  | 'cpu'
  | 'cooler'
  | 'motherboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'case';

export type ComponentTier = 'Ultra Económica' | 'Entrada' | 'Gama Media' | 'Gama Media-Alta' | 'Gama Alta' | 'Entusiasta';

export interface PCComponent {
  id: string;
  name: string;
  brand: string;
  category: ComponentCategory;
  categoryName: string;
  priceMinUSD: number;
  priceMaxUSD: number;
  tdpWatts: number;
  perfScore?: number; // relative gaming score 1-100 for bottleneck & fps calculation
  socket?: 'AM5' | 'AM4' | 'LGA1700' | 'LGA1851';
  ramType?: 'DDR4' | 'DDR5';
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX';
  specs: Record<string, string>;
  tier: ComponentTier;
  shortDesc: string;
  recommendedFor: string;
}

export interface UserBuild {
  id: string;
  name: string;
  createdAt: string;
  components: Partial<Record<ComponentCategory, PCComponent>>;
}

export interface BuildPreset {
  id: string;
  title: string;
  subtitle: string;
  tierCategory: 'Ultra Económica' | 'Entrada Esports' | 'Gama Media' | 'Gama Media-Alta' | 'Gama Alta 4K' | 'Entusiasta Extrema' | 'Creador & IA' | 'Compacta ITX';
  targetResolution: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  componentIds: Partial<Record<ComponentCategory, string>>;
  badge: string;
  description: string;
  fpsHighlights: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rateAgainstUSD: number;
  label: string;
}

export interface BottleneckAnalysis {
  cpuScore: number;
  gpuScore: number;
  status: 'balanced' | 'cpu_bottleneck' | 'gpu_bottleneck';
  summary: string;
  recommendation: string;
  fpsEstimates: {
    game: string;
    resolution: '1080p' | '1440p' | '4K';
    fps: number;
    quality: string;
  }[];
}

export type AppThemeAccent = 'red' | 'cyberpunk' | 'stealth' | 'white' | 'emerald';

export interface UserProfile {
  gamerTag: string;
  avatarSeed: string;
  avatarUrl?: string;
  avatarPresetId?: string;
  bio: string;
  title: string;
  favoriteBuildIds: string[];
  themeAccent: AppThemeAccent;
  defaultCurrencyCode: string;
  soundEnabled: boolean;
  autoSaveBuilds: boolean;
  preferredResolution: '1080p' | '1440p' | '4K';
  preferredHardwareBrand?: 'amd' | 'intel' | 'nvidia' | 'all';
  rgbLightingMode?: 'rainbow' | 'breathing' | 'static' | 'pulse' | 'off';
  showFpsOverlay?: boolean;
  benchmarkTargetFps?: number;
  lowPowerMode?: boolean;
  batterySaverAutoDetect?: boolean;
  equippedMedalId?: string;
  redeemedCodes?: string[];
  unlockedMedals?: string[];
}

export interface BuildHistoryEntry {
  id: string;
  timestamp: string;
  buildName: string;
  components: Partial<Record<ComponentCategory, PCComponent>>;
  totalMinUSD: number;
  totalMaxUSD: number;
  tdpWatts: number;
  summary: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  fpsAchieved: number;
  levelReached: number;
  componentsRescued: number;
  date: string;
  victory: boolean;
  rankTitle: string;
}

export interface WeeklyDealItem {
  id: string;
  componentCategory: ComponentCategory;
  name: string;
  specs: string;
  originalPriceUSD: number;
  dealPriceUSD: number;
  discountPercent: number;
  badge: string;
  retailerNotice: string;
  expiresInDays: number;
}

export interface WeeklyFeaturedBuild {
  id: string;
  weekNumber: number;
  title: string;
  subtitle: string;
  concept: string;
  tierBadge: string;
  totalOriginalUSD: number;
  totalDealUSD: number;
  weeklySavingsUSD: number;
  componentIds: Partial<Record<ComponentCategory, string>>;
  highlights: string[];
}

export interface WeeklyGameQuest {
  id: string;
  weekNumber: number;
  title: string;
  targetDescription: string;
  rewardTitle: string;
  rewardPoints: number;
  targetScore: number;
  targetBossKill: boolean;
  isCompleted: boolean;
}

export interface WeeklyMarketReport {
  weekNumber: number;
  year: number;
  weekLabel: string;
  lastSyncTimestamp: number;
  nextSyncTimestamp: number;
  gpuTrendPercent: number;
  cpuTrendPercent: number;
  ramTrendPercent: number;
  marketSentiment: string;
  deals: WeeklyDealItem[];
  featuredBuild: WeeklyFeaturedBuild;
  weeklyQuest: WeeklyGameQuest;
}
