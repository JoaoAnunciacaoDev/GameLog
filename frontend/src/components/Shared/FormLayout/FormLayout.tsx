import { FormEvent, ReactNode } from 'react';
import styles from './FormLayout.module.css';

interface FormLayoutProps {
  children: ReactNode;
  onSubmit?: (e: FormEvent) => void;
  className?: string;
}

export default function FormLayout({ children, onSubmit, className = '' }: FormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className={`${styles.form} ${className}`}>
      {children}
    </form>
  );
}