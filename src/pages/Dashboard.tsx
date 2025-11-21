// File: src/pages/Dashboard.tsx
import Chart from '../components/Chart';
import type { Transaction } from '../components/TransactionForm';

type Props = { items: (Transaction & { id: string })[] };

export default function Dashboard({ items }: Props) {
  return (
    <div className="space-y-6">
      {/* Summary area */}
      <section className="summary-grid">
        <div className="summary-item app-card">
          <div className="left">
            <div className="text-sm muted">Income</div>
            <div className="text-2xl font-semibold">₹{items.filter(i => i.type === 'income').reduce((s, c) => s + c.amount, 0).toFixed(2)}</div>
          </div>
          <div className="right text-sm muted">Monthly</div>
        </div>

        <div className="summary-item app-card">
          <div className="left">
            <div className="text-sm muted">Expense</div>
            <div className="text-2xl font-semibold">₹{items.filter(i => i.type === 'expense').reduce((s, c) => s + c.amount, 0).toFixed(2)}</div>
          </div>
          <div className="right text-sm muted">This month</div>
        </div>

        <div className="summary-item app-card">
          <div className="left">
            <div className="text-sm muted">Balance</div>
            <div className="text-2xl font-semibold">
              ₹{(items.filter(i => i.type === 'income').reduce((s, c) => s + c.amount, 0) - items.filter(i => i.type === 'expense').reduce((s, c) => s + c.amount, 0)).toFixed(2)}
            </div>
          </div>
          <div className="right text-sm muted">Available</div>
        </div>
      </section>

      {/* Main content */}
      <section className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <div className="app-card">
            <h3 className="text-lg font-semibold mb-3">Spending — Category Breakdown</h3>
            <Chart items={items} />
          </div>
        </div>

        <div>
          <div className="app-card">
            <h4 className="text-md font-semibold mb-2">Quick insights</h4>
            <p className="muted text-sm">This section will show helpful insights — top expense categories, unusual activity, and saving tips.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
