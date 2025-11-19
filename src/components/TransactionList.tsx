import type { Transaction } from "./TransactionForm";

type Props = {
  items: Transaction[];
  onDelete: (id: string) => void;
};

export default function TransactionList({ items, onDelete }: Props) {
  if (items.length === 0)
    return (
      <div className="p-6 text-center text-gray-500">
        No transactions yet — add one from the form.
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <ul>
        {items.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between p-3 border-b last:border-b-0"
          >
            <div>
              <div className="font-medium">
                {t.category} ·{" "}
                <span className="text-sm text-gray-500">{t.date}</span>
              </div>
              <div className="text-sm text-gray-600">{t.note}</div>
            </div>
            <div className="text-right">
              <div
                className={`font-semibold ${
                  t.type === "expense" ? "text-red-600" : "text-green-600"
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
