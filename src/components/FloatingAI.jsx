import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Send, Mic, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { useAiChat } from '../hooks/useAiChat';

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function FloatingAIInner({ role = 'patient' }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [pulse, setPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const roleContext = role === 'doctor' ? 'doctor' : 'patient';
  const { messages: persistedMessages, sending, loadingHistory, sendMessage } = useAiChat({
    roleContext,
    t,
  });

  const localeTag = i18n.language?.startsWith('en') ? 'en-GB' : 'ar-EG';

  const quickActions = useMemo(() => {
    const key = role === 'doctor' ? 'ai.floating.quickDoctor' : 'ai.floating.quickPatient';
    const arr = t(key, { returnObjects: true });
    return Array.isArray(arr) ? arr : [];
  }, [t, role]);

  const initialText = role === 'doctor' ? t('ai.floating.initialDoctor') : t('ai.floating.initialPatient');
  const messages = useMemo(() => {
    if (!persistedMessages.length) {
      return [
        {
          id: createMessageId(),
          from: 'ai',
          text: initialText,
          time: new Date().toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' }),
        },
      ];
    }
    return persistedMessages.map((msg) => ({
      id: msg.id,
      from: msg.role === 'assistant' ? 'ai' : 'user',
      text: msg.text,
      time: msg.time || new Date().toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' }),
    }));
  }, [persistedMessages, initialText, localeTag]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }, 100);
      return () => window.clearTimeout(id);
    }
  }, [messages, open]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || sending) return;
    setInput('');
    await sendMessage({ text });
  };

  const panelStyle = {
    width: 'min(24rem, calc(100vw - 2rem))',
    maxHeight: 'min(32.5rem, calc(100dvh - 6.5rem))',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <>
      {open && !minimized && (
        <div
          className="fixed bottom-[5.25rem] end-5 z-[9999] flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
          style={panelStyle}
          role="dialog"
          aria-label={t('ai.floating.title')}
        >

          <div className="bg-blue-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setMinimized(true)} className="text-blue-200 hover:text-white transition-colors">
                <Minimize2 size={15} />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="text-blue-200 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-end">
                <p className="text-white font-bold text-sm">{t('ai.floating.title')}</p>
                <p className="text-blue-200 text-xs flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  {t('ai.floating.powered')}
                </p>
              </div>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50" style={{ minHeight: 0 }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.from === 'ai' && (
                  <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.from === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-700 shadow-sm rounded-bl-sm border border-gray-100'
                  }`}
                >
                  {msg.text}
                  <p className={`text-xs mt-1 ${msg.from === 'user' ? 'text-blue-200' : 'text-gray-300'} text-end`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

            {(sending || loadingHistory) && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 py-2 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleSendMessage(action).catch(() => {})}
                  className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 font-semibold px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendMessage(input).catch(() => {})}
                disabled={!input.trim() || sending}
                className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-colors disabled:opacity-40"
              >
                <Send size={15} className="text-white" style={{ transform: i18n.language?.startsWith('en') ? 'none' : 'scaleX(-1)' }} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input).catch(() => {})}
                placeholder={t('ai.floating.placeholder')}
                className="flex-1 text-sm text-end bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0 text-gray-400"
              >
                <Mic size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {open && minimized && (
        <div
          className="fixed bottom-[5.25rem] end-5 z-[9999] flex max-w-[min(20rem,calc(100vw-2rem))] cursor-pointer items-center gap-3 rounded-2xl bg-blue-600 px-4 py-2.5 shadow-lg"
          onClick={() => setMinimized(false)}
          onKeyDown={(e) => e.key === 'Enter' && setMinimized(false)}
          role="button"
          tabIndex={0}
        >
          <Maximize2 size={14} className="text-blue-200" />
          <span className="text-sm font-semibold text-white">{t('ai.floating.minimized')}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
            <Bot size={14} className="text-white" />
          </div>
        </div>
      )}

      <div className="fixed bottom-5 end-5 z-[9999] flex flex-row items-center gap-2">
        {!open && (
          <div className="pointer-events-none flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-white px-3 py-1.5 shadow-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs font-semibold text-gray-700">{t('ai.floating.label')}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setOpen(!open);
            setMinimized(false);
            if (!open) setPulse(false);
          }}
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-xl transition-all hover:scale-105 hover:bg-blue-700 active:scale-95"
        >
          {pulse && <span className="absolute inset-0 rounded-2xl bg-blue-400 opacity-30 animate-ping" />}
          {open ? <X size={22} className="text-white" /> : <Bot size={24} className="text-white" />}
          {!open && <span className="absolute -top-1 end-0 h-4 w-4 rounded-full border-2 border-white bg-green-400" />}
        </button>
      </div>
    </>
  );
}

export default function FloatingAI(props) {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language;
  return <FloatingAIInner key={`${props.role ?? 'patient'}-${lang}`} {...props} />;
}
