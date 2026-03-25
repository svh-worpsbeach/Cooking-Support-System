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
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// Made with Bob