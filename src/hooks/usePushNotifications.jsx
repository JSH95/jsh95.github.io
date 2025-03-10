import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';

const usePushNotification = () => {
  useEffect(() => {
    const getFCMToken = async () => {
      try {
        // FCM 토큰 요청
        const token = await getToken();
        console.log('FCM 토큰:', token);

        if (token) {
          // 서버로 토큰 전송
          sendTokenToBackend(token);
        } else {
          console.error('FCM 토큰을 받을 수 없습니다.');
        }
      } catch (error) {
        console.error('FCM 토큰을 받는 데 실패했습니다.', error);
      }
    };

    // 앱이 처음 실행될 때 FCM 토큰을 받아옴
    getFCMToken();

    // Foreground에서 푸시 알림 수신
    onMessage((payload) => {
      console.log('푸시 알림 수신:', payload);
    });
  }, []);
};

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
