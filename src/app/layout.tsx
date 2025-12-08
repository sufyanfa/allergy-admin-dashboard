import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Allergy Checker Admin Dashboard',
  description: 'Admin dashboard for managing allergy checker application',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}