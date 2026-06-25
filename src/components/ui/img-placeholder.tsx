import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ResponsivePlaceholderProps {
  query?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  quality?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: string;
}

export function ResponsivePlaceholder({
  query = 'placeholder image',
  alt = 'Placeholder image',
  className = '',
  priority = false,
  quality = 75,
  objectFit = 'cover',
  aspectRatio,
}: ResponsivePlaceholderProps) {
  // Use a reasonable default size for the placeholder URL
  // The actual display size will be controlled by CSS
  const placeholderUrl = `/placeholder.svg?height=600&width=800&query=${encodeURIComponent(
    query
  )}`;

  return (
    <div className={cn('w-full h-full', className)}>
      <svg
        width="400"
        height="400"
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="rounded-md w-full h-full"
      >
        {/* Circular pattern */}
        <g
          stroke="#e0e0e0"
          strokeWidth="1"
          fill="none"
        >
          <circle
            cx="200"
            cy="200"
            r="60"
          />
          <circle
            cx="200"
            cy="200"
            r="80"
          />

          {/* Radiating lines */}
          <line
            x1="120"
            y1="200"
            x2="280"
            y2="200"
          />
          <line
            x1="200"
            y1="120"
            x2="200"
            y2="280"
          />
          <line
            x1="141"
            y1="141"
            x2="259"
            y2="259"
          />
          <line
            x1="259"
            y1="141"
            x2="141"
            y2="259"
          />
        </g>

        {/* Center circle with image icon */}
        <circle
          cx="200"
          cy="200"
          r="30"
          fill="transparent"
          stroke="#e0e0e0"
          strokeWidth="1"
        />
        <g transform="translate(185, 185)">
          <rect
            x="0"
            y="0"
            width="30"
            height="24"
            rx="2"
            fill="none"
            stroke="#c0c0c0"
            strokeWidth="2"
          />
          <circle
            cx="8"
            cy="8"
            r="3"
            fill="#c0c0c0"
          />
          <polyline
            points="0,18 10,12 20,16 30,8"
            stroke="#c0c0c0"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
