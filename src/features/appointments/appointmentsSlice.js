import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { APPOINTMENTS } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

function normalizeAppointment(a) {
  return {
    id: a.id,
    status: a.status || 'pending',
    date: a.appointment_date || a.date || '-',
    time: a.appointment_time || a.time || '-',
    doctorName: a.doctor?.name || a.doctorName || '-',
    specialty: a.doctor?.specialty || a.specialty || '-',
    specialty2: a.doctor?.specialty || a.specialty2 || a.specialty || '-',
    location: a.doctor?.area || a.location || '-',
    img: a.doctor?.avatar_url || a.img || 'https://randomuser.me/api/portraits/men/55.jpg',
    canRate: Boolean(a.can_rate),
    rating: a.rating
      ? {
          value: Number(a.rating.rating || 0),
          comment: a.rating.comment || '',
        }
      : null,
  };
}

function splitAppointments(rows) {
  return {
    upcoming: rows.filter((a) => a.status !== 'completed' && a.status !== 'cancelled'),
    previous: rows.filter((a) => a.status === 'completed' || a.status === 'cancelled'),
  };
}

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(APPOINTMENTS.LIST);
      const data = res.data;
      if (Array.isArray(data)) {
        return splitAppointments(data.map(normalizeAppointment));
      }
      if (Array.isArray(data?.appointments)) {
        return splitAppointments(data.appointments.map(normalizeAppointment));
      }
      return {
        upcoming: (data.upcoming || []).map(normalizeAppointment),
        previous: (data.previous || []).map(normalizeAppointment),
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'تعذر جلب المواعيد حاليًا'));
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancel',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(APPOINTMENTS.BY_ID(id));
      return id;
    } catch (err) {
      // In mock/offline mode, still resolve locally.
      if (!err.response) return id;
      return rejectWithValue(getApiErrorMessage(err, 'خطأ في إلغاء الموعد'));
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState: {
    upcoming: [],
    previous: [],
    loading: false,
    error: null,
    usingMock: false,
    infoMessage: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearInfo: (state) => {
      state.infoMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.upcoming = action.payload.upcoming || [];
        state.previous = action.payload.previous || [];
        state.usingMock = false;
        state.infoMessage = null;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'تعذر جلب المواعيد حاليًا';
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.upcoming = state.upcoming.filter((a) => a.id !== action.payload);
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearError, clearInfo } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;