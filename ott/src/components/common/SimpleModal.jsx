import React from 'react';

const SimpleModal = ({
  open,
  title,
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
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
        {/* X 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-1 right-4 text-gray-400 hover:text-gray-700 text-xl"
          aria-label="닫기"
        >
          ×
        </button>
        {title && (
          <div className="mb-4 pb-2">
            <h2 className="text-lg font-bold text-center">{title}</h2>
          </div>
        )}
        <p className="text-center whitespace-pre-line mb-6" style={{ whiteSpace: 'pre-line' }}>
          {message}
        </p>
        <div className="flex justify-center gap-3">
          {rightButtonText ? (
            <>
              <button
                onClick={onRightClick || onConfirm || onClose}
                className="px-6 py-2 rounded-lg bg-[#232946] text-white font-semibold text-sm hover:bg-[#1A2238] transition"
              >
                {rightButtonText}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onLeftClick || onClose}
                className="flex-1 px-6 py-2 bg-gray-200 text-black rounded-lg font-semibold"
              >
                {leftButtonText}
              </button>
              <button
                onClick={onConfirm || onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg"
              >
                {leftButtonText}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
