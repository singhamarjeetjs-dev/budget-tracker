/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/pages/TransactionsPage.tsx
import { useMemo, useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import type { Transaction } from '../components/TransactionForm';

type Props = {
  items: (Transaction & { id: string })[];
  onAdd: (t: Omit<Transaction, 'id'>) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
};

export default function TransactionsPage({ items, onAdd, onDelete }: Props) {
  const [query, setQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDeleteId, setLoadingDeleteId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((t) => set.add(t.category));
    return ['All', ...Array.from(set).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        t.category.toLowerCase().includes(q) ||
        (t.note ?? '').toLowerCase().includes(q) ||
        t.date.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      );
    });
  }, [items, typeFilter, categoryFilter, query]);

  function exportCSV(list: (Transaction & { id: string })[]) {
    const header = ['id', 'date', 'type', 'category', 'amount', 'note'];
    const rows = list.map((t) => [t.id, t.date, t.type, t.category, t.amount.toString(), t.note ?? '']);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
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
      const mapped = rows.map((row) => {
        const cols = row.split(',').map((c) => c.replace(/(^"|"$)/g, '').trim());
        const obj: any = {};
        header.forEach((h, i) => (obj[h] = cols[i] ?? ''));
        return obj;
      });

      for (const r of mapped) {
        const payload: Omit<Transaction, 'id'> = {
          amount: parseFloat(r.amount ?? r['Amount'] ?? '0') || 0,
          category: r.category || r.cat || 'General',
          date: r.date || new Date().toISOString().slice(0, 10),
          note: r.note || '',
          type: r.type === 'income' ? 'income' : 'expense',
        };
        if (!payload.amount) continue;
        // sequential to avoid rate limits
        // eslint-disable-next-line no-await-in-loop
        await onAdd(payload);
      }
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
    try {
      setLoadingDeleteId(id);
      await onDelete(id);
    } finally {
      setLoadingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="w-full lg:w-1/3">
          <TransactionForm onAdd={handleAdd} />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => exportCSV(filtered)}
              className="px-3 py-2 border rounded text-sm bg-white dark:bg-gray-800"
            >
              Export visible CSV
            </button>

            <label className="px-3 py-2 border rounded text-sm bg-white dark:bg-gray-800 cursor-pointer">
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

        <div className="w-full lg:w-2/3 space-y-3">
          <div className="p-3 bg-white dark:bg-gray-800 rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by category, note, date or amount"
                className="px-3 py-2 border rounded w-64 bg-transparent"
              />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="px-2 py-2 border rounded bg-transparent">
                <option value="all">All types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-2 py-2 border rounded bg-transparent">
                <option value="all">All categories</option>
                {categories.map((c) =>
                  c === 'All' ? null : (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">Showing {filtered.length} of {items.length}</div>
          </div>

          <TransactionList
            items={filtered}
            onDelete={(id) => {
              if (confirm('Delete this transaction?')) {
                void handleDelete(id);
              }
            }}
          />

          {loadingAdd && <div className="text-sm text-gray-500">Adding transaction...</div>}
          {loadingDeleteId && <div className="text-sm text-gray-500">Deleting...</div>}
        </div>
      </div>
    </div>
  );
}
