import TrxTable from "./_components/trx-table";

export default function TransactionsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <TrxTable />
    </div>
  );
}
