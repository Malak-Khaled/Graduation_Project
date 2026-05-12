import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../api/axiosInstance';
import { AI } from '../api/endpoints';
import { getToken } from '../utils/authStorage';
import { getApiErrorMessage } from '../utils/apiError';

function mapMessage(raw) {
  return {
    id: raw.id,
    role: raw.sender === 'assistant' ? 'assistant' : 'user',
    text: raw.content || '',
    file: raw.attachment_name || null,
    time: raw.created_at
      ? new Date(raw.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  };
}

/**
 * @param {object} [options]
 * @param {string} [options.roleContext] patient | doctor | general
 * @param {import('i18next').TFunction} [options.t] optional, for local guest fallback in UI language
 */
export function useAiChat({ roleContext = 'general', t: translate } = {}) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);

  const storageKey = useMemo(() => `ai_conversation_${roleContext}`, [roleContext]);
  const guestStorageKey = useMemo(() => `ai_guest_messages_${roleContext}`, [roleContext]);

  const reduxToken = useSelector((s) => s.auth?.token);
  const token = reduxToken ?? getToken() ?? null;
  const hasToken = Boolean(token);

  const localFallbackReply = useCallback(
    (text) => {
      const trimmed = String(text || '').trim();
      if (trimmed) {
        if (translate) {
          return translate('ai.guestLocalReply', { text: trimmed });
        }
        return `Assistant: I received: "${trimmed}". Sign in for full cloud AI, or set AI_DRIVER=openai in the server.`;
      }
      if (translate) {
        return translate('ai.guestLocalEmpty');
      }
      return 'How can I help you?';
    },
    [translate]
  );

  const loadFromServer = useCallback(
    async (id) => {
      const res = await axiosInstance.get(AI.CONVERSATION_MESSAGES(id));
      const list = Array.isArray(res.data?.messages) ? res.data.messages : [];
      setMessages(list.map(mapMessage));
    },
    []
  );

  /**
   * Initial load: guest from localStorage; authed = last conversation or empty until first message.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingHistory(true);
      setConversationId(null);
      setMessages([]);

      if (!hasToken) {
        try {
          const raw = localStorage.getItem(guestStorageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && !cancelled) {
              setMessages(parsed);
            }
          }
        } catch {
          localStorage.removeItem(guestStorageKey);
        } finally {
          if (!cancelled) setLoadingHistory(false);
        }
        return;
      }

      try {
        const rawStored = localStorage.getItem(storageKey);
        const convId = rawStored ? parseInt(String(rawStored), 10) : NaN;
        if (rawStored && Number.isFinite(convId) && convId > 0) {
          setConversationId(convId);
          await loadFromServer(convId);
          return;
        }
        if (rawStored) {
          localStorage.removeItem(storageKey);
        }
        const listRes = await axiosInstance.get(AI.CONVERSATIONS, { params: { role_context: roleContext } });
        if (cancelled) return;
        const first = Array.isArray(listRes.data?.conversations) ? listRes.data.conversations[0] : null;
        if (first?.id) {
          setConversationId(first.id);
          localStorage.setItem(storageKey, String(first.id));
          await loadFromServer(first.id);
        }
      } catch (err) {
        localStorage.removeItem(storageKey);
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn('useAiChat bootstrap:', err);
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guestStorageKey, hasToken, loadFromServer, roleContext, storageKey]);

  const sendMessage = useCallback(
    async ({ text, attachmentName = null } = {}) => {
      const bodyText = String(text || '').trim();
      if (!bodyText && !attachmentName) return null;
      if (sendingRef.current) return null;
      sendingRef.current = true;
      setSending(true);
      const messagePayload = {
        text: bodyText,
        file: attachmentName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      try {
        if (!hasToken) {
          const userMsg = { id: `g-${Date.now()}-u`, role: 'user', ...messagePayload, text: bodyText || 'Attachment' };
          const aiMsg = {
            id: `g-${Date.now()}-a`,
            role: 'assistant',
            text: localFallbackReply(bodyText),
            file: null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => {
            const next = [...prev, userMsg, aiMsg];
            try {
              localStorage.setItem(guestStorageKey, JSON.stringify(next));
            } catch {
              // ignore
            }
            return next;
          });
          return { guest: true };
        }

        const buildPayload = (cid) => {
          const out = {
            message: bodyText || 'Attachment uploaded',
            role_context: roleContext,
            attachment_name: attachmentName,
          };
          if (cid != null && Number.isFinite(Number(cid)) && Number(cid) > 0) {
            out.conversation_id = Number(cid);
          }
          return out;
        };

        let res;
        try {
          res = await axiosInstance.post(AI.MESSAGES, buildPayload(conversationId));
        } catch (firstErr) {
          const st = firstErr?.response?.status;
          if ((st === 422 || st === 404) && conversationId) {
            localStorage.removeItem(storageKey);
            setConversationId(null);
            res = await axiosInstance.post(AI.MESSAGES, buildPayload(null));
          } else {
            throw firstErr;
          }
        }

        const newId = res.data?.conversation?.id;
        if (newId) {
          setConversationId(newId);
          localStorage.setItem(storageKey, String(newId));
        }
        const next = [];
        if (res.data?.user_message) next.push(mapMessage(res.data.user_message));
        if (res.data?.assistant_message) next.push(mapMessage(res.data.assistant_message));
        if (next.length) {
          setMessages((prev) => [...prev, ...next]);
        }
        return res.data;
      } catch (err) {
        const status = err.response?.status;
        const isConversationProblem = status === 400 || status === 404 || status === 422;
        if (isConversationProblem && hasToken) {
          localStorage.removeItem(storageKey);
          setConversationId(null);
        }
        const msg = getApiErrorMessage(err, 'Could not get a reply. Please try again.');
        const errText = isConversationProblem && hasToken
          ? `${msg} (${translate ? translate('ai.errorRetryNewChat') : 'Start a new chat below.'})`
          : msg;
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}-u`, role: 'user', text: bodyText, file: attachmentName, time: messagePayload.time },
          {
            id: `e-${Date.now()}-a`,
            role: 'assistant',
            text: errText,
            file: null,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return { error: true };
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [conversationId, guestStorageKey, hasToken, localFallbackReply, roleContext, storageKey, translate]
  );

  const startNewConversation = useCallback(async () => {
    if (!hasToken) {
      localStorage.removeItem(guestStorageKey);
      setMessages([]);
      setConversationId(null);
      return;
    }
    try {
      localStorage.removeItem(storageKey);
      setConversationId(null);
      setMessages([]);
      const res = await axiosInstance.post(AI.CONVERSATIONS, { role_context: roleContext });
      const id = res.data?.conversation?.id;
      if (id) {
        localStorage.setItem(storageKey, String(id));
        setConversationId(id);
        await loadFromServer(id);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('startNewConversation', err);
    }
  }, [guestStorageKey, hasToken, loadFromServer, roleContext, storageKey]);

  return {
    messages,
    sending,
    loadingHistory,
    conversationId,
    sendMessage,
    startNewConversation,
  };
}

export default useAiChat;
