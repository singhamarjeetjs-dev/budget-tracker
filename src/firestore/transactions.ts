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

/**
 * Listen to user's transactions in realtime.
 * Primary ordering: by `date` desc (avoids requiring composite index).
 * Returns unsubscribe function.
 */
export function listenToUserTransactions(
  uid: string,
  onUpdate: (items: (Transaction & { id: string })[]) => void,
): Unsubscribe {
  const primaryQuery = query(txCol, where('uid', '==', uid), orderBy('date', 'desc'));

  const mapSnap = (snap: any) =>
    snap.docs.map((d: any) => {
      const data = d.data();
      return {
        id: d.id,
        amount: data.amount,
        category: data.category,
        date: data.date,
        note: data.note,
        type: data.type,
      } as Transaction & { id: string };
    });

  const unsubscribe = onSnapshot(
    primaryQuery,
    (snap) => {
      onUpdate(mapSnap(snap));
    },
    (error) => {
      // Log error and surface fallback behavior; we don't attach additional listeners here
      console.warn(`Firestore listener error: ${error?.message || error}`);
    },
  );

  return unsubscribe;
}

export async function deleteTransactionById(id: string) {
  const ref = doc(db, 'transactions', id);
  await deleteDoc(ref);
}
