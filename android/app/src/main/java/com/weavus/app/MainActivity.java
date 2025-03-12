package com.weavus.app;

import android.os.Bundle;
import android.webkit.WebView;
import android.view.KeyEvent;
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

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (this.getBridge() != null && this.getBridge().getWebView() != null) {
                WebView webView = (WebView) this.getBridge().getWebView();
                if (webView.canGoBack()) {
                    webView.goBack();  // 웹뷰에서 뒤로 가기
                    return true;
                } else {
                    moveTaskToBack(true);  // 뒤로 갈 수 없으면 앱을 백그라운드로 보냄
                    return true;
                }
            }
        }
        return super.onKeyDown(keyCode, event);
    }
}
