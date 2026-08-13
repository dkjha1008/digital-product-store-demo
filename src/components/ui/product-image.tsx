import Image from "next/image";

type Props = {
  src?: string | null;
  alt: string;
  className: string;
  placeholderClassName: string;
};

export function ProductImage({ src, alt, className, placeholderClassName }: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={800}
        height={400}
        className={className}
        unoptimized
      />
    );
  }

  return (
    <div
      className={`bg-gray-100 flex items-center justify-center text-[var(--muted)] ${placeholderClassName}`}
    >
      No image
    </div>
  );
}
