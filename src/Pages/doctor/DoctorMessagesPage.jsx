import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Send, Phone, Video, MoreVertical } from 'lucide-react';

/**
 * تتبع حقلي وظائفي: الواجهة جاهزة لربط رسائل حقيقية (WebSocket / API) لاحقاً.
 * حالياً لا يوجد محادثات في قاعدة البيانات لهذه الصفحة.
 */
export default function DoctorMessagesPage() {
  const { t, i18n } = useTranslation();
  const [conversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages]);

  const handleSelect = (conv) => {
    setSelected(conv);
  };

  const handleSend = () => {
    if (!input.trim() || !selected) return;
    const locale = i18n.language?.startsWith('en') ? 'en-GB' : 'ar-EG';
    const timeStr = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const newMsg = { id: Date.now(), role: 'doctor', text: input.trim(), time: timeStr };
    const updated = {
      ...selected,
      messages: [...(selected.messages || []), newMsg],
      lastMessage: input.trim(),
      time: t('doctor.messages.now'),
      unread: 0,
    };
    setSelected(updated);
    setInput('');
  };

  const filtered = conversations.filter((c) => c.name.includes(search));

  return (
    <div className="flex h-[calc(100vh-64px)] md:h-screen">
      <div className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white border-e border-gray-100 flex-col shrink-0`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg mb-3 text-start">{t('doctor.messages.title')}</h2>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('doctor.messages.searchPh')}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 ps-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-sm text-gray-400 text-center leading-relaxed">{t('doctor.messages.emptyInbox')}</p>
          )}
          {filtered.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => handleSelect(conv)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-start ${selected?.id === conv.id ? 'bg-blue-50' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">
                      {conv.unread}
                    </span>
                  )}
                  <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                    <span className="text-xs text-gray-400 shrink-0">{conv.time}</span>
                    <p className={`font-semibold text-sm truncate ${selected?.id === conv.id ? 'text-blue-600' : 'text-gray-800'}`}>{conv.name}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5 text-start">{conv.lastMessage}</p>
              </div>
              <img src={conv.img} alt={conv.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {selected ? (
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Video size={16} />
              </button>
              <button
                type="button"
                className="w-9 h-9 rounded-xl border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Phone size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-start min-w-0">
                <p className="font-bold text-gray-800 text-sm truncate">{selected.name}</p>
                <p className="text-xs text-green-500 flex items-center justify-start gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block shrink-0" />
                  {t('doctor.messages.online')}
                </p>
              </div>
              <img src={selected.img} alt={selected.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {(selected.messages || []).map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'doctor' ? 'justify-start' : 'justify-end'}`}>
                {msg.role === 'doctor' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white text-xs font-bold">
                    {t('doctor.messages.doctorInitial')}
                  </div>
                )}
                <div className={`max-w-xs md:max-w-sm flex flex-col gap-1 ${msg.role === 'doctor' ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'doctor'
                        ? 'bg-blue-600 text-white rounded-es-sm'
                        : 'bg-white text-gray-700 rounded-ee-sm shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400 px-1">{msg.time}</span>
                </div>
                {msg.role === 'patient' && (
                  <img src={selected.img} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="bg-white border-t border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('doctor.messages.placeholder')}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-6">
          <div className="text-center text-gray-400 max-w-sm">
            <p className="font-semibold text-gray-600">{conversations.length === 0 ? t('doctor.messages.emptyInbox') : t('doctor.messages.pickConversation')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
