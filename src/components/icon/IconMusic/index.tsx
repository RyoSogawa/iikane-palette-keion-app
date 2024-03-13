import React from 'react';

export type IconMusicProps = React.ComponentPropsWithoutRef<'svg'>;

const IconMusic = React.forwardRef<SVGSVGElement, IconMusicProps>((props, forwardedRef) => {
  return (
    <svg
      ref={forwardedRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width="1em"
      height="1em"
      {...props}
    >
      <path
        d="M490.569 0 137.35 28.019v263.203l-.039 61.813c-7.777-1.848-15.801-2.778-23.973-2.778-50.683 0-91.918 36.282-91.918 80.875 0 44.59 41.234 80.867 91.918 80.867 50.684 0 91.922-36.278 91.922-80.867V114.114l201.394-15.692 16.004-1.234v164.297l-.039 39.153c-7.774-1.852-15.797-2.782-23.973-2.782-50.683 0-91.918 36.274-91.918 80.867 0 44.594 41.234 80.875 91.918 80.875 50.688 0 91.922-36.281 91.922-80.875V28.121L490.58.16h-.011V0zM95.291 393.297a170.057 170.057 0 0 0-8.054 11.129c-6.833 10.367-12.298 21.141-16.41 32-2.555 6.75-12.618 6.09-14.176-.953a42.4 42.4 0 0 1-1.008-9.203c0-18.722 12.168-35.187 30.352-44.211 7.128-3.54 14.226 4.988 9.296 11.238zm289.285-52.351a167.917 167.917 0 0 0-8.054 11.129c-6.836 10.367-12.301 21.144-16.414 32-2.554 6.75-12.617 6.094-14.175-.954a42.531 42.531 0 0 1-1.008-9.203c0-18.722 12.168-35.183 30.351-44.21 7.128-3.54 14.226 4.987 9.3 11.238z"
        fill="currentColor"
      />
    </svg>
  );
});

IconMusic.displayName = 'IconMusic';
export default IconMusic;
