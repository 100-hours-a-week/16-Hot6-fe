import React from 'react';

const SimpleModal = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col items-center">
        <p className="text-gray-500 mb-6 text-center whitespace-pre-line">{message}</p>
        <button className="px-6 py-2 bg-gray-500 text-white rounded" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default SimpleModal;
