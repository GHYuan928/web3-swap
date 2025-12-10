// 这是嵌套 layout，只包含内容布局
// Header 已经在根 layout (app/layout.tsx) 中处理
export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
