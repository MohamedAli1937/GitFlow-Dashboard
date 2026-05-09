import { ipcMain, dialog } from "electron";
import { getGitStatus, isGitRepo, createBranch, commitAndPush, renameBranch, deleteBranch } from "../services/git.service";

ipcMain.handle("git:select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const path = result.filePaths[0];
  const valid = await isGitRepo(path);

  if (!valid) {
    throw new Error("Selected folder is not a valid Git repository.");
  }

  return path;
});

ipcMain.handle("git:get-status", async (_event, path: string) => {
  return await getGitStatus(path);
});

ipcMain.handle("git:create-branch", async (_event, path: string, name: string) => {
  return await createBranch(path, name);
});

ipcMain.handle("git:commit-push", async (_event, path: string, message: string) => {
  return await commitAndPush(path, message);
});

ipcMain.handle("git:rename-branch", async (_event, path: string, oldName: string, newName: string) => {
  return await renameBranch(path, oldName, newName);
});

ipcMain.handle("git:delete-branch", async (_event, path: string, name: string) => {
  return await deleteBranch(path, name);
});
