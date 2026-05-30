import { ipcMain, shell } from "electron";
import { exec } from "child_process";

ipcMain.handle("shell:open-vscode", async (_event, path: string) => {
  return new Promise((resolve, reject) => {
    exec(`code "${path}"`, (error) => {
      if (error) {
        console.error("VS Code Launch Error:", error);
        reject(new Error("Could not launch VS Code. Make sure 'code' is in your PATH."));
      } else {
        resolve(true);
      }
    });
  });
});

ipcMain.handle("shell:open-external", async (_event, url: string) => {
  await shell.openExternal(url);
  return true;
});
