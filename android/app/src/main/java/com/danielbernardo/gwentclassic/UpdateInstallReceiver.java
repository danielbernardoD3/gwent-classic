package com.danielbernardo.gwentclassic;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import java.io.File;

public class UpdateInstallReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        int status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
        String message = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);

        if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Intent confirmIntent = intent.getParcelableExtra(Intent.EXTRA_INTENT);
            if (confirmIntent != null) {
                confirmIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                try {
                    context.startActivity(confirmIntent);
                } catch (Exception e) {
                    e.printStackTrace();
                    if (MainActivity.currentInstance != null) {
                        MainActivity.currentInstance.fallbackViewInstall();
                    }
                }
            }
        } else if (status == PackageInstaller.STATUS_SUCCESS) {
            // Clean up downloaded APK from cache
            try {
                File extCache = context.getExternalCacheDir();
                if (extCache != null) {
                    File f = new File(extCache, "GwentClassic_update.apk");
                    if (f.exists()) f.delete();
                }
                File intCache = context.getCacheDir();
                if (intCache != null) {
                    File f = new File(intCache, "GwentClassic_update.apk");
                    if (f.exists()) f.delete();
                }
            } catch (Exception ignored) {}

            // Launch the newly updated Gwent Classic automatically
            try {
                Intent launchIntent = new Intent(context, MainActivity.class);
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                context.startActivity(launchIntent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else if (status != PackageInstaller.STATUS_FAILURE_ABORTED) {
            // If session install failed (e.g. OEM quirk or signature conflict), fallback to standard ACTION_VIEW installer
            if (MainActivity.currentInstance != null) {
                MainActivity.currentInstance.fallbackViewInstall();
            }
        }
    }
}

