import { ComponentCategory, PCComponent, CurrencyConfig } from '../types';
import { COMPONENTS_DATABASE } from '../data/componentsData';
import { calculateBuildStats, formatPrice, calculateBottleneckAndFps } from './builderUtils';

export interface RigCardOptions {
  buildName: string;
  build: Partial<Record<ComponentCategory, PCComponent>>;
  currency: CurrencyConfig;
  themeStyle: 'crimson' | 'cyberpunk' | 'stealth' | 'snow' | 'emerald';
  aspectRatio: 'story' | 'post'; // story = 1080x1920 (9:16), post = 1200x675 (16:9)
  gamerTag?: string;
}

/**
 * Encodes current build to URL hash payload: #build=BASE64
 */
export function encodeBuildToHash(
  build: Partial<Record<ComponentCategory, PCComponent>>,
  buildName: string
): string {
  try {
    const ids: Record<string, string> = {};
    Object.entries(build).forEach(([cat, comp]) => {
      if (comp) ids[cat] = comp.id;
    });
    const payload = JSON.stringify({ n: buildName, c: ids });
    const encoded = btoa(encodeURIComponent(payload));
    return `#build=${encoded}`;
  } catch (err) {
    console.error('Error encoding build:', err);
    return '';
  }
}

/**
 * Decodes build from URL hash payload
 */
export function decodeBuildFromHash(
  hash: string
): { build: Partial<Record<ComponentCategory, PCComponent>>; buildName: string } | null {
  try {
    if (!hash || !hash.includes('#build=')) return null;
    const base64 = hash.split('#build=')[1]?.trim();
    if (!base64) return null;
    const decodedPayload = decodeURIComponent(atob(base64));
    const data = JSON.parse(decodedPayload);
    if (!data || !data.c) return null;

    const restored: Partial<Record<ComponentCategory, PCComponent>> = {};
    Object.entries(data.c).forEach(([cat, id]) => {
      const found = COMPONENTS_DATABASE.find(comp => comp.id === id);
      if (found) {
        restored[cat as ComponentCategory] = found;
      }
    });

    return {
      build: restored,
      buildName: typeof data.n === 'string' && data.n.trim() ? data.n : 'Ensamble Compartido'
    };
  } catch (err) {
    console.error('Error decoding build from hash:', err);
    return null;
  }
}

/**
 * Draws a high-definition Rig Card poster directly onto an HTML Canvas.
 */
export function drawRigCardToCanvas(canvas: HTMLCanvasElement, options: RigCardOptions): void {
  const isStory = options.aspectRatio === 'story';
  const width = isStory ? 1080 : 1200;
  const height = isStory ? 1920 : 675;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const stats = calculateBuildStats(options.build);
  const bottleneck = calculateBottleneckAndFps(options.build.cpu, options.build.gpu);
  const bottleneckStatus = bottleneck?.status || 'balanced';
  const fpsList = bottleneck?.fpsEstimates || [
    { game: 'CS2', resolution: '1080p', fps: 140, quality: 'Ultra' },
    { game: 'Warzone', resolution: '1440p', fps: 110, quality: 'Ultra' },
    { game: 'Cyberpunk', resolution: '4K', fps: 65, quality: 'Ray Tracing' }
  ];

  // Colors based on theme
  let bgGradientStart = '#020617';
  let bgGradientEnd = '#0f172a';
  let accentColor = '#ef4444';
  let accentGlow = 'rgba(239, 68, 68, 0.35)';
  let tagColor = '#f87171';

  if (options.themeStyle === 'cyberpunk') {
    bgGradientStart = '#030712';
    bgGradientEnd = '#164e63';
    accentColor = '#06b6d4';
    accentGlow = 'rgba(6, 182, 212, 0.4)';
    tagColor = '#38bdf8';
  } else if (options.themeStyle === 'emerald') {
    bgGradientStart = '#022c22';
    bgGradientEnd = '#020617';
    accentColor = '#10b981';
    accentGlow = 'rgba(16, 185, 129, 0.4)';
    tagColor = '#34d399';
  } else if (options.themeStyle === 'snow') {
    bgGradientStart = '#090d16';
    bgGradientEnd = '#1e293b';
    accentColor = '#e2e8f0';
    accentGlow = 'rgba(241, 245, 249, 0.3)';
    tagColor = '#94a3b8';
  } else if (options.themeStyle === 'stealth') {
    bgGradientStart = '#09090b';
    bgGradientEnd = '#18181b';
    accentColor = '#f59e0b';
    accentGlow = 'rgba(245, 158, 11, 0.35)';
    tagColor = '#fbbf24';
  }

  // 1. Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, bgGradientStart);
  bgGrad.addColorStop(1, bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle circuit grid pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Border glow
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, width - 48, height - 48);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // 2. Header Branding
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NÚCLEO', 64, 96);

  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(224, 84, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText('BENCHMARK & SILICON ARCHITECTURE', 244, 92);

  if (options.gamerTag) {
    ctx.fillStyle = tagColor;
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    const tagText = `Arquitecto: ${options.gamerTag}`;
    ctx.fillText(tagText, width - ctx.measureText(tagText).width - 64, 92);
  }

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(64, 128);
  ctx.lineTo(width - 64, 128);
  ctx.stroke();

  if (isStory) {
    // -------------------------------------------------------------
    // STORY FORMAT (9:16 - 1080x1920)
    // -------------------------------------------------------------
    // Rig Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(options.buildName.substring(0, 32), 64, 210);

    // Status Badges
    const priceText = `${formatPrice(stats.minUSD, options.currency)} - ${formatPrice(stats.maxUSD, options.currency)}`;
    const tdpText = `⚡ ${stats.systemTdp}W TDP`;
    const fpsBadge = stats.systemTdp > 450 ? '👑 Bestia 4K Ultra' : stats.systemTdp > 320 ? '🔥 Sweet Spot 1440p' : '⚡ Entrada Competitiva';

    // Draw Price Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(64, 250, width - 128, 90);
    ctx.strokeStyle = accentColor;
    ctx.strokeRect(64, 250, width - 128, 90);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('PRESUPUESTO APROXIMADO', 90, 284);

    ctx.fillStyle = accentColor;
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.fillText(priceText, 90, 324);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText(tdpText, width - 260, 304);

    // Components Table
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ESPECIFICACIONES DEL ENSAMBLE', 64, 400);

    const compEntries: [string, PCComponent | undefined][] = [
      ['PROCESADOR (CPU)', options.build.cpu],
      ['TARJETA GRÁFICA (GPU)', options.build.gpu],
      ['PLACA MADRE', options.build.motherboard],
      ['MEMORIA RAM', options.build.ram],
      ['ALMACENAMIENTO', options.build.storage],
      ['REFRIGERACIÓN', options.build.cooler],
      ['FUENTE DE PODER', options.build.psu],
      ['GABINETE / CHASIS', options.build.case],
    ];

    let startY = 450;
    compEntries.forEach(([label, comp]) => {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.fillRect(64, startY, width - 128, 70);

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 15px "JetBrains Mono", monospace';
      ctx.fillText(label, 84, startY + 28);

      ctx.fillStyle = comp ? '#ffffff' : '#64748b';
      ctx.font = comp ? 'bold 20px "Plus Jakarta Sans", sans-serif' : 'italic 18px "Plus Jakarta Sans", sans-serif';
      const compName = comp ? comp.name : 'No seleccionado';
      ctx.fillText(compName.substring(0, 48), 84, startY + 54);

      if (comp) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 16px "JetBrains Mono", monospace';
        const pText = formatPrice(comp.priceMinUSD, options.currency);
        ctx.fillText(pText, width - 200, startY + 45);
      }

      startY += 82;
    });

    // FPS Estimate Panel
    startY += 20;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(64, startY, width - 128, 280);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeRect(64, startY, width - 128, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ESTIMACIÓN DE RENDIMIENTO EN JUEGOS', 90, startY + 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText(`Target: ${fpsBadge} · ${bottleneckStatus === 'balanced' ? 'Sin Cuello de Botella' : 'Equilibrio Alto'}`, 90, startY + 75);

    // 3 FPS Metric Bars
    const fpsMetrics = [
      { res: '1080p Ultra', fps: Math.round(fpsList[0]?.fps || 140) + 15, bar: 0.95 },
      { res: '1440p Máximo', fps: Math.round(fpsList[1]?.fps || 110), bar: 0.78 },
      { res: '4K Ray Tracing', fps: Math.round(fpsList[2]?.fps || 65), bar: 0.55 }
    ];

    let metricY = startY + 115;
    fpsMetrics.forEach(m => {
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillText(m.res, 90, metricY + 18);

      // Background bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(250, metricY + 4, width - 480, 20);

      // Value bar
      ctx.fillStyle = accentColor;
      ctx.fillRect(250, metricY + 4, (width - 480) * m.bar, 20);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px "JetBrains Mono", monospace';
      ctx.fillText(`${m.fps} FPS`, width - 210, metricY + 20);

      metricY += 46;
    });

    // Footer with Share QR invitation
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('¡Arma y simula tu PC en tiempo real!', 64, height - 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillText('nucleo.app · Noticias, Visor 3D y Hardware Intelligence', 64, height - 85);

  } else {
    // -------------------------------------------------------------
    // POST / DISCORD FORMAT (16:9 - 1200x675)
    // -------------------------------------------------------------
    // Left Column: Title, Price, Performance
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(options.buildName.substring(0, 28), 64, 195);

    const priceText = `${formatPrice(stats.minUSD, options.currency)} - ${formatPrice(stats.maxUSD, options.currency)}`;
    ctx.fillStyle = accentColor;
    ctx.font = 'bold 30px "JetBrains Mono", monospace';
    ctx.fillText(priceText, 64, 245);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText(`⚡ ${stats.systemTdp}W TDP · ${bottleneckStatus === 'balanced' ? 'Equilibrado' : 'Alto Rendimiento'}`, 64, 285);

    // Performance mini box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(64, 320, 480, 240);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeRect(64, 320, 480, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('ESTIMACIÓN DE FPS EN JUEGOS', 84, 355);

    const fpsMetrics = [
      { res: '1080p Ultra', fps: Math.round(fpsList[0]?.fps || 140) + 15 },
      { res: '1440p Competitivo', fps: Math.round(fpsList[1]?.fps || 110) },
      { res: '4K Ray Tracing', fps: Math.round(fpsList[2]?.fps || 65) }
    ];

    let pY = 400;
    fpsMetrics.forEach(m => {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px "JetBrains Mono", monospace';
      ctx.fillText(m.res, 84, pY);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillText(`${m.fps} FPS`, 400, pY);
      pY += 45;
    });

    // Right Column: Key Components
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('COMPONENTES CLAVE', 580, 195);

    const rightComps: [string, PCComponent | undefined][] = [
      ['CPU', options.build.cpu],
      ['GPU', options.build.gpu],
      ['RAM', options.build.ram],
      ['PLACA', options.build.motherboard],
      ['ALMACENAMIENTO', options.build.storage],
      ['FUENTE', options.build.psu],
    ];

    let rY = 220;
    rightComps.forEach(([label, comp]) => {
      ctx.fillStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.fillRect(580, rY, 550, 52);

      ctx.fillStyle = accentColor;
      ctx.font = 'bold 13px "JetBrains Mono", monospace';
      ctx.fillText(label, 595, rY + 22);

      ctx.fillStyle = comp ? '#ffffff' : '#64748b';
      ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
      const cName = comp ? comp.name : 'No seleccionado';
      ctx.fillText(cName.substring(0, 38), 595, rY + 42);

      if (comp) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 14px "JetBrains Mono", monospace';
        ctx.fillText(formatPrice(comp.priceMinUSD, options.currency), 1020, rY + 34);
      }

      rY += 60;
    });

    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 15px "JetBrains Mono", monospace';
    ctx.fillText('Creado con Núcleo PC Builder · nucleo.app', 64, height - 45);
  }
}

/**
 * Trigger browser file download from canvas element
 */
export function downloadCanvasImage(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
