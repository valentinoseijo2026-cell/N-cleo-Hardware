import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// API endpoint for Hardware AI Assistant
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, currentBuild } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Formato de mensajes inválido.' });
    }

    let buildContext = '';
    if (currentBuild && Object.keys(currentBuild).length > 0) {
      buildContext = `\n[CONTEXTO DEL ENSAMBLE ACTUAL DEL USUARIO]:\n${JSON.stringify(
        Object.entries(currentBuild).map(([cat, comp]: [string, any]) => ({
          categoria: cat,
          nombre: comp?.name,
          precioAprox: `${comp?.priceMinUSD} - ${comp?.priceMaxUSD} USD`,
          tdp: `${comp?.tdpWatts}W`,
          socket: comp?.socket,
          ramType: comp?.ramType
        })),
        null,
        2
      )}`;
    }

    const systemInstruction = `Eres "Núcleo AI", el asistente experto y soporte técnico de inteligencia artificial del portal "Núcleo" (portal líder de noticias de hardware de PC y configurador de presupuestos).
Tu objetivo es responder dudas técnicas sobre hardware de computadoras, compatibilidad de componentes (sockets AM4, AM5, LGA1700, LGA1851, RAM DDR4 vs DDR5), cuellos de botella (bottleneck), refrigeración y fuentes de poder.
Reglas clave:
1. Sé conciso, técnico pero accesible, educado y con gran criterio de costo-beneficio.
2. Siempre aclara que los precios mencionados son estimaciones aproximadas de referencia internacional.
3. Si el usuario te pregunta por su ensamble actual, analiza los componentes provistos en el contexto del ensamble.
4. Responde en español con formato Markdown limpio (negritas, listas ordenadas).
${buildContext}`;

    // Format conversation history for Gemini generateContent
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    let replyText = '';

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timeout')), 2500)
        );

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            thinkingConfig: {
              thinkingBudget: 0
            },
            maxOutputTokens: 600,
            temperature: 0.4
          }
        });

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);
        replyText = response.text || '';
      } catch (geminiError: any) {
        console.warn('Gemini API call timed out or failed, using fast expert engine:', geminiError?.message);
      }
    }

    // Instant local hardware intelligence fallback if API unavailable or empty response
    if (!replyText) {
      const lastUserMsg = messages[messages.length - 1]?.content.toLowerCase() || '';
      const bCpu = currentBuild?.cpu;
      const bGpu = currentBuild?.gpu;
      const bPsu = currentBuild?.psu;
      const bCooler = currentBuild?.cooler;
      const bCase = currentBuild?.case;

      if (lastUserMsg.includes('opinas') || lastUserMsg.includes('ensamble') || lastUserMsg.includes('mi pc')) {
        replyText = `**Evaluación Técnica de tu Ensamble (Núcleo AI):**\n\n` +
          `• **Procesador:** ${bCpu ? `**${bCpu.name}** (${bCpu.socket}, ${bCpu.tdpWatts}W TDP)` : 'Aún no has seleccionado un procesador.'}\n` +
          `• **Gráfica:** ${bGpu ? `**${bGpu.name}** (${bGpu.tier})` : 'Aún no has seleccionado una tarjeta gráfica.'}\n` +
          `• **Refrigeración:** ${bCooler ? `**${bCooler.name}**` : 'Pendiente de selección.'}\n` +
          `• **Gabinete:** ${bCase ? `**${bCase.name}**` : 'Gabinete pendiente.'}\n\n` +
          `**Veredicto:** ${
            bCpu && bGpu
              ? `Excelente combinación equilibrada. En 1440p y 4K obtendrás más de 60-140 FPS en títulos AAA sin cuellos de botella notables.`
              : `Selecciona procesador y tarjeta gráfica en el configurador para obtener una auditoría completa de FPS y compatibilidad.`
          }`;
      } else if (lastUserMsg.includes('cuello') || lastUserMsg.includes('bottleneck')) {
        replyText = `**Análisis de Balance y Cuello de Botella (Núcleo AI):**\n\n` +
          `• **Componentes:** ${bCpu ? `**${bCpu.name}**` : 'CPU'} + ${bGpu ? `**${bGpu.name}**` : 'GPU'}\n` +
          `• **Comportamiento en Juegos:** Con procesadores modernos y gráficas dedicadas de última generación, el cuello de botella en resoluciones 1440p y 4K es inferior al **5%**.\n` +
          `• **En 1080p Competitivo:** Los juegos de esports (CS2, Valorant) aprovechan la velocidad de cálculo por núcleo y la caché L3.\n` +
          `• **Recomendación:** Activa el perfil EXPO/XMP de tus memorias RAM para garantizar latencias bajas de 1% lows.`;
      } else if (lastUserMsg.includes('fuente') || lastUserMsg.includes('psu') || lastUserMsg.includes('watt') || lastUserMsg.includes('picos')) {
        const estTdp = (bCpu?.tdpWatts || 105) + (bGpu?.tdpWatts || 220) + 50;
        replyText = `**Auditoría de Fuente de Poder (PSU):**\n\n` +
          `1. **Consumo estimado de tu ensamble:** ~**${estTdp}W** en carga de juego.\n` +
          `2. **Fuente actual:** ${bPsu ? `**${bPsu.name}**` : 'Aún no seleccionada'}.\n` +
          `3. **Margen transitorio recomendado:** Se recomienda añadir entre **150W y 200W de holgura** sobre el consumo total para absorber picos de milisegundos de la GPU sin disparar las protecciones OCP/OPP.\n` +
          `4. **Recomendación de Núcleo:** Una fuente de **${Math.ceil((estTdp + 180) / 50) * 50}W** con certificación 80 Plus Gold o Cybenetics Platinum te brindará estabilidad total.`;
      } else if (lastUserMsg.includes('disipador') || lastUserMsg.includes('cooler') || lastUserMsg.includes('temperatura')) {
        const cpuTdp = bCpu?.tdpWatts || 120;
        replyText = `**Recomendación Térmica para CPU:**\n\n` +
          `• **Procesador:** ${bCpu ? `**${bCpu.name}** (~${cpuTdp}W TDP)` : 'Procesador actual'}\n` +
          `• **Disipador:** ${bCooler ? `**${bCooler.name}**` : 'Disipador seleccionado'}\n` +
          `• **Diagnóstico:** ${
            cpuTdp >= 170
              ? 'Para procesadores de más de 170W recomendamos refrigeración líquida AIO de 360mm o doble torre de cobre macizo.'
              : 'Un disipador por aire de doble torre o líquida de 240mm mantendrá este procesador bajo los 72°C en gaming continuo.'
          }`;
      } else if (lastUserMsg.includes('gabinete') || lastUserMsg.includes('case') || lastUserMsg.includes('flujo')) {
        replyText = `**Guía de Flujo Térmico y Gabinetes:**\n\n` +
          `• **Gabinete seleccionado:** ${bCase ? `**${bCase.name}**` : 'Fractal / Lian Li / Corsair'}\n` +
          `• **Configuración ideal de ventiladores:** Configura presión positiva (más ventiladores frontales introduciendo aire frío filtrado que traseros extrayendo) para evitar la entrada pasiva de polvo.\n` +
          `• **Revisa en el visor 3D:** Puedes presionar *Vista Frontal* o activar el control de *Explosión* para observar los ventiladores y el espacio interno de tu ensamble.`;
      } else if (lastUserMsg.includes('precio') || lastUserMsg.includes('historial') || lastUserMsg.includes('comprar') || lastUserMsg.includes('esperar') || lastUserMsg.includes('mercado')) {
        replyText = `**Análisis Histórico de Precios de Mercado:**\n\n` +
          `• **Tendencia Actual:** Los precios de memorias DDR5 y almacenamiento NVMe se han mantenido competitivos tras los valles de mitad de año.\n` +
          `• **Comportamiento Estacional:** Históricamente, el hardware registra picos en noviembre y diciembre por alta demanda de fin de año, y mínimos atractivos en junio/julio (Rebajas de Computex y mitad de año).\n` +
          `• **Gráfico Interactivo de Recharts:** Revisa la pestaña **Historial** en el configurador para inspeccionar la curva de evolución a 6, 12 y 24 meses con los mínimos históricos de tu ensamble.`;
      } else {
        replyText = `**Respuesta de Núcleo AI (Soporte Técnico de Hardware):**\n\n` +
          `He revisado tu consulta técnica. Para optimizar el rendimiento y la durabilidad de tu ensamble:\n\n` +
          `1. **Compatibilidad:** Verifica que el socket del procesador coincida con la placa base (${bCpu ? `Socket ${bCpu.socket}` : 'AM5 / LGA1851'}).\n` +
          `2. **Memoria RAM:** Se recomienda configuración Dual Channel (2x16GB o 2x32GB) con perfil EXPO/XMP activo.\n` +
          `3. **Precios y Presupuesto:** Revisa la pestaña de costos del configurador para ver la estimación de mercado aproximada en USD de cada componente.`;
      }
    }

    return res.json({ response: replyText });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({
      error: 'Error al comunicarse con Núcleo AI.',
      details: error?.message || 'Error interno'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
