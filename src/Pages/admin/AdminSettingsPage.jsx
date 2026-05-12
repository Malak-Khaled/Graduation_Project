import { createElement, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../context/ToastContext';
import { Save, Bell, Shield, Globe } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { ADMIN } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

function Section({ icon, title, children }) {
  return (
    <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">{createElement(icon, { size: 18, className: 'text-blue-600' })}</div>
        <h3 className="font-bold text-gray-800 text-start">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1 text-start">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
}

function Toggle({ value, onChange, label, sub }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
            value ? 'start-0.5' : 'end-0.5'
          }`}
        />
      </button>
      <div className="text-start min-w-0">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    siteName: 'لصحتك',
    siteEmail: 'admin@lesahtak.com',
    sitePhone: '01012345678',
    address: 'بني سويف، مصر',
    emailNotifications: true,
    smsNotifications: false,
    newAppointmentAlert: true,
    paymentAlert: true,
    language: 'ar',
    maxAppointmentsPerDay: '20',
    appointmentDuration: '30',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleChange = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(ADMIN.SETTINGS);
      if (res.data?.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axiosInstance.put(ADMIN.SETTINGS, settings);
      setSaved(true);
      toast.success(t('admin.settings.savedToast'));
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t('authErrors.default')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen w-full">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save size={15} />
          {loading ? t('common.loading') : saved ? t('admin.settings.saved') : t('admin.settings.saveTop')}
        </button>
        <div className="text-start">
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-800">{t('admin.settings.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('admin.settings.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section icon={Globe} title={t('admin.settings.sectionGeneral')}>
          <Field label={t('admin.settings.siteName')}>
            <Input value={settings.siteName} onChange={(v) => handleChange('siteName', v)} placeholder={t('admin.settings.siteNamePh')} />
          </Field>
          <Field label={t('admin.settings.siteEmail')}>
            <Input value={settings.siteEmail} onChange={(v) => handleChange('siteEmail', v)} placeholder="admin@lesahtak.com" type="email" />
          </Field>
          <Field label={t('admin.settings.sitePhone')}>
            <Input value={settings.sitePhone} onChange={(v) => handleChange('sitePhone', v)} placeholder="01xxxxxxxxx" />
          </Field>
          <Field label={t('admin.settings.address')}>
            <Input value={settings.address} onChange={(v) => handleChange('address', v)} placeholder={t('admin.settings.addressPh')} />
          </Field>
        </Section>

        <Section icon={Bell} title={t('admin.settings.sectionNotifications')}>
          <div className="space-y-4">
            <Toggle
              value={settings.emailNotifications}
              onChange={(v) => handleChange('emailNotifications', v)}
              label={t('admin.settings.notifEmail')}
              sub={t('admin.settings.notifEmailSub')}
            />
            <Toggle
              value={settings.smsNotifications}
              onChange={(v) => handleChange('smsNotifications', v)}
              label={t('admin.settings.notifSms')}
              sub={t('admin.settings.notifSmsSub')}
            />
            <Toggle
              value={settings.newAppointmentAlert}
              onChange={(v) => handleChange('newAppointmentAlert', v)}
              label={t('admin.settings.notifNewAppt')}
              sub={t('admin.settings.notifNewApptSub')}
            />
            <Toggle
              value={settings.paymentAlert}
              onChange={(v) => handleChange('paymentAlert', v)}
              label={t('admin.settings.notifPayment')}
              sub={t('admin.settings.notifPaymentSub')}
            />
          </div>
        </Section>

        <Section icon={Shield} title={t('admin.settings.sectionAppointments')}>
          <Field label={t('admin.settings.maxApptsPerDay')}>
            <Input value={settings.maxAppointmentsPerDay} onChange={(v) => handleChange('maxAppointmentsPerDay', v)} placeholder="20" type="number" />
          </Field>
          <Field label={t('admin.settings.apptDuration')}>
            <Input value={settings.appointmentDuration} onChange={(v) => handleChange('appointmentDuration', v)} placeholder="30" type="number" />
          </Field>
          <Field label={t('admin.settings.systemLanguage')}>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-start focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none bg-white"
            >
              <option value="ar">{t('admin.settings.langAr')}</option>
              <option value="en">{t('admin.settings.langEn')}</option>
            </select>
          </Field>
        </Section>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleSave}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save size={15} />
          {loading ? t('common.loading') : saved ? t('admin.settings.saved') : t('admin.settings.saveBottom')}
        </button>
      </div>
    </div>
  );
}
