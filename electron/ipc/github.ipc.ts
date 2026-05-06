import { ipcMain } from "electron";
import { getRepos, getRepoDetails } from "../services/github.service";

ipcMain.handle("github:get-repos", async () => {
  return await getRepos();
});

ipcMain.handle("github:get-repo-details", async (_, fullName: string) => {
  const [owner, repo] = fullName.split("/");
  return await getRepoDetails(owner, repo);
});
