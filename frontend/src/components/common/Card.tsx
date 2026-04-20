import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  onClick,
  hover = false,
}: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow cursor-pointer' : '';
  
  return (
    <div
      className={`bg-white/90 dark:bg-gray-800/75 backdrop-blur-md rounded-lg shadow-md border border-gray-200/30 dark:border-gray-700/30 p-6 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Made with Bob