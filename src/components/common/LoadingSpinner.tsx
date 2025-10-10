import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Ładowanie...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex flex-col items-center justify-center h-32 space-y-2">
      <div 
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
        role="status"
        aria-label={text}
      />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
};