import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'text', 
  width, 
  height 
}) => {
  const baseClasses = 'animate-pulse bg-slate-200 rounded';
  
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined)
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

interface StatCardSkeletonProps {
  className?: string;
}

export const StatCardSkeleton: React.FC<StatCardSkeletonProps> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-slate-200 p-6 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton width={60} height={20} />
    </div>
    <Skeleton width={120} height={32} className="mb-2" />
    <Skeleton width={80} height={16} />
  </div>
);

interface CourseCardSkeletonProps {
  className?: string;
}

export const CourseCardSkeleton: React.FC<CourseCardSkeletonProps> = ({ className = '' }) => (
  <div className={`bg-white rounded-lg border border-slate-200 overflow-hidden ${className}`}>
    <Skeleton height={120} className="w-full" />
    <div className="p-4">
      <Skeleton width={40} height={40} className="mx-auto mb-3 rounded-full" />
      <Skeleton height={20} className="mb-2" />
      <Skeleton height={16} className="mb-3" />
      <div className="flex items-center justify-between mb-3">
        <Skeleton width={80} height={20} />
        <Skeleton width={60} height={16} />
      </div>
      <Skeleton height={8} className="mb-2" />
      <Skeleton width="60%" height={8} />
    </div>
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon, 
  action, 
  className = '' 
}) => (
  <div className={`text-center py-12 ${className}`}>
    {icon && (
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 mb-6 max-w-md mx-auto">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default Skeleton;
