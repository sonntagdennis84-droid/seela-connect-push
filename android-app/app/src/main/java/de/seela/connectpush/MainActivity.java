package de.seela.connectpush;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.google.firebase.messaging.FirebaseMessaging;
import java.io.IOException;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class MainActivity extends Activity {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private final OkHttpClient http = new OkHttpClient();
    private TextView pushStatus;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestNotificationPermission();
        registerDeviceForPush();
        openSeelaWebView();
    }

    private void openSeelaWebView() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);

        LinearLayout statusBar = new LinearLayout(this);
        statusBar.setOrientation(LinearLayout.HORIZONTAL);
        statusBar.setPadding(16, 10, 16, 10);
        statusBar.setBackgroundColor(Color.rgb(245, 247, 250));

        pushStatus = new TextView(this);
        pushStatus.setText("Push wird registriert...");
        pushStatus.setTextColor(Color.rgb(33, 37, 41));
        pushStatus.setLayoutParams(new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));

        Button retryButton = new Button(this);
        retryButton.setText("Push testen");
        retryButton.setOnClickListener(view -> registerDeviceForPush());

        statusBar.addView(pushStatus);
        statusBar.addView(retryButton);

        WebView webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                0,
                1
        ));

        layout.addView(statusBar);
        layout.addView(webView);
        setContentView(layout);
        webView.loadUrl(getString(R.string.seela_url));
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[] { Manifest.permission.POST_NOTIFICATIONS }, 1001);
        }
    }

    private void registerDeviceForPush() {
        updatePushStatus("Push wird registriert...");
        FirebaseMessaging.getInstance().getToken()
                .addOnSuccessListener(this::sendTokenToBackend)
                .addOnFailureListener(error -> updatePushStatus("Firebase-Token fehlt: " + error.getMessage()));
    }

    private void sendTokenToBackend(String token) {
        String backendUrl = getString(R.string.backend_url);
        if (backendUrl.contains("YOUR-BACKEND-DOMAIN")) return;

        String body = "{\"token\":\"" + token.replace("\"", "\\\"") + "\"}";
        Request request = new Request.Builder()
                .url(backendUrl + "/devices")
                .post(RequestBody.create(body, JSON))
                .build();

        http.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                updatePushStatus("Backend nicht erreichbar: " + e.getMessage());
            }

            @Override
            public void onResponse(Call call, Response response) {
                if (response.isSuccessful()) {
                    updatePushStatus("Push registriert");
                } else {
                    updatePushStatus("Push-Registrierung fehlgeschlagen: HTTP " + response.code());
                }
                response.close();
            }
        });
    }

    private void updatePushStatus(String text) {
        runOnUiThread(() -> {
            if (pushStatus != null) pushStatus.setText(text);
        });
    }
}
