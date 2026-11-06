package com.danielbernardo.gwentclassic;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.os.Bundle;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static MainActivity currentInstance = null;
    private File downloadedApkFile = null;
    private String pendingDownloadUrl = null;
    private volatile boolean isDownloadingApk = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppUpdaterPlugin.class);
        super.onCreate(savedInstanceState);
        currentInstance = this;
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        hideSystemUI();
        setupBackHandling();
        setupUpdaterBridge();
    }

    private void setupUpdaterBridge() {
        if (bridge != null && bridge.getWebView() != null) {
            try {
                bridge.getWebView().addJavascriptInterface(new AndroidAppUpdater(this), "AndroidAppUpdater");
            } catch (Exception ignored) {}
        }
    }

    public void startApkDownload(final String apkUrl) {
        if (apkUrl == null || apkUrl.isEmpty()) return;

        // Check install permission BEFORE downloading 140 MB so the flow is uninterrupted
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            if (!getPackageManager().canRequestPackageInstalls()) {
                pendingDownloadUrl = apkUrl;
                runOnUiThread(() -> {
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().evaluateJavascript(
                            "if(document.getElementById('updater-progress-text')) document.getElementById('updater-progress-text').innerText = 'Autorize a permissão \"Instalar apps desconhecidos\" para iniciar a atualização automática...';",
                            null
                        );
                    }
                    try {
                        Intent permIntent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                        permIntent.setData(android.net.Uri.parse("package:" + getPackageName()));
                        startActivity(permIntent);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
                return;
            }
        }

        if (isDownloadingApk) return;
        isDownloadingApk = true;
        pendingDownloadUrl = null;

        new Thread(() -> {
            java.net.HttpURLConnection conn = null;
            InputStream input = null;
            OutputStream output = null;
            try {
                File cacheDir = getExternalCacheDir() != null ? getExternalCacheDir() : getCacheDir();
                File apkFile = new File(cacheDir, "GwentClassic_update.apk");
                if (apkFile.exists()) {
                    apkFile.delete();
                }

                java.net.URL url = new java.net.URL(apkUrl);
                int redirects = 0;
                while (redirects < 10) {
                    conn = (java.net.HttpURLConnection) url.openConnection();
                    conn.setRequestProperty("User-Agent", "GwentClassic-Android-Updater");
                    conn.setRequestProperty("Accept", "application/octet-stream, */*");
                    conn.setConnectTimeout(15000);
                    conn.setReadTimeout(30000);
                    conn.setInstanceFollowRedirects(false);
                    conn.connect();

                    int responseCode = conn.getResponseCode();
                    if (responseCode == java.net.HttpURLConnection.HTTP_MOVED_TEMP
                        || responseCode == java.net.HttpURLConnection.HTTP_MOVED_PERM
                        || responseCode == java.net.HttpURLConnection.HTTP_SEE_OTHER
                        || responseCode == 307
                        || responseCode == 308) {
                        String location = conn.getHeaderField("Location");
                        conn.disconnect();
                        if (location == null || location.isEmpty()) {
                            throw new Exception("Redirecionamento sem destino (HTTP " + responseCode + ")");
                        }
                        url = new java.net.URL(url, location);
                        redirects++;
                        continue;
                    }
                    if (responseCode < 200 || responseCode >= 300) {
                        throw new Exception("Servidor respondeu com HTTP " + responseCode);
                    }
                    break;
                }

                long fileLength = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N)
                    ? conn.getContentLengthLong()
                    : conn.getContentLength();

                input = new java.io.BufferedInputStream(conn.getInputStream(), 65536);
                output = new FileOutputStream(apkFile);

                byte[] data = new byte[65536];
                long total = 0;
                int count;
                long lastProgressTime = 0;

                while ((count = input.read(data)) != -1) {
                    total += count;
                    output.write(data, 0, count);

                    long now = System.currentTimeMillis();
                    if (now - lastProgressTime > 100) {
                        lastProgressTime = now;
                        final int progress = (fileLength > 0) ? (int) ((total * 100L) / fileLength) : -1;
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
                output = null;
                input.close();
                input = null;
                conn.disconnect();
                conn = null;

                if (apkFile.length() < 5 * 1024 * 1024) {
                    throw new Exception("Arquivo APK baixado está incompleto (" + apkFile.length() + " bytes).");
                }

                downloadedApkFile = apkFile;
                isDownloadingApk = false;
                final long finalTotal = total;
                runOnUiThread(() -> {
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().evaluateJavascript(
                            String.format(java.util.Locale.US, "window.onUpdaterProgress && window.onUpdaterProgress(100, %d, %d);", finalTotal, finalTotal),
                            null
                        );
                    }
                    installDownloadedApk(downloadedApkFile);
                });

            } catch (Exception e) {
                isDownloadingApk = false;
                final String errorMsg = e.getMessage() != null ? e.getMessage().replace("'", "\\'").replace("\n", " ") : "Erro no download";
                runOnUiThread(() -> {
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().evaluateJavascript(
                            String.format("window.onUpdaterError && window.onUpdaterError('%s');", errorMsg),
                            null
                        );
                    }
                });
            } finally {
                try { if (output != null) output.close(); } catch (Exception ignored) {}
                try { if (input != null) input.close(); } catch (Exception ignored) {}
                try { if (conn != null) conn.disconnect(); } catch (Exception ignored) {}
            }
        }).start();
    }

    public void installDownloadedApk(File apkFile) {
        if (apkFile == null || !apkFile.exists()) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getPackageManager().canRequestPackageInstalls()) {
            try {
                Intent permIntent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
                permIntent.setData(android.net.Uri.parse("package:" + getPackageName()));
                startActivity(permIntent);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return;
        }

        // Try modern PackageInstaller Session first (supports auto-relaunch & seamless update)
        if (!installViaPackageInstallerSession(apkFile)) {
            promptInstallApk(apkFile);
        }
    }

    private boolean installViaPackageInstallerSession(File apkFile) {
        PackageInstaller.Session session = null;
        try {
            PackageInstaller packageInstaller = getPackageManager().getPackageInstaller();
            PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(
                PackageInstaller.SessionParams.MODE_FULL_INSTALL
            );
            params.setAppPackageName(getPackageName());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
            }

            int sessionId = packageInstaller.createSession(params);
            session = packageInstaller.openSession(sessionId);

            try (OutputStream out = session.openWrite("GwentClassic_update", 0, apkFile.length());
                 InputStream in = new FileInputStream(apkFile)) {
                byte[] buffer = new byte[65536];
                int c;
                while ((c = in.read(buffer)) != -1) {
                    out.write(buffer, 0, c);
                }
                session.fsync(out);
            }

            Intent callbackIntent = new Intent(this, UpdateInstallReceiver.class);
            callbackIntent.setPackage(getPackageName());

            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                flags |= PendingIntent.FLAG_MUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                this,
                sessionId,
                callbackIntent,
                flags
            );

            session.commit(pendingIntent.getIntentSender());
            session.close();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            if (session != null) {
                try { session.abandon(); } catch (Exception ignored) {}
            }
            return false;
        }
    }

    public void fallbackViewInstall() {
        runOnUiThread(() -> {
            if (downloadedApkFile != null && downloadedApkFile.exists()) {
                promptInstallApk(downloadedApkFile);
            }
        });
    }

    public void promptInstallApk(File apkFile) {
        if (apkFile == null || !apkFile.exists()) return;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (!getPackageManager().canRequestPackageInstalls()) {
                    Intent permIntent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
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

            Intent installIntent = new Intent(Intent.ACTION_VIEW);
            installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
            installIntent.putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true);
            installIntent.putExtra(Intent.EXTRA_RETURN_RESULT, true);
            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(installIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        currentInstance = this;
        setupUpdaterBridge();

        // If user just returned from granting "Install unknown apps" permission:
        if (pendingDownloadUrl != null && !pendingDownloadUrl.isEmpty()) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getPackageManager().canRequestPackageInstalls()) {
                String urlToStart = pendingDownloadUrl;
                pendingDownloadUrl = null;
                startApkDownload(urlToStart);
                return;
            }
        }

        if (downloadedApkFile != null && downloadedApkFile.exists() && !isDownloadingApk) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || getPackageManager().canRequestPackageInstalls()) {
                File toInstall = downloadedApkFile;
                downloadedApkFile = null;
                installDownloadedApk(toInstall);
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
                return "1.2.8";
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
                Intent intent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
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
