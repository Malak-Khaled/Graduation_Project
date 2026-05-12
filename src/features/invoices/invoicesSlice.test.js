import { describe, it, expect } from 'vitest';
import invoicesReducer, { clearError, payInvoice } from './invoicesSlice';

describe('invoicesSlice', () => {
  it('clearError resets error', () => {
    const s = invoicesReducer(
      {
        invoices: [],
        summary: { total: 0, pending: 0, paid: 0 },
        loading: false,
        payLoading: false,
        error: 'x',
      },
      clearError()
    );
    expect(s.error).toBeNull();
  });

  it('payInvoice.fulfilled marks matching invoice as paid', () => {
    const start = {
      invoices: [
        { id: 1, amount: 100, status: 'لم يتم الدفع', paymentMethod: '---' },
      ],
      summary: { total: 1, pending: 100, paid: 0 },
      loading: false,
      payLoading: true,
      error: null,
    };
    const s = invoicesReducer(
      start,
      payInvoice.fulfilled(
        { invoiceId: 1, paymentMethod: 'card', ok: true },
        '',
        { invoiceId: 1 },
        null
      )
    );
    expect(s.invoices[0].status).toBe('تم الدفع');
    expect(s.invoices[0].paymentMethod).toBe('card');
    expect(s.payLoading).toBe(false);
  });
});
