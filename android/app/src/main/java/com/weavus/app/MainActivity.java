package com.weavus.app;

import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebViewClient;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
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

        //윈도우 모달 처리
//        setContentView(R.layout.activity_main);
//
//        WebView webView = findViewById(R.id.webview);
//        webView.getSettings().setJavaScriptEnabled(true);
//        webView.getSettings().setDomStorageEnabled(true);
//        webView.getSettings().setSupportMultipleWindows(true); // 다중 창 지원
//        webView.setWebChromeClient(new WebChromeClient()); // 새 창 열기 처리
//
//        // 새 창이 아닌 현재 WebView에서 열리도록 설정
//        webView.setWebViewClient(new WebViewClient() {
//            @Override
//            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
//                view.loadUrl(request.getUrl().toString());
//                return true;
//            }
//        });
//        webView.loadUrl("file:///android_asset/public/index.html");
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