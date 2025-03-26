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
        // console.log('네이티브 환경에서만 지원됩니다.');
        return;
      }

      // 푸시 알림 권한 요청
      console.log('푸시 알림 권한 요청 중...');
      const pushStatus = await PushNotifications.requestPermissions();
      console.log('푸시 알림 권한 상태:', pushStatus);

      if (pushStatus.receive === 'granted') {
        console.log('푸시 알림 권한 허용됨.');

        // 푸시 알림 등록
        await PushNotifications.register();
        console.log('푸시 알림 등록 완료');

        // 푸시 알림 등록 후에 토큰 받기
        PushNotifications.addListener('registration', (token) => {
          console.log('발급된 FCM 토큰:', token.value); // ✅ 토큰 확인
          setToken(token.value);
          sendTokenToBackend(token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('푸시 등록 중 오류 발생:', error);
        });
      } else {
        console.log('푸시 알림 권한 거부됨');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    if (token) {
      console.log('상태값에 저장된 토큰:', token); // ✅ 상태 값 확인
    }
  }, [token]);

  return token;
};

// 토큰을 서버로 전송하는 함수

const sendTokenToBackend = async (token, username) => {
  console.log('서버로 토큰 전송 시작:', token); // ✅ 서버 전송 로그 추가
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
