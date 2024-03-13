import React from 'react';

export type IconKeyboardProps = React.ComponentPropsWithoutRef<'svg'>;

const IconKeyboard = React.forwardRef<SVGSVGElement, IconKeyboardProps>((props, forwardedRef) => {
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
        d="M0 105.234v301.531h512V105.234H0zm436.602 151.95H414.05l-3.598-.047.016.047h-.168l6.031 19.289h9.75v81.254h-59.618v-81.254h9.715l4.633-14.726 1.434-4.402h-.051l.051-.16h-38.332l-3.598-.047.015.047h-.168l6.031 19.289h9.75v81.254h-59.618v-81.254h9.715l4.633-14.726 1.434-4.402h-.051l.051-.16h-38.332l-3.598-.047.015.047h-.168l6.031 19.289h9.75v81.254h-59.618V126.274h43.836V248h42.083V126.274h28.054V248h42.083V126.274h28.054V248h42.083V126.274h38.574v231.453h-54.355v-81.254h9.715l4.633-14.726 1.434-4.402h-.051l.051-.16h-15.779zm-280.548 0h-22.55l-3.598-.047.015.047h-.168l6.031 19.289h9.75v81.254H85.918v-81.254h9.715l4.629-14.726 1.438-4.402h-.05l.05-.16H63.363l-3.594-.047.015.047h-.168l6.032 19.289h9.75v81.254H21.043V126.274h38.574V248H101.7V126.274h28.054V248h42.083V126.274h43.836v231.453h-59.618v-81.254h9.715l4.633-14.722 1.434-4.406h-.051l.051-.16h-15.783z"
        fill="currentColor"
      />
    </svg>
  );
});

IconKeyboard.displayName = 'IconKeyboard';
export default IconKeyboard;
