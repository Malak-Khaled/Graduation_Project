import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import axiosInstance from '../../api/axiosInstance';
import { ADMIN } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import { translateDoctorActiveStatus } from '../../utils/i18nStatus';
import { Search, Plus, X, Save, Shield, Trash2, Mail, User, Phone, Lock } from 'lucide-react';
import ConfirmActionModal from '../../components/ConfirmActionModal';

function mapAdminFromApi(payload, form) {
  const a = payload?.user ?? payload?.admin ?? payload?.data ?? payload;
  const active = a.is_active !== false && a.active !== false;
  return {
    id: a.id ?? Date.now(),
    name: a.name ?? form.name,
    email: a.email ?? form.email,
    phone: a.phone ?? form.phone ?? '',
    status: active ? 'نشط' : 'غير نشط',
    img: a.avatar_url ?? a.img ?? `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90)}.jpg`,
  };
}

function AddAdminModal({ onClose, onSave }) {
  const { t } = useTranslation();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.password) {
      toast.error(t('admin.staff.errors.required'));
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post(ADMIN.ADMINS, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: 'admin',
        permissions: 'full',
      });
      onSave(mapAdminFromApi(res.data, form));
      onClose();
    } catch (err) {
      if (err.response) {
        toast.error(getApiErrorMessage(err, t('admin.staff.addFail')));
        setLoading(false);
        return;
      }
      onSave({
        ...form,
        id: Date.now(),
        status: 'نشط',
        img: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 90)}.jpg`,
      });
      toast.info(t('admin.staff.savedLocal'));
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose} role="presentation" />
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-lg z-10">
        <div className="flex items-center justify-between mb-4 gap-3">
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
          <h3 className="font-bold text-gray-800 text-lg text-start flex-1">{t('admin.staff.modalTitle')}</h3>
        </div>
        <p className="text-xs text-gray-500 text-start mb-4 leading-relaxed">{t('admin.staff.modalHint')}</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('admin.staff.fieldName')}</label>
            <div className="relative">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t('admin.staff.phName')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <User size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('admin.staff.fieldEmail')}</label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder={t('admin.staff.phEmail')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Mail size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('admin.staff.fieldPhone')}</label>
              <div className="relative">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder={t('admin.doctors.phPhone')}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Phone size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 text-start">{t('admin.staff.fieldPassword')}</label>
            <div className="relative">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pe-10 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Lock size={15} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <>
                <Save size={15} /> {t('admin.doctors.saveBtn')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  const { t } = useTranslation();
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ADMIN.ADMINS);
      const mapped = (res.data?.admins || []).map((a) => mapAdminFromApi({ admin: a }, {}));
      setAdmins(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const filtered = useMemo(() => admins.filter(
    (a) => a.name.includes(search) || a.email.includes(search) || (a.phone && a.phone.includes(search))
  ), [admins, search]);

  const deleteAdmin = async (id) => {
    try {
      await axiosInstance.delete(ADMIN.ADMIN_BY_ID(id));
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast.error(t('admin.staff.deleted'), t('admin.staff.deleteTitle'));
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteSubmitting(true);
    try {
      const ok = await deleteAdmin(pendingDelete.id);
      if (ok) setPendingDelete(null);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          {t('admin.staff.add')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('admin.staff.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{loading ? t('common.loading') : t('admin.staff.subtitle')}</p>
        </div>
      </div>

      <div className="relative flex-1 min-w-48 max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('admin.staff.searchPh')}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
        <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 text-start min-w-0">
                <p className="font-bold text-gray-800">{a.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-start gap-1">
                  <Shield size={12} className="text-blue-500 shrink-0" />
                  {t('admin.staff.roleLine')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 break-all">{a.email}</p>
                {a.phone ? <p className="text-xs text-gray-400">{a.phone}</p> : null}
              </div>
              <img src={a.img} alt="" className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  a.status === 'نشط' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {translateDoctorActiveStatus(a.status, t)}
              </span>
              <button
                type="button"
                onClick={() => setPendingDelete({ id: a.id, name: a.name })}
                className="w-9 h-9 border border-red-200 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 shrink-0"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <AddAdminModal
          onClose={() => setShowAdd(false)}
          onSave={(row) => {
            setAdmins((prev) => [row, ...prev]);
            toast.success(t('admin.staff.addSuccess', { name: row.name }));
          }}
        />
      )}

      <ConfirmActionModal
        open={!!pendingDelete}
        onClose={() => !deleteSubmitting && setPendingDelete(null)}
        title={t('admin.confirm.deleteAdminTitle')}
        description={t('admin.confirm.deleteAdminBody', { name: pendingDelete?.name ?? '' })}
        variant="danger"
        isSubmitting={deleteSubmitting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
