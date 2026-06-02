import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        {eyebrow && (
          <div className="text-xs uppercase tracking-widest text-primary-glow font-medium">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-bold mt-1.5">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
