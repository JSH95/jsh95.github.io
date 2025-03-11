package com.weavus.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.FirebaseApp;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Firebase 초기화
        FirebaseApp.initializeApp(this);  // Firebase 초기화

        // FCM 토큰 받기
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    return;
                }

                // 토큰을 가져온 후
                String token = task.getResult();
                System.out.println("FCM 토큰: " + token); // 여기서 토큰을 확인할 수 있습니다
            });
    }
}
