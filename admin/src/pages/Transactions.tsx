import {
  useListTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  getListTransactionsQueryKey,
} from "@workspace/api-client-react";
import { ResourcePage } from "@/components/schema/ResourcePage";

export default function Transactions() {
  const { data, isLoading } = useListTransactions();
  return (
    <ResourcePage
      resource="transactions"
      titleKey="transactions.title"
      subtitleKey="transactions.subtitle"
      data={data}
      isLoading={isLoading}
      listQueryKey={getListTransactionsQueryKey()}
      createMutation={useCreateTransaction()}
      updateMutation={useUpdateTransaction()}
      deleteMutation={useDeleteTransaction()}
    />
  );
}
