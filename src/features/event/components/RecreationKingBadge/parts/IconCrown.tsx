'use client';

import React, { useId } from 'react';

export type CrownColor = 'gold' | 'silver' | 'bronze';

const GradientColorMap: Record<CrownColor, [string, string, string]> = {
  gold: ['#FFFACD', '#FFD700', '#FFA500'],
  silver: ['#F0F0F0', '#C0C0C0', '#E0E0E0'],
  bronze: ['#FFDAB9', '#CD853F', '#D2691E'],
};

export type IconCrownProps = {
  crownColor: CrownColor;
};

const IconCrown: React.FC<IconCrownProps> = ({ crownColor }) => {
  const id = useId();

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: GradientColorMap[crownColor][0], stopOpacity: 1 }}
          />
          <stop
            offset="50%"
            style={{ stopColor: GradientColorMap[crownColor][1], stopOpacity: 1 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: GradientColorMap[crownColor][2], stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>
      <path
        d="M256 0C114.617 0 0 114.617 0 256c0 141.39 114.617 256 256 256s256-114.61 256-256C512 114.617 397.383 0 256 0m47.274 213.93.031-.043.094.137 31.75-41.367c6.706-8.938 21.015-4.015 21.015 7.164v113.266H155.836V179.82c0-11.179 14.313-16.102 21.242-7.164l23.953 31.434 7.438 9.844.027-.043.106.133 37.789-54.766c4.692-6.718 14.527-6.718 19.223 0l28.859 41.828zM155.836 350.18v-28.618h200.328v28.618c0 4.242-3.578 7.609-7.828 7.609H163.664c-4.25 0-7.828-3.367-7.828-7.609"
        fill={`url(#${id})`}
      />
    </svg>
  );
};

export default IconCrown;
