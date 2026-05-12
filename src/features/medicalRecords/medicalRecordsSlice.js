import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { MEDICAL_RECORDS } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

export const fetchMedicalRecords = createAsyncThunk(
  'medicalRecords/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(MEDICAL_RECORDS.ROOT);
      return res.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'خطأ في جلب السجلات الطبية'));
    }
  }
);

export const updateMedicalData = createAsyncThunk(
  'medicalRecords/update',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(MEDICAL_RECORDS.UPDATE, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'خطأ في تحديث البيانات'));
    }
  }
);

const medicalRecordsSlice = createSlice({
  name: 'medicalRecords',
  initialState: {
    records: [],
    vitals: null,
    chronicDiseases: [],
    surgicalOperations: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records || [];
        state.vitals = action.payload.vitals || null;
        state.chronicDiseases = action.payload.chronicDiseases || [];
        state.surgicalOperations = action.payload.surgicalOperations || [];
      })
      .addCase(fetchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateMedicalData.fulfilled, (state, action) => {
        state.vitals = action.payload.vitals || state.vitals;
        state.chronicDiseases = action.payload.chronicDiseases || state.chronicDiseases;
        state.surgicalOperations = action.payload.surgicalOperations || state.surgicalOperations;
      });
  },
});

export const { clearError } = medicalRecordsSlice.actions;
export default medicalRecordsSlice.reducer;