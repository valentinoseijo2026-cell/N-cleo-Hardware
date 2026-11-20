import { WeeklyMarketReport, WeeklyDealItem, WeeklyFeaturedBuild, WeeklyGameQuest } from '../types';

const STORAGE_KEY = 'nucleo_weekly_market_report_v2';
const QUEST_STORAGE_KEY = 'nucleo_weekly_quest_status_v1';

// Calculate standard ISO week number
export function getISOWeekNumber(date: Date = new Date()): { weekNumber: number; year: number } {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { weekNumber, year: target.getFullYear() };
}

// Compute the exact timestamp of next Monday at 00:00:00 local time
export function getNextMondayTimestamp(fromDate: Date = new Date()): number {
  const nextMonday = new Date(fromDate.getTime());
  const day = nextMonday.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const daysUntilNextMonday = day === 0 ? 1 : 8 - day;
  nextMonday.setDate(nextMonday.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime();
}

// Format countdown remaining until next week's sync
export function getRemainingTimeUntilNextSync(nextSyncTimestamp: number): {
  days: number;
  hours: number;
  minutes: number;
  formatted: string;
} {
  const diff = Math.max(0, nextSyncTimestamp - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  let formatted = '';
  if (days > 0) {
    formatted = `${days}d ${hours}h`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes}m`;
  } else {
    formatted = `${minutes}m`;
  }

  return { days, hours, minutes, formatted };
}

// Generate weekly report content based on 4-week rotating cycle
function generateReportForWeek(weekNum: number, year: number): WeeklyMarketReport {
  const cycleIndex = ((weekNum - 1) % 4 + 4) % 4; // 0, 1, 2, 3
  const now = Date.now();
  const nextSync = getNextMondayTimestamp();

  const daysLeftThisWeek = Math.max(
    1,
    Math.ceil((nextSync - now) / (1000 * 60 * 60 * 24))
  );

  const dealsByCycle: WeeklyDealItem[][] = [
    // Cycle 0: AM5 & 1440p Sweet Spot Deals
    [
      {
        id: `deal-w${weekNum}-ssd`,
        componentCategory: 'storage',
        name: 'Lexar NM790 PCIe 4.0 NVMe 2TB',
        specs: '7.400 MB/s lectura · Sin caché DRAM · Eficiencia térmica extrema',
        originalPriceUSD: 149,
        dealPriceUSD: 118,
        discountPercent: 21,
        badge: '🔥 Flash -21%',
        retailerNotice: 'Precio mínimo de las últimas 6 semanas',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-gpu`,
        componentCategory: 'gpu',
        name: 'Sapphire PULSE AMD Radeon RX 7900 GRE 16GB',
        specs: '16GB GDDR6 · Dual BIOS · Recomendada para 1440p Ultra',
        originalPriceUSD: 549,
        dealPriceUSD: 495,
        discountPercent: 10,
        badge: '⭐ Sweet Spot 1440p',
        retailerNotice: 'Rebaja semanal destacada para gaming en QHD',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-ram`,
        componentCategory: 'ram',
        name: 'Corsair Vengeance DDR5 32GB (2x16GB) 6000MHz CL30',
        specs: 'Perfil AMD EXPO & Intel XMP 3.0 · Latencia CL30 ultra baja',
        originalPriceUSD: 122,
        dealPriceUSD: 96,
        discountPercent: 21,
        badge: '⚡ Ahorro -21%',
        retailerNotice: 'Stock limitado en tiendas locales verificadas',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-cpu`,
        componentCategory: 'cpu',
        name: 'AMD Ryzen 7 7800X3D (8C/16T 3D V-Cache)',
        specs: '96MB L3 Cache · El rey del gaming competitivo y simuladores',
        originalPriceUSD: 449,
        dealPriceUSD: 389,
        discountPercent: 13,
        badge: '👑 Rey Gaming',
        retailerNotice: 'Ajuste de precio semanal en arquitectura AM5',
        expiresInDays: daysLeftThisWeek
      }
    ],
    // Cycle 1: RTX 4080 Super & 4K Creator Deals
    [
      {
        id: `deal-w${weekNum}-gpu`,
        componentCategory: 'gpu',
        name: 'ASUS TUF Gaming GeForce RTX 4080 SUPER 16GB',
        specs: '16GB GDDR6X · Bus 256-bit · DLSS 3.5 & Frame Generation',
        originalPriceUSD: 1049,
        dealPriceUSD: 959,
        discountPercent: 9,
        badge: '💎 Élite 4K',
        retailerNotice: 'Descuento especial de la rotación semanal',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-psu`,
        componentCategory: 'psu',
        name: 'Corsair RM1000x SHIFT ATX 3.0 1000W Gold',
        specs: 'Conectores laterales · Cable 12VHPWR nativo · 100% Modular',
        originalPriceUSD: 189,
        dealPriceUSD: 158,
        discountPercent: 16,
        badge: '🔌 ATX 3.0 Ready',
        retailerNotice: 'Rebaja semanal certificada 80+ Gold',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-case`,
        componentCategory: 'case',
        name: 'Lian Li O11 Dynamic EVO Panorámico',
        specs: 'Doble cámara · Vidrio templado sin pilares · Soporte triple 360mm',
        originalPriceUSD: 169,
        dealPriceUSD: 142,
        discountPercent: 16,
        badge: '🌟 Look Pecera',
        retailerNotice: 'Superventas con descuento de lote semanal',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-ssd`,
        componentCategory: 'storage',
        name: 'Samsung 990 PRO PCIe 4.0 NVMe 2TB',
        specs: '7.450 MB/s lectura · Controlador Pascal · Ideal edición 4K',
        originalPriceUSD: 185,
        dealPriceUSD: 152,
        discountPercent: 18,
        badge: '⚡ Pro Studio',
        retailerNotice: 'Descuento directo de distribuidor esta semana',
        expiresInDays: daysLeftThisWeek
      }
    ],
    // Cycle 2: Intel Core Ultra & Workstation Gen 5 Deals
    [
      {
        id: `deal-w${weekNum}-cpu`,
        componentCategory: 'cpu',
        name: 'Intel Core Ultra 9 285K (24 Núcleos Arrow Lake)',
        specs: 'LGA1851 · NPU IA dedicada · Frecuencias hasta 5.7 GHz',
        originalPriceUSD: 619,
        dealPriceUSD: 559,
        discountPercent: 10,
        badge: '🔵 Arrow Lake',
        retailerNotice: 'Oferta semanal en tope de gama Intel',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-mb`,
        componentCategory: 'motherboard',
        name: 'MSI MPG Z890 CARBON WIFI (LGA1851)',
        specs: 'VRM 20+1+1 fases · PCIe 5.0 M.2 · Thunderbolt 4 & WiFi 7',
        originalPriceUSD: 449,
        dealPriceUSD: 389,
        discountPercent: 13,
        badge: '🛡️ Blindaje Z890',
        retailerNotice: 'Combo semanal para creadores y entusiastas',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-ssd`,
        componentCategory: 'storage',
        name: 'Crucial T705 2TB PCIe Gen5 x4 NVMe',
        specs: '14.500 MB/s lectura · DirectStorage nativo · Máximo ancho de banda',
        originalPriceUSD: 289,
        dealPriceUSD: 239,
        discountPercent: 17,
        badge: '🚀 Gen 5.0 -17%',
        retailerNotice: 'Mayor caída semanal en almacenamiento Gen5',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-cooler`,
        componentCategory: 'cooler',
        name: 'Arctic Liquid Freezer III 360 A-RGB',
        specs: 'Radiador 38mm · Ventilador VRM integrado · Contacto offset',
        originalPriceUSD: 119,
        dealPriceUSD: 94,
        discountPercent: 21,
        badge: '❄️ Rey Térmico',
        retailerNotice: 'Mejor rendimiento térmico por dólar de la semana',
        expiresInDays: daysLeftThisWeek
      }
    ],
    // Cycle 3: Esports 240Hz & Value Performance Deals
    [
      {
        id: `deal-w${weekNum}-gpu`,
        componentCategory: 'gpu',
        name: 'NVIDIA GeForce RTX 4070 SUPER 12GB',
        specs: '12GB GDDR6X · Eficiencia 220W · DLSS 3.5 para 1440p fluido',
        originalPriceUSD: 619,
        dealPriceUSD: 559,
        discountPercent: 10,
        badge: '🎯 Calidad/Precio',
        retailerNotice: 'GPU más equilibrada en oferta semanal',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-cpu`,
        componentCategory: 'cpu',
        name: 'AMD Ryzen 5 7600X (6C/12T AM5)',
        specs: '5.3 GHz Boost · PCIe 5.0 · Actualizable a Ryzen 9000X3D',
        originalPriceUSD: 239,
        dealPriceUSD: 189,
        discountPercent: 21,
        badge: '🔥 Súper Valor -21%',
        retailerNotice: 'Mínimo histórico en entrada a plataforma AM5',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-cooler`,
        componentCategory: 'cooler',
        name: 'DeepCool AK620 Dual-Tower',
        specs: 'Doble torre 6 heatpipes · Silencioso · Soporta 260W TDP',
        originalPriceUSD: 68,
        dealPriceUSD: 52,
        discountPercent: 24,
        badge: '💨 Aire Dual -24%',
        retailerNotice: 'Descuento relámpago de la semana',
        expiresInDays: daysLeftThisWeek
      },
      {
        id: `deal-w${weekNum}-case`,
        componentCategory: 'case',
        name: 'Corsair 4000D Airflow Cristal Templado',
        specs: 'Frontal microperforado · Gestión rápida de cables · ATX',
        originalPriceUSD: 104,
        dealPriceUSD: 82,
        discountPercent: 21,
        badge: '🌬️ Airflow Top',
        retailerNotice: 'Clásico de flujo de aire en liquidación semanal',
        expiresInDays: daysLeftThisWeek
      }
    ]
  ];

  // ALL componentIds below match real IDs in src/data/componentsData.ts
  const featuredBuildsByCycle: WeeklyFeaturedBuild[] = [
    {
      id: `weekly-build-w${weekNum}-conqueror`,
      weekNumber: weekNum,
      title: 'El Conquistador 1440p High-Refresh',
      subtitle: 'La configuración más equilibrada de la semana con $185 USD de ahorro',
      concept: 'Diseñada específicamente para jugar en monitores 1440p a más de 144 FPS con máxima estabilidad térmica y componentes en oferta simultánea.',
      tierBadge: '⭐ Selección de la Semana',
      totalOriginalUSD: 1920,
      totalDealUSD: 1735,
      weeklySavingsUSD: 185,
      componentIds: {
        cpu: 'cpu-r7-7800x3d',
        gpu: 'gpu-rx-7900-gre-16gb',
        motherboard: 'mb-b650-tomahawk',
        ram: 'ram-ddr5-32gb-6000-cl30',
        storage: 'ssd-lexar-nm790-2tb',
        cooler: 'cooler-nzxt-kraken-elite-360',
        psu: 'psu-seasonic-focus-gx850-atx3',
        case: 'case-fractal-north'
      },
      highlights: [
        'Procesador Ryzen 7 7800X3D con caché 3D V-Cache de 96MB',
        'Tarjeta gráfica Radeon RX 7900 GRE de 16GB VRAM en rebaja',
        '32GB DDR5 6000 CL30 con perfil EXPO garantizado',
        'Fuente Seasonic Focus GX 850W ATX 3.0 y flujo Fractal North'
      ]
    },
    {
      id: `weekly-build-w${weekNum}-titan-4k`,
      weekNumber: weekNum,
      title: 'Titán Studio & Ray-Tracing 4K',
      subtitle: 'Potencia pura para renderizado 3D, IA local y gaming 4K Ultra',
      concept: 'Aprovecha las rebajas semanales en fuentes ATX 3.0 de 1000W, SSD 990 PRO y el rey Ryzen 7 9800X3D junto a la RTX 4080 Super.',
      tierBadge: '👑 Selección Élite 4K',
      totalOriginalUSD: 2690,
      totalDealUSD: 2410,
      weeklySavingsUSD: 280,
      componentIds: {
        cpu: 'cpu-r7-9800x3d',
        gpu: 'gpu-rtx-4080-super-16gb',
        motherboard: 'mb-x870-asus-tuf',
        ram: 'ram-ddr5-32gb-6000-cl30',
        storage: 'ssd-samsung-990-pro-2tb',
        cooler: 'cooler-arctic-liquid-iii-360',
        psu: 'psu-corsair-rm1000x-shift',
        case: 'case-lian-li-o11-dynamic-evo'
      },
      highlights: [
        'Ryzen 7 9800X3D + RTX 4080 Super 16GB para 4K Path Tracing',
        'Placa X870 ASUS TUF con soporte PCIe 5.0 en GPU y SSD',
        'Fuente Corsair RM1000x SHIFT con cable nativo 12VHPWR',
        'Ahorro acumulado de $280 USD frente a cotizaciones sueltas'
      ]
    },
    {
      id: `weekly-build-w${weekNum}-arrow-workstation`,
      weekNumber: weekNum,
      title: 'Arrow Lake Suprema · Creador & IA 4090',
      subtitle: 'Estación extrema Intel LGA1851 con 64GB DDR5 y SSD PCIe Gen5',
      concept: 'Orientada a quienes compilan, entrenan modelos de IA, editan vídeo 8K y juegan al máximo nivel con Core Ultra 9 285K y RTX 4090.',
      tierBadge: '🔵 Edición Arrow Lake',
      totalOriginalUSD: 4150,
      totalDealUSD: 3790,
      weeklySavingsUSD: 360,
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
      highlights: [
        'Intel Core Ultra 9 285K (24 núcleos) + MSI MPG Z890 Carbon WiFi',
        'RTX 4090 de 24GB GDDR6X con 64GB DDR5 6400MT/s',
        'Almacenamiento Crucial T705 Gen5 de hasta 14.500 MB/s',
        'Fuente Seasonic Vertex GX-1200W Platinum para picos transitorios'
      ]
    },
    {
      id: `weekly-build-w${weekNum}-esports-value`,
      weekNumber: weekNum,
      title: 'Relámpago Esports 240Hz AM5',
      subtitle: 'Máxima relación FPS por dólar en 1080p y 1440p competitivo',
      concept: 'Configuración ágil y fresca que exprime el Ryzen 5 7600X y la RTX 4070 Super dentro del legendario chasis Corsair 4000D Airflow.',
      tierBadge: '⚡ Mejor Calidad/Precio',
      totalOriginalUSD: 1420,
      totalDealUSD: 1255,
      weeklySavingsUSD: 165,
      componentIds: {
        cpu: 'cpu-r5-7600x',
        gpu: 'gpu-rtx-4070-super-12gb',
        motherboard: 'mb-b650-gigabyte-eagle',
        ram: 'ram-ddr5-32gb-6000-cl30',
        storage: 'ssd-wd-black-sn770-1tb',
        cooler: 'cooler-deepcool-ak620',
        psu: 'psu-corsair-rm750e-atx3',
        case: 'case-corsair-4000d-airflow'
      },
      highlights: [
        'Ryzen 5 7600X AM5 con puerta abierta a futuras mejoras X3D',
        'RTX 4070 Super 12GB ideal para 1440p a más de 144 FPS',
        'Doble torre DeepCool AK620 ultra silenciosa y libre de mantenimiento',
        'Flujo de aire optimizado en Corsair 4000D Airflow'
      ]
    }
  ];

  // Check saved quest status
  let savedQuestCompleted = false;
  try {
    const raw = localStorage.getItem(QUEST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.weekNumber === weekNum && parsed.isCompleted) {
        savedQuestCompleted = true;
      }
    }
  } catch {
    // ignore
  }

  const questsByCycle: WeeklyGameQuest[] = [
    {
      id: `quest-w${weekNum}-zeroday`,
      weekNumber: weekNum,
      title: 'Operación Desinfección Zero-Day',
      targetDescription: 'Supera los primeros 5 reinos de Núcleo Legend, alcanza más de 21.000 puntos y derrota al Titán Virus Zero-Day Prime.',
      rewardTitle: '👑 Medalla de Oro: Purificador Zero-Day',
      rewardPoints: 10000,
      targetScore: 21000,
      targetBossKill: true,
      isCompleted: savedQuestCompleted
    },
    {
      id: `quest-w${weekNum}-intel-vs-amd`,
      weekNumber: weekNum,
      title: 'Desafío Dual: Camino Intel o AMD',
      targetDescription: 'Completa los 6 reinos de Núcleo Legend eligiendo tu alianza en la bifurcación final (Intel Core Ultra o AMD Ryzen X3D) y vence al jefe definitivo.',
      rewardTitle: '⚡ Medalla de Diamante: Arquitecto de Facción',
      rewardPoints: 15000,
      targetScore: 24000,
      targetBossKill: true,
      isCompleted: savedQuestCompleted
    },
    {
      id: `quest-w${weekNum}-cryo-combo`,
      weekNumber: weekNum,
      title: 'Fiebre de Combos x5 Criogénicos',
      targetDescription: 'Encadena rachas de eliminación en Núcleo Legend, conquista el Reino 6 sin sobrecalentarte y reclama la PC Suprema.',
      rewardTitle: '❄️ Insignia Criogénica: Maestro de Combos',
      rewardPoints: 12500,
      targetScore: 22000,
      targetBossKill: true,
      isCompleted: savedQuestCompleted
    },
    {
      id: `quest-w${weekNum}-speed-silicon`,
      weekNumber: weekNum,
      title: 'Rescate Total del Hardware',
      targetDescription: 'Rescata piezas legendarias a través de los 6 reinos y derrota al núcleo corrupto en cualquiera de las dos rutas finales.',
      rewardTitle: '🛡️ Guardián Supremo del Silicio',
      rewardPoints: 13500,
      targetScore: 20000,
      targetBossKill: true,
      isCompleted: savedQuestCompleted
    }
  ];

  const trendsByCycle = [
    {
      gpu: -2.4,
      cpu: -1.6,
      ram: -3.5,
      sentiment: 'Favorable para el comprador: rebajas en memoria RAM DDR5 CL30 y GPUs 1440p.'
    },
    {
      gpu: -1.9,
      cpu: -2.2,
      ram: -1.1,
      sentiment: 'Estabilidad de precios con descuentos fuertes en fuentes ATX 3.0 y almacenamiento 4K.'
    },
    {
      gpu: -1.2,
      cpu: -2.8,
      ram: +0.5,
      sentiment: 'Recorte agresivo en procesadores Arrow Lake, placas Z890 y SSDs PCIe Gen 5.0.'
    },
    {
      gpu: -2.7,
      cpu: -3.1,
      ram: -2.0,
      sentiment: 'Semana ideal para PCs competitivos: caída de precios en Ryzen 7600X y RTX 4070 Super.'
    }
  ];

  const trend = trendsByCycle[cycleIndex];

  return {
    weekNumber: weekNum,
    year,
    weekLabel: `Semana ${weekNum} · ${year}`,
    lastSyncTimestamp: now,
    nextSyncTimestamp: nextSync,
    gpuTrendPercent: trend.gpu,
    cpuTrendPercent: trend.cpu,
    ramTrendPercent: trend.ram,
    marketSentiment: trend.sentiment,
    deals: dealsByCycle[cycleIndex],
    featuredBuild: featuredBuildsByCycle[cycleIndex],
    weeklyQuest: questsByCycle[cycleIndex]
  };
}

// Get the current weekly market report with automatic week-change cache invalidation
export function getWeeklyMarketReport(): WeeklyMarketReport {
  const { weekNumber, year } = getISOWeekNumber();

  try {
    const cachedRaw = localStorage.getItem(STORAGE_KEY);
    if (cachedRaw) {
      const cached: WeeklyMarketReport = JSON.parse(cachedRaw);
      const isSameWeek = cached.weekNumber === weekNumber && cached.year === year;
      const isNotExpired = Date.now() < cached.nextSyncTimestamp;

      if (isSameWeek && isNotExpired) {
        try {
          const questRaw = localStorage.getItem(QUEST_STORAGE_KEY);
          if (questRaw) {
            const q = JSON.parse(questRaw);
            if (q.weekNumber === weekNumber && q.isCompleted) {
              cached.weeklyQuest.isCompleted = true;
            }
          }
        } catch {
          // ignore
        }
        return cached;
      }
    }
  } catch (err) {
    console.warn('Error reading cached weekly market report:', err);
  }

  const freshReport = generateReportForWeek(weekNumber, year);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshReport));
    // Also mark weekly report visit key for medal evaluation
    localStorage.setItem('nucleo_weekly_market_report_v1', 'true');
  } catch (err) {
    console.warn('Error saving weekly market report:', err);
  }
  return freshReport;
}

// Manually trigger a fresh sync
export function forceSyncWeeklyReport(): WeeklyMarketReport {
  const { weekNumber, year } = getISOWeekNumber();
  const fresh = generateReportForWeek(weekNumber, year);
  fresh.lastSyncTimestamp = Date.now();
  fresh.nextSyncTimestamp = getNextMondayTimestamp();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    localStorage.setItem('nucleo_weekly_market_report_v1', 'true');
  } catch (err) {
    console.warn('Error caching forced weekly sync:', err);
  }
  return fresh;
}

// Mark weekly quest completed
export function setWeeklyQuestCompleted(score: number): void {
  const { weekNumber } = getISOWeekNumber();
  try {
    const payload = {
      weekNumber,
      isCompleted: true,
      completedAt: new Date().toISOString(),
      score
    };
    localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Error recording quest completion:', e);
  }
}

// Power and Energy Cost Estimator
export interface PowerCostCalculation {
  watts: number;
  hoursPerWeek: number;
  costPerKwh: number;
  weeklyKwh: number;
  weeklyCostUSD: number;
  monthlyCostUSD: number;
  yearlyCostUSD: number;
  yearlyCo2Kg: number;
}

export function calculateWeeklyPowerCost(
  tdpWatts: number,
  hoursPerWeek: number = 20,
  costPerKwh: number = 0.16
): PowerCostCalculation {
  const effectiveWatts = Math.max(50, tdpWatts);
  const weeklyKwh = (effectiveWatts * hoursPerWeek) / 1000;
  const weeklyCostUSD = weeklyKwh * costPerKwh;
  const monthlyCostUSD = weeklyCostUSD * 4.333;
  const yearlyCostUSD = weeklyCostUSD * 52;
  const yearlyCo2Kg = weeklyKwh * 52 * 0.42;

  return {
    watts: effectiveWatts,
    hoursPerWeek,
    costPerKwh,
    weeklyKwh,
    weeklyCostUSD,
    monthlyCostUSD,
    yearlyCostUSD,
    yearlyCo2Kg
  };
}
