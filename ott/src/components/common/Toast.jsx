import React from 'react';

export default function Toast({ message }) {
  return (
    <div
      className={`
        fixed bottom-28 left-1/2 -translate-x-1/2
        bg-gray-800 text-white px-5 py-2 rounded-full shadow-lg z-50 text-base
        flex items-center justify-center
        min-w-[120px] max-w-[90vw]
        transition-all duration-400
        ${
          message
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }
      `}
      style={{
        display: 'inline-block',
      }}
    >
      {message}
    </div>
  );
}
