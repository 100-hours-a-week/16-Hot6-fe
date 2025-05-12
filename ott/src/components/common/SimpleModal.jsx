import React from 'react';

const SimpleModal = ({
  open,
  message,
  onClose,
  onConfirm,
  leftButtonText = '확인',
  rightButtonText,
  onLeftClick,
  onRightClick,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <p className="text-center whitespace-pre-line mb-6" style={{ whiteSpace: 'pre-line' }}>
          {message}
        </p>
        <div className="flex justify-center gap-3">
          {rightButtonText ? (
            <>
              <button
                onClick={onLeftClick || onClose}
                className="flex-1 px-6 py-2 bg-gray-200 text-black rounded-lg font-semibold"
              >
                {leftButtonText}
              </button>
              <button
                onClick={onRightClick || onConfirm || onClose}
                className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold"
              >
                {rightButtonText}
              </button>
            </>
          ) : (
            <button
              onClick={onConfirm || onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg"
            >
              {leftButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
