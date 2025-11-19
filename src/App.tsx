import Header from "./components/Header";
import TransactionForm, {
  type Transaction,
} from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import SummaryCard from "./components/SummaryCard";
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  const [items, setItems] = useLocalStorage<Transaction[]>("tx", []);

  const add = (t: Transaction) => setItems([t, ...items]);
  const del = (id: string) => setItems(items.filter((x) => x.id !== id));

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        <section>
          <SummaryCard items={items} />
        </section>

        <section className="grid md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-1">
            <TransactionForm onAdd={add} />
          </div>

          <div className="md:col-span-2">
            <h2 id="transactions" className="text-lg font-medium mb-2">
              Transactions
            </h2>
            <TransactionList items={items} onDelete={del} />
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500 py-8">
          Built with React + Vite • Deploy on Vercel
        </footer>
      </main>
    </div>
  );
}
