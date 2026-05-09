export interface ElectronAPI {
  getRepos: () => Promise<any[]>;
  getRepoDetails: (fullName: string) => Promise<any>;
  createIssue: (fullName: string, title: string, body: string) => Promise<any>;
  selectFolder: () => Promise<string | null>;
  getGitStatus: (path: string) => Promise<any>;
  createBranch: (path: string, name: string) => Promise<boolean>;
  commitAndPush: (path: string, message: string) => Promise<boolean>;
  openVSCode: (path: string) => Promise<boolean>;
  renameBranch: (path: string, oldName: string, newName: string) => Promise<boolean>;
  deleteBranch: (path: string, name: string) => Promise<boolean>;
  createPR: (fullName: string, title: string, body: string, head: string, base: string) => Promise<any>;
}

export const electronAPI: ElectronAPI = (window as any).electronAPI;
