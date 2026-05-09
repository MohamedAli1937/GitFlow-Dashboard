import { ipcMain } from "electron";
import { getRepos, getRepoDetails, createIssue, createPR } from "../services/github.service";

ipcMain.handle("github:get-repos", async () => {
  return await getRepos();
});

ipcMain.handle("github:get-repo-details", async (_, fullName: string) => {
  const [owner, repo] = fullName.split("/");
  return await getRepoDetails(owner, repo);
});

ipcMain.handle("github:create-issue", async (_, fullName: string, title: string, body: string) => {
  const [owner, repo] = fullName.split("/");
  return await createIssue(owner, repo, title, body);
});

ipcMain.handle("github:create-pr", async (_, fullName: string, title: string, body: string, head: string, base: string) => {
  const [owner, repo] = fullName.split("/");
  return await createPR(owner, repo, title, body, head, base);
});
