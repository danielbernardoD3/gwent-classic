package com.danielbernardo.gwentclassic;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import java.io.File;

public class UpdateReplacedReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null || !Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction())) {
            return;
        }

        // Remove temporary downloaded update APK after successful installation
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

        // Automatically relaunch the newly updated Gwent Classic app
        try {
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            context.startActivity(launchIntent);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

