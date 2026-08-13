import { Field } from "@/components/ui/field";
import type { Product } from "@/db/schema";
import { DEFAULT_CURRENCY } from "@/lib/config/constants";

type Props = {
  product?: Pick<
    Product,
    "name" | "description" | "priceMinor" | "currency" | "status" | "fileName"
  >;
  fileRequired?: boolean;
};

export function ProductFields({ product, fileRequired = false }: Props) {
  return (
    <>
      <Field label="Name" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          maxLength={200}
          defaultValue={product?.name}
        />
      </Field>
      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={5000}
          defaultValue={product?.description ?? ""}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (cents)" htmlFor="priceMinor">
          <input
            id="priceMinor"
            name="priceMinor"
            type="number"
            min={0}
            step={1}
            required
            placeholder="1999 = $19.99"
            defaultValue={product?.priceMinor}
          />
        </Field>
        <Field label="Currency" htmlFor="currency">
          <select
            id="currency"
            name="currency"
            defaultValue={product?.currency ?? DEFAULT_CURRENCY}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </Field>
      </div>
      <Field label="Status" htmlFor="status">
        <select id="status" name="status" defaultValue={product?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </Field>
      <Field
        label={
          product
            ? `Replace file (optional) — current: ${product.fileName}`
            : "Digital file"
        }
        htmlFor="file"
      >
        <input id="file" name="file" type="file" required={fileRequired} />
      </Field>
      <Field
        label={product ? "Replace thumbnail (optional)" : "Thumbnail (optional)"}
        htmlFor="thumbnail"
      >
        <input id="thumbnail" name="thumbnail" type="file" accept="image/*" />
      </Field>
    </>
  );
}
