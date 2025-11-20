import Chart from "../components/Chart";
import SummaryCard from "../components/SummaryCard";
import type { Transaction } from "../components/TransactionForm";

type Props = { items: Transaction[] };

export default function Dashboard({ items }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        <SummaryCard items={items} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Chart items={items} />
        </div>
        <div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            Quick tips and insights will appear here.
          </div>
        </div>
      </div>
    </div>
  );
}
