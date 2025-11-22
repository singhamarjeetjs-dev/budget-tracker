/* eslint-disable @typescript-eslint/no-explicit-any */
// src/firestore/transactions.ts
import {
  db,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  serverTimestamp,
  getDocs,
} from '../firebase';
import type { Unsubscribe } from 'firebase/firestore';
import type { Transaction } from '../components/TransactionForm';

const txCol = collection(db, 'transactions');

export async function addTransactionForUser(uid: string, t: Omit<Transaction, 'id'>) {
  const payload = {
    uid,
    amount: t.amount,
    category: t.category,
    date: t.date,
    note: t.note ?? '',
    type: t.type,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(txCol, payload);
  return ref.id;
}

export async function deleteTransactionById(id: string) {
  const ref = doc(db, 'transactions', id);
  await deleteDoc(ref);
}

/**
 * One-time fetch: returns all transactions for user (ordered by date desc).
 * Strictly filtered by uid.
 */
export async function getUserTransactions(uid: string): Promise<(Transaction & { id: string })[]> {
  const q = query(txCol, where('uid', '==', uid), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as any;
    return {
      id: d.id,
      amount: Number(data.amount || 0),
      category: data.category || 'General',
      date: data.date || new Date().toISOString().slice(0, 10),
      note: data.note || '',
      type: data.type === 'income' ? 'income' : 'expense',
    } as Transaction & { id: string };
  });
}

/**
 * Realtime listener (strict uid filter).
 * Returns unsubscribe.
 */
export function listenToUserTransactions(
  uid: string,
  onUpdate: (items: (Transaction & { id: string })[]) => void,
): Unsubscribe {
  const q = query(txCol, where('uid', '==', uid), orderBy('date', 'desc'));
  const unsub = onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          amount: Number(data.amount || 0),
          category: data.category || 'General',
          date: data.date || new Date().toISOString().slice(0, 10),
          note: data.note || '',
          type: data.type === 'income' ? 'income' : 'expense',
        } as Transaction & { id: string };
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Realtime listener error (uid query):', err?.message ?? err);
    },
  );
  return unsub;
}
