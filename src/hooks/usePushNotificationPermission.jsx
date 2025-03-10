// src/hooks/usePushNotificationPermission.tsx
import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';

function usePushNotificationPermission() {
  useEffect(() => {
    const requestNotificationPermission = async () => {
      const status = await PushNotifications.requestPermissions();
      if (status.receive === 'granted') {
        console.log('푸시 알림 권한이 허용되었습니다.');
      } else {
        console.log('푸시 알림 권한이 거부되었습니다...');
      }
    };

    requestNotificationPermission();
  }, []);
}

export default usePushNotificationPermission;
