import React from 'react';

const ImagePreview = React.memo(function ImagePreview({ images, carouselIdx, onRemove, onSelect }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative flex flex-col items-center mb-4">
      <div className="relative flex items-center justify-center w-60 h-60 bg-gray-100 rounded-xl overflow-hidden">
        {/* 삭제 버튼 */}
        <button
          onClick={() => onRemove(carouselIdx)}
          className="absolute top-2 left-2 bg-white rounded-full p-1 shadow"
        >
          🗑️
        </button>
        {/* 순서/전체 표기 */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {carouselIdx + 1} / {images.length}
        </div>
        {/* 이미지 */}
        <img
          src={URL.createObjectURL(images[carouselIdx])}
          alt={`선택 이미지 ${carouselIdx + 1}`}
          className="object-cover w-full h-full"
        />
      </div>
      {/* 썸네일 리스트 */}
      <div className="flex gap-2 mt-2">
        {images.map((file, idx) => (
          <img
            key={idx}
            src={URL.createObjectURL(file)}
            alt={`썸네일 ${idx + 1}`}
            className={`w-12 h-12 object-cover rounded ${idx === carouselIdx ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onSelect(idx)}
          />
        ))}
      </div>
    </div>
  );
});

export default ImagePreview;
