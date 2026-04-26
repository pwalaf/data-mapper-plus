import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
} from "@workspace/api-client-react";
import { ResourcePage } from "@/components/schema/ResourcePage";

export default function Products() {
  const { data, isLoading } = useListProducts();
  return (
    <ResourcePage
      resource="products"
      titleKey="products.title"
      subtitleKey="products.subtitle"
      data={data}
      isLoading={isLoading}
      listQueryKey={getListProductsQueryKey()}
      createMutation={useCreateProduct()}
      updateMutation={useUpdateProduct()}
      deleteMutation={useDeleteProduct()}
    />
  );
}
