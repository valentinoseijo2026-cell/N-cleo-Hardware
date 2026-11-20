import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Calendar,
  Layers,
  Sparkles,
  Info,
  DollarSign
} from 'lucide-react';
import { PCComponent, ComponentCategory, CurrencyConfig } from '../types';
import {
  generateHistoricalPriceData,
  formatPrice,
  PriceHistoryPoint
} from '../utils/builderUtils';

interface PriceHistoryChartProps {
  build: Partial<Record<ComponentCategory, PCComponent>>;
  buildName: string;
  currency: CurrencyConfig;
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({
  build,
  buildName,
  currency
}) => {
  const [timeframe, setTimeframe] = useState<'6m' | '12m' | '24m'>('12m');
  const [chartMode, setChartMode] = useState<'total' | 'breakdown'>('total');

  const priceData = useMemo(() => {
    return generateHistoricalPriceData(build, currency, timeframe);
  }, [build, currency, timeframe]);

  const {
    history,
    currentPrice,
    allTimeLow,
    allTimeLowDate,
    allTimeHigh,
    allTimeHighDate,
    priceChangePercent,
    trend
  } = priceData;

  const formatCurrencyVal = (val: number) => {
    return `${currency.symbol} ${new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: 0
    }).format(Math.round(val))}`;
  };

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: PriceHistoryPoint = payload[0].payload;
      const diffFromCurrent = dataPoint.priceAvg - currentPrice;
      const pctDiff = Math.round((diffFromCurrent / currentPrice) * 1000) / 10;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-red-500/40 rounded-xl p-3 shadow-2xl text-xs z-50 min-w-[210px] animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-400" />
              {dataPoint.fullDate}
            </span>
          </div>

          {dataPoint.marketEvent && (
            <div className="mt-1.5 py-0.5 px-2 rounded bg-red-500/15 border border-red-500/30 text-[10px] text-red-300 font-medium">
              ★ {dataPoint.marketEvent}
            </div>
          )}

          {chartMode === 'total' ? (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-sm font-bold text-white">
                <span>Precio Promedio:</span>
                <span className="font-mono text-red-400">
                  {formatCurrencyVal(dataPoint.priceAvg)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Rango de Mercado:</span>
                <span className="font-mono text-slate-300">
                  {formatCurrencyVal(dataPoint.priceMin)} - {formatCurrencyVal(dataPoint.priceMax)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                <span>Vs. Precio Actual:</span>
                <span
                  className={`font-mono font-bold ${
                    diffFromCurrent < 0
                      ? 'text-emerald-400'
                      : diffFromCurrent > 0
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }`}
                >
                  {diffFromCurrent > 0 ? '+' : ''}
                  {pctDiff}% ({diffFromCurrent > 0 ? '+' : ''}
                  {formatCurrencyVal(diffFromCurrent)})
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  GPU:
                </span>
                <span className="font-mono text-white">{formatCurrencyVal(dataPoint.gpuPrice)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
                  CPU:
                </span>
                <span className="font-mono text-white">{formatCurrencyVal(dataPoint.cpuPrice)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  Resto del PC:
                </span>
                <span className="font-mono text-white">{formatCurrencyVal(dataPoint.otherPrice)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white pt-1.5 border-t border-slate-800">
                <span>Total:</span>
                <span className="font-mono text-red-400">{formatCurrencyVal(dataPoint.priceAvg)}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-red-950/60 bg-slate-900/90 p-4 sm:p-5 shadow-2xl space-y-4 text-slate-100">
      {/* Top Header & Interactive Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Evolución Histórica de Precios de Mercado</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-semibold border border-red-500/30">
                Recharts
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Fluctuación del valor comercial del ensamble según oferta, demanda y ciclos de hardware.
          </p>
        </div>

        {/* View Mode & Timeframe Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Chart Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl text-xs font-medium border border-slate-800">
            <button
              onClick={() => setChartMode('total')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartMode === 'total'
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Precio Total
            </button>
            <button
              onClick={() => setChartMode('breakdown')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                chartMode === 'breakdown'
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Desglose GPU/CPU
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl text-xs font-mono font-bold border border-slate-800">
            {(['6m', '12m', '24m'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  timeframe === t
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Precio Actual */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
            Precio Actual
          </span>
          <div className="text-base sm:text-lg font-black text-white font-mono mt-0.5">
            {formatCurrencyVal(currentPrice)}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Referencia de hoy</span>
        </div>

        {/* Mínimo Histórico */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> Mínimo Histórico
          </span>
          <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">
            {formatCurrencyVal(allTimeLow)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono truncate block">
            {allTimeLowDate}
          </span>
        </div>

        {/* Máximo Histórico */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-red-400" /> Máximo Registrado
          </span>
          <div className="text-base sm:text-lg font-black text-slate-300 font-mono mt-0.5">
            {formatCurrencyVal(allTimeHigh)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono truncate block">
            {allTimeHighDate}
          </span>
        </div>

        {/* Tendencia del Mercado */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
            Tendencia ({timeframe.toUpperCase()})
          </span>
          <div
            className={`text-sm sm:text-base font-bold font-mono mt-0.5 flex items-center gap-1 ${
              trend === 'falling'
                ? 'text-emerald-400'
                : trend === 'rising'
                ? 'text-red-400'
                : 'text-amber-400'
            }`}
          >
            {trend === 'falling' ? (
              <TrendingDown className="w-4 h-4" />
            ) : trend === 'rising' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span>{priceChangePercent > 0 ? `+${priceChangePercent}%` : `${priceChangePercent}%`}</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {trend === 'falling'
              ? 'Momento favorable'
              : trend === 'rising'
              ? 'Precio en alza'
              : 'Mercado estable'}
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="w-full h-72 sm:h-80 bg-slate-950/60 rounded-xl p-2 sm:p-3 border border-slate-800 relative">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'total' ? (
            <AreaChart data={history} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <defs>
                {/* Núcleo Crimson Red Area Gradient */}
                <linearGradient id="nucleoPriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="nucleoRangeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
                domain={['auto', 'auto']}
                tickFormatter={(val: number) => {
                  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                  if (val >= 1000) return `${Math.round(val / 1000)}k`;
                  return `${val}`;
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Reference line for All Time Low */}
              <ReferenceLine
                y={allTimeLow}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: 'Mínimo',
                  fill: '#10b981',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />

              {/* Range band (Upper max price) */}
              <Area
                type="monotone"
                dataKey="priceMax"
                stroke="#38bdf8"
                strokeWidth={1}
                strokeDasharray="2 2"
                fillOpacity={1}
                fill="url(#nucleoRangeGradient)"
                name="Precio Máximo"
              />

              {/* Main Total Price Line & Glow */}
              <Area
                type="monotone"
                dataKey="priceAvg"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#nucleoPriceGradient)"
                name="Precio Promedio"
                activeDot={{ r: 6, fill: '#ffffff', stroke: '#ef4444', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={history} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="month"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />

              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
                domain={['auto', 'auto']}
                tickFormatter={(val: number) => {
                  if (val >= 1000) return `${Math.round(val / 1000)}k`;
                  return `${val}`;
                }}
              />

              <Tooltip content={<CustomTooltip />} />

              <Line
                type="monotone"
                dataKey="gpuPrice"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#ef4444' }}
                activeDot={{ r: 5 }}
                name="Tarjeta Gráfica"
              />

              <Line
                type="monotone"
                dataKey="cpuPrice"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, fill: '#38bdf8' }}
                activeDot={{ r: 5 }}
                name="Procesador"
              />

              <Line
                type="monotone"
                dataKey="otherPrice"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={{ r: 2, fill: '#94a3b8' }}
                name="Resto de Componentes"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Legend / Footnote */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
        <div className="flex items-center gap-4">
          {chartMode === 'total' ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-red-500 rounded-full" />
                <span>Precio Promedio de Mercado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-400 border-t border-dashed border-sky-400" />
                <span>Banda Máxima Estimada</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-red-500 rounded-full" />
                <span>Gráfica (GPU)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-sky-400 rounded-full" />
                <span>Procesador (CPU)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-slate-400 border-t border-dashed" />
                <span>Placa, RAM, SSD & Fuente</span>
              </div>
            </>
          )}
        </div>

        <div className="text-slate-500 text-[10px] italic">
          *Datos de referencia calculados según fluctuaciones históricas reales de hardware y componentes seleccionados.
        </div>
      </div>
    </div>
  );
};
