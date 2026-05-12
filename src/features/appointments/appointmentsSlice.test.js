import { describe, it, expect } from 'vitest';
import appointmentsReducer, { clearError, cancelAppointment } from './appointmentsSlice';

const base = {
  upcoming: [{ id: 10, status: 'pending' }],
  previous: [],
  loading: false,
  error: 'e',
  usingMock: false,
  infoMessage: null,
};

describe('appointmentsSlice', () => {
  it('clearError resets error', () => {
    const s = appointmentsReducer({ ...base }, clearError());
    expect(s.error).toBeNull();
  });

  it('cancel fulfilled removes id from upcoming', () => {
    const s = appointmentsReducer({ ...base }, { type: `${cancelAppointment.fulfilled.type}`, payload: 10 });
    expect(s.upcoming.some((a) => a.id === 10)).toBe(false);
  });
});
