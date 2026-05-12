import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import { INVOICES } from '../../api/endpoints';
import { getApiErrorMessage } from '../../utils/apiError';

function buildSummary(invoices) {
  return {
    total: invoices.length,
    pending: invoices.filter((i) => i.status === 'لم يتم الدفع' || i.status === 'pending' || i.status === 'unpaid').reduce((s, i) => s + Number(i.amount || 0), 0),
    paid: invoices.filter((i) => i.status === 'تم الدفع' || i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0),
  };
}

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(INVOICES.LIST);
      const data = res.data || {};
      const invoices = Array.isArray(data) ? data : (data.invoices || []);
      return {
        invoices,
        summary: data.summary || buildSummary(invoices),
      };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'تعذر تحميل الفواتير'));
    }
  }
);

export const payInvoice = createAsyncThunk(
  'invoices/pay',
  async ({ invoiceId, paymentMethod, cardData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(INVOICES.PAY(invoiceId), {
        paymentMethod,
        cardData,
      });
      return { invoiceId, paymentMethod, ...res.data };
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'خطأ في عملية الدفع'));
    }
  }
);

export const fetchInvoiceByRef = createAsyncThunk(
  'invoices/fetchOne',
  async (invoiceId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(INVOICES.BY_REF(invoiceId));
      return res.data?.invoice || null;
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'تعذر متابعة حالة الفاتورة'));
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: {
    invoices: [],
    summary: {
      total: 0,
      pending: 0,
      paid: 0,
    },
    loading: false,
    payLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload.invoices || [];
        state.summary = action.payload.summary || state.summary;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(payInvoice.pending, (state) => {
        state.payLoading = true;
      })
      .addCase(payInvoice.fulfilled, (state, action) => {
        state.payLoading = false;
        if (action.payload.pending_confirmation) {
          state.error = null;
          return;
        }
        const idx = state.invoices.findIndex((i) => i.id === action.payload.invoiceId);
        if (idx !== -1) {
          state.invoices[idx].status = 'تم الدفع';
          state.invoices[idx].paymentMethod = action.payload.paymentMethod;
        }
        state.summary = buildSummary(state.invoices);
      })
      .addCase(payInvoice.rejected, (state, action) => {
        state.payLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvoiceByRef.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        const idx = state.invoices.findIndex((i) => i.id === updated.id);
        if (idx !== -1) {
          state.invoices[idx] = { ...state.invoices[idx], ...updated };
        }
        state.summary = buildSummary(state.invoices);
      });
  },
});

export const { clearError } = invoicesSlice.actions;
export default invoicesSlice.reducer;
