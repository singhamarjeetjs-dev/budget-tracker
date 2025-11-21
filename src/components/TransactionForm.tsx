// File: src/components/TransactionForm.tsx
import { useState } from 'react';

export type Transaction = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  type: 'income' | 'expense';
};

type Props = {
  // onAdd expects payload WITHOUT id (id will be provided by Firestore)
  onAdd: (t: Omit<Transaction, 'id'>) => void | Promise<void>;
};

export default function TransactionForm({ onAdd }: Props) {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num === 0) return;
    const payload: Omit<Transaction, 'id'> = {
      amount: num,
      category,
      date,
      note,
      type,
    };
    try {
      setLoading(true);
      await onAdd(payload);
      setAmount('');
      setNote('');
    } finally {
      setLoading(false);
    }
  };

  return (
    // NOTE: Do NOT use a bg/card wrapper here. The page already provides .app-card.
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (₹)"
          className="input"
          inputMode="decimal"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'income' | 'expense')}
            className="input"
            aria-label="Type"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
            aria-label="Category"
          >
            <option>General</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Entertainment</option>
            <option>Salary</option>
          </select>
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="input"
          rows={2}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
        >
          {loading ? 'Adding…' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}
