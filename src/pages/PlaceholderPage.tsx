import { MainLayout } from '@/layouts/MainLayout';

export function PlaceholderPage({ title }: { title: string }) {
  return <MainLayout><section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"><h1 className="text-4xl font-extrabold text-primary-900">{title}</h1><p className="mt-4 text-earth-700">This page content is currently under development.</p></section></MainLayout>;
}
