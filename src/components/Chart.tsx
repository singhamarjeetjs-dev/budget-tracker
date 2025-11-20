/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { Transaction } from "./TransactionForm";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = { items: Transaction[] };

export default function Chart({ items }: Props) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((t) => {
      if (t.type === "expense") {
        map.set(t.category, (map.get(t.category) || 0) + t.amount);
      }
    });
    const labels = Array.from(map.keys());
    const values = Array.from(map.values());
    return {
      labels,
      datasets: [
        {
          label: "Expenses by category",
          data: values,
          backgroundColor: [
            "rgba(99,102,241,0.8)",
            "rgba(236,72,153,0.8)",
            "rgba(16,185,129,0.8)",
            "rgba(34,197,94,0.8)",
            "rgba(249,115,22,0.8)",
          ],
        },
      ],
    };
  }, [items]);

  if (!data.labels || data.labels.length === 0)
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-300">
        No expense data to show
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="font-medium mb-2">Category Breakdown</h3>
      <Pie data={data as any} />
    </div>
  );
}
