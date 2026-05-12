import { createElement, useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, Mic, Paperclip, Bot, User, FileText, Users, Stethoscope, ClipboardList, X } from 'lucide-react';
import { useAiChat } from '../../hooks/useAiChat';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Bot size={16} className="text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
      <div className={`max-w-xs md:max-w-md lg:max-w-lg flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white text-gray-700 border border-slate-200 rounded-bl-sm shadow-sm'
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

function DoctorAIAssistantPageInner() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const { messages, sending, loadingHistory, sendMessage, startNewConversation } = useAiChat({
    roleContext: 'doctor',
    t,
  });

  const quickActions = useMemo(
    () => [
      { label: t('ai.doctorPage.quick.dx'), icon: Stethoscope },
      { label: t('ai.doctorPage.quick.protocol'), icon: ClipboardList },
      { label: t('ai.doctorPage.quick.labs'), icon: FileText },
      { label: t('ai.doctorPage.quick.followup'), icon: Users },
    ],
    [t]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async (text = input) => {
    if (!text.trim() && !attachment) return;
    const attachmentName = attachment?.name || null;
    setInput('');
    setAttachment(null);
    await sendMessage({ text: text.trim(), attachmentName });
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{t('ai.doctorPage.online')}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => startNewConversation().catch(() => {})}
            className="hidden md:inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-600 px-3 py-2 rounded-xl text-sm font-semibold hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {t('ai.doctorPage.newChat')}
          </button>
          <div className="text-start">
            <h2 className="font-bold text-gray-800">{t('ai.doctorPage.title')}</h2>
            <p className="text-xs text-gray-400">{t('ai.doctorPage.subtitle')}</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Bot size={20} className="text-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        {(sending || loadingHistory) && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 md:px-6 py-2 flex gap-2 overflow-x-auto shrink-0">
        {quickActions.map(({ label, icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => handleSend(label).catch(() => {})}
            className="shrink-0 flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-semibold hover:border-blue-400 hover:text-blue-600 transition-all"
          >
            {createElement(icon, { size: 13 })}
            {label}
          </button>
        ))}
      </div>

      {attachment && (
        <div className="px-4 md:px-6 pb-2 shrink-0">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 w-fit max-w-full">
            <button type="button" onClick={() => setAttachment(null)} className="text-gray-400 hover:text-red-500 shrink-0">
              <X size={14} />
            </button>
            <span className="text-xs text-blue-600 font-semibold truncate">{attachment.name}</span>
            <FileText size={14} className="text-blue-500 shrink-0" />
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-100 px-4 md:px-6 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => handleSend().catch(() => {})}
            disabled={(!input.trim() && !attachment) || sending}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={t('ai.doctorPage.placeholder')}
            rows={1}
            style={{ minHeight: '42px' }}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none max-h-32 overflow-y-auto"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 border border-gray-200 text-gray-500 rounded-xl flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0"
          >
            <Paperclip size={16} />
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
          <button
            type="button"
            className="w-10 h-10 border border-gray-200 text-gray-500 rounded-xl flex items-center justify-center hover:border-blue-400 hover:text-blue-600 transition-colors shrink-0"
          >
            <Mic size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">{t('ai.doctorPage.disclaimer')}</p>
      </div>
    </div>
  );
}

export default function DoctorAIAssistantPage() {
  const { i18n } = useTranslation();
  const langKey = i18n.resolvedLanguage || i18n.language;
  return <DoctorAIAssistantPageInner key={langKey} />;
}
