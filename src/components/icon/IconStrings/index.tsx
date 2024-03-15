import React from 'react';

export type IconStringsProps = React.ComponentPropsWithoutRef<'svg'>;

const IconStrings = React.forwardRef<SVGSVGElement, IconStringsProps>((props, forwardedRef) => {
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
        d="M511.373 173.893c-2.774-12.274-13.41-22.23-24.442-31.11a327.027 327.027 0 0 0-16.238-12.254 84.454 84.454 0 0 1-1.696-1.301l10.016-2.965 4.754-10.863 2.602-5.992 7.011-16.071-74.782-74.782-16.012 7.07-6.051 2.66-10.805 4.809-1.875 6.183-1.25 3.782c-2.726-4.078-7.383-10.531-13.336-17.942C360.331 14.031 350.374 3.394 338.1.62L335.441 0l-10.41 10.406.625 2.664c1.809 7.918 6.899 14.821 13.235 21.157 3.453 3.445 7.355 6.785 11.312 9.953 12.051 9.79 21.841 16.063 22.235 16.352l3.336 2.094.938-.938.695-.546-2.707 9.008-.168.617-41.466 41.47c-32.699 32.695-62.794 49.782-110.876 62.903a848.09 848.09 0 0 1-12.898 3.504c-27.606 7.469-56.173 15.218-83.666 26.305-29.867 11.992-53.344 26.078-71.841 43.11-11.77 10.75-21.894 22.798-30.098 35.864C6.097 311.809-1.88 342.528.382 372.848c2.602 33.829 18.329 66.071 45.536 93.282 27.153 27.157 59.399 42.88 93.228 45.482 30.379 2.316 61.094-5.77 88.926-23.309 13.067-8.199 25.118-18.325 35.922-30.036 16.969-18.554 31.055-42.031 43.048-71.899 11.09-27.493 18.84-56.173 26.363-83.833a789.851 789.851 0 0 1 3.45-12.731c13.121-48.082 30.207-78.176 62.903-110.876l19.89-19.887 21.918-21.672.281-.078 4.997-1.461 4.09-1.058-1.508 1.504 2.035 3.282c.286.398 6.566 10.179 16.406 22.289 3.114 3.902 6.45 7.805 9.958 11.313 6.277 6.282 13.18 11.371 21.098 13.18l2.66.625 10.41-10.41-.62-2.662zM130.872 484.764a108.548 108.548 0 0 1-8.157-1.77c-.297-.078-.594-.168-.886-.246-8.137-2.16-16.266-5.332-24.309-9.614-.226-.121-.454-.226-.676-.347a125.965 125.965 0 0 1-7.656-4.516 67.765 67.765 0 0 1-1.047-.668c-8.176-5.301-16.226-11.793-24.062-19.629-10.555-10.559-18.704-21.508-24.739-32.626-.175-.332-.339-.664-.511-.992a119.27 119.27 0 0 1-3.426-6.996c-.316-.711-.609-1.426-.914-2.137a116.446 116.446 0 0 1-2.406-6.106c-.301-.836-.574-1.676-.855-2.516a110.03 110.03 0 0 1-1.825-6.012c-.21-.766-.394-1.531-.586-2.297a110.276 110.276 0 0 1-1.418-6.523c-.09-.504-.171-1.012-.258-1.519-.418-2.504-.77-5.001-1.008-7.497-.011-.117-.019-.234-.031-.347-1.805-19.711 1.938-39.086 9.805-56.919l69.638 69.634 84.345-84.345-50.012-50.012-16.801-16.871a259.801 259.801 0 0 1 12.168-5.184c30.207-12.218 63.13-20.481 93.677-28.848 54.645-14.938 87.739-35.016 122.247-69.524l49.158-49.161-1.074-3.793 7.637-25.626 6.054-2.656 14.309 14.313-236.23 236.229-1.023 1.024h.004l-.114.109 3.321 3.325.015.015.114.114L430.704 66.868l5.484 5.485-237.362 237.361 3.321 3.325.015.015.114.114L439.642 75.806l5.488 5.485L208.9 317.519l-1.023 1.024-.114.109 3.321 3.325.015.015.114.114L448.579 84.743l14.367 14.367-2.715 5.996-25.625 7.637-3.79-1.078-49.161 49.161c-34.504 34.508-54.586 67.598-69.524 122.247-8.371 30.547-16.629 63.47-28.79 93.736-1.598 4.015-3.359 7.98-5.066 11.89l-.172.297-66.891-66.891-84.228 84.227h-.004l-.109.118 51.078 51.082 18.555 18.634c-20.43 8.961-42.837 12.554-65.454 8.625-.057-.012-.119-.019-.178-.027zm-6.469-209.933c-8.23-1.66-16.367-2.484-24.344-2.519-.195 0-.391-.019-.586-.019-.168 0-.332.019-.496.019-6.418.031-12.75.394-18.832 1.426-2.719.454-4.414-2.828-2.489-4.867 1.016-1.015 2.09-1.977 3.11-2.992 7.41-6.848 16.462-13.07 27.438-18.84 1.129-.566 2.542-.394 3.394.453l24.492 24.497c2.094 2.09 0 5.656-2.828 4.859-.054-.054-.054-.054-.113-.11-2.598-.71-5.18-1.148-7.77-1.691-.324-.071-.648-.149-.976-.216z"
        fill="currentColor"
      />
      <path
        d="m123.387 402.997 84.224-84.219.113-.114-5.469-5.473-84.336 84.337zM205.971 228.655c-.535-1.672-1.195-3.313-2.121-4.848-.016.051-.047.098-.059.153-.038-.058-.058-.129-.098-.188a14.447 14.447 0 0 1-3.918 7.196c-4.598 4.598-11.52 5.457-16.993 2.586-.57-.301-1.218.348-.918.918 2.875 5.469 2.027 12.378-2.57 16.977-1.551 1.55-3.398 2.531-5.324 3.23-.598.175-1.165.48-1.786.55.035.023.074.039.11.062-.066.016-.129.059-.195.074 8.851 5.676 20.738 4.621 28.469-3.106 6.399-6.397 8.156-15.6 5.403-23.604zM278.448 329.215c-2.875-5.469-2.012-12.391 2.586-16.993 1.551-1.546 3.395-2.527 5.321-3.226.602-.18 1.164-.484 1.785-.554-.035-.024-.074-.035-.109-.059.066-.015.129-.058.199-.074-8.852-5.676-20.742-4.626-28.489 3.125-7.73 7.726-8.782 19.618-3.106 28.469a14.379 14.379 0 0 1 3.918-7.195c4.598-4.598 11.508-5.45 16.974-2.57.569.3 1.222-.352.921-.923z"
        fill="currentColor"
      />
      <path
        d="M88.348 388.856c-1.305-1.304-2.946-1.75-4.57-1.789-.054 0-.102-.031-.156-.031-.043 0-.086.019-.13.019-1.816.035-3.465.786-4.71 2.207-.137.153-.246.325-.367.493-.309.422-.715.734-.93 1.25-2.43 5.828-6.504 9.676-10.352 11.375-2.488 1.129-5.43.562-7.41-1.414l-7.129-7.133-7.996 8-.039.035h.004l-.114.114 65.563 65.563 8.145-8.149-7.129-7.125c-1.977-1.977-2.543-4.922-1.41-7.41 1.695-3.847 5.543-7.918 11.371-10.355 4.41-1.805 5.543-7.462 2.149-10.86l-6.734-6.73 10.469-10.465-3.454-3.454-10.465 10.47-5.488-5.489 10.469-10.465-3.454-3.454 84.322-84.317-5.461-5.462-84.22 84.22v.004l-.117.11 5.461 5.461-10.45 10.454-5.488-5.489 10.469-10.465-3.454-3.454-10.465 10.47-6.73-6.735zm7.691 27.157c.68.676 1.02 1.582.906 2.485-.058.734-.398 1.414-.965 1.984a3.102 3.102 0 0 1-1.922.906c-.902.11-1.809-.23-2.489-.906-.734-.738-1.074-1.641-.961-2.546a3.059 3.059 0 0 1 .902-1.922c.566-.57 1.246-.906 1.985-.965.904-.114 1.81.225 2.544.964zm-8.031-6.453c-.058.734-.34 1.473-.906 2.039-.508.507-1.246.789-1.98.851-.906.11-1.809-.23-2.489-.906a3.295 3.295 0 0 1-.965-2.546c.118-.68.398-1.414.906-1.922.566-.57 1.305-.851 1.981-.969a3.292 3.292 0 0 1 2.546.969c.681.675 1.021 1.578.907 2.484zm16.915 15.332a3.29 3.29 0 0 1 .961 2.543c-.114.679-.394 1.414-.965 1.984-.508.508-1.242.79-1.922.906a3.292 3.292 0 0 1-2.543-.965c-.68-.676-1.02-1.582-.906-2.488a3.059 3.059 0 0 1 .902-1.922c.566-.57 1.246-.906 1.985-.965.901-.112 1.808.227 2.488.907zM468.478 374.352h-77.149a16.99 16.99 0 0 0-15.195 9.294 16.991 16.991 0 0 0 1.351 17.75c9.028 12.515 17.165 27.742 23.54 44.039 6.515 16.664 6.316 39.899 6.25 47.532a18.367 18.367 0 0 0 5.359 13.187 18.378 18.378 0 0 0 13.145 5.477H434.03c4.973 0 9.641-1.945 13.141-5.477a18.359 18.359 0 0 0 5.363-13.179c-.066-7.641-.27-30.868 6.25-47.54 6.375-16.297 14.512-31.524 23.539-44.039a16.987 16.987 0 0 0 1.351-17.75 16.995 16.995 0 0 0-15.196-9.294zM437.454 493.1a3.423 3.423 0 0 1-3.426 3.453H425.777a3.424 3.424 0 0 1-3.426-3.453c.094-10.618.066-34.36-7.286-53.157-6.949-17.766-15.738-34.04-25.351-47.368-.946-1.313-.008-3.141 1.613-3.141h77.149c1.621 0 2.558 1.828 1.614 3.141-9.614 13.328-18.403 29.602-25.352 47.368-7.351 18.797-7.378 42.539-7.284 53.157z"
        fill="currentColor"
      />
    </svg>
  );
});

IconStrings.displayName = 'IconStrings';
export default IconStrings;