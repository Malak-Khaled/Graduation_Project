import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import medicalRecordsReducer from '../features/medicalRecords/medicalRecordsSlice';
import invoicesReducer from '../features/invoices/invoicesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer,
    medicalRecords: medicalRecordsReducer,
    invoices: invoicesReducer,
  },
});

export default store;