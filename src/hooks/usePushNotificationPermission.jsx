import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import {useAuth} from "../config/AuthContext";

const usePushNotificationPermission = () => {

  const [token, setToken] = useState(null);
  const { username } = useAuth();
  sendTokenToBackend(token, username);


  useEffect(() => {
    const requestPermissions = async () => {
      if (!Capacitor.isNativePlatform()) {
        return;
      }

      // 푸시 알림 권한 요청
      const pushStatus = await PushNotifications.requestPermissions();

      if (pushStatus.receive === 'granted') {

        // 푸시 알림 등록
        await PushNotifications.register();

        // 푸시 알림 등록 후에 토큰 받기
        PushNotifications.addListener('registration', (token) => {
          setToken(token.value);
          sendTokenToBackend(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          // console.error('푸시 등록 중 오류 발생:', error);
        });
      } else {
      }
    };
    requestPermissions();
  }, []);
  return token;
};

// 토큰을 서버로 전송하는 함수

const sendTokenToBackend = async (token, username) => {
  try {
    const response = await fetch(
      'https://port-0-severance-m4yzyreu8bbe535f.sel4.cloudtype.app/api/fcm/save',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          userId: username,
        }),
      }
    );
  } catch (error) {
    // console.error('서버 연결 실패:', error);
  }
};

export default usePushNotificationPermission;
