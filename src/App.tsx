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
import { listenToUserTransactions, addTransactionForUser, deleteTransactionById } from './firestore/transactions';
import './App.css';

export default function App() {
  const [dark] = useLocalStorage<boolean>('dark', false);
  const [items, setItems] = useState<(Transaction & { id: string })[]>([]);
  const { user, loading } = useAuth();

  // 1) Clear items when user logs out (separate effect to avoid ESLint warning)
  useEffect(() => {
    if (loading) return;
    if (!user) {
      // only set if there is something to clear (avoids unnecessary state update)
      setItems((prev) => (prev.length ? [] : prev));
    }
  }, [user, loading, setItems]);

  // 2) Attach listener when a user is present (separate effect)
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const unsub = listenToUserTransactions(user.uid, (list) => {
      setItems(list);
    });

    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, loading, setItems]);

  // Optimistic add: update UI immediately with a temp id, then write to Firestore.
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
      // realtime listener will reconcile authoritative data
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
    // listener will update state
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
