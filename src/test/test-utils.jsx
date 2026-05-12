import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { store } from '../app/store';
import { ToastProvider } from '../context/ToastContext';
import authReducer from '../features/auth/authSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import medicalRecordsReducer from '../features/medicalRecords/medicalRecordsSlice';
import invoicesReducer from '../features/invoices/invoicesSlice';

const rootReducer = {
  auth: authReducer,
  appointments: appointmentsReducer,
  medicalRecords: medicalRecordsReducer,
  invoices: invoicesReducer,
};

export function createTestStore(preloaded = undefined) {
  return configureStore({ reducer: rootReducer, preloadedState: preloaded });
}

const emptySlices = {
  appointments: { upcoming: [], previous: [], loading: false, error: null, usingMock: false, infoMessage: null },
  medicalRecords: { records: [], vitals: null, chronicDiseases: [], surgicalOperations: [], loading: false, error: null },
  invoices: {
    invoices: [],
    summary: { total: 0, pending: 0, paid: 0 },
    loading: false,
    payLoading: false,
    error: null,
    usingMock: false,
    infoMessage: null,
  },
};

export const adminAuthState = {
  ...emptySlices,
  auth: {
    user: { id: 1, name: 'Admin', role: 'admin', email: 'a@t.com' },
    token: 'test-token',
    role: 'admin',
    loading: false,
    error: null,
  },
};

export const doctorAuthState = {
  ...emptySlices,
  auth: {
    user: { id: 2, name: 'Dr', role: 'doctor', email: 'd@t.com' },
    token: 'test-token',
    role: 'doctor',
    loading: false,
    error: null,
  },
};

export const patientAuthState = {
  ...emptySlices,
  auth: {
    user: { id: 3, name: 'Pat', role: 'patient', email: 'p@t.com' },
    token: 'test-token',
    role: 'patient',
    loading: false,
    error: null,
  },
};

export function renderWithProviders(ui, { route = '/', storeOverride = null, preloaded = null } = {}) {
  const reduxStore = preloaded != null ? createTestStore(preloaded) : (storeOverride ?? store);
  return render(
    <I18nextProvider i18n={i18n}>
      <Provider store={reduxStore}>
        <ToastProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </ToastProvider>
      </Provider>
    </I18nextProvider>
  );
}
