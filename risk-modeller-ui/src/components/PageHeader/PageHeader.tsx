import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional actions rendered on the right (buttons, menus, etc.). */
  actions?: ReactNode;
}

/**
 * App-local page header reused across screens within this app. Generic enough
 * to be consistent, specific enough that it does not belong in the shared lib.
 */
export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => (
  <header className={styles.header}>
    <div>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </header>
);
