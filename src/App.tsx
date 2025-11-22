// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Transaction } from './components/TransactionForm';
import { useEffect, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import {
  listenToUserTransactions,
  addTransactionForUser,
  deleteTransactionById,
  getUserTransactions,
} from './firestore/transactions';

export default function App() {
  const [dark] = useLocalStorage<boolean>('dark', false);
  const [items, setItems] = useState<(Transaction & { id: string })[]>([]);
  const { user, loading } = useAuth();

  // Clear items when user logs out (separate effect)
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setItems((prev) => (prev.length ? [] : prev));
    }
  }, [user, loading]);

  // inside App.tsx (replace the login/init useEffect)
useEffect(() => {
  if (loading) return;
  if (!user) return;

  let unsub = () => {};

  (async () => {
    try {
      console.info('Transaction init for uid:', user.uid);

      // 1) One-shot fetch strictly by uid (no broad queries)
      const initial = await getUserTransactions(user.uid);
      setItems(initial);

      // 2) Attach realtime listener strictly by uid
      unsub = listenToUserTransactions(user.uid, (list) => {
        setItems(list);
      });
    } catch (e) {
      console.error('Error initializing transactions for user:', e);
    }
  })();

  return () => {
    // eslint-disable-next-line no-empty
    try { unsub(); } catch {}
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [user?.uid, loading]);


  // Optimistic add
  const handleAdd = async (t: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error('Not authenticated');

    const tempId = `temp-${Date.now()}`;
    const optimisticItem: Transaction & { id: string } = {
      id: tempId,
      amount: t.amount,
      category: t.category,
      date: t.date,
      note: t.note ?? '',
      type: t.type,
    };

    setItems((prev) => [optimisticItem, ...prev]);

    try {
      await addTransactionForUser(user.uid, t);
    } catch (err) {
      console.error('Failed to add transaction:', err);
      setItems((prev) => prev.filter((it) => it.id !== tempId));
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('temp-')) {
      setItems((prev) => prev.filter((it) => it.id !== id));
      return;
    }
    await deleteTransactionById(id);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Checking authentication…</div>;

  return (
    <div className={dark ? 'min-h-screen bg-gray-900 text-white' : 'min-h-screen bg-gray-50 text-gray-900'}>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>
                <Header />
                <div className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-3">
                    <Sidebar />
                  </div>
                  <div className="lg:col-span-9">
                    <Dashboard items={items} />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <div>
                <Header />
                <div className="max-w-7xl mx-auto px-6 py-6 grid lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-3">
                    <Sidebar />
                  </div>
                  <div className="lg:col-span-9">
                    <TransactionsPage items={items} onAdd={handleAdd} onDelete={handleDelete} />
                  </div>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
