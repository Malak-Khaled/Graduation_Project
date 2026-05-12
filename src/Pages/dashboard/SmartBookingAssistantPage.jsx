import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Mic, Sparkles, MapPin, Clock, Calendar, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { BOOKING } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiError';
import { getApiOrigin } from '../../utils/apiOrigin';

function msgId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function AssistantCard({ data, t, apiOrigin, onBookDoctor }) {
  if (data.emergency) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-start shadow-sm">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm font-semibold leading-relaxed text-red-900">{data.emergency_message_ar}</p>
        </div>
        <p className="mt-2 text-xs text-red-800/90">{data.disclaimer_ar}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-start">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white px-4 py-3 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{t('patient.smartAssistant.specialtyLabel')}</p>
        <p className="mt-1 text-base font-extrabold text-gray-900">{data.suggested_specialty_ar}</p>
        {Array.isArray(data.matched_hints) && data.matched_hints.length > 0 && (
          <p className="mt-1 text-xs text-gray-600">
            {t('patient.smartAssistant.matched')}: {data.matched_hints.join('، ')}
          </p>
        )}
      </div>

      {data.doctors?.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-600">{t('patient.smartAssistant.suggestions')}</p>
          {data.doctors.map((doc) => {
            const img = doc.avatar?.startsWith('http')
              ? doc.avatar
              : doc.avatar
                ? `${apiOrigin}/storage/${doc.avatar}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Dr')}&background=0d9488&color=fff`;
            const slot = doc.next_slot;
            return (
              <div
                key={doc.id}
                className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <img src={img} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-gray-900">{doc.name}</p>
                    <p className="text-xs font-semibold text-blue-600">{doc.specialty}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {doc.area} — {doc.governorate}
                      </span>
                    </p>
                    {slot && (
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-700">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">
                          <Calendar className="h-3.5 w-3.5" />
                          {slot.day_name} · {slot.date}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 font-semibold text-slate-800">
                          <Clock className="h-3.5 w-3.5" />
                          {slot.time}
                        </span>
                        <span className="text-gray-500">
                          {t('patient.smartAssistant.waitHint', { minutes: doc.estimated_wait_minutes ?? 15 })}
                        </span>
                      </p>
                    )}
                    {!slot && (
                      <p className="mt-1 text-xs text-amber-700">{t('patient.smartAssistant.noSlotSoon')}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onBookDoctor(doc)}
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  {t('patient.smartAssistant.bookCta')}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-600">{t('patient.smartAssistant.noDoctors')}</p>
      )}

      <p className="text-[11px] leading-relaxed text-gray-400">{data.disclaimer_ar}</p>
    </div>
  );
}

export default function SmartBookingAssistantPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const apiOrigin = getApiOrigin();
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState(() => [
    {
      id: msgId(),
      role: 'assistant',
      kind: 'intro',
      text: t('patient.smartAssistant.intro'),
    },
  ]);

  const scrollBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [messages, sending, scrollBottom]);

  const quickSamples = useMemo(
    () => t('patient.smartAssistant.samples', { returnObjects: true }) || [],
    [t]
  );

  const onBookDoctor = useCallback(
    (doc) => {
      const spec = encodeURIComponent(String(doc.specialty || '').trim() || t('patient.smartAssistant.fallbackSpecialty'));
      navigate(`/dashboard/booking?specialty=${spec}`);
    },
    [navigate, t]
  );

  const sendSymptoms = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || sending) return;
    setSending(true);
    setMessages((prev) => [...prev, { id: msgId(), role: 'user', kind: 'text', text: trimmed }]);
    try {
      const res = await axiosInstance.post(BOOKING.SYMPTOM_ADVICE, { symptoms: trimmed });
      setMessages((prev) => [
        ...prev,
        {
          id: msgId(),
          role: 'assistant',
          kind: 'advice',
          data: res.data,
        },
      ]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('patient.smartAssistant.error')));
      setMessages((prev) => [
        ...prev,
        {
          id: msgId(),
          role: 'assistant',
          kind: 'text',
          text: t('patient.smartAssistant.error'),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleVoice = () => {
    const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SR) {
      toast.error(t('patient.smartAssistant.noSpeech'));
      return;
    }
    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        /* ignore */
      }
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = i18n.language?.startsWith('en') ? 'en-US' : 'ar-EG';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript?.trim();
      if (said) setInput((prev) => (prev ? `${prev} ${said}` : said));
      setListening(false);
    };
    rec.onerror = () => {
      setListening(false);
      toast.error(t('patient.smartAssistant.speechError'));
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      toast.error(t('patient.smartAssistant.speechError'));
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
      <div className="mb-4 flex flex-col gap-2 text-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 md:text-2xl">{t('patient.smartAssistant.title')}</h1>
              <p className="text-xs text-gray-500 md:text-sm">{t('patient.smartAssistant.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-hover flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-5" style={{ minHeight: '280px' }}>
          {messages.map((m) => (
            <div key={m.id} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[min(100%,520px)] ${
                  m.role === 'user'
                    ? 'rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-sm text-white shadow-md'
                    : 'w-full min-w-0'
                }`}
              >
                {m.role === 'user' && <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>}
                {m.role === 'assistant' && m.kind === 'intro' && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-gray-800 shadow-sm">
                    {m.text}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(quickSamples) &&
                        quickSamples.map((sample) => (
                          <button
                            key={sample}
                            type="button"
                            disabled={sending}
                            onClick={() => void sendSymptoms(sample)}
                            className="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                          >
                            {sample}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
                {m.role === 'assistant' && m.kind === 'text' && (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">{m.text}</div>
                )}
                {m.role === 'assistant' && m.kind === 'advice' && (
                  <AssistantCard data={m.data} t={t} apiOrigin={apiOrigin} onBookDoctor={onBookDoctor} />
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-end gap-2 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-slate-100 bg-white/95 p-3 md:p-4">
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={toggleVoice}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                listening ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              title={t('patient.smartAssistant.micTitle')}
              aria-pressed={listening}
            >
              <Mic className="h-5 w-5" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendSymptoms(input);
                  setInput('');
                }
              }}
              rows={2}
              placeholder={t('patient.smartAssistant.placeholder')}
              className="min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-start text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              disabled={!input.trim() || sending}
              onClick={() => {
                void sendSymptoms(input);
                setInput('');
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:opacity-40"
              aria-label={t('patient.smartAssistant.send')}
            >
              <Send className="h-5 w-5" style={{ transform: i18n.language?.startsWith('en') ? 'none' : 'scaleX(-1)' }} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-gray-400">{t('patient.smartAssistant.footerHint')}</p>
        </div>
      </div>
    </div>
  );
}
