import React from "react";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Loading Card for card-based layouts
type LoadingCardProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

type LoadingDotsProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const cardSizeMap = {
  sm: {
    container: "p-3 rounded-lg",
    title: "h-2 w-1/3",
    text: "h-1.5",
    button: "h-3 w-12",
  },
  md: {
    container: "p-6 rounded-xl",
    title: "h-3 w-1/2",
    text: "h-2",
    button: "h-4 w-20",
  },
  lg: {
    container: "p-8 rounded-2xl",
    title: "h-3 w-2/3",
    text: "h-3",
    button: "h-5 w-28",
  },
};

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  className = "",
}) => {
  const dotSizes = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3",
  };

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <div
        className={`${dotSizes[size]} bg-primary-green-400 rounded-full animate-bounce [animation-delay:-0.3s]`}
      ></div>
      <div
        className={`${dotSizes[size]} bg-primary-green-400 rounded-full animate-bounce [animation-delay:-0.15s]`}
      ></div>
      <div
        className={`${dotSizes[size]} bg-primary-green-400 rounded-full animate-bounce`}
      ></div>
    </div>
  );
};

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "",
  fullScreen = true,
  size = "lg",
  className = "",
}) => {
  const containerClasses = fullScreen
    ? "min-h-screen flex items-center justify-center bg-grey-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center space-y-4">
        <div>{message}</div>
        {/* Animated Dots */}
        <LoadingDots size={size} />
      </div>
    </div>
  );
};

// Compact Loading Spinner for smaller spaces
export const LoadingSpinner: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} text-primary-green-500`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

// Loading Skeleton for content placeholders
export const LoadingSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = "" }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-grey-200 rounded w-full"></div>
          {i === lines - 1 && (
            <div className="h-4 bg-grey-200 rounded w-2/3"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export const LoadingCard: React.FC<LoadingCardProps> = ({
  size = "md",
  className = "",
}) => {
  const styles = cardSizeMap[size];

  return (
    <div
      className={`bg-white shadow-lg animate-pulse ${styles.container} ${className}`}
    >
      <div className="space-y-4">
        <div className={`${styles.title} bg-gray-200 rounded`}></div>

        <div className="space-y-2">
          <div className={`${styles.text} bg-gray-200 rounded`}></div>
          <div className={`${styles.text} bg-gray-200 rounded w-5/6`}></div>
          <div className={`${styles.text} bg-gray-200 rounded w-4/6`}></div>
        </div>

        <div className="flex space-x-3">
          <div className={`${styles.button} bg-gray-200 rounded`}></div>
          <div className={`${styles.button} bg-gray-200 rounded`}></div>
        </div>
      </div>
    </div>
  );
};
