import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
}

export default function Section({ id, title, icon, count, action, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-white/5 py-10 first:border-t-0">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <h2 className="flex items-center justify-center gap-2.5 text-xl font-semibold tracking-tight text-white">
          <span className="text-red-500">{icon}</span>
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-zinc-300">
              {count.toLocaleString()}
            </span>
          )}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
