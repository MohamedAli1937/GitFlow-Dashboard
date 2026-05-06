import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  getRepos: () => ipcRenderer.invoke("github:get-repos"),
  getRepoDetails: (fullName: string) => ipcRenderer.invoke("github:get-repo-details", fullName),
});
