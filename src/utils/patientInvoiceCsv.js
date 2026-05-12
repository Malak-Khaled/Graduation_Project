import { translateInvoiceStatus } from './i18nStatus';

function escapeCsvField(val) {
  const s = String(val ?? '');
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function line(cells) {
  return cells.map(escapeCsvField).join(',');
}

export function buildAccountStatementCsv({ summary, rows, t }) {
  const out = [
    line([t('patient.invoices.summaryCount'), String(summary.total)]),
    line([t('patient.invoices.summaryPending'), String(summary.pending)]),
    line([t('patient.invoices.summaryPaid'), String(summary.paid)]),
    '',
    line([
      t('patient.invoices.colNum'),
      t('patient.invoices.exportDate'),
      t('patient.invoices.colStatus'),
      t('patient.invoices.colAmount'),
      t('patient.invoices.colMethod'),
      t('patient.invoices.colService'),
    ]),
    ...rows.map((inv) =>
      line([
        String(inv.id ?? inv.invoiceNum ?? ''),
        inv.date ?? '',
        translateInvoiceStatus(inv.status, t),
        String(inv.amount ?? ''),
        inv.paymentMethod ?? '',
        `${inv.doctor ?? ''} — ${inv.service ?? ''}`,
      ])
    ),
  ];
  return `\uFEFF${out.join('\r\n')}`;
}

export function buildSingleInvoiceCsv(inv, t) {
  const out = [
    line([
      t('patient.invoices.colNum'),
      t('patient.invoices.exportDate'),
      t('patient.invoices.colStatus'),
      t('patient.invoices.colAmount'),
      t('patient.invoices.colMethod'),
      t('patient.invoices.colService'),
    ]),
    line([
      String(inv.id ?? inv.invoiceNum ?? ''),
      inv.date ?? '',
      translateInvoiceStatus(inv.status, t),
      String(inv.amount ?? ''),
      inv.paymentMethod ?? '',
      `${inv.doctor ?? ''} — ${inv.service ?? ''}`,
    ]),
  ];
  return `\uFEFF${out.join('\r\n')}`;
}
