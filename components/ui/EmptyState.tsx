interface EmptyStateProps {
  children: React.ReactNode;
}

export function EmptyState({ children }: EmptyStateProps) {
  return <div className="text-dim p-5 text-center text-sm">{children}</div>;
}
