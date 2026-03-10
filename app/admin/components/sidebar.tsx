export default function AdminSidebar({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return <aside className={`${className}`}>{children}</aside>;
}
