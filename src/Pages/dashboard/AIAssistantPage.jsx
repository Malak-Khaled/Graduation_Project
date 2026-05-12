import { createElement, useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, Paperclip, Bot, User, FileText, Calendar, Pill, Stethoscope, X } from 'lucide-react';
import { useAiChat } from '../../hooks/useAiChat';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Bot size={16} className="text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-slate-200 rounded-bl-sm shadow-sm'
          }`}
        >
          {msg.text}
          {msg.file && (
            <div className={`mt-2 flex items-center gap-2 text-xs ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
              <FileText size={13} />
              <span>{msg.file}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 px-1">{msg.time}</span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <User size={16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
}

function AIAssistantPageInner() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const {
    messages,
    sending,
    loadingHistory,
    sendMessage,
    startNewConversation,
  } = useAiChat({ roleContext: 'patient', t });

  const quickActions = useMemo(
    () => [
      { label: t('ai.patientPage.quick.book'), icon: Calendar },
      { label: t('ai.patientPage.quick.meds'), icon: Pill },
      { label: t('ai.patientPage.quick.labs'), icon: FileText },
      { label: t('ai.patientPage.quick.diet'), icon: Stethoscope },
    ],
    [t]
  );

  const historyItems = useMemo(
    () => t('ai.patientPage.history', { returnObjects: true }) || [],
    [t]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (text = input) => {
    if (!text.trim() && !attachment) return;
    const attachmentName = attachment?.name || null;
    setInput('');
    setAttachment(null);
    await sendMessage({ text: text.trim(), attachmentName });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment(file);
  };

  const handleQuickAction = (label) => {
    handleSend(label).catch(() => {});
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-100/90 backdrop-blur-sm">
      <div className="bg-slate-50 border-b border-slate-200 shadow-sm px-4 md:px-6 py-4 flex items-center justify-between shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{t('ai.patientPage.online')}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-start">
            <h2 className="font-bold text-gray-800">{t('ai.patientPage.title')}</h2>
            <p className="text-xs text-gray-400">{t('ai.patientPage.subtitle')}</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Bot size={20} className="text-white" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={() => startNewConversation().catch(() => {})}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            {t('ai.patientPage.newChat')}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-64 bg-slate-50 border-s border-slate-200 flex-col p-4 gap-3 overflow-y-auto shrink-0">
          <button
            type="button"
            onClick={() => startNewConversation().catch(() => {})}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {t('ai.patientPage.newChat')}
          </button>

          <p className="text-xs font-bold text-gray-400 mt-2">{t('ai.patientPage.prevTitle')}</p>
          {historyItems.map(({ label, time }) => (
            <button
              key={label}
              type="button"
              className="text-start p-3 rounded-xl bg-white hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm w-full"
            >
              <p className="text-sm font-semibold text-gray-700 truncate">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{time}</p>
            </button>
          ))}

          <p className="text-xs font-bold text-gray-400 mt-2">{t('ai.patientPage.toolsTitle')}</p>
          {[
            { label: t('ai.patientPage.toolMedical'), icon: FileText },
            { label: t('ai.patientPage.toolMeds'), icon: Pill },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2 p-3 rounded-xl bg-white hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm w-full text-start"
            >
              {createElement(icon, { size: 15, className: 'text-blue-600 shrink-0' })}
              <span className="text-sm text-gray-600">{label}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-slate-100">
            {messages.map((msg) => (
              <Message key={msg.id} msg={msg} />
            ))}
            {(sending || loadingHistory) && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 md:px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-slate-100 border-t border-slate-200">
            {quickActions.map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickAction(label)}
                className="shrink-0 flex items-center gap-1.5 bg-white border-2 border-slate-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:border-blue-500 hover:text-blue-700 transition-all"
              >
                {createElement(icon, { size: 13 })}
                {label}
              </button>
            ))}
          </div>

          {attachment && (
            <div className="px-4 md:px-6 pb-2 shrink-0">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 w-fit max-w-full">
                <button type="button" onClick={() => setAttachment(null)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <X size={14} />
                </button>
                <span className="text-xs text-blue-600 font-semibold truncate">{attachment.name}</span>
                <FileText size={14} className="text-blue-500 shrink-0" />
              </div>
            </div>
          )}

          <div className="bg-slate-50 border-t-2 border-slate-200 px-4 md:px-6 py-3 shrink-0 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => handleSend().catch(() => {})}
                disabled={(!input.trim() && !attachment) || sending}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm"
              >
                <Send size={16} />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.patientPage.placeholder')}
                rows={1}
                className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-start text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition resize-none max-h-32 overflow-y-auto shadow-inner"
                style={{ minHeight: '42px' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 border-2 border-slate-200 bg-white text-gray-600 rounded-xl flex items-center justify-center hover:border-blue-500 hover:text-blue-700 transition-colors shrink-0 shadow-sm"
              >
                <Paperclip size={16} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />

              <button
                type="button"
                className="w-10 h-10 border-2 border-slate-200 bg-white text-gray-600 rounded-xl flex items-center justify-center hover:border-blue-500 hover:text-blue-700 transition-colors shrink-0 shadow-sm"
              >
                <Mic size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">{t('ai.patientPage.disclaimer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const { i18n } = useTranslation();
  const langKey = i18n.resolvedLanguage || i18n.language;
  return <AIAssistantPageInner key={langKey} />;
}
