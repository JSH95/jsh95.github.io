import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { getToken, onMessage, onTokenRefresh } from 'firebase/messaging';

const usePushNotification = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      console.log('네이티브 환경이 아니므로 푸시 알림을 지원하지 않습니다.');
      return;
    }

    const handleForegroundMessage = (payload) => {
      console.log('푸시 알림 수신:', payload);
    };

    const handleTokenRefresh = async () => {
      try {
        const newToken = await getToken();
        console.log('FCM 토큰 갱신됨:', newToken);
        sendTokenToBackend(newToken);
      } catch (error) {
        console.error('토큰 갱신 실패:', error);
      }
    };

    // Firebase 메시지 수신 리스너 등록
    onMessage(handleForegroundMessage);
    onTokenRefresh(handleTokenRefresh);
  }, []);
};

// 토큰을 서버로 전송하는 함수
const sendTokenToBackend = async (token) => {
  try {
    const response = await fetch('https://your-backend-api.com/save-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      console.log('토큰 전송 성공');
    } else {
      console.error('토큰 전송 실패');
    }
  } catch (error) {
    console.error('서버 연결 실패:', error);
  }
};

export default usePushNotification;
