/* eslint-disable @typescript-eslint/no-explicit-any */
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
  onAdd: (t: Omit<Transaction, 'id'>) => void;
};

export default function TransactionForm({ onAdd }: Props) {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const submit = (e: React.FormEvent) => {
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
    onAdd(payload);
    setAmount('');
    setNote('');
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (₹)"
          className="flex-1 p-2 border rounded bg-transparent"
          inputMode="decimal"
        />
        <select value={type} onChange={(e) => setType(e.target.value as any)} className="p-2 border rounded bg-transparent">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-2 border rounded bg-transparent">
          <option>General</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Entertainment</option>
          <option>Salary</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border rounded bg-transparent" />
      </div>

      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="w-full p-2 border rounded bg-transparent" />

      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Add Transaction</button>
      </div>
    </form>
  );
}
