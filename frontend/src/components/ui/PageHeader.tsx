import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="heading-display text-2xl sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
