import React from 'react';

export type IconBassProps = React.ComponentPropsWithoutRef<'svg'>;

const IconBass = React.forwardRef<SVGSVGElement, IconBassProps>((props, forwardedRef) => {
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
        d="m76.029 398.984-13.941 13.941 40.126 40.116 13.776-13.775.06-.061h-.004l.109-.106zM145.78 339.592l-2.557-2.561-3.613-3.609-9.102 9.104 3.597 3.608 2.561 2.557 2.572 2.56 5.433 5.431 3.922 3.925 5.939 5.939 3.926 3.937.494.495 9.114-9.104-.508-.505zM142.688 386.246h.004l-3.926-3.922-5.939-5.939-3.922-3.926-5.434-5.43-2.572-2.571-2.557-2.561-3.612-3.609-8.96 8.975-.03.03-.11.109 3.609 3.609 2.557 2.561 2.572 2.571 5.434 5.431 3.922 3.925 17.855 17.851 2.561 2.561 3.597 3.598 8.953-8.952.041-.042h-.004l.11-.109-3.598-3.609-5.117-5.117zM145.177 364.023l-3.922-3.925-8.836 8.839h-.003l-.106.105 3.922 3.926zM142.171 378.907l3.922 3.923 8.832-8.817.003-.007.114-.106-3.926-3.937zM167.165 353.914l-.003.004-.11.109 3.922 3.925 1.957-1.957-3.925-3.921z"
        fill="currentColor"
      />
      <path
        d="m502.247 54.191-26.05-50.086c-1.162-2.236-3.273-3.706-5.807-4.034-2.526-.336-5.023.531-6.87 2.368l-26.378 26.389-1.859-1.859a2.864 2.864 0 0 1-.83-2.27l.63-7.373a2.874 2.874 0 0 0-.83-2.27l-1.086-1.086a2.866 2.866 0 0 0-4.054 0l-12.27 12.271a2.866 2.866 0 0 0 0 4.054l1.086 1.086c.596.6 1.426.902 2.27.83l7.372-.626a2.867 2.867 0 0 1 2.27.826l1.859 1.859-19.74 19.74-1.859-1.859a2.884 2.884 0 0 1-.83-2.27l.63-7.373a2.855 2.855 0 0 0-.83-2.27l-1.086-1.086a2.866 2.866 0 0 0-4.054 0l-12.27 12.27a2.866 2.866 0 0 0 0 4.054l1.086 1.086c.596.596 1.43.902 2.27.83l7.376-.63a2.865 2.865 0 0 1 2.266.83l1.859 1.859-10.528 10.518-6.06 20.341-.999 1.003-6.256 6.263-140.181 140.17-9.997 9.982c-3.345-3.858-9.526-15.834-2.757-25.813 9.982-14.751 11.396-14.751 20.122-24.688 9.186-10.43 10.83-23.176-1.425-35.417-4.718-4.721-17.539-13.074-37.265.422-13.726 9.39-28.946 28.09-37.182 46.379-8.764 19.484-15.74 37.642-32.193 54.094-12.447 12.444-27.716 17.554-45.39 23.478-5.396 1.798-10.974 3.669-16.754 5.845-16.589 6.203-29.674 13.206-39.983 21.4-14.379 11.411-23.686 25.424-27.668 41.65-4.683 19.062-4.118 38.12 1.69 56.65 6.373 20.378 19.172 40.274 38.038 59.14 43.313 43.313 84.563 42.589 100.292 40.27 11.649-1.723 22.984-7.108 32.762-15.582 10.999-9.502 17.953-19.16 25.665-38.327 7.858-19.496 18.01-49.075 31.533-64.936 4.612-5.419 23.658-23.915 39.825-28.32 2.496-.686 4.936-1.316 7.301-1.93 7.907-2.04 14.74-3.79 20.159-6.542 9.876-4.997 11.999-12.218 12.048-17.396.049-5.543-1.738-10.151-5.298-13.726-6.218-6.207-15.947-7.459-28.282-9.032-1.03-.132-2.078-.264-3.142-.407-13.952-1.829-24.138-6.535-33.693-15.619-.034-.034-.068-.06-.102-.094l166.766-166.766 6.264-6.252.942-.954 17.878-3.594 4.875-4.88 1.078 1.078c.6.6.902 1.43.83 2.27l-.626 7.376c-.072.841.23 1.67.83 2.27l1.086 1.086a2.873 2.873 0 0 0 4.054 0l12.27-12.27a2.87 2.87 0 0 0 0-4.058l-1.086-1.082a2.855 2.855 0 0 0-2.27-.83l-7.372.626a2.852 2.852 0 0 1-2.27-.83l-1.074-1.07 19.733-19.745 1.078 1.078c.6.596.902 1.426.83 2.27l-.626 7.372c-.072.841.23 1.674.83 2.27l1.082 1.086a2.866 2.866 0 0 0 4.054 0l12.27-12.27a2.858 2.858 0 0 0 0-4.054l-1.082-1.086a2.874 2.874 0 0 0-2.27-.83l-7.376.63a2.875 2.875 0 0 1-2.27-.83l-1.074-1.074 22.527-22.535c2.545-2.559 3.186-6.349 1.568-9.438zm-105.096 57.858 5.939 5.939-150.619 150.619-38.595 38.607-5.939-5.939 38.75-38.762 150.464-150.464zm-159.59 140.879 150.234-150.234 5.43 5.434-150.351 150.35-38.86 38.871-5.434-5.43 38.981-38.991zm-53.031-32.366c.882-1.991 1.776-3.994 2.681-6.01 6.905-15.378 20.435-32.366 32.132-40.357 7.067-4.838 12.886-6.022 17.038-3.549.128.075.249.166.374.249.505.336.995.702 1.448 1.15 5.781 5.785 5.973 9.718.784 15.623-2.232 2.534-3.986 4.419-5.517 6.071-4.997 5.347-8.183 8.91-15.729 20.062-4.363 6.441-5.788 13.485-5.407 20.193.003.087-.011.17-.008.257a268.088 268.088 0 0 0-16.81-.494c-4.001.026-7.923.249-11.856.442-1.787.053-3.635.075-5.396.128 2.205-4.602 4.249-9.202 6.266-13.765zm-59.536 225.065-16.249 16.249a9.246 9.246 0 0 1-13.062 0l-42.434-42.419c-3.598-3.598-3.598-9.466 0-13.063l16.249-16.249a9.227 9.227 0 0 1 6.531-2.704c2.478 0 4.793.966 6.531 2.704l6.328 6.328 7.99 8.002 3.922 3.926 5.939 5.939 3.926 3.922 7.991 7.991 2.56 2.56 3.763 3.767c3.613 3.597 3.613 9.45.015 13.047zm19.508 3.477a7.55 7.55 0 0 1 0-10.672 7.548 7.548 0 0 1 10.672 0 7.55 7.55 0 0 1 0 10.672 7.55 7.55 0 0 1-10.672 0zm20.148 29.794a7.547 7.547 0 0 1-10.671 0 7.547 7.547 0 0 1 0-10.671 7.547 7.547 0 0 1 10.671 0 7.549 7.549 0 0 1 0 10.671zm21.826-39.753a7.55 7.55 0 0 1-10.672 0 7.543 7.543 0 0 1 0-10.672 7.55 7.55 0 0 1 10.672 0 7.55 7.55 0 0 1 0 10.672zm10.378-91.091 2.561 2.557 13.281 13.293-15.936 15.921-15.838-15.838-2.561-2.56-26.834 26.838 2.56 2.561 2.557 2.556 7.026 7.026-15.933 15.936-7.025-7.025-5.121-5.118-17.49 17.49-5.434-5.43 17.494-17.493-3.926-3.922-17.49 17.49-5.939-5.939 17.49-17.49-3.798-3.797-.015-.019-.109-.11-17.494 17.494-5.43-5.434 17.49-17.49-2.56-2.561-2.557-2.56-7.026-7.026 15.933-15.932 7.029 7.025 2.557 2.557 2.56 2.561 8.945-8.945-2.572-2.561-2.556-2.557-7.014-7.025 15.932-15.936 7.026 7.025 2.561 2.557v.004l2.458 2.455.004.003.109.11 41.696-41.706 5.434 5.434-41.699 41.706 3.926 3.922 1.954-1.954-1.592-1.595 15.937-15.932 1.466 1.478.004.003.11.11 23.817-23.818 5.939 5.939-23.7 23.693-.008.004-.109.11 3.922 3.922 23.817-23.802 5.434 5.43-23.701 23.689-.007.008-.11.109 2.555 2.559zm49.436-54.555-23.059 23.071-5.43-5.434 38.498-38.509 150.713-150.714 5.434 5.43L246.29 293.499zM461.02 30.627l-55.516 55.504c-2.21 2.222-6.241.219-5.796-2.934 0-.034 0-.06.015-.083l.614-3.937a3.21 3.21 0 0 1 .894-1.761l53.586-53.586c1.026-1.029 2.67-1.282 3.97-.486a6.023 6.023 0 0 1 2.112 2.21l.618 1.101c.725 1.328.532 2.946-.497 3.972z"
        fill="currentColor"
      />
      <path
        d="m168.44 344.418-.026.023h.003l-.109.109 28.451 28.456 8.96-8.948.046-.046.109-.109-28.452-28.452z"
        fill="currentColor"
      />
    </svg>
  );
});

IconBass.displayName = 'IconBass';
export default IconBass;
