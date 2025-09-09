import React from "react";

interface LogoProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = "primary",
  size = "md",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary-green-500 text-white hover:bg-primary-green-600 focus:ring-primary-green-500 shadow-sm hover:shadow-md",
    secondary:
      "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
    outline:
      "border-2 border-primary-green-500 text-primary-green-600 hover:bg-primary-green-50 focus:ring-primary-green-500",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-500",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-4 py-2.5 text-base rounded-lg",
    lg: "px-6 py-3 text-lg rounded-xl",
  };

  const sizesSVG = {
    sm: "20px",
    md: "30px",
    lg: "40px",
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <div className="inline-flex items-center justify-center gap-4">
      <svg
        fill="#000000"
        height={sizesSVG[size]}
        width={sizesSVG[size]}
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 512 512"
        xmlSpace="preserve"
      >
        <g>
          <g>
            <path
              d="M508.74,95.69L389.274,1.823c-2.56-2.014-6.05-2.389-9.003-0.964c-2.935,1.425-4.804,4.403-4.804,7.671v51.635
			c-45.602,4.634-85.598,45.645-119.467,88.158c-33.869-42.513-73.865-83.524-119.467-88.158V8.531c0-3.268-1.869-6.246-4.796-7.671
			c-2.953-1.425-6.434-1.05-9.011,0.964L3.26,95.69C1.203,97.303,0,99.777,0,102.397c0,2.62,1.203,5.094,3.26,6.707l119.467,93.867
			c2.577,2.022,6.059,2.406,9.011,0.964c2.927-1.425,4.796-4.403,4.796-7.672v-50.475c41.566,7.1,76.8,64.41,76.8,110.208v247.467
			c0,4.71,3.814,8.533,8.533,8.533h68.267c4.719,0,8.533-3.823,8.533-8.533V255.997c0-45.798,35.234-103.108,76.8-110.208v50.475
			c0,3.268,1.869,6.246,4.804,7.672c2.953,1.442,6.443,1.058,9.003-0.964l119.467-93.867c2.057-1.613,3.26-4.087,3.26-6.707
			C512,99.777,510.797,97.303,508.74,95.69z"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export const LogoWithText: React.FC<LogoProps> = ({
  variant = "primary",
  size = "md",
  className = "",
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <Logo variant={variant} size={size} />
      <p
        className={`text-center font-logo font-bold text-m text-slate-500 ${className}`}
      >
        Kairos
      </p>
    </div>
  );
};