import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, User, RefreshCw, MessageSquare, AlertCircle } from 'lucide-react';
import { PCComponent, ComponentCategory } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentBuild: Partial<Record<ComponentCategory, PCComponent>>;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  isOpen,
  onClose,
  currentBuild
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy **Núcleo AI**, tu asesor técnico de hardware. Puedo ayudarte a verificar la compatibilidad de tu PC, diagnosticar cuellos de botella, sugerir fuentes de poder o resolver dudas sobre próximos lanzamientos. ¿En qué te puedo asesorar hoy?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentBuild: currentBuild
        })
      });

      if (!res.ok) {
        throw new Error('Error al conectar con el servidor.');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Lo siento, ocurrió un error temporal al procesar tu consulta con la IA. Por favor intenta nuevamente.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '¿Qué opinas de mi ensamble actual?',
    '¿Hay cuello de botella entre mi CPU y GPU?',
    '¿Me alcanza la fuente de poder para picos de consumo?',
    '¿Qué disipador me conviene para este procesador?',
    '¿El gabinete tiene buen flujo para mi tarjeta gráfica?'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-sm flex justify-end p-2 sm:p-4 animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg bg-slate-900 border border-red-950/60 rounded-2xl shadow-2xl flex flex-col h-[92vh] max-h-[850px] overflow-hidden z-10 text-slate-100 my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-md shadow-red-600/30 border border-red-500/30 shrink-0 bg-red-600">
              <img
                src="/assets/aistudio/image_08c4c239.png"
                alt="Logo Núcleo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white">Núcleo AI</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-semibold">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Soporte de hardware y análisis de compatibilidad
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-red-600 text-white font-medium rounded-tr-xs'
                    : 'bg-slate-800/80 border border-slate-750 text-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
              <span>Analizando arquitectura y generando respuesta...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions Pills */}
        <div className="p-2.5 bg-slate-950/70 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 border border-slate-700/60 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Pregunta sobre tu PC, piezas o dudas técnicas..."
            className="flex-1 text-xs bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 transition-colors shadow-md shadow-red-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
