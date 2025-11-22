/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/TransactionsPage.tsx
import { useMemo, useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import type { Transaction } from '../components/TransactionForm';
import type { FC } from 'react';

type Props = {
  items: (Transaction & { id: string })[];
  onAdd: (t: Omit<Transaction, 'id'>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
};

/** helper: month-year label from date string (expects YYYY-MM-DD or ISO) */
function monthLabelFromDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** group items by month-year (descending months) */
function groupByMonth(items: (Transaction & { id: string })[]) {
  const map = new Map<string, (Transaction & { id: string })[]>();
  for (const it of items) {
    const label = monthLabelFromDate(it.date || '');
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(it);
  }

  // convert to sorted array of [label, items], newest month first
  const arr = Array.from(map.entries()).sort((a, b) => {
    // try parse year-month from first item's date
    const aDate = new Date(a[1][0]?.date || 0).getTime();
    const bDate = new Date(b[1][0]?.date || 0).getTime();
    return bDate - aDate;
  });

  return arr;
}

const EmptyState: FC<{ actionLabel?: string }> = ({ actionLabel = 'Add your first transaction' }) => (
  <div className="app-card center flex-col gap-4 p-8">
    <svg width="96" height="96" viewBox="0 0 24 24" fill="none" className="mb-2 opacity-80">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" opacity="0.12" />
      <path d="M7 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div className="text-lg font-semibold">No transactions yet</div>
    <div className="muted text-center max-w-sm">Add an expense or income to start tracking your budget. You can import CSV or add manually.</div>
    <div className="mt-4">
      <div className="btn btn-primary">{actionLabel}</div>
    </div>
  </div>
);

export default function TransactionsPage({ items, onAdd, onDelete }: Props) {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | string>('all');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  // derived lists
  const categories = useMemo(() => {
    const s = new Set<string>();
    items.forEach((t) => s.add(t.category));
    return ['All', ...Array.from(s).sort()];
  }, [items]);

  const totals = useMemo(() => {
    const income = items.filter((i) => i.type === 'income').reduce((s, c) => s + c.amount, 0);
    const expense = items.filter((i) => i.type === 'expense').reduce((s, c) => s + c.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        t.category.toLowerCase().includes(q) ||
        (t.note ?? '').toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    });
  }, [items, query, typeFilter, categoryFilter]);

  const grouped = useMemo(() => groupByMonth(filtered), [filtered]);

  function exportCSV(list: (Transaction & { id: string })[]) {
    const header = ['id', 'date', 'type', 'category', 'amount', 'note'];
    const rows = list.map((t) => [t.id, t.date, t.type, t.category, t.amount.toString(), t.note ?? '']);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File | null) {
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) return;
      const header = lines[0].split(',').map((h) => h.replace(/(^"|"$)/g, '').trim().toLowerCase());
      const rows = lines.slice(1);
      for (const row of rows) {
        const cols = row.split(',').map((c) => c.replace(/(^"|"$)/g, '').trim());
        const obj: any = {};
        header.forEach((h, i) => (obj[h] = cols[i] ?? ''));
        const payload: Omit<Transaction, 'id'> = {
          amount: parseFloat(obj.amount || obj['Amount'] || '0') || 0,
          category: obj.category || obj.cat || 'General',
          date: obj.date || new Date().toISOString().slice(0, 10),
          note: obj.note || '',
          type: obj.type === 'income' ? 'income' : 'expense',
        };
        if (!payload.amount) continue;
        // eslint-disable-next-line no-await-in-loop
        await onAdd(payload);
      }
    } catch (e) {
      console.error('Import failed', e);
    } finally {
      setImporting(false);
    }
  }

  const handleAdd = async (t: Omit<Transaction, 'id'>) => {
    try {
      setLoadingAdd(true);
      await onAdd(t);
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      setDeletingId(id);
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top controls + totals */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="lg:w-1/3 space-y-4">
          <div className="app-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm muted">Total Income</div>
                <div className="text-2xl font-semibold">₹{totals.income.toFixed(2)}</div>
              </div>
              <div className="label-pill type-income">Income</div>
            </div>
          </div>

          <div className="app-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm muted">Total Expense</div>
                <div className="text-2xl font-semibold">₹{totals.expense.toFixed(2)}</div>
              </div>
              <div className="label-pill type-expense">Expense</div>
            </div>
          </div>

          <div className="app-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm muted">Balance</div>
                <div className="text-2xl font-semibold">₹{totals.balance.toFixed(2)}</div>
              </div>
              <div className={`label-pill ${totals.balance >= 0 ? 'type-income' : 'type-expense'}`}>
                {totals.balance >= 0 ? 'Positive' : 'Overdraft'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 space-y-4">
          <div className="app-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  placeholder="Search by category, note, date or amount"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input"
                />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="input">
                  <option value="all">All types</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input">
                  <option value="all">All categories</option>
                  {categories.map((c) => (c === 'All' ? null : <option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => exportCSV(filtered)} className="btn btn-ghost">Export CSV</button>

                <label className="btn btn-ghost cursor-pointer">
                  {importing ? 'Importing...' : 'Import CSV'}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleImport(e.target.files ? e.target.files[0] : null)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Form + list area */}
          <div className="grid lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-1">
              <div className="app-card">
                <h3 className="text-lg font-semibold mb-3">Add Transaction</h3>
                <TransactionForm onAdd={handleAdd} />
                {loadingAdd && <div className="muted mt-2">Adding transaction…</div>}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="app-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Transactions ({filtered.length})</h3>
                  <div className="muted text-sm">Showing latest first</div>
                </div>

                {grouped.length === 0 ? (
                  <EmptyState actionLabel="Add your first transaction" />
                ) : (
                  <div className="space-y-6">
                    {grouped.map(([monthLabel, txs]) => (
                      <section key={monthLabel}>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{monthLabel}</h4>
                          <div className="muted text-sm">{txs.length} items</div>
                        </div>

                        <div className="tx-list">
                          {txs.map((t) => (
                            <div key={t.id} className="tx-row">
                              <div className="meta">
                                <div className="flex items-center gap-3">
                                  <div className={`label-pill ${t.type === 'income' ? 'type-income' : 'type-expense'}`}>{t.category}</div>
                                  <div className="text-sm muted">{t.date}</div>
                                </div>
                                <div className="text-sm text-gray-700 dark:text-gray-200">{t.note}</div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className={`font-semibold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                                  {t.type === 'expense' ? '-' : '+'}₹{t.amount.toFixed(2)}
                                </div>
                                <button
                                  onClick={() => handleDelete(t.id)}
                                  className="text-sm text-red-500 hover:underline"
                                  disabled={deletingId === t.id}
                                >
                                  {deletingId === t.id ? 'Deleting…' : 'Delete'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
