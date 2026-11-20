import { PCComponent, ComponentCategory, CurrencyConfig, BottleneckAnalysis } from '../types';
import { COMPONENTS_DATABASE } from '../data/componentsData';

export interface CompatibilityReport {
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
  systemTdpWatts: number;
  recommendedPsuWatts: number;
}

export function formatPrice(amountUSD: number, currency: CurrencyConfig): string {
  const converted = amountUSD * currency.rateAgainstUSD;
  const isLargeCurrency = currency.rateAgainstUSD > 10;
  const formatted = new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: isLargeCurrency ? 0 : 0
  }).format(Math.round(converted));

  return `${currency.symbol} ${formatted} ${currency.code}`;
}

export function calculateBuildStats(
  selectedComponents: Partial<Record<ComponentCategory, PCComponent>>
) {
  let minUSD = 0;
  let maxUSD = 0;
  let rawTdp = 0;

  Object.values(selectedComponents).forEach(comp => {
    if (!comp) return;
    minUSD += comp.priceMinUSD;
    maxUSD += comp.priceMaxUSD;
    rawTdp += comp.tdpWatts || 0;
  });

  const systemTdp = rawTdp > 0 ? rawTdp + 45 : 0;
  const recommendedPsu = Math.ceil((systemTdp * 1.3) / 50) * 50;

  return {
    minUSD,
    maxUSD,
    systemTdp,
    recommendedPsu: Math.max(recommendedPsu, 450)
  };
}

export function checkCompatibility(
  components: Partial<Record<ComponentCategory, PCComponent>>
): CompatibilityReport {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { systemTdp, recommendedPsu } = calculateBuildStats(components);

  const cpu = components.cpu;
  const mb = components.motherboard;
  const ram = components.ram;
  const psu = components.psu;
  const cooler = components.cooler;

  // 1. CPU vs Motherboard Socket
  if (cpu && mb) {
    if (cpu.socket && mb.socket && cpu.socket !== mb.socket) {
      issues.push(
        `Incompatibilidad de Socket: El procesador ${cpu.name} usa socket ${cpu.socket}, pero la placa ${mb.name} tiene socket ${mb.socket}. No son compatibles físicamente.`
      );
    }
  }

  // 2. RAM vs Motherboard DDR Type
  if (ram && mb) {
    if (ram.ramType && mb.ramType && ram.ramType !== mb.ramType) {
      issues.push(
        `Incompatibilidad de Memoria: El kit de RAM seleccionado es ${ram.ramType}, pero la placa base solo admite ranuras ${mb.ramType}.`
      );
    }
  }

  // 3. Platform DDR restrictions
  if (cpu && ram) {
    if (cpu.socket === 'AM5' && ram.ramType === 'DDR4') {
      issues.push(`La plataforma AMD AM5 (${cpu.name}) no soporta DDR4. Requiere módulos DDR5.`);
    }
    if (cpu.socket === 'LGA1851' && ram.ramType === 'DDR4') {
      issues.push(`La plataforma Intel LGA 1851 (${cpu.name}) no soporta DDR4. Requiere memoria DDR5.`);
    }
  }

  // 4. PSU Wattage Check
  if (psu && systemTdp > 0) {
    const psuMatch = psu.name.match(/(\d{3,4})W/i) || psu.specs['Potencia']?.match(/(\d{3,4})/);
    const psuWatts = psuMatch ? parseInt(psuMatch[1], 10) : 600;

    if (psuWatts < systemTdp) {
      issues.push(
        `Fuente Insuficiente: Consumo estimado ~${systemTdp}W, lo cual supera la capacidad nominal de ${psuWatts}W de la fuente ${psu.name}.`
      );
    } else if (psuWatts < recommendedPsu) {
      warnings.push(
        `Margen Energético Ajustado: Tu fuente (${psuWatts}W) tiene poco margen sobre los ${recommendedPsu}W recomendados para picos transitorios.`
      );
    }
  }

  // 5. Thermal warning
  if (cpu && cooler) {
    if (cpu.tdpWatts >= 160 && (cooler.tier === 'Ultra Económica' || cooler.tier === 'Entrada')) {
      warnings.push(
        `Aviso Térmico: El ${cpu.name} genera alto calor (${cpu.tdpWatts}W+). Sugerimos disipador de doble torre o líquida 240/360mm.`
      );
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    warnings,
    systemTdpWatts: systemTdp,
    recommendedPsuWatts: recommendedPsu
  };
}

// Special Feature: Bottleneck Calculator and Estimated FPS
export function calculateBottleneckAndFps(
  cpu: PCComponent | undefined,
  gpu: PCComponent | undefined
): BottleneckAnalysis | null {
  if (!cpu && !gpu) return null;

  const cpuScore = cpu?.perfScore || 60;
  const gpuScore = gpu?.perfScore || 60;
  const delta = cpuScore - gpuScore;

  let status: 'balanced' | 'cpu_bottleneck' | 'gpu_bottleneck' = 'balanced';
  let summary = 'Excelente equilibrio entre CPU y GPU para gaming sin cuellos de botella notables.';
  let recommendation = 'Tu combinación permite aprovechar tanto los fotogramas en juegos competitivos como la calidad visual en títulos AAA.';

  if (delta > 22) {
    status = 'gpu_bottleneck';
    summary = 'La CPU es notablemente más potente que la GPU (Factor limitante en juegos: Tarjeta Gráfica).';
    recommendation = 'Ideal para jugar a 1080p con altísimos fotogramas en esports, pero en 1440p o 4K la gráfica alcanzará su 100% de uso antes.';
  } else if (delta < -20) {
    status = 'cpu_bottleneck';
    summary = 'La GPU es mucho más potente que el procesador (Factor limitante: Procesador en bajas resoluciones).';
    recommendation = 'En resoluciones altas (1440p/4K) el impacto es menor, pero en 1080p competitivo el procesador limitará los FPS máximos de la gráfica.';
  }

  // FPS formulas based on benchmark data points
  const baseScale = gpuScore / 100;
  const cpuScale = cpuScore / 100;

  const fpsEstimates = [
    {
      game: 'Counter-Strike 2 / Valorant',
      resolution: '1080p' as const,
      fps: Math.round(180 + cpuScale * 260 + baseScale * 140),
      quality: 'Calidad Competitiva / Ultra'
    },
    {
      game: 'Call of Duty: Warzone',
      resolution: '1440p' as const,
      fps: Math.max(45, Math.round(55 + baseScale * 95 + cpuScale * 30)),
      quality: 'Calidad Equilibrada / FSR'
    },
    {
      game: 'Cyberpunk 2077 (DLSS / FSR)',
      resolution: '1440p' as const,
      fps: Math.max(35, Math.round(40 + baseScale * 85)),
      quality: 'Ultra con Trazado de Rayos'
    },
    {
      game: 'Black Myth: Wukong',
      resolution: '4K' as const,
      fps: Math.max(25, Math.round(20 + baseScale * 75)),
      quality: 'Ajustes Altos / DLSS Calidad'
    }
  ];

  return {
    cpuScore,
    gpuScore,
    status,
    summary,
    recommendation,
    fpsEstimates
  };
}

// Special Feature: Budget Optimizer Tips
export function analyzeBudgetDistribution(
  components: Partial<Record<ComponentCategory, PCComponent>>
) {
  const { minUSD } = calculateBuildStats(components);
  if (minUSD === 0) return [];

  const tips: { type: 'optimal' | 'saving' | 'warning'; text: string }[] = [];

  const gpu = components.gpu;
  const cpu = components.cpu;
  const mb = components.motherboard;
  const cooler = components.cooler;

  if (gpu) {
    const gpuPct = Math.round((gpu.priceMinUSD / minUSD) * 100);
    if (gpuPct >= 38 && gpuPct <= 52) {
      tips.push({
        type: 'optimal',
        text: `La GPU representa el ${gpuPct}% del presupuesto total: Reparto óptimo para un PC de juegos moderno.`
      });
    } else if (gpuPct < 30 && minUSD > 800) {
      tips.push({
        type: 'saving',
        text: `La GPU solo representa el ${gpuPct}% del presupuesto. Si el objetivo es gaming, considera invertir más en la tarjeta gráfica.`
      });
    }
  }

  if (mb && cpu && mb.priceMinUSD > cpu.priceMinUSD * 0.95 && mb.tier === 'Gama Alta') {
    tips.push({
      type: 'saving',
      text: `Tu placa base cuesta casi tanto como el procesador. Una placa B650 o B760 te ahorraría entre $50 y $100 sin perder rendimiento.`
    });
  }

  if (cooler && cooler.priceMinUSD > 180 && cpu && cpu.tdpWatts <= 105) {
    tips.push({
      type: 'saving',
      text: `El disipador seleccionado es de exhibición. Para un procesador de ${cpu.tdpWatts}W, un disipador de $35-$60 mantendrá temperaturas óptimas.`
    });
  }

  return tips;
}

// Special Feature: Electricity & Operating Cost Calculator
export interface ElectricityStats {
  monthlyKwh: number;
  monthlyCostUSD: number;
  yearlyCostUSD: number;
  co2KgMonthly: number;
  recommendedUpsVA: number;
}

export function calculateElectricityStats(
  systemTdpWatts: number,
  hoursPerDay: number = 4,
  costPerKwhUSD: number = 0.15
): ElectricityStats {
  if (systemTdpWatts <= 0) {
    return {
      monthlyKwh: 0,
      monthlyCostUSD: 0,
      yearlyCostUSD: 0,
      co2KgMonthly: 0,
      recommendedUpsVA: 650
    };
  }

  // Gaming load average ~ 85% of total TDP, plus idle ~ 15%
  const avgLoadWatts = systemTdpWatts * 0.85;
  const dailyKwh = (avgLoadWatts * hoursPerDay) / 1000;
  const monthlyKwh = dailyKwh * 30;
  const monthlyCostUSD = monthlyKwh * costPerKwhUSD;
  const yearlyCostUSD = monthlyCostUSD * 12;
  const co2KgMonthly = monthlyKwh * 0.42; // ~0.42kg CO2 per kWh grid average
  const recommendedUpsVA = Math.ceil((systemTdpWatts * 1.5) / 100) * 100;

  return {
    monthlyKwh: Math.round(monthlyKwh * 10) / 10,
    monthlyCostUSD: Math.round(monthlyCostUSD * 100) / 100,
    yearlyCostUSD: Math.round(yearlyCostUSD * 100) / 100,
    co2KgMonthly: Math.round(co2KgMonthly * 10) / 10,
    recommendedUpsVA: Math.max(recommendedUpsVA, 750)
  };
}

// Special Feature: Physical Clearance & Dimension Checker
export interface ClearanceReport {
  gpuClearance: {
    status: 'optimal' | 'tight' | 'incompatible';
    gpuLengthMm: number;
    caseMaxGpuMm: number;
    marginMm: number;
    text: string;
  };
  coolerClearance: {
    status: 'optimal' | 'warning';
    type: 'liquid' | 'air';
    text: string;
  };
}

export function checkClearance(
  build: Partial<Record<ComponentCategory, PCComponent>>
): ClearanceReport {
  const pcCase = build.case;
  const gpu = build.gpu;
  const cooler = build.cooler;

  // Case max GPU clearance estimation
  let caseMaxGpu = 380;
  if (pcCase?.id === 'case-montech-air-100') caseMaxGpu = 330;
  else if (pcCase?.id === 'case-montech-air-903-max') caseMaxGpu = 400;
  else if (pcCase?.id === 'case-corsair-4000d-airflow') caseMaxGpu = 360;
  else if (pcCase?.id === 'case-lianli-lancool-216') caseMaxGpu = 392;
  else if (pcCase?.id === 'case-fractal-north') caseMaxGpu = 355;
  else if (pcCase?.id === 'case-lian-li-o11-dynamic-evo') caseMaxGpu = 422;

  // GPU estimated length
  let gpuLength = 260;
  if (gpu?.tier === 'Entusiasta') gpuLength = 336; // RTX 4090 / 5090
  else if (gpu?.tier === 'Gama Alta') gpuLength = 305; // RTX 4070 Ti / 7900 XT
  else if (gpu?.tier === 'Gama Media') gpuLength = 250;
  else if (gpu?.tier === 'Entrada') gpuLength = 230;

  const marginMm = caseMaxGpu - gpuLength;
  let gpuStatus: 'optimal' | 'tight' | 'incompatible' = 'optimal';
  let gpuText = `Holgura óptima (${marginMm} mm libres). Flujo de aire despejado hacia el ventilador frontal.`;

  if (marginMm < 0) {
    gpuStatus = 'incompatible';
    gpuText = `¡Conflicto físico! La tarjeta gráfica (${gpuLength} mm) supera la longitud máxima admitida por el gabinete (${caseMaxGpu} mm).`;
  } else if (marginMm < 25) {
    gpuStatus = 'tight';
    gpuText = `Espacio muy ajustado (${marginMm} mm libres). La tarjeta gráfica quedará muy cerca de los ventiladores frontales.`;
  }

  // Cooler check
  const isAio = cooler?.name.toLowerCase().includes('liquid') || cooler?.name.toLowerCase().includes('kraken');
  let coolerStatus: 'optimal' | 'warning' = 'optimal';
  let coolerText = isAio
    ? `Refrigeración líquida compatible con montaje superior/frontal en chasis ${pcCase?.name.split('(')[0] || 'ATX'}.`
    : `Disipador por aire con altura estándar compatible con la profundidad del chasis.`;

  if (pcCase?.id === 'case-montech-air-100' && isAio && cooler?.name.includes('360')) {
    coolerStatus = 'warning';
    coolerText = `El gabinete Micro-ATX soporta radiadores de hasta 240/280 mm en el techo, un radiador de 360 mm podría requerir montaje frontal.`;
  }

  return {
    gpuClearance: {
      status: gpuStatus,
      gpuLengthMm: gpuLength,
      caseMaxGpuMm: caseMaxGpu,
      marginMm,
      text: gpuText
    },
    coolerClearance: {
      status: coolerStatus,
      type: isAio ? 'liquid' : 'air',
      text: coolerText
    }
  };
}

// Special Feature: Export Build to Text, Reddit Markdown or WhatsApp
export function generateExportBuild(
  build: Partial<Record<ComponentCategory, PCComponent>>,
  buildName: string,
  currency: CurrencyConfig,
  format: 'whatsapp' | 'reddit' | 'plain'
): string {
  const { minUSD, maxUSD, systemTdp } = calculateBuildStats(build);
  const minFmt = formatPrice(minUSD, currency);
  const maxFmt = formatPrice(maxUSD, currency);

  if (format === 'whatsapp') {
    let msg = `🔥 *${buildName} - Configuración Núcleo PC*\n`;
    msg += `💰 Presupuesto estimado: *${minFmt} - ${maxFmt}*\n`;
    msg += `⚡ Consumo TDP estimado: ~${systemTdp}W\n\n`;
    msg += `*Componentes seleccionados:*\n`;

    Object.entries(build).forEach(([cat, comp]) => {
      if (!comp) return;
      msg += `• *${comp.categoryName}:* ${comp.name} (~${formatPrice(comp.priceMinUSD, currency)})\n`;
    });

    msg += `\n_Generado en Núcleo Hardware & PC Builder_`;
    return msg;
  }

  if (format === 'reddit') {
    let md = `### [Núcleo PC Builder] ${buildName}\n\n`;
    md += `| Componente | Modelo | Precio Estimado |\n`;
    md += `| :--- | :--- | :--- |\n`;

    Object.entries(build).forEach(([cat, comp]) => {
      if (!comp) return;
      md += `| **${comp.categoryName}** | ${comp.name} | ${formatPrice(comp.priceMinUSD, currency)} |\n`;
    });

    md += `| **TOTAL ESTIMADO** | **${systemTdp}W TDP** | **${minFmt} - ${maxFmt}** |\n\n`;
    md += `*Precios de referencia aproximados generados en Núcleo.*`;
    return md;
  }

  // Plain Text
  let plain = `========================================\n`;
  plain += `${buildName} - Ensamblado Núcleo\n`;
  plain += `Presupuesto aprox: ${minFmt} - ${maxFmt}\n`;
  plain += `Consumo TDP: ~${systemTdp}W\n`;
  plain += `========================================\n\n`;

  Object.entries(build).forEach(([cat, comp]) => {
    if (!comp) return;
    plain += `[${comp.categoryName.toUpperCase()}]: ${comp.name} (${formatPrice(comp.priceMinUSD, currency)})\n`;
  });

  return plain;
}

// Special Feature: Historical Market Price Evolution
export interface PriceHistoryPoint {
  month: string;
  fullDate: string;
  priceMin: number;
  priceMax: number;
  priceAvg: number;
  gpuPrice: number;
  cpuPrice: number;
  otherPrice: number;
  marketEvent?: string;
}

export interface PriceHistorySummary {
  history: PriceHistoryPoint[];
  currentPrice: number;
  allTimeLow: number;
  allTimeLowDate: string;
  allTimeHigh: number;
  allTimeHighDate: string;
  priceChangePercent: number;
  trend: 'falling' | 'rising' | 'stable';
}

export function generateHistoricalPriceData(
  build: Partial<Record<ComponentCategory, PCComponent>>,
  currency: CurrencyConfig,
  timeframe: '6m' | '12m' | '24m' = '12m'
): PriceHistorySummary {
  const { minUSD, maxUSD } = calculateBuildStats(build);
  const currentBaseUSD = minUSD > 0 ? (minUSD + maxUSD) / 2 : 1250; // fallback realistic baseline if empty
  const currentMinUSD = minUSD > 0 ? minUSD : 1100;
  const currentMaxUSD = maxUSD > 0 ? maxUSD : 1400;

  const gpuBase = build.gpu ? (build.gpu.priceMinUSD + build.gpu.priceMaxUSD) / 2 : currentBaseUSD * 0.42;
  const cpuBase = build.cpu ? (build.cpu.priceMinUSD + build.cpu.priceMaxUSD) / 2 : currentBaseUSD * 0.25;
  const otherBase = Math.max(0, currentBaseUSD - gpuBase - cpuBase);

  // Rate factor to convert USD to target currency
  const rate = currency.rateAgainstUSD;

  // Realistic market historical fluctuations for PC components over 24 months
  // Factors relative to current price (1.0 = current)
  const fullTimeline = [
    { month: 'Dic 24', fullDate: 'Diciembre 2024', factor: 1.16, gpuFactor: 1.20, cpuFactor: 1.14, event: 'Demanda Navideña 2024' },
    { month: 'Ene 25', fullDate: 'Enero 2025', factor: 1.12, gpuFactor: 1.15, cpuFactor: 1.10, event: 'CES 2025 Anuncios' },
    { month: 'Feb 25', fullDate: 'Febrero 2025', factor: 1.09, gpuFactor: 1.11, cpuFactor: 1.08 },
    { month: 'Mar 25', fullDate: 'Marzo 2025', factor: 1.06, gpuFactor: 1.07, cpuFactor: 1.06, event: 'Abaratamiento DDR5' },
    { month: 'Abr 25', fullDate: 'Abril 2025', factor: 1.04, gpuFactor: 1.05, cpuFactor: 1.04 },
    { month: 'May 25', fullDate: 'Mayo 2025', factor: 1.02, gpuFactor: 1.03, cpuFactor: 1.02 },
    { month: 'Jun 25', fullDate: 'Junio 2025', factor: 0.98, gpuFactor: 0.98, cpuFactor: 0.98, event: 'Rebajas Computex' },
    { month: 'Jul 25', fullDate: 'Julio 2025', factor: 0.93, gpuFactor: 0.92, cpuFactor: 0.94, event: 'Mínimo del Verano 2025' },
    { month: 'Ago 25', fullDate: 'Agosto 2025', factor: 0.95, gpuFactor: 0.94, cpuFactor: 0.96 },
    { month: 'Sep 25', fullDate: 'Septiembre 2025', factor: 0.97, gpuFactor: 0.96, cpuFactor: 0.98, event: 'Vuelta a Clases' },
    { month: 'Oct 25', fullDate: 'Octubre 2025', factor: 1.01, gpuFactor: 1.02, cpuFactor: 1.01 },
    { month: 'Nov 25', fullDate: 'Noviembre 2025', factor: 1.07, gpuFactor: 1.09, cpuFactor: 1.06, event: 'Black Friday 2025' },
    { month: 'Dic 25', fullDate: 'Diciembre 2025', factor: 1.12, gpuFactor: 1.15, cpuFactor: 1.10, event: 'Pico de Fin de Año' },
    { month: 'Ene 26', fullDate: 'Enero 2026', factor: 1.08, gpuFactor: 1.10, cpuFactor: 1.07, event: 'Lanzamientos CES 2026' },
    { month: 'Feb 26', fullDate: 'Febrero 2026', factor: 1.05, gpuFactor: 1.06, cpuFactor: 1.05 },
    { month: 'Mar 26', fullDate: 'Marzo 2026', factor: 1.02, gpuFactor: 1.03, cpuFactor: 1.02 },
    { month: 'Abr 26', fullDate: 'Abril 2026', factor: 0.99, gpuFactor: 0.99, cpuFactor: 0.99, event: 'Estabilización de Stock' },
    { month: 'May 26', fullDate: 'Mayo 2026', factor: 0.97, gpuFactor: 0.96, cpuFactor: 0.98 },
    { month: 'Jun 26', fullDate: 'Junio 2026', factor: 0.94, gpuFactor: 0.92, cpuFactor: 0.95, event: 'Rebajas de Medio Año' },
    { month: 'Jul 26', fullDate: 'Julio 2026', factor: 0.91, gpuFactor: 0.89, cpuFactor: 0.92, event: 'Mínimo Histórico Verano' },
    { month: 'Ago 26', fullDate: 'Agosto 2026', factor: 0.93, gpuFactor: 0.91, cpuFactor: 0.94 },
    { month: 'Sep 26', fullDate: 'Septiembre 2026', factor: 0.96, gpuFactor: 0.95, cpuFactor: 0.97, event: 'Llegada Zen 5 / Arrow Lake' },
    { month: 'Oct 26', fullDate: 'Octubre 2026', factor: 0.98, gpuFactor: 0.97, cpuFactor: 0.99 },
    { month: 'Nov 26', fullDate: 'Noviembre 2026 (Actual)', factor: 1.00, gpuFactor: 1.00, cpuFactor: 1.00, event: 'Precio Actual de Mercado' }
  ];

  // Slice timeline according to selected timeframe
  let selectedSlice = fullTimeline;
  if (timeframe === '6m') {
    selectedSlice = fullTimeline.slice(-6);
  } else if (timeframe === '12m') {
    selectedSlice = fullTimeline.slice(-12);
  }

  const history: PriceHistoryPoint[] = selectedSlice.map(item => {
    const minVal = Math.round(currentMinUSD * item.factor * rate);
    const maxVal = Math.round(currentMaxUSD * item.factor * rate);
    const avgVal = Math.round((minVal + maxVal) / 2);

    const gpuVal = Math.round(gpuBase * item.gpuFactor * rate);
    const cpuVal = Math.round(cpuBase * item.cpuFactor * rate);
    const otherVal = Math.max(0, avgVal - gpuVal - cpuVal);

    return {
      month: item.month,
      fullDate: item.fullDate,
      priceMin: minVal,
      priceMax: maxVal,
      priceAvg: avgVal,
      gpuPrice: gpuVal,
      cpuPrice: cpuVal,
      otherPrice: otherVal,
      marketEvent: item.event
    };
  });

  // Calculate stats
  let allTimeLow = Infinity;
  let allTimeLowDate = '';
  let allTimeHigh = -Infinity;
  let allTimeHighDate = '';

  history.forEach(pt => {
    if (pt.priceAvg < allTimeLow) {
      allTimeLow = pt.priceAvg;
      allTimeLowDate = pt.fullDate;
    }
    if (pt.priceAvg > allTimeHigh) {
      allTimeHigh = pt.priceAvg;
      allTimeHighDate = pt.fullDate;
    }
  });

  const firstPoint = history[0];
  const lastPoint = history[history.length - 1];
  const priceChangePercent = Math.round(((lastPoint.priceAvg - firstPoint.priceAvg) / firstPoint.priceAvg) * 1000) / 10;
  
  let trend: 'falling' | 'rising' | 'stable' = 'stable';
  if (priceChangePercent <= -2.5) trend = 'falling';
  else if (priceChangePercent >= 2.5) trend = 'rising';

  return {
    history,
    currentPrice: lastPoint.priceAvg,
    allTimeLow,
    allTimeLowDate,
    allTimeHigh,
    allTimeHighDate,
    priceChangePercent,
    trend
  };
}

// Special Feature: Generalized Synthetic & Gaming Performance Benchmark Engine
export interface PerformanceBenchmarkItem {
  game: string;
  category: string;
  quality: string;
  fps1080p: number;
  fps1440p: number;
  fps4k: number;
  low1Pct1080p: number;
  low1Pct1440p: number;
  low1Pct4k: number;
  frameTimeMs1080p: number;
  frameTimeMs1440p: number;
  frameTimeMs4k: number;
}

export interface SyntheticBenchmarkReport {
  items: PerformanceBenchmarkItem[];
  avgFps1080p: number;
  avgFps1440p: number;
  avgFps4k: number;
  timeSpyScore: number;
  fireStrikeScore: number;
  cinebenchScore: number;
  tierLabel: string;
  tierColor: string;
  recommendedResolution: '1080p' | '1440p' | '4K';
  targetMonitorHz: number;
  hasGpu: boolean;
}

export function generatePerformanceEstimates(
  build: Partial<Record<ComponentCategory, PCComponent>>,
  upscalingEnabled: boolean = true
): SyntheticBenchmarkReport {
  const gpu = build.gpu;
  const cpu = build.cpu;
  const ram = build.ram;

  const hasGpu = Boolean(gpu);
  // Default base fallback scores if component is missing
  const gpuScore = gpu?.perfScore ?? (cpu ? 20 : 35);
  const cpuScore = cpu?.perfScore ?? 50;
  const ramMultiplier = ram?.ramType === 'DDR5' ? 1.05 : 0.98;
  const upscalingMultiplier = upscalingEnabled ? 1.18 : 1.0;

  // Normalized scaling factors
  const gpuRatio = gpuScore / 100;
  const cpuRatio = cpuScore / 100;

  const baseGames = [
    {
      game: 'Counter-Strike 2 / Valorant',
      category: 'Esports Competitivo',
      quality: 'Ultra Competitivo / 240Hz+',
      base1080: 380,
      base1440: 290,
      base4k: 180,
      gpuWeight: 0.45,
      cpuWeight: 0.55
    },
    {
      game: 'Black Myth: Wukong',
      category: 'AAA Cinematic UE5',
      quality: 'Ajustes Altos / TSR / Nanite',
      base1080: 110,
      base1440: 82,
      base4k: 52,
      gpuWeight: 0.82,
      cpuWeight: 0.18
    },
    {
      game: 'Cyberpunk 2077 (Path Tracing)',
      category: 'Ray Tracing Extremo',
      quality: 'Trazado de Rayos Overdrive + DLSS/FSR',
      base1080: 95,
      base1440: 72,
      base4k: 44,
      gpuWeight: 0.88,
      cpuWeight: 0.12
    },
    {
      game: 'Call of Duty: Warzone',
      category: 'Battle Royale Masivo',
      quality: 'Equilibrado Competitivo',
      base1080: 165,
      base1440: 125,
      base4k: 78,
      gpuWeight: 0.68,
      cpuWeight: 0.32
    },
    {
      game: 'Fortnite (Unreal Engine 5)',
      category: 'Mundo Abierto Lumen',
      quality: 'Nanite + Sombras Virtuales',
      base1080: 155,
      base1440: 115,
      base4k: 70,
      gpuWeight: 0.72,
      cpuWeight: 0.28
    },
    {
      game: 'GTA V / VI Ready',
      category: 'Mundo Abierto',
      quality: 'Muy Alta Calidad / MSAA x2',
      base1080: 170,
      base1440: 135,
      base4k: 88,
      gpuWeight: 0.70,
      cpuWeight: 0.30
    }
  ];

  const items: PerformanceBenchmarkItem[] = baseGames.map(bg => {
    const combinedScale = (gpuRatio * bg.gpuWeight + cpuRatio * bg.cpuWeight) * ramMultiplier;

    // Apply upscaling boost on GPU heavy scenarios (1440p and 4K)
    const fps1080p = Math.max(20, Math.round(bg.base1080 * combinedScale * (upscalingEnabled ? 1.08 : 1.0)));
    const fps1440p = Math.max(15, Math.round(bg.base1440 * combinedScale * upscalingMultiplier));
    const fps4k = Math.max(10, Math.round(bg.base4k * combinedScale * (upscalingEnabled ? 1.25 : 1.0)));

    const low1Pct1080p = Math.round(fps1080p * 0.73);
    const low1Pct1440p = Math.round(fps1440p * 0.71);
    const low1Pct4k = Math.round(fps4k * 0.69);

    const frameTimeMs1080p = Math.round((1000 / Math.max(fps1080p, 1)) * 10) / 10;
    const frameTimeMs1440p = Math.round((1000 / Math.max(fps1440p, 1)) * 10) / 10;
    const frameTimeMs4k = Math.round((1000 / Math.max(fps4k, 1)) * 10) / 10;

    return {
      game: bg.game,
      category: bg.category,
      quality: bg.quality,
      fps1080p,
      fps1440p,
      fps4k,
      low1Pct1080p,
      low1Pct1440p,
      low1Pct4k,
      frameTimeMs1080p,
      frameTimeMs1440p,
      frameTimeMs4k
    };
  });

  const avgFps1080p = Math.round(items.reduce((acc, it) => acc + it.fps1080p, 0) / items.length);
  const avgFps1440p = Math.round(items.reduce((acc, it) => acc + it.fps1440p, 0) / items.length);
  const avgFps4k = Math.round(items.reduce((acc, it) => acc + it.fps4k, 0) / items.length);

  // Synthetic 3DMark TimeSpy estimate based on GPU perfScore
  // e.g. Score 40 (RX 6600) -> ~8,100 pts
  // e.g. Score 68 (RTX 4070) -> ~17,800 pts
  // e.g. Score 100 (RTX 4090) -> ~36,200 pts
  const timeSpyScore = Math.round(Math.pow(gpuScore / 10, 1.85) * 510);
  const fireStrikeScore = Math.round(timeSpyScore * 1.55);
  // Cinebench R23 Multi-Core estimate based on CPU perfScore
  const cinebenchScore = Math.round(Math.pow(cpuScore / 10, 1.92) * 540);

  let tierLabel = 'Entrada 1080p';
  let tierColor = '#38bdf8'; // sky
  let recommendedResolution: '1080p' | '1440p' | '4K' = '1080p';
  let targetMonitorHz = 144;

  if (gpuScore >= 90) {
    tierLabel = 'Entusiasta 4K Ultra';
    tierColor = '#ec4899'; // pink
    recommendedResolution = '4K';
    targetMonitorHz = 240;
  } else if (gpuScore >= 75) {
    tierLabel = 'Gama Alta 1440p / 4K';
    tierColor = '#ef4444'; // crimson
    recommendedResolution = '1440p';
    targetMonitorHz = 180;
  } else if (gpuScore >= 55) {
    tierLabel = 'Gama Media 1440p Sweet Spot';
    tierColor = '#f59e0b'; // amber
    recommendedResolution = '1440p';
    targetMonitorHz = 165;
  } else if (gpuScore >= 40) {
    tierLabel = 'Entrada Esports 1080p';
    tierColor = '#10b981'; // emerald
    recommendedResolution = '1080p';
    targetMonitorHz = 144;
  }

  return {
    items,
    avgFps1080p,
    avgFps1440p,
    avgFps4k,
    timeSpyScore,
    fireStrikeScore,
    cinebenchScore,
    tierLabel,
    tierColor,
    recommendedResolution,
    targetMonitorHz,
    hasGpu
  };
}
