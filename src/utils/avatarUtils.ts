export interface AvatarPreset {
  id: string;
  name: string;
  category: string;
  icon: string;
  gradient: string;
  border: string;
  description: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'overclocker',
    name: 'Overclocker Criogénico',
    category: 'Rendimiento',
    icon: '⚡',
    gradient: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-400',
    description: 'Buscador de frecuencias extremas y voltajes al límite.'
  },
  {
    id: 'cyberbuilder',
    name: 'Ciber-Ensamblador',
    category: 'Hardware',
    icon: '🦾',
    gradient: 'from-rose-600 to-red-700',
    border: 'border-rose-400',
    description: 'Maestro del montaje de bancos de prueba y custom loops.'
  },
  {
    id: 'rtx_master',
    name: 'Maestro Ray-Tracing',
    category: 'Gráficos',
    icon: '💎',
    gradient: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400',
    description: 'Devoto de DLSS, iluminación global y trazado de rayos.'
  },
  {
    id: 'subzero',
    name: 'Ingeniero Sub-Zero',
    category: 'Térmico',
    icon: '❄️',
    gradient: 'from-sky-400 to-indigo-600',
    border: 'border-sky-300',
    description: 'Temperaturas bajo cero con nitrógeno líquido y pastas térmicas cryo.'
  },
  {
    id: 'zeroday_hunter',
    name: 'Cazador de Zero-Day',
    category: 'Arcade',
    icon: '👾',
    gradient: 'from-purple-600 to-pink-600',
    border: 'border-purple-400',
    description: 'Destructor de virus de silicio y cuellos de botella.'
  },
  {
    id: 'silicon_god',
    name: 'Leyenda del Silicio',
    category: 'Prestigio',
    icon: '👑',
    gradient: 'from-amber-400 to-amber-600',
    border: 'border-amber-300',
    description: 'El poseedor definitivo de la PC Suprema con 999+ FPS.'
  },
  {
    id: 'quantum',
    name: 'Piloto Cuántico',
    category: 'Ciencia',
    icon: '🚀',
    gradient: 'from-fuchsia-600 to-indigo-700',
    border: 'border-fuchsia-400',
    description: 'Explorador de computación cuántica y arquitecturas del futuro.'
  },
  {
    id: 'stealth',
    name: 'Guardián Stealth',
    category: 'Minimalismo',
    icon: '🛡️',
    gradient: 'from-slate-700 to-zinc-900',
    border: 'border-slate-500',
    description: 'Elegancia negra mate, cero luces RGB y acústica silenciosa.'
  }
];

export const HONORIFIC_TITLES = [
  'Arquitecto de Silicio',
  'Overclocker Supremo 👑',
  'Cazador de Ray Tracing 💎',
  'Especialista Criogénico ❄️',
  'Destructor de Zero-Day 👾',
  'Ingeniero de Flujo Térmico 🌬️',
  'Maestro de la PC Suprema ⚡',
  'Técnico de Banco de Pruebas 🛠️'
];

/**
 * Resizes and compresses an uploaded image file via an offscreen HTML5 Canvas.
 * Ensures the resulting base64 Data URL fits comfortably in localStorage without quota issues.
 */
export function compressAvatarImage(file: File, maxDim = 256, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen válida.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving dimensions within maxDim x maxDim
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto de canvas.'));
          return;
        }

        // Draw image smoothed
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('No se pudo decodificar la imagen.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
}
