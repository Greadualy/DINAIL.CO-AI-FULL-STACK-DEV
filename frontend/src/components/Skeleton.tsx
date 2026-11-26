import type { CSSProperties } from 'react';

export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export default function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer ${className}`.trim()}
      style={{
        borderRadius: 12,
        ...style,
      }}
    />
  );
}
