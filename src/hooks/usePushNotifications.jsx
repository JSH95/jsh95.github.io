import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { getToken, onMessage, onTokenRefresh } from 'firebase/messaging';

const usePushNotification = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const handleForegroundMessage = (payload) => {
    };

    const handleTokenRefresh = async () => {
      try {
        const newToken = await getToken();
        sendTokenToBackend(newToken);
      } catch (error) {
        // console.error('토큰 갱신 실패:', error);
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
    await fetch(
      'https://port-0-severance-m4yzyreu8bbe535f.sel4.cloudtype.app/api/fcm/save',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    );
  } catch (error) {
    // console.error('서버 연결 실패:', error);
  }
};

export default usePushNotification;
