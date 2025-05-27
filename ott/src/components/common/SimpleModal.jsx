const SimpleModal = ({ open, title, message, onClose, rightButtonText, onRightClick }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative">
        {/* X 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
          aria-label="닫기"
        >
          ×
        </button>
        {title && (
          <div className="mb-4 pb-2">
            <h2 className="text-base font-bold text-center text-[#1A2238]">{title}</h2>
          </div>
        )}
        <p className="text-center whitespace-pre-line mb-6 text-lg font-semibold text-[#232946]">
          {message}
        </p>
        <div className="flex justify-center">
          {rightButtonText && (
            <button
              onClick={onRightClick || onClose}
              className="px-4 py-2 rounded-lg bg-[#232946] text-white font-semibold text-sm hover:bg-[#1A2238] transition"
            >
              {rightButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleModal;
