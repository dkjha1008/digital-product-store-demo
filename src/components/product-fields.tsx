import { Field } from "@/components/ui/field";
import type { Product } from "@/db/schema";
import {
  DEFAULT_CURRENCY,
  PRODUCT_FILE_ACCEPT,
  PRODUCT_FILE_HINT,
  THUMBNAIL_FILE_ACCEPT,
  THUMBNAIL_FILE_HINT,
} from "@/lib/config/constants";
import type { FieldErrors } from "@/lib/validators/parse";

type Props = {
  product?: Pick<
    Product,
    "name" | "description" | "priceMinor" | "currency" | "status" | "fileName"
  >;
  errors?: FieldErrors;
};

export function ProductFields({ product, errors = {} }: Props) {
  return (
    <>
      <Field label="Name" htmlFor="name" error={errors.name}>
        <input
          id="name"
          name="name"
          defaultValue={product?.name}
          aria-invalid={Boolean(errors.name)}
        />
      </Field>
      <Field label="Description" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          aria-invalid={Boolean(errors.description)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Price (cents)" htmlFor="priceMinor" error={errors.priceMinor}>
          <input
            id="priceMinor"
            name="priceMinor"
            inputMode="numeric"
            placeholder="1999 = $19.99"
            defaultValue={product?.priceMinor}
            aria-invalid={Boolean(errors.priceMinor)}
          />
        </Field>
        <Field label="Currency" htmlFor="currency" error={errors.currency}>
          <select
            id="currency"
            name="currency"
            defaultValue={product?.currency ?? DEFAULT_CURRENCY}
            aria-invalid={Boolean(errors.currency)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </Field>
      </div>
      <Field label="Status" htmlFor="status" error={errors.status}>
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? "draft"}
          aria-invalid={Boolean(errors.status)}
        >
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
        hint={PRODUCT_FILE_HINT}
        error={errors.file}
      >
        <input
          id="file"
          name="file"
          type="file"
          accept={PRODUCT_FILE_ACCEPT}
          aria-invalid={Boolean(errors.file)}
        />
      </Field>
      <Field
        label={product ? "Replace thumbnail (optional)" : "Thumbnail (optional)"}
        htmlFor="thumbnail"
        hint={THUMBNAIL_FILE_HINT}
        error={errors.thumbnail}
      >
        <input
          id="thumbnail"
          name="thumbnail"
          type="file"
          accept={THUMBNAIL_FILE_ACCEPT}
          aria-invalid={Boolean(errors.thumbnail)}
        />
      </Field>
    </>
  );
}
