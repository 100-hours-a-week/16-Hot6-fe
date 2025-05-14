import React from 'react';
import deleteIcon from '@/assets/icons/delete/trash-outlined.svg';

const ImagePreview = React.memo(function ImagePreview({ images, carouselIdx, onRemove, onSelect }) {
  if (!images || images.length === 0) return null;

  // 이미지 URL을 가져오는 함수
  const getImageUrl = (image) => {
    // File 객체인 경우 (새로 업로드한 이미지)
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    // URL 문자열인 경우 (서버에서 받아온 이미지)
    if (typeof image === 'string') {
      return image;
    }
    // 객체인 경우 (서버에서 받아온 이미지 객체)
    if (image.imageUuid) {
      return image.imageUuid;
    }
    return '';
  };

  return (
    <div className="relative flex flex-col items-center mb-4">
      <div className="relative flex items-center justify-center w-60 h-60 bg-gray-100 rounded-xl overflow-visible">
        {/* 삭제 버튼 */}
        {onRemove && (
          <button
            onClick={() => onRemove(carouselIdx)}
            className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-lg ring-2 ring-red-500"
          >
            <img src={deleteIcon} alt="삭제" className="w-4 h-4" />
          </button>
        )}
        {/* 순서/전체 표기 */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          {carouselIdx + 1} / {images.length}
        </div>
        {/* 이미지 */}
        <div className="w-full h-full rounded-xl overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(images[carouselIdx])}
            alt={`선택 이미지 ${carouselIdx + 1}`}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      {/* 썸네일 리스트 */}
      <div className="flex gap-2 mt-2">
        {images.map((image, idx) => (
          <img
            key={idx}
            src={getImageUrl(image)}
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
