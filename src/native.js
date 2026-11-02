import { Capacitor, registerPlugin } from "@capacitor/core";

const AppLauncher = registerPlugin("AppLauncher");

export const isApp = Capacitor.isNativePlatform();

// Opens the real NOW app on the Fire Stick. Returns true if it opened.
export async function openNowApp() {
  if (!isApp) return false;
  try {
    const r = await AppLauncher.openByName({ name: "NOW" });
    return !!r.opened;
  } catch {
    return false;
  }
}

export async function listApps() {
  if (!isApp) return "Not running as an installed app.";
  try {
    return (await AppLauncher.listApps()).apps;
  } catch (e) {
    return String(e);
  }
}
