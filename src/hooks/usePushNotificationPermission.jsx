import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { getToken } from 'firebase/messaging';
import { PushNotifications } from '@capacitor/push-notifications';

const usePushNotificationPermission = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const requestPermission = async () => {
      if (!Capacitor.isNativePlatform()) {
        console.log('네이티브 환경에서만 지원됩니다.');
        return;
      }

      console.log('푸시 알림 권한 요청 중...');

      const status = await PushNotifications.requestPermissions();
      console.log('권한 상태:', status);

      if (status.receive === 'granted') {
        console.log('푸시 알림 권한 허용됨.');

        try {
          const token = await getToken();
          console.log('발급된 FCM 토큰:', token); // ✅ 토큰 확인

          if (token) {
            setToken(token);
            sendTokenToBackend(token); // 최초 토큰 서버 전송
          } else {
            console.log('FCM 토큰 발급 실패');
          }
        } catch (error) {
          console.error('토큰 발급 중 오류 발생:', error);
        }
      } else {
        console.log('푸시 알림 권한 거부됨');
      }

      await PushNotifications.register();
      console.log('푸시 알림 등록 완료');
    };

    requestPermission();
  }, []);

  useEffect(() => {
    if (token) {
      console.log('상태값에 저장된 토큰:', token); // ✅ 상태 값 확인
    }
  }, [token]);

  return token;
};

// 토큰을 서버로 전송하는 함수
const sendTokenToBackend = async (token) => {
  console.log('서버로 토큰 전송 시작:', token); // ✅ 서버 전송 로그 추가
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

export default usePushNotificationPermission;
