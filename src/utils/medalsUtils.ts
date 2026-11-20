import { UserProfile, UserBuild } from '../types';

export interface MedalItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  badge: string;
  tier: 'comun' | 'raro' | 'epico' | 'legendario' | 'mitico';
  border: string;
  bgGradient: string;
  glowColor: string;
  isSecret?: boolean;
  unlocked: boolean;
  unlockedAt?: string;
  requirementHint: string;
}

export interface SecretCodeClue {
  id: string;
  category: string;
  rewardTitle: string;
  rewardIcon: string;
  clue: string;
  tier: string;
}

// 20 Secret Codes Clues for the UI (never reveals the code itself!)
export const SECRET_CODES_CLUES: SecretCodeClue[] = [
  {
    id: 'clue-1',
    category: 'Tarjetas Gráficas',
    rewardTitle: 'Monarca de Blackwell',
    rewardIcon: '🟢',
    clue: 'El titán gráfico de próxima generación con 32 GB de memoria GDDR7 y bus de 512 bits (Tres letras + cuatro números).',
    tier: 'Legendaria'
  },
  {
    id: 'clue-2',
    category: 'Procesadores',
    rewardTitle: 'Caché Invertida 3D',
    rewardIcon: '🔴',
    clue: 'La arquitectura de AMD que rediseñó el chiplet colocando la caché L3 debajo de los núcleos (Tres letras + un número).',
    tier: 'Épica'
  },
  {
    id: 'clue-3',
    category: 'Overclocking Extremo',
    rewardTitle: 'Maestro del LN2',
    rewardIcon: '❄️',
    clue: 'Elemento químico en estado líquido que hierve a -196°C, vertido en potas de cobre para récords mundiales.',
    tier: 'Mítica'
  },
  {
    id: 'clue-4',
    category: 'Cultura PC',
    rewardTitle: '+1000 FPS Arcoíris',
    rewardIcon: '🌈',
    clue: 'Siglas de los tres colores de luz primarios que según el meme aumentan un 20% los FPS de cualquier computadora.',
    tier: 'Común'
  },
  {
    id: 'clue-5',
    category: 'Gráficos Avanzados',
    rewardTitle: 'Iluminación Cuántica',
    rewardIcon: '💎',
    clue: 'La técnica de trazado de caminos completa en inglés que calcula físicamente el rebote de la luz en Cyberpunk 2077 y Wukong.',
    tier: 'Legendaria'
  },
  {
    id: 'clue-6',
    category: 'Montaje de PC',
    rewardTitle: 'La Gota de Guisante',
    rewardIcon: '🧪',
    clue: 'El compuesto térmico grisáceo en inglés que nunca debes olvidar aplicar entre el procesador y el disipador.',
    tier: 'Común'
  },
  {
    id: 'clue-7',
    category: 'Diagnóstico',
    rewardTitle: 'Superviviente de BIOS',
    rewardIcon: '🔄',
    clue: 'Término en inglés para la pesadilla en que tu PC se reinicia en bucle infinito antes de poder cargar el sistema operativo.',
    tier: 'Rara'
  },
  {
    id: 'clue-8',
    category: 'Modificación Extrema',
    rewardTitle: 'Cirujano de Silicio',
    rewardIcon: '🔪',
    clue: 'Palabra en inglés de 5 letras para la peligrosa maniobra de despegar el disipador metálico (IHS) del procesador.',
    tier: 'Mítica'
  },
  {
    id: 'clue-9',
    category: 'Monitores & Esports',
    rewardTitle: 'Fluidez Competitiva',
    rewardIcon: '👁️',
    clue: 'La tasa de refresco estándar dorada en hercios (tres números + dos letras) adorada por jugadores competitivos de shooters.',
    tier: 'Común'
  },
  {
    id: 'clue-10',
    category: 'Eficiencia Eléctrica',
    rewardTitle: 'Domador de Voltajes',
    rewardIcon: '⚡',
    clue: 'Técnica en inglés de reducir el voltaje suministrado a la GPU o CPU para bajar hasta 15°C sin perder ni un solo FPS.',
    tier: 'Épica'
  },
  {
    id: 'clue-11',
    category: 'Fortuna de Silicio',
    rewardTitle: 'Silicio Bendecido',
    rewardIcon: '🎰',
    clue: 'Término de dos palabras pegadas en inglés que describe la suerte aleatoria de que te toque un chip de oblea ultra-overclockeable.',
    tier: 'Legendaria'
  },
  {
    id: 'clue-12',
    category: 'Térmica de Élite',
    rewardTitle: 'Conductividad Extrema',
    rewardIcon: '🧊',
    clue: 'El nombre del compuesto térmico más famoso de la marca alemana del oso polar (Thermal Grizzly).',
    tier: 'Rara'
  },
  {
    id: 'clue-13',
    category: 'Memorias RAM',
    rewardTitle: 'Ancho de Banda Duplicado',
    rewardIcon: '🧠',
    clue: 'Término en inglés para la configuración de dos módulos de memoria en ranuras alternas (A2/B2) para duplicar la velocidad.',
    tier: 'Común'
  },
  {
    id: 'clue-14',
    category: 'Ciberseguridad',
    rewardTitle: 'Ciber-Inmunidad Zero-Day',
    rewardIcon: '🛡️',
    clue: 'Expresión en inglés para una vulnerabilidad informática desconocida por los desarrolladores hasta el mismo "día cero".',
    tier: 'Legendaria'
  },
  {
    id: 'clue-15',
    category: 'Estética de Ensamble',
    rewardTitle: 'Maestro del Peine y Bridas',
    rewardIcon: '🧵',
    clue: 'La paciencia y técnica en inglés de ordenar, peinar y amarrar todos los cables detrás de la chapa del gabinete.',
    tier: 'Épica'
  },
  {
    id: 'clue-16',
    category: 'Resolución de Video',
    rewardTitle: 'Devorador de Píxeles',
    rewardIcon: '🖥️',
    clue: 'La combinación de la resolución 3840x2160 (dos caracteres) junto con la calidad gráfica máxima de los juegos (cinco letras).',
    tier: 'Legendaria'
  },
  {
    id: 'clue-17',
    category: 'Pruebas Sintéticas',
    rewardTitle: 'Cazador de Cinebench',
    rewardIcon: '📊',
    clue: 'Palabra en inglés para cualquier prueba estandarizada diseñada para medir y comparar el rendimiento de componentes.',
    tier: 'Rara'
  },
  {
    id: 'clue-18',
    category: 'El Santo Grial',
    rewardTitle: 'Silicio de Oro 24K',
    rewardIcon: '🥇',
    clue: 'Término en inglés de dos palabras pegadas para el procesador "dorado" perfecto que corre a frecuencias impensables con mínimo voltaje.',
    tier: 'Mítica'
  },
  {
    id: 'clue-19',
    category: 'Errores Térmicos',
    rewardTitle: 'Freidora de Silicio',
    rewardIcon: '🔥',
    clue: 'Término en inglés para el sobrecalentamiento extremo que ocurre cuando olvidas retirar el film de plástico del disipador.',
    tier: 'Común'
  },
  {
    id: 'clue-20',
    category: 'Legado de la Plataforma',
    rewardTitle: 'Fundador Legendario',
    rewardIcon: '👑',
    clue: 'La combinación del nombre de esta plataforma web unida al año de su lanzamiento oficial (sin espacios).',
    tier: 'Mítica'
  },
  {
    id: 'clue-21',
    category: 'Computación Clásica',
    rewardTitle: 'Legado 8-Bit Retro',
    rewardIcon: '🕹️',
    clue: 'Palabra en inglés para la informática nostálgica de disquetes y MS-DOS unida a las siglas de Personal Computer (siete letras).',
    tier: 'Épica'
  },
  {
    id: 'clue-22',
    category: 'Física de Próxima Era',
    rewardTitle: 'Salto Cuántico',
    rewardIcon: '⚛️',
    clue: 'Término en inglés para la computación basada en cúbits que resuelve algoritmos complejos en microsegundos (siete letras).',
    tier: 'Mítica'
  },
  {
    id: 'clue-23',
    category: 'Estética Minimalista',
    rewardTitle: 'Arquitectura Fantasma',
    rewardIcon: '🥷',
    clue: 'Palabra en inglés de 7 letras para la filosofía de ensamble sigiloso: cero luces RGB, pintura negro mate y absoluto silencio.',
    tier: 'Legendaria'
  },
  {
    id: 'clue-24',
    category: 'Tecnología Gráfica',
    rewardTitle: 'Reflejo del Fotorrealismo',
    rewardIcon: '🪞',
    clue: 'Término en inglés de 10 letras para el trazado de rayos que simula físicamente el rebote de los fotones en tiempo real.',
    tier: 'Legendaria'
  },
  {
    id: 'clue-25',
    category: 'Refrigeración Extrema',
    rewardTitle: 'Fontanero del Cobre',
    rewardIcon: '💧',
    clue: 'Palabra en inglés de 12 letras para la refrigeración líquida personalizada con bloques, racores y tubos de agua.',
    tier: 'Épica'
  },
  {
    id: 'clue-26',
    category: 'Ranuras de Expansión',
    rewardTitle: 'Autopista Gen 5.0',
    rewardIcon: '🏎️',
    clue: 'Nombre del bus de alta velocidad en inglés (dos palabras pegadas, 10 letras) donde instalas tu gráfica y SSD.',
    tier: 'Rara'
  },
  {
    id: 'clue-27',
    category: 'Frecuencia Límite',
    rewardTitle: 'Furia de Gigahercios',
    rewardIcon: '🚀',
    clue: 'Término en inglés de 9 letras para la práctica de exigir a la CPU o GPU frecuencias por encima de sus límites de fábrica.',
    tier: 'Legendaria'
  },
  {
    id: 'clue-28',
    category: 'Escalado Inteligente',
    rewardTitle: 'Generador de Cuadros IA',
    rewardIcon: '🧠',
    clue: 'Siglas de 4 letras de la tecnología de reconstrucción de imagen y frame generation mediante IA de Nvidia.',
    tier: 'Épica'
  },
  {
    id: 'clue-29',
    category: 'Energía Suprema',
    rewardTitle: 'Grado 80 Plus Titanium',
    rewardIcon: '🛡️',
    clue: 'Nombre en inglés del metal de máxima certificación energética para fuentes de poder con 94% de eficiencia (8 letras).',
    tier: 'Mítica'
  },
  {
    id: 'clue-30',
    category: 'Tecnología de Pantallas',
    rewardTitle: 'Negro Infinito & 0.03ms',
    rewardIcon: '🌌',
    clue: 'Siglas de 4 letras del panel de diodos emisores orgánicos donde cada píxel se apaga de forma independiente.',
    tier: 'Épica'
  },
  {
    id: 'clue-31',
    category: 'Procesador con Gráficos',
    rewardTitle: 'Corazón Híbrido Silicio',
    rewardIcon: '📦',
    clue: 'Siglas de 3 letras (Accelerated Processing Unit) para los chips que combinan CPU con potentes núcleos gráficos.',
    tier: 'Común'
  },
  {
    id: 'clue-32',
    category: 'Almacenamiento Flash',
    rewardTitle: 'Lectura a 14,000 MB/s',
    rewardIcon: '⚡',
    clue: 'Protocolo de 4 letras desarrollado para unidades de estado sólido ultrarrápidas conectadas directamente a PCIe.',
    tier: 'Rara'
  },
  {
    id: 'clue-33',
    category: 'Diagnóstico de Memoria',
    rewardTitle: 'Centinela de Errores RAM',
    rewardIcon: '🧪',
    clue: 'Nombre de 7 letras de la mítica herramienta de diagnóstico que estresa y analiza cada celda de tu memoria RAM.',
    tier: 'Rara'
  },
  {
    id: 'clue-34',
    category: 'Inmersión Cyberpunk',
    rewardTitle: 'Implante Cibernético 2.0.77',
    rewardIcon: '🦾',
    clue: 'El legendario título de rol y mundo abierto de Night City con trazado de caminos e implantes biónicos (9 letras).',
    tier: 'Mítica'
  },
  {
    id: 'clue-35',
    category: 'Sistemas Operativos',
    rewardTitle: 'Pingüino Kernel Maestro',
    rewardIcon: '🐧',
    clue: 'El sistema operativo libre y de código abierto simbolizado por un simpático pingüino (5 letras).',
    tier: 'Épica'
  },
  {
    id: 'clue-36',
    category: 'Recuperación de Placa',
    rewardTitle: 'Resurrección por Botón',
    rewardIcon: '⚡',
    clue: 'La función de dos palabras en inglés pegadas que flashea la BIOS desde una memoria USB sin necesidad de procesador (9 letras).',
    tier: 'Rara'
  },
  {
    id: 'clue-37',
    category: 'Equilibrio de Potencia',
    rewardTitle: 'Cero Cuello de Botella',
    rewardIcon: '⏳',
    clue: 'Palabra en inglés de 10 letras para el desbalance cuando un procesador lento estrangula a una tarjeta gráfica de gama alta.',
    tier: 'Común'
  },
  {
    id: 'clue-38',
    category: 'Personalización Extrema',
    rewardTitle: 'Artesano del Chasis',
    rewardIcon: '🎨',
    clue: 'La unión de dos palabras en inglés (gabinete + modificación, 7 letras) para la disciplina de construir gabinetes temáticos.',
    tier: 'Legendaria'
  },
  {
    id: 'clue-39',
    category: 'Almacenamiento Masivo',
    rewardTitle: 'Bóveda de Petabytes',
    rewardIcon: '💽',
    clue: 'Plural coloquial de 5 letras para referirse a la acumulación infinita de terabytes de juegos y archivos.',
    tier: 'Rara'
  },
  {
    id: 'clue-40',
    category: 'Inteligencia Artificial Visual',
    rewardTitle: 'Interpolación Fotónica',
    rewardIcon: '🎬',
    clue: 'Término de dos palabras pegadas en inglés (8 letras) para la tecnología de generar fotogramas intermedios con redes neuronales.',
    tier: 'Legendaria'
  },
  {
    id: 'clue-41',
    category: 'Factor de Forma SFF',
    rewardTitle: 'Monstruo SFF Compacto',
    rewardIcon: '📐',
    clue: 'Las 3 letras del formato de placa base más diminuto del mercado (17 x 17 cm).',
    tier: 'Épica'
  },
  {
    id: 'clue-42',
    category: 'Topología de Silicio',
    rewardTitle: 'Núcleo de Silicio Puro',
    rewardIcon: '👑',
    clue: 'Término de dos palabras en inglés pegadas (10 letras) para el núcleo privilegiado de la CPU que alcanza la frecuencia Turbo boost más alta.',
    tier: 'Mítica'
  },
  {
    id: 'clue-43',
    category: 'Ecosistema Lumínico',
    rewardTitle: 'Sincronía Neón Lumínica',
    rewardIcon: '🌈',
    clue: 'La unión de dos palabras en inglés (9 letras) para el protocolo y software de sincronización de luces LED de la placa y ventiladores.',
    tier: 'Común'
  }
];

// Master Catalog of Medals
export const ALL_MEDALS_CATALOG: Omit<MedalItem, 'unlocked'>[] = [
  // Original Secret Code Medal
  {
    id: 'secret-2026',
    title: 'Viajero del Silicio 2026',
    desc: 'Canjeaste la clave maestra "2026" en la Bóveda Secreta de Códigos de Núcleo.',
    icon: '🔮',
    badge: 'Secreta · Mítica',
    tier: 'mitico',
    border: 'border-purple-400',
    bgGradient: 'from-purple-900/40 via-fuchsia-950/30 to-slate-950',
    glowColor: 'shadow-purple-500/30',
    isSecret: true,
    requirementHint: 'Introduce el código secreto "2026" en la pestaña de Códigos del perfil.'
  },
  // 20 NEW SECRET MEDALS (Unlocked via secret codes)
  {
    id: 'secret-rtx5090',
    title: 'Monarca de Blackwell',
    desc: 'Desbloqueaste el poder de los 32GB GDDR7 y el chip insignia de próxima generación.',
    icon: '🟢',
    badge: 'GPU Insignia',
    tier: 'legendario',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/60 via-green-950/40 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: El titán gráfico de próxima generación con 32GB GDDR7.'
  },
  {
    id: 'secret-zen5',
    title: 'Caché Invertida 3D',
    desc: 'La microarquitectura que colocó la memoria SRAM debajo de los núcleos para overclocking total.',
    icon: '🔴',
    badge: 'CPU Zen 5',
    tier: 'epico',
    border: 'border-red-400',
    bgGradient: 'from-red-950/60 via-rose-950/40 to-slate-950',
    glowColor: 'shadow-red-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: La microarquitectura de AMD que revolucionó el 3D V-Cache.'
  },
  {
    id: 'secret-nitrogeno',
    title: 'Maestro del LN2',
    desc: 'Temperatura a -196°C para pulverizar récords mundiales en Cinebench y 3DMark.',
    icon: '❄️',
    badge: 'Crio-Overclock',
    tier: 'mitico',
    border: 'border-cyan-400',
    bgGradient: 'from-cyan-950/60 via-blue-950/40 to-slate-950',
    glowColor: 'shadow-cyan-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Elemento químico licuado a -196°C usado para overclock extremo.'
  },
  {
    id: 'secret-rgb',
    title: '+1000 FPS Arcoíris',
    desc: 'La leyenda del gaming: luces de colores que "aumentan" los FPS en cualquier ensamble.',
    icon: '🌈',
    badge: 'Estética',
    tier: 'comun',
    border: 'border-fuchsia-400',
    bgGradient: 'from-fuchsia-950/60 via-pink-950/40 to-slate-950',
    glowColor: 'shadow-fuchsia-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Las 3 letras de los colores primarios de luz.'
  },
  {
    id: 'secret-pathtracing',
    title: 'Iluminación Cuántica',
    desc: 'Trazado de trayectorias completo que simula la física cuántica de cada fotón de luz.',
    icon: '💎',
    badge: 'Fotorrealismo',
    tier: 'legendario',
    border: 'border-teal-400',
    bgGradient: 'from-teal-950/60 via-emerald-950/40 to-slate-950',
    glowColor: 'shadow-teal-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: La técnica gráfica más avanzada de simulación de luz física.'
  },
  {
    id: 'secret-thermalpaste',
    title: 'La Gota de Guisante',
    desc: 'Compuesto térmico imprescindible para transferir el calor de la CPU al disipador.',
    icon: '🧪',
    badge: 'Mantenimiento',
    tier: 'comun',
    border: 'border-slate-400',
    bgGradient: 'from-slate-900 via-slate-950 to-black',
    glowColor: 'shadow-slate-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: El compuesto viscoso gris en inglés colocado sobre el procesador.'
  },
  {
    id: 'secret-bootloop',
    title: 'Superviviente de BIOS',
    desc: 'El bucle infinito de reinicios que forja la paciencia de todo ensamblador.',
    icon: '🔄',
    badge: 'Diagnóstico',
    tier: 'raro',
    border: 'border-orange-400',
    bgGradient: 'from-orange-950/60 via-amber-950/40 to-slate-950',
    glowColor: 'shadow-orange-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Término en inglés para cuando el PC se reinicia sin parar.'
  },
  {
    id: 'secret-delid',
    title: 'Cirujano de Silicio',
    desc: 'Remover el encapsulado metálico IHS del chip para aplicar metal líquido directo al silicio.',
    icon: '🔪',
    badge: 'Modificación',
    tier: 'mitico',
    border: 'border-rose-400',
    bgGradient: 'from-rose-950/60 via-red-950/40 to-slate-950',
    glowColor: 'shadow-rose-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Palabra de 5 letras para separar el IHS del procesador.'
  },
  {
    id: 'secret-144hz',
    title: 'Fluidez Competitiva',
    desc: 'La frecuencia de actualización sagrada que separa el juego casual del nivel esports.',
    icon: '👁️',
    badge: 'Display',
    tier: 'comun',
    border: 'border-sky-400',
    bgGradient: 'from-sky-950/60 via-indigo-950/40 to-slate-950',
    glowColor: 'shadow-sky-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: La tasa de refresco estándar en hercios (número + HZ).'
  },
  {
    id: 'secret-undervolt',
    title: 'Domador de Voltajes',
    desc: 'Menos calor, menos consumo y mismos FPS optimizando la curva de voltaje y frecuencia.',
    icon: '⚡',
    badge: 'Eficiencia',
    tier: 'epico',
    border: 'border-yellow-400',
    bgGradient: 'from-yellow-950/60 via-amber-950/40 to-slate-950',
    glowColor: 'shadow-yellow-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Técnica de reducir el voltaje suministrado al componente.'
  },
  {
    id: 'secret-siliconlottery',
    title: 'Silicio Bendecido',
    desc: 'Te tocó el chip perfecto salido del centro exacto de la oblea de TSMC.',
    icon: '🎰',
    badge: 'Fortuna',
    tier: 'legendario',
    border: 'border-purple-400',
    bgGradient: 'from-purple-950/60 via-pink-950/40 to-slate-950',
    glowColor: 'shadow-purple-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Término en inglés de dos palabras pegadas para la lotería del silicio.'
  },
  {
    id: 'secret-kryonaut',
    title: 'Conductividad Extrema',
    desc: '12.5 W/mk de conductividad térmica para exprimir cada grado bajo estrés sintético.',
    icon: '🧊',
    badge: 'Refrigeración',
    tier: 'raro',
    border: 'border-blue-400',
    bgGradient: 'from-blue-950/60 via-cyan-950/40 to-slate-950',
    glowColor: 'shadow-blue-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Modelo estrella de pasta térmica de Thermal Grizzly.'
  },
  {
    id: 'secret-dualchannel',
    title: 'Ancho de Banda Duplicado',
    desc: 'Dos módulos de RAM en ranuras alternas a 128 bits para alimentar a la CPU sin restricciones.',
    icon: '🧠',
    badge: 'Memoria RAM',
    tier: 'comun',
    border: 'border-indigo-400',
    bgGradient: 'from-indigo-950/60 via-purple-950/40 to-slate-950',
    glowColor: 'shadow-indigo-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Modo de dos memorias en paralelo para duplicar el bus.'
  },
  {
    id: 'secret-zeroday',
    title: 'Ciber-Inmunidad Zero-Day',
    desc: 'Escudo de hardware contra vulnerabilidades y exploits antes de que existan parches públicos.',
    icon: '🛡️',
    badge: 'Seguridad',
    tier: 'legendario',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/60 via-teal-950/40 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Vulnerabilidad informática desconocida hasta el día cero.'
  },
  {
    id: 'secret-cablemanagement',
    title: 'Maestro del Peine y Bridas',
    desc: 'El sagrado orden de enrutamiento que permite cerrar la tapa trasera sin forzar el chasis.',
    icon: '🧵',
    badge: 'Ensamble Pro',
    tier: 'epico',
    border: 'border-amber-400',
    bgGradient: 'from-amber-950/60 via-orange-950/40 to-slate-950',
    glowColor: 'shadow-amber-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: La disciplina en inglés de organizar y ordenar los cables.'
  },
  {
    id: 'secret-4kultra',
    title: 'Devorador de Píxeles',
    desc: '3840x2160 píxeles nativos con texturas al máximo y filtrado anisotrópico 16x.',
    icon: '🖥️',
    badge: 'Resolución Élite',
    tier: 'legendario',
    border: 'border-violet-400',
    bgGradient: 'from-violet-950/60 via-purple-950/40 to-slate-950',
    glowColor: 'shadow-violet-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Resolución 3840x2160 + preset gráfico máximo.'
  },
  {
    id: 'secret-benchmark',
    title: 'Cazador de Cinebench',
    desc: 'Obsesionado con exprimir 100 puntos más en cada pasada de pruebas sintéticas.',
    icon: '📊',
    badge: 'Rendimiento',
    tier: 'raro',
    border: 'border-lime-400',
    bgGradient: 'from-lime-950/60 via-emerald-950/40 to-slate-950',
    glowColor: 'shadow-lime-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Prueba estandarizada para medir la potencia de un equipo.'
  },
  {
    id: 'secret-goldenchip',
    title: 'Silicio de Oro 24K',
    desc: 'Voltajes mínimos y temperaturas gélidas. Una de cada cien mil unidades producidas.',
    icon: '🥇',
    badge: 'Gatazo de Oblea',
    tier: 'mitico',
    border: 'border-yellow-400',
    bgGradient: 'from-yellow-950/60 via-amber-950/40 to-slate-950',
    glowColor: 'shadow-yellow-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Término en inglés para el chip "dorado" de silicio perfecto.'
  },
  {
    id: 'secret-overheating',
    title: 'Freidora de Silicio',
    desc: '¡Alerta 100°C! Olvidaste despegar el plástico protector de la base de cobre del AIO.',
    icon: '🔥',
    badge: 'Throttling',
    tier: 'comun',
    border: 'border-red-400',
    bgGradient: 'from-red-950/60 via-orange-950/40 to-slate-950',
    glowColor: 'shadow-red-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Palabra en inglés para el sobrecalentamiento crítico de la CPU.'
  },
  {
    id: 'secret-nucleo2026',
    title: 'Fundador Legendario',
    desc: 'Pionero oficial del nacimiento de la plataforma Núcleo en el año 2026.',
    icon: '👑',
    badge: 'Fundador',
    tier: 'mitico',
    border: 'border-amber-400',
    bgGradient: 'from-amber-950/60 via-yellow-950/40 to-slate-950',
    glowColor: 'shadow-amber-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Nombre de esta plataforma unido al año de su lanzamiento.'
  },

  // Standard Community & Achievement Medals
  {
    id: 'secret-boss-kill',
    title: 'Destructor de Zero-Day',
    desc: 'Erradicaste al Titán Virus Zero-Day Prime con más de 21,000 puntos en Núcleo Legend.',
    icon: '👑👾',
    badge: 'Legendaria',
    tier: 'legendario',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    isSecret: true,
    requirementHint: 'Supera 21.000 pts en Núcleo Legend para convocar y aniquilar al Jefe Secreto de la fase 4.'
  },
  {
    id: 'arcade-legend',
    title: 'Leyenda del Overclock',
    desc: 'Alcanzaste una puntuación colosal de más de 20,000 puntos en Núcleo Legend.',
    icon: '⚡',
    badge: 'Épica',
    tier: 'epico',
    border: 'border-amber-400',
    bgGradient: 'from-amber-950/40 via-yellow-950/30 to-slate-950',
    glowColor: 'shadow-amber-500/30',
    requirementHint: 'Consigue más de 20,000 puntos en el juego arcade de la plataforma.'
  },
  {
    id: 'first-build',
    title: 'Arquitecto de Silicio',
    desc: 'Diseñaste y guardaste tu primer ensamble de PC en el configurador.',
    icon: '💻',
    badge: 'Rara',
    tier: 'raro',
    border: 'border-blue-400',
    bgGradient: 'from-blue-950/40 via-indigo-950/30 to-slate-950',
    glowColor: 'shadow-blue-500/30',
    requirementHint: 'Crea y guarda al menos un ensamble en el Configurador de PC.'
  },
  {
    id: 'sub-zero',
    title: 'Ingeniero Sub-Zero',
    desc: 'Diseñaste un ensamble con refrigeración líquida AIO de alto rendimiento térmico.',
    icon: '❄️',
    badge: 'Térmica',
    tier: 'raro',
    border: 'border-cyan-400',
    bgGradient: 'from-cyan-950/40 via-sky-950/30 to-slate-950',
    glowColor: 'shadow-cyan-500/30',
    requirementHint: 'Guarda una build equipada con disipador líquido o AIO de 360mm/420mm.'
  },
  {
    id: 'custom-avatar',
    title: 'Identidad Forjada',
    desc: 'Configuraste una foto de perfil personalizada o un avatar temático de hardware.',
    icon: '📸',
    badge: 'Perfil',
    tier: 'comun',
    border: 'border-rose-400',
    bgGradient: 'from-rose-950/40 via-red-950/30 to-slate-950',
    glowColor: 'shadow-rose-500/30',
    requirementHint: 'Sube tu propia foto o selecciona un preset de avatar en la pestaña Identidad.'
  },
  {
    id: 'eco-master',
    title: 'Eficiencia Ecológica',
    desc: 'Activaste el Modo de Bajo Consumo y ahorro de energía en la plataforma.',
    icon: '🍃',
    badge: 'Eficiencia',
    tier: 'comun',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/40 via-green-950/30 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    requirementHint: 'Activa el interruptor de Modo de Bajo Consumo en la configuración de perfil.'
  },
  {
    id: 'weekly-hero',
    title: 'Pionero Semanal',
    desc: 'Sincronizaste el Hub Semanal y exploraste los descuentos de silicio en vivo.',
    icon: '📅',
    badge: 'Exploración',
    tier: 'comun',
    border: 'border-amber-400',
    bgGradient: 'from-amber-950/40 via-slate-950 to-slate-950',
    glowColor: 'shadow-amber-500/30',
    requirementHint: 'Abre el Hub Semanal o fuerza una sincronización de ofertas.'
  },
  {
    id: 'tech-guru',
    title: 'Técnico de Banco de Pruebas',
    desc: 'Completaste al menos 5 pasos en la guía física interactiva de montaje de PC.',
    icon: '🛠️',
    badge: 'Taller',
    tier: 'raro',
    border: 'border-yellow-400',
    bgGradient: 'from-yellow-950/40 via-slate-950 to-slate-950',
    glowColor: 'shadow-yellow-500/30',
    requirementHint: 'Marca al menos 5 pasos en la pestaña Guía de Montaje del perfil.'
  },
  {
    id: 'rig-collector',
    title: 'Coleccionista de Ensambles',
    desc: 'Guardaste 3 o más configuraciones personalizadas en tu perfil de entusiasta.',
    icon: '🌟',
    badge: 'Colección',
    tier: 'epico',
    border: 'border-purple-400',
    bgGradient: 'from-purple-950/40 via-indigo-950/30 to-slate-950',
    glowColor: 'shadow-purple-500/30',
    requirementHint: 'Crea y guarda al menos 3 ensambles distintos en tu perfil.'
  },
  {
    id: 'intel-path-victor',
    title: 'Alianza Azul Intel',
    desc: 'Completaste el camino final de Intel en Núcleo Legend (Fortaleza Azul LGA 1851) derrotando al Titán Spectre-Bot.',
    icon: '🔵⚡',
    badge: 'Camino Intel',
    tier: 'legendario',
    border: 'border-blue-400',
    bgGradient: 'from-blue-950/60 via-cyan-950/40 to-slate-950',
    glowColor: 'shadow-blue-500/30',
    requirementHint: 'Elige el camino INTEL en la Encrucijada de Núcleo Legend y vence al Jefe Final.'
  },
  {
    id: 'amd-path-victor',
    title: 'Legión Carmesí AMD',
    desc: 'Completaste el camino final de AMD en Núcleo Legend (Templo 3D V-Cache AM5) venciendo al Titán del Cuello de Botella.',
    icon: '🔴🔥',
    badge: 'Camino AMD',
    tier: 'legendario',
    border: 'border-red-400',
    bgGradient: 'from-red-950/60 via-orange-950/40 to-slate-950',
    glowColor: 'shadow-red-500/30',
    requirementHint: 'Elige el camino AMD en la Encrucijada de Núcleo Legend y vence al Jefe Final.'
  },
  {
    id: 'combo-master',
    title: 'Furia Overclock 5x',
    desc: 'Encadenaste eliminaciones y pisoteos hasta alcanzar el multiplicador máximo de combo x5 en Núcleo Legend.',
    icon: '⚡💥',
    badge: 'Combo x5',
    tier: 'epico',
    border: 'border-amber-400',
    bgGradient: 'from-amber-950/60 via-orange-950/40 to-slate-950',
    glowColor: 'shadow-amber-500/30',
    requirementHint: 'Alcanza un combo x5 consecutivo en Núcleo Legend.'
  },
  // --- NUEVAS MEDALLAS DE HARDWARE Y COMUNIDAD ---
  {
    id: 'psu-titan',
    title: 'Titán Eléctrico 1000W',
    desc: 'Configuraste o guardaste un ensamble con fuente de poder de 1000W o superior.',
    icon: '⚡🔋',
    badge: 'Energía Élite',
    tier: 'epico',
    border: 'border-amber-400',
    bgGradient: 'from-amber-950/60 via-yellow-950/30 to-slate-950',
    glowColor: 'shadow-amber-500/30',
    requirementHint: 'Agrega y guarda un ensamble con fuente de poder (PSU) de 1000W o más.'
  },
  {
    id: 'speedrun-architect',
    title: 'Arquitectura Total 8/8',
    desc: 'Completaste un ensamble con los 8 componentes de hardware esenciales sin dejar ninguna bahía vacía.',
    icon: '🧩✨',
    badge: 'Ensamble 100%',
    tier: 'legendario',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/60 via-teal-950/40 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    requirementHint: 'Configura y guarda un ensamble completo con CPU, Cooler, Placa, RAM, GPU, SSD, Fuente y Gabinete.'
  },
  {
    id: 'sound-explorer',
    title: 'Sinfonía Mecánica',
    desc: 'Probaste los efectos acústicos en el Laboratorio de Audio y Curva de Ventiladores.',
    icon: '🎧🔊',
    badge: 'Acústica',
    tier: 'comun',
    border: 'border-cyan-400',
    bgGradient: 'from-cyan-950/60 via-blue-950/30 to-slate-950',
    glowColor: 'shadow-cyan-500/30',
    requirementHint: 'Prueba el Laboratorio Acústico de Ventiladores en la pestaña Herramientas del perfil.'
  },
  {
    id: 'high-flyer',
    title: 'Acróbata de 5,000 FPS',
    desc: 'Superaste los 5,000 puntos en Núcleo Legend combatiendo las hordas de virus informáticos.',
    icon: '🚀👾',
    badge: 'Gamer Destacado',
    tier: 'raro',
    border: 'border-rose-400',
    bgGradient: 'from-rose-950/60 via-red-950/30 to-slate-950',
    glowColor: 'shadow-rose-500/30',
    requirementHint: 'Alcanza al menos 5,000 puntos en el juego arcade Núcleo Legend.'
  },
  {
    id: 'rgb-overlord',
    title: 'Soberano del RGB',
    desc: 'Sincronizaste tu perfil con efectos de iluminación dinámica Arcoíris, Pulsación o Respiración.',
    icon: '🌈✨',
    badge: 'Estilo Neón',
    tier: 'raro',
    border: 'border-fuchsia-400',
    bgGradient: 'from-fuchsia-950/60 via-pink-950/30 to-slate-950',
    glowColor: 'shadow-fuchsia-500/30',
    requirementHint: 'Activa un modo de iluminación RGB activo en las preferencias de perfil.'
  },
  {
    id: 'comparator-guru',
    title: 'Oráculo Comparativo',
    desc: 'Utilizaste el comparador cara a cara de componentes para calibrar tu presupuesto y potencia.',
    icon: '⚖️🔬',
    badge: 'Laboratorio',
    tier: 'raro',
    border: 'border-blue-400',
    bgGradient: 'from-blue-950/60 via-indigo-950/30 to-slate-950',
    glowColor: 'shadow-blue-500/30',
    requirementHint: 'Abre y prueba el comparador de hardware desde la barra superior.'
  },
  // --- NUEVAS MEDALLAS SECRETAS CANJEABLES ---
  {
    id: 'secret-retro',
    title: 'Legado 8-Bit Retro',
    desc: 'Desbloqueado con el código clásico de la era dorada de la informática y el MS-DOS.',
    icon: '🕹️💾',
    badge: 'Retro Computing',
    tier: 'epico',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/60 via-lime-950/40 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Palabra para la informática nostálgica unida a PC.'
  },
  {
    id: 'secret-quantum',
    title: 'Salto Cuántico',
    desc: 'Computación basada en cúbits y estados entrelazados más allá del silicio tradicional.',
    icon: '⚛️🌀',
    badge: 'Cuántico',
    tier: 'mitico',
    border: 'border-indigo-400',
    bgGradient: 'from-indigo-950/60 via-cyan-950/40 to-slate-950',
    glowColor: 'shadow-indigo-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Término en inglés para computación basada en cúbits.'
  },
  {
    id: 'secret-stealth',
    title: 'Arquitectura Fantasma',
    desc: 'Cero RGB, acabado negro mate anodizado y máxima potencia en absoluto silencio.',
    icon: '🥷🖤',
    badge: 'Stealth Total',
    tier: 'legendario',
    border: 'border-slate-400',
    bgGradient: 'from-slate-900 via-neutral-950 to-black',
    glowColor: 'shadow-slate-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Palabra en inglés de 7 letras para ensamble sin luces y sigiloso.'
  },
  // 10 NUEVAS MEDALLAS POR CÓDIGO SECRETO
  {
    id: 'secret-raytracing',
    title: 'Reflejo del Fotorrealismo',
    desc: 'Simulación física de trazado de rayos en tiempo real para iluminación y reflejos cinemáticos.',
    icon: '🪞✨',
    badge: 'Ray Tracing',
    tier: 'legendario',
    border: 'border-cyan-400',
    bgGradient: 'from-cyan-950/60 via-blue-950/40 to-slate-950',
    glowColor: 'shadow-cyan-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Término en inglés de 10 letras para el trazado de rayos.'
  },
  {
    id: 'secret-watercooling',
    title: 'Fontanero del Cobre',
    desc: 'Custom loop con tubos rígidos, bomba D5 y radiadores triples para domar el silicio más salvaje.',
    icon: '💧🛠️',
    badge: 'Custom Loop',
    tier: 'epico',
    border: 'border-sky-400',
    bgGradient: 'from-sky-950/60 via-blue-950/40 to-slate-950',
    glowColor: 'shadow-sky-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Palabra en inglés de 12 letras para refrigeración líquida personalizada.'
  },
  {
    id: 'secret-pciexpress',
    title: 'Autopista Gen 5.0',
    desc: 'Carriles PCIe ultrarrápidos con 128 GB/s de ancho de banda bidireccional.',
    icon: '🏎️⚡',
    badge: 'Bus PCIe 5.0',
    tier: 'raro',
    border: 'border-yellow-400',
    bgGradient: 'from-yellow-950/60 via-amber-950/40 to-slate-950',
    glowColor: 'shadow-yellow-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Nombre del bus serie de alta velocidad (PCIEXPRESS o PCIE5).'
  },
  {
    id: 'secret-overclock',
    title: 'Furia de Gigahercios',
    desc: 'Desbloqueaste el multiplicador de reloj para alcanzar frecuencias de infarto.',
    icon: '🚀🔥',
    badge: 'Overclock Máximo',
    tier: 'legendario',
    border: 'border-red-400',
    bgGradient: 'from-red-950/60 via-orange-950/40 to-slate-950',
    glowColor: 'shadow-red-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Término universal en inglés para forzar frecuencias (OVERCLOCK u OC).'
  },
  {
    id: 'secret-dlss',
    title: 'Generador de Cuadros IA',
    desc: 'Reconstrucción de imagen y generación de fotogramas neuronales para duplicar tus FPS.',
    icon: '🧠✨',
    badge: 'IA Neuronal',
    tier: 'epico',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/60 via-teal-950/40 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Siglas de 4 letras para Deep Learning Super Sampling.'
  },
  {
    id: 'secret-titanium',
    title: 'Grado 80 Plus Titanium',
    desc: 'Eficiencia energética de titanio: 94% de conversión para cero calor desperdiciado.',
    icon: '🛡️⚡',
    badge: 'Eficiencia 94%',
    tier: 'mitico',
    border: 'border-slate-300',
    bgGradient: 'from-slate-800 via-neutral-900 to-slate-950',
    glowColor: 'shadow-slate-300/40',
    isSecret: true,
    requirementHint: 'Pista de código: Nombre en inglés del metal de máxima certificación (TITANIUM).'
  },
  {
    id: 'secret-oled',
    title: 'Negro Infinito & 0.03ms',
    desc: 'Píxeles autoemisivos con contraste absoluto y tiempos de respuesta instantáneos.',
    icon: '🌌🖤',
    badge: 'Panel OLED',
    tier: 'epico',
    border: 'border-purple-400',
    bgGradient: 'from-purple-950/60 via-fuchsia-950/40 to-slate-950',
    glowColor: 'shadow-purple-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Siglas de 4 letras para pantallas con diodos orgánicos (OLED).'
  },
  {
    id: 'secret-apu',
    title: 'Corazón Híbrido Silicio',
    desc: 'CPU y gráfica Radeon integradas en un solo chiplet de máxima portabilidad.',
    icon: '📦🎮',
    badge: 'Chiplet APU',
    tier: 'comun',
    border: 'border-orange-400',
    bgGradient: 'from-orange-950/60 via-amber-950/40 to-slate-950',
    glowColor: 'shadow-orange-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Siglas de 3 letras para Accelerated Processing Unit (APU).'
  },
  {
    id: 'secret-nvme',
    title: 'Lectura a 14,000 MB/s',
    desc: 'Almacenamiento directo a carriles PCIe con colas de comandos ultra-paralelas.',
    icon: '⚡💾',
    badge: 'SSD NVMe',
    tier: 'raro',
    border: 'border-amber-400',
    bgGradient: 'from-amber-950/60 via-yellow-950/40 to-slate-950',
    glowColor: 'shadow-amber-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Protocolo de 4 letras para memoria no volátil sobre PCIe (NVME).'
  },
  {
    id: 'secret-memtest',
    title: 'Centinela de Errores RAM',
    desc: 'Pasaste 4 rondas completas de comprobación de memoria sin un solo fallo de paridad.',
    icon: '🧪🔬',
    badge: 'RAM Estable',
    tier: 'raro',
    border: 'border-lime-400',
    bgGradient: 'from-lime-950/60 via-emerald-950/40 to-slate-950',
    glowColor: 'shadow-lime-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Herramienta mítica de comprobación de memoria RAM (MEMTEST).'
  },
  {
    id: 'secret-cyberpunk',
    title: 'Implante Cibernético 2.0.77',
    desc: 'Conectaste la red neuronal del silicio a la mega-urbe distópica con Path Tracing y Overdrive.',
    icon: '🦾⚡',
    badge: 'Cyberware Élite',
    tier: 'mitico',
    border: 'border-yellow-400',
    bgGradient: 'from-yellow-950/60 via-amber-950/40 to-slate-950',
    glowColor: 'shadow-yellow-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: El legendario RPG futurista distópico de Night City (CYBERPUNK).'
  },
  {
    id: 'secret-linux',
    title: 'Pingüino Kernel Maestro',
    desc: 'Control absoluto sobre los procesos del sistema, drivers de código abierto y compilación personalizada.',
    icon: '🐧💻',
    badge: 'Kernel Open-Source',
    tier: 'epico',
    border: 'border-emerald-400',
    bgGradient: 'from-emerald-950/60 via-teal-950/40 to-slate-950',
    glowColor: 'shadow-emerald-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: El sistema operativo de código abierto del pingüino (LINUX).'
  },
  {
    id: 'secret-biosflash',
    title: 'Resurrección por Botón',
    desc: 'Reviviste una placa base sin procesador gracias al circuito dedicado de BIOS Flashback.',
    icon: '⚡💾',
    badge: 'Flashback Seguro',
    tier: 'raro',
    border: 'border-blue-400',
    bgGradient: 'from-blue-950/60 via-indigo-950/40 to-slate-950',
    glowColor: 'shadow-blue-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Función en inglés para flashear la BIOS con un pendrive (BIOSFLASH).'
  },
  {
    id: 'secret-bottleneck',
    title: 'Cero Cuello de Botella',
    desc: 'Calibración milimétrica de CPU y GPU trabajando al 99% sin generar pérdidas de rendimiento.',
    icon: '⏳🎯',
    badge: 'Sincronía 1:1',
    tier: 'comun',
    border: 'border-cyan-400',
    bgGradient: 'from-cyan-950/60 via-blue-950/40 to-slate-950',
    glowColor: 'shadow-cyan-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Término en inglés para cuando un componente estrangula a otro (BOTTLENECK).'
  },
  {
    id: 'secret-casemod',
    title: 'Artesano del Chasis',
    desc: 'Corte láser, pintura personalizada y grabado en vidrio templado para un ensamble único en el mundo.',
    icon: '🎨🛠️',
    badge: 'Modding de Élite',
    tier: 'legendario',
    border: 'border-fuchsia-400',
    bgGradient: 'from-fuchsia-950/60 via-pink-950/40 to-slate-950',
    glowColor: 'shadow-fuchsia-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Modificación artesanal de gabinete en inglés (CASEMOD).'
  },
  {
    id: 'secret-teras',
    title: 'Bóveda de Petabytes',
    desc: 'Capacidad de almacenamiento colosal para albergar bibliotecas enteras de juegos sin desinstalar nada.',
    icon: '💽📦',
    badge: 'Capacidad Infinita',
    tier: 'raro',
    border: 'border-indigo-400',
    bgGradient: 'from-indigo-950/60 via-violet-950/40 to-slate-950',
    glowColor: 'shadow-indigo-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Plural coloquial de 5 letras para terabytes (TERAS).'
  },
  {
    id: 'secret-framegen',
    title: 'Interpolación Fotónica',
    desc: 'Multiplicador de FPS que inserta fotogramas hiper-precisos calculados mediante tensores neuronales.',
    icon: '🎬⚡',
    badge: 'Multiplicador FPS',
    tier: 'legendario',
    border: 'border-green-400',
    bgGradient: 'from-green-950/60 via-emerald-950/40 to-slate-950',
    glowColor: 'shadow-green-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Generación de cuadros por IA en inglés (FRAMEGEN).'
  },
  {
    id: 'secret-itx',
    title: 'Monstruo SFF Compacto',
    desc: 'Máxima densidad de transistores en un volumen inferior a 11 litros con flujo de aire de precisión.',
    icon: '📐💼',
    badge: 'Mini-ITX Supremo',
    tier: 'epico',
    border: 'border-rose-400',
    bgGradient: 'from-rose-950/60 via-red-950/40 to-slate-950',
    glowColor: 'shadow-rose-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Formato de placa miniatura de 3 letras (ITX).'
  },
  {
    id: 'secret-goldencore',
    title: 'Núcleo de Silicio Puro',
    desc: 'El núcleo maestro con la curva V/F perfecta capaz de sostener frecuencias estables en un solo hilo.',
    icon: '👑💎',
    badge: 'Núcleo Insignia',
    tier: 'mitico',
    border: 'border-amber-300',
    bgGradient: 'from-amber-950/70 via-yellow-950/50 to-slate-950',
    glowColor: 'shadow-amber-400/40',
    isSecret: true,
    requirementHint: 'Pista de código: El mejor núcleo individual de tu CPU en inglés (GOLDENCORE).'
  },
  {
    id: 'secret-rgbfusion',
    title: 'Sincronía Neón Lumínica',
    desc: 'Todos tus ventiladores, memorias y tarjeta gráfica latiendo en una única onda de color coordinada.',
    icon: '🌈✨',
    badge: 'Aura Coordinada',
    tier: 'comun',
    border: 'border-pink-400',
    bgGradient: 'from-pink-950/60 via-fuchsia-950/40 to-slate-950',
    glowColor: 'shadow-pink-500/30',
    isSecret: true,
    requirementHint: 'Pista de código: Fusión y sincronización RGB en inglés (RGBFUSION).'
  },
  {
    id: 'secret-valen',
    title: 'Valen',
    desc: 'La insignia raíz y secreta del creador de Núcleo. Concede el rango supremo de arquitectura y acceso de nivel Desarrollador.',
    icon: '👑⚡',
    badge: 'Desarrollador Maestro',
    tier: 'mitico',
    border: 'border-amber-300',
    bgGradient: 'from-amber-500/30 via-yellow-600/25 to-slate-950',
    glowColor: 'shadow-yellow-400/40',
    isSecret: true,
    requirementHint: 'Código secreto confidencial.'
  }
];

// Mapping of all secret codes to their medal ID and unlock details
export const SECRET_CODES_MAP: Record<string, { medalId: string; title: string; icon: string }> = {
  'DEVELOPER': { medalId: 'secret-valen', title: 'Valen', icon: '👑⚡' },
  '2026': { medalId: 'secret-2026', title: 'Viajero del Silicio 2026', icon: '🔮' },
  'RTX5090': { medalId: 'secret-rtx5090', title: 'Monarca de Blackwell', icon: '🟢' },
  'ZEN5': { medalId: 'secret-zen5', title: 'Caché Invertida 3D', icon: '🔴' },
  'NITROGENO': { medalId: 'secret-nitrogeno', title: 'Maestro del LN2', icon: '❄️' },
  'LN2': { medalId: 'secret-nitrogeno', title: 'Maestro del LN2', icon: '❄️' },
  'RGB': { medalId: 'secret-rgb', title: '+1000 FPS Arcoíris', icon: '🌈' },
  'PATHTRACING': { medalId: 'secret-pathtracing', title: 'Iluminación Cuántica', icon: '💎' },
  'THERMALPASTE': { medalId: 'secret-thermalpaste', title: 'La Gota de Guisante', icon: '🧪' },
  'PASTATERMICA': { medalId: 'secret-thermalpaste', title: 'La Gota de Guisante', icon: '🧪' },
  'BOOTLOOP': { medalId: 'secret-bootloop', title: 'Superviviente de BIOS', icon: '🔄' },
  'DELID': { medalId: 'secret-delid', title: 'Cirujano de Silicio', icon: '🔪' },
  '144HZ': { medalId: 'secret-144hz', title: 'Fluidez Competitiva', icon: '👁️' },
  'UNDERVOLT': { medalId: 'secret-undervolt', title: 'Domador de Voltajes', icon: '⚡' },
  'SILICONLOTTERY': { medalId: 'secret-siliconlottery', title: 'Silicio Bendecido', icon: '🎰' },
  'KRYONAUT': { medalId: 'secret-kryonaut', title: 'Conductividad Extrema', icon: '🧊' },
  'DUALCHANNEL': { medalId: 'secret-dualchannel', title: 'Ancho de Banda Duplicado', icon: '🧠' },
  'ZERODAY': { medalId: 'secret-zeroday', title: 'Ciber-Inmunidad Zero-Day', icon: '🛡️' },
  'CABLEMANAGEMENT': { medalId: 'secret-cablemanagement', title: 'Maestro del Peine y Bridas', icon: '🧵' },
  '4KULTRA': { medalId: 'secret-4kultra', title: 'Devorador de Píxeles', icon: '🖥️' },
  'BENCHMARK': { medalId: 'secret-benchmark', title: 'Cazador de Cinebench', icon: '📊' },
  'GOLDENCHIP': { medalId: 'secret-goldenchip', title: 'Silicio de Oro 24K', icon: '🥇' },
  'OVERHEATING': { medalId: 'secret-overheating', title: 'Freidora de Silicio', icon: '🔥' },
  'NUCLEO2026': { medalId: 'secret-nucleo2026', title: 'Fundador Legendario', icon: '👑' },
  'NUCLEO': { medalId: 'secret-nucleo2026', title: 'Fundador Legendario', icon: '👑' },
  // CÓDIGOS SECRETOS EXPANDIDOS
  'RETROPC': { medalId: 'secret-retro', title: 'Legado 8-Bit Retro', icon: '🕹️💾' },
  'RETRO': { medalId: 'secret-retro', title: 'Legado 8-Bit Retro', icon: '🕹️💾' },
  'QUANTUM': { medalId: 'secret-quantum', title: 'Salto Cuántico', icon: '⚛️🌀' },
  'QUBIT': { medalId: 'secret-quantum', title: 'Salto Cuántico', icon: '⚛️🌀' },
  'STEALTH': { medalId: 'secret-stealth', title: 'Arquitectura Fantasma', icon: '🥷🖤' },
  'GHOST': { medalId: 'secret-stealth', title: 'Arquitectura Fantasma', icon: '🥷🖤' },
  // 10 NUEVOS CÓDIGOS
  'RAYTRACING': { medalId: 'secret-raytracing', title: 'Reflejo del Fotorrealismo', icon: '🪞✨' },
  'RTXON': { medalId: 'secret-raytracing', title: 'Reflejo del Fotorrealismo', icon: '🪞✨' },
  'WATERCOOLING': { medalId: 'secret-watercooling', title: 'Fontanero del Cobre', icon: '💧🛠️' },
  'CUSTOMCOOLING': { medalId: 'secret-watercooling', title: 'Fontanero del Cobre', icon: '💧🛠️' },
  'PCIEXPRESS': { medalId: 'secret-pciexpress', title: 'Autopista Gen 5.0', icon: '🏎️⚡' },
  'PCIE5': { medalId: 'secret-pciexpress', title: 'Autopista Gen 5.0', icon: '🏎️⚡' },
  'OVERCLOCK': { medalId: 'secret-overclock', title: 'Furia de Gigahercios', icon: '🚀🔥' },
  'OC': { medalId: 'secret-overclock', title: 'Furia de Gigahercios', icon: '🚀🔥' },
  'DLSS': { medalId: 'secret-dlss', title: 'Generador de Cuadros IA', icon: '🧠✨' },
  'FSR': { medalId: 'secret-dlss', title: 'Generador de Cuadros IA', icon: '🧠✨' },
  'TITANIUM': { medalId: 'secret-titanium', title: 'Grado 80 Plus Titanium', icon: '🛡️⚡' },
  '80PLUSTITANIUM': { medalId: 'secret-titanium', title: 'Grado 80 Plus Titanium', icon: '🛡️⚡' },
  'OLED': { medalId: 'secret-oled', title: 'Negro Infinito & 0.03ms', icon: '🌌🖤' },
  'APU': { medalId: 'secret-apu', title: 'Corazón Híbrido Silicio', icon: '📦🎮' },
  'NVME': { medalId: 'secret-nvme', title: 'Lectura a 14,000 MB/s', icon: '⚡💾' },
  'MEMTEST': { medalId: 'secret-memtest', title: 'Centinela de Errores RAM', icon: '🧪🔬' },
  // 10 NUEVOS CÓDIGOS DE LA ACTUALIZACIÓN
  'CYBERPUNK': { medalId: 'secret-cyberpunk', title: 'Implante Cibernético 2.0.77', icon: '🦾⚡' },
  'NIGHTCITY': { medalId: 'secret-cyberpunk', title: 'Implante Cibernético 2.0.77', icon: '🦾⚡' },
  'LINUX': { medalId: 'secret-linux', title: 'Pingüino Kernel Maestro', icon: '🐧💻' },
  'KERNEL': { medalId: 'secret-linux', title: 'Pingüino Kernel Maestro', icon: '🐧💻' },
  'BIOSFLASH': { medalId: 'secret-biosflash', title: 'Resurrección por Botón', icon: '⚡💾' },
  'FLASHBACK': { medalId: 'secret-biosflash', title: 'Resurrección por Botón', icon: '⚡💾' },
  'BOTTLENECK': { medalId: 'secret-bottleneck', title: 'Cero Cuello de Botella', icon: '⏳🎯' },
  'CUELLOBOTELLA': { medalId: 'secret-bottleneck', title: 'Cero Cuello de Botella', icon: '⏳🎯' },
  'CASEMOD': { medalId: 'secret-casemod', title: 'Artesano del Chasis', icon: '🎨🛠️' },
  'MODDING': { medalId: 'secret-casemod', title: 'Artesano del Chasis', icon: '🎨🛠️' },
  'TERAS': { medalId: 'secret-teras', title: 'Bóveda de Petabytes', icon: '💽📦' },
  'PETABYTE': { medalId: 'secret-teras', title: 'Bóveda de Petabytes', icon: '💽📦' },
  'FRAMEGEN': { medalId: 'secret-framegen', title: 'Interpolación Fotónica', icon: '🎬⚡' },
  'FRAMEGENERATION': { medalId: 'secret-framegen', title: 'Interpolación Fotónica', icon: '🎬⚡' },
  'ITX': { medalId: 'secret-itx', title: 'Monstruo SFF Compacto', icon: '📐💼' },
  'MINIITX': { medalId: 'secret-itx', title: 'Monstruo SFF Compacto', icon: '📐💼' },
  'GOLDENCORE': { medalId: 'secret-goldencore', title: 'Núcleo de Silicio Puro', icon: '👑💎' },
  'RGBFUSION': { medalId: 'secret-rgbfusion', title: 'Sincronía Neón Lumínica', icon: '🌈✨' }
};

// All secret codes available to restore
export const ALL_SECRET_CODES: string[] = [
  'DEVELOPER',
  '2026',
  'RTX5090',
  'ZEN5',
  'NITROGENO',
  'RGB',
  'PATHTRACING',
  'THERMALPASTE',
  'BOOTLOOP',
  'DELID',
  '144HZ',
  'UNDERVOLT',
  'SILICONLOTTERY',
  'KRYONAUT',
  'DUALCHANNEL',
  'ZERODAY',
  'CABLEMANAGEMENT',
  '4KULTRA',
  'BENCHMARK',
  'GOLDENCHIP',
  'OVERHEATING',
  'NUCLEO2026',
  'RETROPC',
  'QUANTUM',
  'STEALTH',
  'RAYTRACING',
  'WATERCOOLING',
  'PCIEXPRESS',
  'OVERCLOCK',
  'DLSS',
  'TITANIUM',
  'OLED',
  'APU',
  'NVME',
  'MEMTEST',
  'CYBERPUNK',
  'LINUX',
  'BIOSFLASH',
  'BOTTLENECK',
  'CASEMOD',
  'TERAS',
  'FRAMEGEN',
  'ITX',
  'GOLDENCORE',
  'RGBFUSION'
];

export const ALL_MEDAL_IDS: string[] = ALL_MEDALS_CATALOG.map(m => m.id);

export function restoreAllUserMedalsAndCodes(currentProfile: UserProfile): UserProfile {
  try {
    localStorage.setItem('nucleo_acoustic_lab_tested', 'true');
    localStorage.setItem('nucleo_comparator_used', 'true');
    localStorage.setItem('nucleo_weekly_market_report_v1', 'true');

    // Ensure checklist steps are checked so tech-guru is active
    const existingChecklist = localStorage.getItem('nucleo_checklist_steps');
    if (!existingChecklist || JSON.parse(existingChecklist).length < 5) {
      localStorage.setItem('nucleo_checklist_steps', JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8]));
    }

    // Ensure arcade leaderboard has 21000+ points and defeatedSecretBoss
    const lbRaw = localStorage.getItem('nucleo_legend_leaderboard');
    let hasZeroDayKill = false;
    if (lbRaw) {
      try {
        const parsed = JSON.parse(lbRaw);
        if (Array.isArray(parsed) && parsed.some((e: any) => (e.score || 0) >= 21000 || e.defeatedSecretBoss)) {
          hasZeroDayKill = true;
        }
      } catch {}
    }
    if (!hasZeroDayKill) {
      const defaultRecord = [{
        id: 'hero-score-restored',
        playerName: currentProfile.gamerTag || 'Entusiasta_01',
        score: 22850,
        fpsAchieved: 240,
        levelReached: 5,
        componentsRescued: 8,
        date: new Date().toLocaleDateString('es-ES'),
        victory: true,
        rankTitle: '👑 Destructor del Virus Zero-Day Prime',
        defeatedSecretBoss: true
      }];
      localStorage.setItem('nucleo_legend_leaderboard', JSON.stringify(defaultRecord));
    }
  } catch {}

  const mergedCodes = Array.from(new Set([...(currentProfile.redeemedCodes || []), ...ALL_SECRET_CODES]));
  const mergedMedals = Array.from(new Set([...(currentProfile.unlockedMedals || []), ...ALL_MEDAL_IDS]));

  const updatedProfile: UserProfile = {
    ...currentProfile,
    redeemedCodes: mergedCodes,
    unlockedMedals: mergedMedals,
    equippedMedalId: currentProfile.equippedMedalId || 'secret-valen'
  };

  try {
    localStorage.setItem('nucleo_user_profile', JSON.stringify(updatedProfile));
  } catch {}

  return updatedProfile;
}

export function evaluateUserMedals(
  userProfile: UserProfile,
  savedBuilds: UserBuild[],
  topGameScore: number = 0
): MedalItem[] {
  let checklistCount = 0;
  try {
    const raw = localStorage.getItem('nucleo_checklist_steps');
    if (raw) checklistCount = JSON.parse(raw).length;
  } catch {}

  let defeatedSecretBoss = false;
  try {
    const lbRaw = localStorage.getItem('nucleo_legend_leaderboard');
    if (lbRaw) {
      const lb = JSON.parse(lbRaw);
      if (Array.isArray(lb)) {
        defeatedSecretBoss = lb.some((e: any) => e.defeatedSecretBoss || e.rankTitle?.includes('Zero-Day') || e.score >= 21000);
      }
    }
  } catch {}

  const hasLiquidCooler = savedBuilds.some(b =>
    Object.values(b.components).some(
      c => c?.category === 'cooler' && (c.name.toLowerCase().includes('liquid') || c.name.toLowerCase().includes('aio') || c.name.toLowerCase().includes('kraken') || c.name.toLowerCase().includes('360'))
    )
  );

  const has1000WPSU = savedBuilds.some(b =>
    Object.values(b.components).some(
      c => c?.category === 'psu' && (c.name.includes('1000') || c.name.includes('1200') || c.name.includes('1300') || c.name.includes('1500') || c.name.includes('1600') || (c.tdpWatts && c.tdpWatts >= 1000))
    )
  );

  const hasComplete8Build = savedBuilds.some(b => {
    const keys = Object.keys(b.components);
    return keys.length >= 8;
  });

  const hasTestedAcoustic = typeof window !== 'undefined' && !!localStorage.getItem('nucleo_acoustic_lab_tested');
  const hasUsedComparator = typeof window !== 'undefined' && !!localStorage.getItem('nucleo_comparator_used');
  const hasActiveRgb = userProfile.rgbLightingMode === 'rainbow' || userProfile.rgbLightingMode === 'breathing' || userProfile.rgbLightingMode === 'pulse';

  const redeemed = (userProfile.redeemedCodes || []).map(c => c.toUpperCase());
  const manuallyUnlocked = userProfile.unlockedMedals || [];

  return ALL_MEDALS_CATALOG.map(medal => {
    let unlocked = false;

    if (manuallyUnlocked.includes(medal.id)) {
      unlocked = true;
    } else {
      // Check if unlocked via code redemption
      const matchingCode = Object.keys(SECRET_CODES_MAP).find(
        k => SECRET_CODES_MAP[k].medalId === medal.id && redeemed.includes(k)
      );

      if (matchingCode) {
        unlocked = true;
      } else {
        switch (medal.id) {
          case 'secret-boss-kill':
            unlocked = defeatedSecretBoss || redeemed.includes('ZERODAY');
            break;
          case 'arcade-legend':
            unlocked = topGameScore >= 20000;
            break;
          case 'high-flyer':
            unlocked = topGameScore >= 5000;
            break;
          case 'first-build':
            unlocked = savedBuilds.length >= 1;
            break;
          case 'sub-zero':
            unlocked = hasLiquidCooler;
            break;
          case 'psu-titan':
            unlocked = has1000WPSU;
            break;
          case 'speedrun-architect':
            unlocked = hasComplete8Build;
            break;
          case 'sound-explorer':
            unlocked = hasTestedAcoustic || userProfile.soundEnabled;
            break;
          case 'rgb-overlord':
            unlocked = hasActiveRgb;
            break;
          case 'comparator-guru':
            unlocked = hasUsedComparator;
            break;
          case 'custom-avatar':
            unlocked = !!(userProfile.avatarUrl || userProfile.avatarPresetId);
            break;
          case 'eco-master':
            unlocked = !!userProfile.lowPowerMode;
            break;
          case 'weekly-hero':
            unlocked = !!localStorage.getItem('nucleo_weekly_market_report_v1');
            break;
          case 'tech-guru':
            unlocked = checklistCount >= 5;
            break;
          case 'rig-collector':
            unlocked = savedBuilds.length >= 3;
            break;
          case 'intel-path-victor':
            unlocked = typeof window !== 'undefined' && !!localStorage.getItem('nucleo_legend_intel_win');
            break;
          case 'amd-path-victor':
            unlocked = typeof window !== 'undefined' && !!localStorage.getItem('nucleo_legend_amd_win');
            break;
          case 'combo-master':
            unlocked = typeof window !== 'undefined' && Number(localStorage.getItem('nucleo_legend_max_combo') || '0') >= 5;
            break;
          default:
            unlocked = false;
        }
      }
    }

    return {
      ...medal,
      unlocked
    };
  });
}

export interface RedeemResult {
  success: boolean;
  alreadyRedeemed?: boolean;
  medalId?: string;
  medalTitle?: string;
  medalIcon?: string;
  message: string;
}

export function redeemSecretCode(
  rawCode: string,
  userProfile: UserProfile
): RedeemResult {
  const code = rawCode.trim().toUpperCase();
  const redeemed = (userProfile.redeemedCodes || []).map(c => c.toUpperCase());
  const unlockedMedals = userProfile.unlockedMedals || [];

  if (!code) {
    return {
      success: false,
      message: 'Por favor, ingresa un código para canjear.'
    };
  }

  const match = SECRET_CODES_MAP[code];

  if (!match) {
    return {
      success: false,
      message: `Código secreto no reconocido o expirado. ¡Revisa las pistas abajo en la Bóveda de Códigos para descubrir los ${SECRET_CODES_CLUES.length} enigmas!`
    };
  }

  const alreadyHasMedal =
    redeemed.includes(code) ||
    unlockedMedals.includes(match.medalId) ||
    Object.keys(SECRET_CODES_MAP).some(
      k => SECRET_CODES_MAP[k].medalId === match.medalId && redeemed.includes(k)
    );

  if (alreadyHasMedal) {
    return {
      success: false,
      alreadyRedeemed: true,
      medalId: match.medalId,
      medalTitle: match.title,
      medalIcon: match.icon,
      message: `¡La recompensa de "${code}" ya está registrada en este perfil! Tu medalla "${match.title}" ${match.icon} ya está disponible en tu colección.`
    };
  }

  return {
    success: true,
    medalId: match.medalId,
    medalTitle: match.title,
    medalIcon: match.icon,
    message: `¡CÓDIGO SECRETO VÁLIDO! ${match.icon} Has desbloqueado la Medalla "${match.title}". ¡Ahora puedes equiparla y lucirla en tu perfil!`
  };
}

export function playMedalFanfareSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.12 },     // C5
      { freq: 659.25, time: 0.12, dur: 0.12 },  // E5
      { freq: 783.99, time: 0.24, dur: 0.12 },  // G5
      { freq: 1046.50, time: 0.36, dur: 0.35 }  // C6
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.001, now + note.time);
      gain.gain.linearRampToValueAtTime(0.12, now + note.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur + 0.05);
    });
  } catch (e) {
    // ignore
  }
}

export function playEquipSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // ignore
  }
}

export function playMechanicalClickSound(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {}
}

export interface UserLevelInfo {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  rankTitle: string;
  rankBadge: string;
  rankColor: string;
}

export function calculateUserLevel(
  medals: MedalItem[],
  savedBuildsCount: number,
  checklistCount: number = 0,
  topGameScore: number = 0
): UserLevelInfo {
  let xp = 0;

  medals.forEach(m => {
    if (m.unlocked) {
      if (m.tier === 'mitico') xp += 350;
      else if (m.tier === 'legendario') xp += 250;
      else if (m.tier === 'epico') xp += 180;
      else if (m.tier === 'raro') xp += 120;
      else xp += 80;
    }
  });

  xp += Math.min(savedBuildsCount * 120, 600);
  xp += Math.min(checklistCount * 60, 480);
  xp += Math.min(Math.floor(topGameScore / 40), 600);

  if (typeof window !== 'undefined') {
    if (localStorage.getItem('nucleo_comparator_used')) xp += 100;
    if (localStorage.getItem('nucleo_acoustic_lab_tested')) xp += 120;
    if (localStorage.getItem('nucleo_weekly_market_report_v1')) xp += 100;
    try {
      const dailyData = localStorage.getItem('nucleo_daily_drop_data');
      if (dailyData) {
        const parsed = JSON.parse(dailyData);
        if (parsed.totalClaimedXp) xp += Number(parsed.totalClaimedXp);
      }
    } catch {}
  }

  const XP_PER_LEVEL = 300;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXp = xp % XP_PER_LEVEL;
  const nextLevelXp = XP_PER_LEVEL;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 100));

  let rankTitle = 'Novato del Silicio';
  let rankBadge = 'Nivel 1';
  let rankColor = 'text-slate-400';

  if (level >= 35) {
    rankTitle = 'Soberano Cuántico del Silicio';
    rankBadge = 'Arquitecto Cósmico 2026';
    rankColor = 'text-cyan-300';
  } else if (level >= 28) {
    rankTitle = 'Deidad del Silicio';
    rankBadge = 'Arquitecto Supremo';
    rankColor = 'text-amber-300';
  } else if (level >= 20) {
    rankTitle = 'Maestro de la Bóveda';
    rankBadge = 'Leyenda de Hardware';
    rankColor = 'text-purple-400';
  } else if (level >= 12) {
    rankTitle = 'Ingeniero de Microchips';
    rankBadge = 'Élite de Hardware';
    rankColor = 'text-rose-400';
  } else if (level >= 8) {
    rankTitle = 'Overclocker Calificado';
    rankBadge = 'LN2 Certified';
    rankColor = 'text-cyan-400';
  } else if (level >= 4) {
    rankTitle = 'Ensamblador Hábil';
    rankBadge = 'Taller Avanzado';
    rankColor = 'text-emerald-400';
  }

  return {
    totalXp: xp,
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent,
    rankTitle,
    rankBadge,
    rankColor
  };
}

export function playFanSimulationTone(rpm: number, durationSec: number = 0.5): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Generate modulated motor hum + air turbulence (bandpass filtered noise)
    const baseFreq = 40 + (rpm / 3000) * 180;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    // Soft low pass filter to simulate chassis absorption
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300 + (rpm / 3000) * 600, ctx.currentTime);

    const volume = Math.min(0.12, 0.01 + (rpm / 3000) * 0.1);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + durationSec - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {}
}

export interface DailyDropStatus {
  canClaim: boolean;
  streakDays: number;
  lastClaimDate: string | null;
  todayRewardXp: number;
}

export function getDailyDropStatus(): DailyDropStatus {
  if (typeof window === 'undefined') {
    return { canClaim: true, streakDays: 1, lastClaimDate: null, todayRewardXp: 200 };
  }
  try {
    const raw = localStorage.getItem('nucleo_daily_drop_data');
    const todayStr = new Date().toISOString().slice(0, 10);
    if (!raw) {
      return { canClaim: true, streakDays: 0, lastClaimDate: null, todayRewardXp: 200 };
    }
    const data = JSON.parse(raw);
    const lastDate = data.lastClaimDate;
    if (lastDate === todayStr) {
      return { canClaim: false, streakDays: data.streakDays || 1, lastClaimDate: lastDate, todayRewardXp: 200 + ((data.streakDays || 1) * 50) };
    }
    const lastTime = new Date(lastDate).getTime();
    const todayTime = new Date(todayStr).getTime();
    const diffDays = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));
    const nextStreak = diffDays === 1 ? (data.streakDays || 1) + 1 : 1;
    return { canClaim: true, streakDays: nextStreak, lastClaimDate: lastDate, todayRewardXp: 200 + (nextStreak * 50) };
  } catch {
    return { canClaim: true, streakDays: 1, lastClaimDate: null, todayRewardXp: 200 };
  }
}

export function claimDailyDrop(): { success: boolean; xpEarned: number; streakDays: number; message: string } {
  if (typeof window === 'undefined') return { success: false, xpEarned: 0, streakDays: 0, message: '' };
  const status = getDailyDropStatus();
  if (!status.canClaim) {
    return { success: false, xpEarned: 0, streakDays: status.streakDays, message: '¡Ya reclamaste el Drop de Silicio de hoy! Regresa mañana para mantener tu racha.' };
  }
  const todayStr = new Date().toISOString().slice(0, 10);
  const streak = status.streakDays === 0 ? 1 : status.streakDays;
  const xp = status.todayRewardXp;
  try {
    const existing = JSON.parse(localStorage.getItem('nucleo_daily_drop_data') || '{}');
    const totalXp = (existing.totalClaimedXp || 0) + xp;
    localStorage.setItem('nucleo_daily_drop_data', JSON.stringify({
      lastClaimDate: todayStr,
      streakDays: streak,
      totalClaimedXp: totalXp
    }));
  } catch {}
  return {
    success: true,
    xpEarned: xp,
    streakDays: streak,
    message: `¡Caja Diaria Reclamada! +${xp} XP otorgados. Racha de Silicio: ${streak} día${streak > 1 ? 's' : ''}.`
  };
}

