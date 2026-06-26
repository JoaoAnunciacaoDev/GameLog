import { ReactNode } from 'react';
import styles from './PageTitle.module.css';

interface PageTitleProps {
  children: ReactNode;
  level?: 'h1' | 'h2';
  className?: string;
}

export default function PageTitle({ children, level: Tag = 'h1', className = '' }: PageTitleProps) {
  return (
    <Tag className={`${styles.title} ${styles[Tag]} ${className}`}>
      {children}
    </Tag>
  );
}