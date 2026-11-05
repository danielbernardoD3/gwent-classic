package com.danielbernardo.gwentclassic;

import java.io.File;
import android.os.Bundle;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUI();
        setupBackHandling();
        setupUpdaterBridge();
    }

    private void setupUpdaterBridge() {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().addJavascriptInterface(new AndroidAppUpdater(this), "AndroidAppUpdater");
        }
    }

    private File downloadedApkFile = null;

    public void startApkDownload(final String apkUrl) {
        new Thread(() -> {
            try {
                File cacheDir = getExternalCacheDir() != null ? getExternalCacheDir() : getCacheDir();
                File apkFile = new File(cacheDir, "GwentClassic_update.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                java.net.URL url = new java.net.URL(apkUrl);
                java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
                conn.setRequestProperty("User-Agent", "GwentClassic-Android");
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(30000);
                conn.setInstanceFollowRedirects(true);
                conn.connect();

                int responseCode = conn.getResponseCode();
                int redirects = 0;
                while ((responseCode == java.net.HttpURLConnection.HTTP_MOVED_TEMP || responseCode == java.net.HttpURLConnection.HTTP_MOVED_PERM || responseCode == 307 || responseCode == 308) && redirects < 6) {
                    String newUrl = conn.getHeaderField("Location");
                    conn.disconnect();
                    url = new java.net.URL(newUrl);
                    conn = (java.net.HttpURLConnection) url.openConnection();
                    conn.setRequestProperty("User-Agent", "GwentClassic-Android");
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(30000);
                    conn.setInstanceFollowRedirects(true);
                    conn.connect();
                    responseCode = conn.getResponseCode();
                    redirects++;
                }

                int fileLength = conn.getContentLength();
                java.io.InputStream input = new java.io.BufferedInputStream(conn.getInputStream(), 8192);
                java.io.OutputStream output = new java.io.FileOutputStream(apkFile);

                byte[] data = new byte[8192];
                long total = 0;
                int count;
                long lastProgressTime = 0;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    long now = System.currentTimeMillis();
                    if (now - lastProgressTime > 120) {
                        lastProgressTime = now;
                        final int progress = (fileLength > 0) ? (int) ((total * 100) / fileLength) : -1;
                        final long cur = total;
                        final long len = fileLength;
                        runOnUiThread(() -> {
                            if (bridge != null && bridge.getWebView() != null) {
                                bridge.getWebView().evaluateJavascript(
                                    String.format(java.util.Locale.US, "window.onUpdaterProgress && window.onUpdaterProgress(%d, %d, %d);", progress, cur, len),
                                    null
                                );
                            }
                        });
                    }
                }

                output.flush();
                output.close();
                input.close();
                conn.disconnect();

                downloadedApkFile = apkFile;
                final long finalTotal = total;
                runOnUiThread(() -> {
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().evaluateJavascript(
                            String.format(java.util.Locale.US, "window.onUpdaterProgress && window.onUpdaterProgress(100, %d, %d);", finalTotal, finalTotal),
                            null
                        );
                    }
                    promptInstallApk(downloadedApkFile);
                });

            } catch (Exception e) {
                final String errorMsg = e.getMessage() != null ? e.getMessage().replace("'", "\\'") : "Erro no download";
                runOnUiThread(() -> {
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().evaluateJavascript(
                            String.format("window.onUpdaterError && window.onUpdaterError('%s');", errorMsg),
                            null
                        );
                    }
                });
            }
        }).start();
    }

    public void promptInstallApk(File apkFile) {
        if (apkFile == null || !apkFile.exists()) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!getPackageManager().canRequestPackageInstalls()) {
                    android.content.Intent permIntent = new android.content.Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                    permIntent.setData(android.net.Uri.parse("package:" + getPackageName()));
                    startActivity(permIntent);
                    return;
                }
            }

            android.net.Uri apkUri = androidx.core.content.FileProvider.getUriForFile(
                this,
                getPackageName() + ".fileprovider",
                apkFile
            );

            android.content.Intent installIntent = new android.content.Intent(android.content.Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installIntent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(installIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        setupUpdaterBridge();
        if (downloadedApkFile != null && downloadedApkFile.exists()) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getPackageManager().canRequestPackageInstalls()) {
                File toInstall = downloadedApkFile;
                downloadedApkFile = null;
                promptInstallApk(toInstall);
            }
        }
    }

    public static class AndroidAppUpdater {
        private final MainActivity activity;

        public AndroidAppUpdater(MainActivity activity) {
            this.activity = activity;
        }

        @android.webkit.JavascriptInterface
        public boolean isNativeAndroid() {
            return true;
        }

        @android.webkit.JavascriptInterface
        public String getInstalledVersion() {
            try {
                return activity.getPackageManager().getPackageInfo(activity.getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "1.1.0";
            }
        }

        @android.webkit.JavascriptInterface
        public void downloadAndInstall(final String apkUrl) {
            activity.startApkDownload(apkUrl);
        }

        @android.webkit.JavascriptInterface
        public boolean canInstallPackages() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                return activity.getPackageManager().canRequestPackageInstalls();
            }
            return true;
        }

        @android.webkit.JavascriptInterface
        public void openInstallPermissionSettings() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                android.content.Intent intent = new android.content.Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                intent.setData(android.net.Uri.parse("package:" + activity.getPackageName()));
                activity.startActivity(intent);
            }
        }
    }

    private void setupBackHandling() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,
                this::triggerBackLogic
            );
        }
    }

    @Override
    public void onBackPressed() {
        triggerBackLogic();
    }

    private void triggerBackLogic() {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().evaluateJavascript("window.handleAndroidBackButton ? window.handleAndroidBackButton() : false", value -> {
                if ("false".equals(value) || "null".equals(value)) {
                    // Minimize app smoothly to background when on root menu
                    moveTaskToBack(true);
                }
            });
        } else {
            moveTaskToBack(true);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    private void hideSystemUI() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            View decorView = getWindow().getDecorView();
            decorView.setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
            );
        }
    }
}
