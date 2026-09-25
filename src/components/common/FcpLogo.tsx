import React, { useState } from 'react';

interface FcpLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'dark' | 'light';
}

export const OFFICIAL_LOGO_SRC = '/src/assets/images/regenerated_image_1790330971091.png';

export const FcpLogo: React.FC<FcpLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'light',
}) => {
  const [imgError, setImgError] = useState(false);

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official Emblem: Sun, Airplane, Waves & Cruise Ship */}
      <div className={`relative shrink-0 ${iconSizes[size]} rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-[#FFDF00] via-[#1498CC] to-[#FFDF00] shadow-sm`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
          {!imgError ? (
            <img
              src={OFFICIAL_LOGO_SRC}
              alt="FCP Sunrise Travel & Tours Inc. Official Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none">
              <circle cx="50" cy="50" r="46" fill="#0A2A43" stroke="#FFDF00" strokeWidth="3" />
              <path d="M50 20 L50 12 M28 30 L22 24 M72 30 L78 24" stroke="#FFDF00" strokeWidth="4" strokeLinecap="round" />
              <circle cx="50" cy="45" r="18" fill="#FFDF00" />
              <path d="M15 65 Q 50 50, 85 65 L85 85 L15 85 Z" fill="#1498CC" />
            </svg>
          )}
        </div>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col text-left leading-none select-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight font-sans ${titleSizes[size]} ${
                isDark ? 'text-white' : 'text-[#0A2A43]'
              }`}
            >
              FCP SUNRISE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1498CC]" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#1498CC] mt-0.5">
            Travel & Tours Inc.
          </span>
        </div>
      )}
    </div>
  );
};
