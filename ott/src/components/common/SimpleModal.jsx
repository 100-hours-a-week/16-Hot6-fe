import React from 'react';

const SimpleModal = ({ open, message, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <p className="text-center whitespace-pre-line mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm || onClose}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
