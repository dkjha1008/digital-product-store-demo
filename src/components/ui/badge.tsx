type Props = {
  tone: string;
  children: React.ReactNode;
};

export function Badge({ tone, children }: Props) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
