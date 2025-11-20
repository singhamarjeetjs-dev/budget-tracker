import type { Transaction } from "./TransactionForm";

type Props = {
  items: Transaction[];
  onDelete: (id: string) => void;
};

export default function TransactionList({ items, onDelete }: Props) {
  if (items.length === 0)
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-300">
        No transactions yet — add one from the form.
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="font-medium">Transactions</div>
        <div className="text-sm text-gray-500">Recent first</div>
      </div>
      <ul>
        {items.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between p-4 border-b last:border-b-0"
          >
            <div>
              <div className="font-medium">
                {t.category}{" "}
                <span className="text-sm text-gray-400">· {t.date}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-300">
                {t.note}
              </div>
            </div>
            <div className="text-right">
              <div
                className={`font-semibold ${
                  t.type === "expense" ? "text-red-500" : "text-green-500"
                }`}
              >
                {t.type === "expense" ? "-" : "+"}₹{t.amount.toFixed(2)}
              </div>
              <button
                onClick={() => onDelete(t.id)}
                className="text-xs text-red-500 mt-1"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
