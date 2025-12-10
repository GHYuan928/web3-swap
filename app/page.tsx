import { redirect } from 'next/navigation'

// 根路由重定向到 /swap
export default function RootPage() {
  redirect('/swap')
}

