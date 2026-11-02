package com.anupjuneja.nowguide;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.ArrayList;
import java.util.List;

/**
 * Opens another installed app by its on-screen name (e.g. "NOW").
 * Looks through apps that show on the Fire TV home screen.
 */
@CapacitorPlugin(name = "AppLauncher")
public class AppLauncherPlugin extends Plugin {

    private List<ResolveInfo> launchable() {
        PackageManager pm = getContext().getPackageManager();
        List<ResolveInfo> all = new ArrayList<>();
        for (String cat : new String[] {Intent.CATEGORY_LEANBACK_LAUNCHER, Intent.CATEGORY_LAUNCHER}) {
            Intent i = new Intent(Intent.ACTION_MAIN).addCategory(cat);
            all.addAll(pm.queryIntentActivities(i, 0));
        }
        return all;
    }

    /** Returns every launchable app so we can see exactly what NOW is called. */
    @PluginMethod
    public void listApps(PluginCall call) {
        PackageManager pm = getContext().getPackageManager();
        StringBuilder sb = new StringBuilder();
        for (ResolveInfo ri : launchable()) {
            sb.append(ri.loadLabel(pm)).append(" = ").append(ri.activityInfo.packageName).append("\n");
        }
        JSObject out = new JSObject();
        out.put("apps", sb.toString());
        call.resolve(out);
    }

    /** Launch by exact label first ("NOW", "NOW TV"), then by label containing the name. */
    @PluginMethod
    public void openByName(PluginCall call) {
        String name = call.getString("name", "NOW").trim().toLowerCase();
        PackageManager pm = getContext().getPackageManager();
        ResolveInfo exact = null, partial = null;
        for (ResolveInfo ri : launchable()) {
            String label = String.valueOf(ri.loadLabel(pm)).trim().toLowerCase();
            if (label.equals(name) || label.equals(name + " tv")) { exact = ri; break; }
            if (partial == null && label.startsWith(name + " ")) partial = ri;
        }
        ResolveInfo pick = exact != null ? exact : partial;
        JSObject out = new JSObject();
        if (pick == null) {
            out.put("opened", false);
            call.resolve(out);
            return;
        }
        Intent launch = new Intent(Intent.ACTION_MAIN);
        launch.setClassName(pick.activityInfo.packageName, pick.activityInfo.name);
        launch.addCategory(Intent.CATEGORY_LAUNCHER);
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        String deeplink = call.getString("url");
        try {
            if (deeplink != null && !deeplink.isEmpty()) {
                Intent view = new Intent(Intent.ACTION_VIEW, Uri.parse(deeplink));
                view.setPackage(pick.activityInfo.packageName);
                view.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                try { getContext().startActivity(view); out.put("opened", true); out.put("deepLinked", true); call.resolve(out); return; }
                catch (Exception ignored) { /* fall back to plain launch */ }
            }
            getContext().startActivity(launch);
            out.put("opened", true);
            out.put("package", pick.activityInfo.packageName);
        } catch (Exception e) {
            out.put("opened", false);
            out.put("error", String.valueOf(e.getMessage()));
        }
        call.resolve(out);
    }
}
