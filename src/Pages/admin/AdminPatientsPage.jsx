import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { translateDoctorActiveStatus } from '../../utils/i18nStatus';
import { Search, Eye, Trash2, Droplet, Phone } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { ADMIN } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';
import ConfirmActionModal from '../../components/ConfirmActionModal';

const FILTER_VALUES = ['الكل', 'نشط', 'غير نشط'];

function filterLabelKey(v) {
  if (v === 'الكل') return 'admin.doctors.filterAll';
  if (v === 'نشط') return 'admin.doctors.active';
  return 'admin.doctors.inactive';
}

export default function AdminPatientsPage() {
  const { t } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('الكل');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [pendingAction, setPendingAction] = useState(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ADMIN.PATIENTS);
      const mapped = (res.data?.patients || []).map((p) => {
        const birth = p.date_of_birth ? new Date(p.date_of_birth) : null;
        const age = birth ? Math.max(0, new Date().getFullYear() - birth.getFullYear()) : '-';
        return {
          id: p.id,
          name: p.name,
          phone: p.phone || '-',
          bloodType: 'N/A',
          age,
          governorate: p.governorate || p.city || p.address || '-',
          status: p.is_active ? 'نشط' : 'غير نشط',
          visits: 0,
          img: 'https://randomuser.me/api/portraits/lego/4.jpg',
        };
      });
      setPatients(mapped);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const filtered = useMemo(() => patients.filter((p) => {
    const matchSearch = p.name.includes(search) || p.phone.includes(search) || p.governorate.includes(search);
    const matchStatus = filterStatus === 'الكل' || p.status === filterStatus;
    return matchSearch && matchStatus;
  }), [patients, search, filterStatus]);

  const deletePatient = async (id) => {
    try {
      await axiosInstance.delete(ADMIN.PATIENT_BY_ID(id));
      setPatients((prev) => prev.filter((p) => p.id !== id));
      toast.error(t('admin.patients.deleted'), t('admin.patients.deleteTitle'));
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
      return false;
    }
  };

  const toggleStatus = async (id) => {
    const p = patients.find((x) => x.id === id);
    if (!p) return false;
    const nextActive = p.status !== 'نشط';
    try {
      await axiosInstance.put(ADMIN.PATIENT_BY_ID(id), { is_active: nextActive });
      setPatients((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: nextActive ? 'نشط' : 'غير نشط' } : x))
      );
      toast.info(nextActive ? t('admin.patients.toggledOn') : t('admin.patients.toggledOff'));
      return true;
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
      return false;
    }
  };

  const handleConfirmPending = async () => {
    if (!pendingAction) return;
    setActionSubmitting(true);
    try {
      const ok =
        pendingAction.type === 'delete'
          ? await deletePatient(pendingAction.id)
          : await toggleStatus(pendingAction.id);
      if (ok) setPendingAction(null);
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-blue-50 text-blue-600 text-sm font-bold px-4 py-2 rounded-xl">
            {loading ? t('common.loading') : t('admin.patients.badge', { count: patients.length })}
          </span>
        </div>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('admin.patients.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('admin.patients.subtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 bg-white rounded-xl shadow-sm p-1">
          {FILTER_VALUES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-800 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/70'
              }`}
            >
              {t(filterLabelKey(s))}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-48">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.patients.searchPh')}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pe-10 text-sm text-start placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
          <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="card-hover-panel bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-6 gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 text-center">
          <span>{t('admin.patients.colAction')}</span>
          <span>{t('admin.patients.colStatus')}</span>
          <span>{t('admin.patients.colVisits')}</span>
          <span>{t('admin.patients.colGovAge')}</span>
          <span>{t('admin.patients.colPhoneBlood')}</span>
          <span className="text-start">{t('admin.patients.colPatient')}</span>
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((p) => (
            <div key={p.id} className="px-4 md:px-5 py-4">
              <div className="md:hidden space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.status === 'نشط' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {translateDoctorActiveStatus(p.status, t)}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="text-start min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.governorate} - {t('admin.patients.ageSuffix', { age: p.age })}
                      </p>
                    </div>
                    <img src={p.img} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingAction({ type: 'delete', id: p.id, name: p.name, isActive: p.status === 'نشط' })}
                    className="w-9 h-9 border border-red-200 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingAction({ type: 'toggle', id: p.id, name: p.name, isActive: p.status === 'نشط' })}
                    className="flex-1 border border-gray-200 text-gray-600 text-xs font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {p.status === 'نشط' ? t('admin.doctors.disable') : t('admin.doctors.enable')}
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-blue-600 text-white text-xs font-semibold py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye size={13} />
                    {t('admin.doctors.view')}
                  </button>
                </div>
              </div>
              <div className="hidden md:grid grid-cols-6 gap-3 items-center text-center">
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingAction({ type: 'delete', id: p.id, name: p.name, isActive: p.status === 'نشط' })}
                    className="w-8 h-8 border border-red-200 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingAction({ type: 'toggle', id: p.id, name: p.name, isActive: p.status === 'نشط' })}
                    className="text-xs font-semibold border border-gray-200 text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {p.status === 'نشط' ? t('admin.doctors.disable') : t('admin.doctors.enable')}
                  </button>
                </div>
                <div className="flex justify-center">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.status === 'نشط' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {translateDoctorActiveStatus(p.status, t)}
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-600">{p.visits}</span>
                <div>
                  <p className="text-sm text-gray-700">{p.governorate}</p>
                  <p className="text-xs text-gray-400">{t('admin.patients.ageSuffix', { age: p.age })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Phone size={11} />
                    {p.phone}
                  </p>
                  <p className="text-xs text-red-500 font-bold flex items-center justify-center gap-1 mt-0.5">
                    <Droplet size={11} />
                    {p.bloodType}
                  </p>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                  <img src={p.img} alt="" className="w-9 h-9 rounded-xl object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-start">
          <p className="text-xs text-gray-400">
            {t('admin.patients.footer', { shown: filtered.length, total: patients.length })}
          </p>
        </div>
      </div>

      <ConfirmActionModal
        open={!!pendingAction}
        onClose={() => !actionSubmitting && setPendingAction(null)}
        title={
          !pendingAction
            ? ''
            : pendingAction.type === 'delete'
              ? t('admin.confirm.deletePatientTitle')
              : pendingAction.isActive
                ? t('admin.confirm.togglePatientOffTitle')
                : t('admin.confirm.togglePatientOnTitle')
        }
        description={
          !pendingAction
            ? ''
            : pendingAction.type === 'delete'
              ? t('admin.confirm.deletePatientBody', { name: pendingAction.name })
              : pendingAction.isActive
                ? t('admin.confirm.togglePatientOffBody', { name: pendingAction.name })
                : t('admin.confirm.togglePatientOnBody', { name: pendingAction.name })
        }
        variant={pendingAction?.type === 'delete' ? 'danger' : 'warning'}
        isSubmitting={actionSubmitting}
        onConfirm={handleConfirmPending}
      />
    </div>
  );
}
