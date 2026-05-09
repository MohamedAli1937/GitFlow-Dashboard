import { ipcMain } from "electron";
import { exec } from "child_process";

ipcMain.handle("shell:open-vscode", async (_event, path: string) => {
  return new Promise((resolve, reject) => {
    // Run 'code .' in the directory. On Windows, it might need to be 'code.cmd' or just 'code'
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
