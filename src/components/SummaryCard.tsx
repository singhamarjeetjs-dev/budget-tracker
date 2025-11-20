import type { Transaction } from "./TransactionForm";

type Props = { items: Transaction[] };

export default function SummaryCard({ items }: Props) {
  const income = items
    .filter((i) => i.type === "income")
    .reduce((s, c) => s + c.amount, 0);
  const expense = items
    .filter((i) => i.type === "expense")
    .reduce((s, c) => s + c.amount, 0);
  const balance = income - expense;

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <div className="text-sm text-gray-500">Income</div>
        <div className="text-xl font-semibold">₹{income.toFixed(2)}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <div className="text-sm text-gray-500">Expense</div>
        <div className="text-xl font-semibold">₹{expense.toFixed(2)}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <div className="text-sm text-gray-500">Balance</div>
        <div className="text-xl font-semibold">₹{balance.toFixed(2)}</div>
      </div>
    </div>
  );
}
