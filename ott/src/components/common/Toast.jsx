import React from 'react';

export default function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-2 w-full max-w-[768px] text-left bg-gray-800 text-white px-4 py-2 shadow-lg z-50">
      {message}
    </div>
  );
}
