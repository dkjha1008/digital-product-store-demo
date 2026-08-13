import { FormPage } from "@/components/ui/form-page";
import { ProductForm } from "@/components/product-form";

export default function NewProductPage() {
  return (
    <FormPage title="New product">
      <ProductForm />
    </FormPage>
  );
}
