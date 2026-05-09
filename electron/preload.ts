import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getRepos: () => ipcRenderer.invoke("github:get-repos"),
  getRepoDetails: (fullName: string) => ipcRenderer.invoke("github:get-repo-details", fullName),
  createIssue: (fullName: string, title: string, body: string) => ipcRenderer.invoke("github:create-issue", fullName, title, body),
  selectFolder: () => ipcRenderer.invoke("git:select-folder"),
  getGitStatus: (path: string) => ipcRenderer.invoke("git:get-status", path),
  createBranch: (path: string, name: string) => ipcRenderer.invoke("git:create-branch", path, name),
  commitAndPush: (path: string, message: string) => ipcRenderer.invoke("git:commit-push", path, message),
  openVSCode: (path: string) => ipcRenderer.invoke("shell:open-vscode", path),
  renameBranch: (path: string, oldName: string, newName: string) => ipcRenderer.invoke("git:rename-branch", path, oldName, newName),
  deleteBranch: (path: string, name: string) => ipcRenderer.invoke("git:delete-branch", path, name),
  createPR: (fullName: string, title: string, body: string, head: string, base: string) => ipcRenderer.invoke("github:create-pr", fullName, title, body, head, base),
});
