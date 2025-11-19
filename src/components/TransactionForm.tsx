import React, { useState } from "react";

type Props = {
  onAdd: (t: Transaction) => void;
};

export type Transaction = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  type: "income" | "expense";
};

export default function TransactionForm({ onAdd }: Props) {
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("General");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (Number.isNaN(num) || num === 0) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      amount: num,
      category,
      date,
      note,
      type,
    };
    onAdd(tx);
    setAmount("");
    setNote("");
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-3 p-4 bg-white rounded-lg shadow-sm"
    >
      <div className="flex gap-2">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="flex-1 p-2 border rounded"
          inputMode="decimal"
        />
        <select
          value={type}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => setType(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option>General</option>
          <option>Food</option>
          <option>Transport</option>
          <option>Entertainment</option>
          <option>Salary</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-full p-2 border rounded"
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Add
        </button>
      </div>
    </form>
  );
}
