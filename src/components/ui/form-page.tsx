import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type Props = {
  title: string;
  children: React.ReactNode;
};

export function FormPage({ title, children }: Props) {
  return (
    <div>
      <PageHeader title={title} />
      <Card className="max-w-xl">{children}</Card>
    </div>
  );
}
