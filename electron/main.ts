import "dotenv/config";
import { app, BrowserWindow } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Store from "electron-store";

import "./ipc/github.ipc";
import "./ipc/git.ipc";
import "./ipc/shell.ipc";
import { setToken } from "./services/github.service";

export const store = new Store();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const activeUsername = store.get("active_username") as string | undefined;
  const accounts = (store.get("github_accounts") as any[] | undefined) || [];
  const activeAccount = activeUsername
    ? accounts.find((a: any) => a.username === activeUsername)
    : null;
  const token = activeAccount?.token || store.get("github_token") || process.env.GITHUB_TOKEN || "";
  setToken(token as string);

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
