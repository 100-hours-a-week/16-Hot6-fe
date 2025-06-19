import axiosInstance from '@/api/axios';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import TopBar from '@/components/common/TopBar';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function validateNickname(nickname) {
  const regex = /^[A-Za-z0-9가-힣]{2,20}$/;
  return regex.test(nickname);
}

function validateKakaoNickname(nickname) {
  const regex = /^[A-Za-z0-9]{2,20}\.[A-Za-z0-9]{2,20}$/;
  return regex.test(nickname);
}

function resizeImage(file, maxSize = 1024) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('이미지 리사이즈 실패'));
          }
        },
        file.type,
        0.9,
      );
    };
    img.onerror = reject;
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [nickname, setNickname] = useState('Chu');
  const [kakaoNickname, setKakaoNickname] = useState('Chu');
  const [nicknameError, setNicknameError] = useState('');
  const [kakaoNicknameError, setKakaoNicknameError] = useState('');
  const [imgHelper, setImgHelper] = useState('');
  const [toast, setToast] = useState('');
  const [certified, setCertified] = useState(false);
  const fileInputRef = useRef();
  const [originalNickname, setOriginalNickname] = useState('');
  const [originalKakaoNickname, setOriginalKakaoNickname] = useState('');
  const [originalProfileImg, setOriginalProfileImg] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/users/me');
        setProfileImg(response.data.data.profileImagePath);
        setOriginalProfileImg(response.data.data.profileImagePath);
        setNickname(response.data.data.nicknameCommunity);
        setOriginalNickname(response.data.data.nicknameCommunity);
        setKakaoNickname(response.data.data.nicknameKakao);
        setOriginalKakaoNickname(response.data.data.nicknameKakao);
        setCertified(response.data.data.certified);
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
    );
  }

  // 프로필 이미지 변경
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setImgHelper('* 이미지는 5MB 이하의 jpg, png 파일만 가능합니다.');
      return;
    }
    setProfileFile(file);
    setProfileImg(URL.createObjectURL(file));
  };

  // 닉네임 입력
  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    if (!validateNickname(value)) {
      setNicknameError(
        '* 닉네임은 2~20자 이내의 공백 제외 완성형 한글(가–힣), 영문, 숫자로 이루어져야 합니다.',
      );
    } else {
      setNicknameError('');
    }
  };

  const handleKakaoNicknameChange = (e) => {
    const value = e.target.value;
    setKakaoNickname(value);
    if (!validateKakaoNickname(value)) {
      setKakaoNicknameError(
        "* 카테부 닉네임은 2~20자의 영문, 숫자만 사용하며, 중간에 '.'이 정확히 한 개 있어야 합니다. 한글은 사용할 수 없습니다.",
      );
    } else {
      setKakaoNicknameError('');
    }
  };

  // 저장 버튼
  const handleSave = async () => {
    if (!validateNickname(nickname)) {
      setNicknameError(
        '* 닉네임은 2~20자 이내의 공백 제외 완성형 한글(가–힣), 영문, 숫자로 이루어져야 합니다.',
      );
      return;
    }
    if (!validateKakaoNickname(kakaoNickname)) {
      setKakaoNicknameError(
        "* 카테부 닉네임은 2~20자의 영문, 숫자만 사용하며, 중간에 '.'이 정확히 한 개 있어야 합니다. 한글은 사용할 수 없습니다.",
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nicknameCommunity', nickname);
      if (kakaoNickname) {
        formData.append('nicknameKakao', kakaoNickname);
      }
      if (profileFile) {
        // 이미지 리사이즈
        const resizedBlob = await resizeImage(profileFile, 1024);
        const resizedFile = new File([resizedBlob], profileFile.name, { type: profileFile.type });
        formData.append('profileImagePath', resizedFile);
      }

      await axiosInstance.patch('/users/me', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/mypage');
    } catch {
      setToast('회원정보 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      setTimeout(() => setToast(''), 3000);
    }
  };

  const isNicknameValid = validateNickname(nickname);
  const isKakaoNicknameValid = validateKakaoNickname(kakaoNickname);
  const isProfileChanged = profileFile || profileImg !== originalProfileImg;
  const isNicknameChanged = nickname !== originalNickname;
  const isKakaoNicknameChanged = kakaoNickname !== originalKakaoNickname;
  const isValid =
    isNicknameValid &&
    (certified ? isKakaoNicknameValid : true) &&
    (isProfileChanged || isNicknameChanged || isKakaoNicknameChanged);

  return (
    <div className="max-w-[768px] mx-auto min-h-screen bg-white pb-24 relative">
      <div className="fixed inset-0 bg-gray-100 -z-10 hidden sm:block" />
      <TopBar title="회원정보 변경" showBack />

      {/* 프로필 사진 + 이미지 선택 버튼 */}
      <div className="flex items-center gap-4 mt-8 px-4 justify-between">
        <img
          src={profileImg}
          alt="프로필"
          className="w-[85px] h-[85px] rounded-xl object-cover border"
        />
        <div className="w-full max-w-[300px]">
          <label className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 rounded cursor-pointer text-gray-400 text-sm justify-center">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l11-11a2.828 2.828 0 10-4-4L3 17z" />
            </svg>
            이미지를 선택해주세요.
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              ref={fileInputRef}
              onChange={handleProfileChange}
            />
          </label>
          {imgHelper && !profileImg && <div className="text-xs text-red-500 mt-1">{imgHelper}</div>}
          {!profileFile && (
            <div className="text-xs text-gray-400 mt-1">
              * 이미지는 5MB 이하의 jpg, png 파일만 가능합니다.
            </div>
          )}
        </div>
      </div>

      {/* 닉네임 변경 */}
      <div className="flex items-center gap-4 mt-8 px-4 justify-between">
        <div className="font-bold min-w-[90px]">닉네임 변경</div>
        <div className="w-full max-w-[300px]">
          <div className="flex items-center border rounded px-3 py-2 bg-white">
            <input
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              className="flex-1 outline-none bg-transparent"
              maxLength={20}
              placeholder="닉네임을 입력하세요"
            />
          </div>
          {nicknameError && <div className="text-xs text-red-500 mt-1">{nicknameError}</div>}
        </div>
      </div>

      {/* 카테부 닉네임 변경 */}
      {certified && (
        <div className="flex items-center gap-4 mt-8 px-4 justify-between">
          <div className="font-bold min-w-[120px]">카테부 닉네임 변경</div>
          <div className="w-full max-w-[300px]">
            <div className="flex items-center border rounded px-3 py-2 bg-white">
              <input
                type="text"
                value={kakaoNickname}
                onChange={handleKakaoNicknameChange}
                className="flex-1 outline-none bg-transparent"
                maxLength={20}
                placeholder="카테부 닉네임을 입력하세요"
              />
            </div>
            {kakaoNicknameError && (
              <div className="text-xs text-red-500 mt-1">{kakaoNicknameError}</div>
            )}
          </div>
        </div>
      )}
      {/* 저장 버튼 */}
      <div className="flex-1">
        <div className="flex justify-end mt-4 px-4">
          <button
            className={`px-8 py-2 border rounded-lg font-semibold 
              ${
                isValid
                  ? 'bg-gray-700 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            onClick={handleSave}
            disabled={!isValid}
          >
            저장
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
