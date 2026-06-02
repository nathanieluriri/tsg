import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Transactions' };

export default function TransactionsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Transactions</h1>
      <p className="text-gray-500">Transactions tracking is not yet enabled.</p>
    </>
  );
}
