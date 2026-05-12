import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { NOTIFICATIONS } from '../api/endpoints';

function timeAgoLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diffSec < 60) return 'just now';
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 8 });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(NOTIFICATIONS.LIST);
      setItems(Array.isArray(res.data?.notifications) ? res.data.notifications : []);
      setUnreadCount(Number(res.data?.unread_count || 0));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (!open) return undefined;

    const updatePos = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const panelWidth = Math.min(320, window.innerWidth - 16);
      const unclampedLeft = rect.right - panelWidth;
      const left = Math.max(8, Math.min(unclampedLeft, window.innerWidth - panelWidth - 8));
      setPanelPos({ top: rect.bottom + 8, left });
    };

    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    document.addEventListener('mousedown', onDocClick);

    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
      document.removeEventListener('mousedown', onDocClick);
    };
  }, [open]);

  const markAllRead = async () => {
    try {
      await axiosInstance.post(NOTIFICATIONS.MARK_ALL_READ);
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch {
      // no-op
    }
  };

  const markSingleRead = async (id) => {
    try {
      await axiosInstance.post(NOTIFICATIONS.MARK_READ(id));
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // no-op
    }
  };

  const visibleItems = useMemo(() => items.slice(0, 12), [items]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="layout-topbar-icon relative text-gray-600 hover:text-blue-600"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 end-0 min-w-4 h-4 px-1 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed w-80 max-w-[90vw] rounded-xl border border-gray-200 bg-white shadow-xl z-[200]"
          style={{ top: `${panelPos.top}px`, left: `${panelPos.left}px` }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800">Notifications</p>
            <button type="button" onClick={() => void markAllRead()} className="text-xs text-blue-600 hover:underline">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-sm text-gray-500">Loading…</p>
            ) : visibleItems.length === 0 ? (
              <p className="px-3 py-4 text-sm text-gray-500">No notifications yet.</p>
            ) : (
              visibleItems.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => void markSingleRead(n.id)}
                  className={`w-full text-start px-3 py-3 border-b border-gray-50 hover:bg-gray-50 ${n.read_at ? '' : 'bg-blue-50/40'}`}
                >
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  {n.body ? <p className="text-xs text-gray-500 mt-0.5">{n.body}</p> : null}
                  <p className="text-[11px] text-gray-400 mt-1">{timeAgoLabel(n.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
