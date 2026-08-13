import { Card } from "@/components/ui/card";

type Props = {
  children: React.ReactNode;
};

export function AuthShell({ children }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md">{children}</Card>
    </div>
  );
}
