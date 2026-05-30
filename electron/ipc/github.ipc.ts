import { ipcMain } from "electron";
import {
  getRepos,
  getRepoDetails,
  createIssue,
  createPR,
  verifyAndSetToken,
  clearTokenService,
  getUserStats,
} from "../services/github.service";
import { store } from "../main";

interface StoredAccount {
  username: string;
  avatar_url: string;
  token: string;
}

function getAccounts(): StoredAccount[] {
  return (store.get("github_accounts") as StoredAccount[] | undefined) || [];
}

function saveAccounts(accounts: StoredAccount[]) {
  store.set("github_accounts", accounts);
}

function getActiveUsername(): string | null {
  return (store.get("active_username") as string | undefined) || null;
}

function setActiveUsername(username: string | null) {
  if (username) {
    store.set("active_username", username);
  } else {
    store.delete("active_username");
  }
}

ipcMain.handle("github:add-account", async (_, token: string) => {
  try {
    const user = await verifyAndSetToken(token);
    const accounts = getAccounts();
    const idx = accounts.findIndex((a) => a.username === user.login);
    const entry: StoredAccount = { username: user.login, avatar_url: user.avatar_url, token };
    if (idx >= 0) {
      accounts[idx] = entry;
    } else {
      accounts.push(entry);
    }
    saveAccounts(accounts);
    setActiveUsername(user.login);
    store.set("github_token", token);
    return { success: true, username: user.login, avatar_url: user.avatar_url };
  } catch (error: any) {
    console.error("Add Account Error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("github:get-accounts", async () => {
  const accounts = getAccounts();
  const active = getActiveUsername();
  return accounts.map((a) => ({
    username: a.username,
    avatar_url: a.avatar_url,
    active: a.username === active,
  }));
});

ipcMain.handle("github:switch-account", async (_, username: string) => {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.username === username);
  if (!account) return { success: false, error: "Account not found" };
  try {
    await verifyAndSetToken(account.token);
    setActiveUsername(username);
    store.set("github_token", account.token);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle("github:delete-account", async (_, username: string) => {
  let accounts = getAccounts();
  accounts = accounts.filter((a) => a.username !== username);
  saveAccounts(accounts);
  const active = getActiveUsername();
  if (active === username) {
    if (accounts.length > 0) {
      const next = accounts[0];
      await verifyAndSetToken(next.token);
      setActiveUsername(next.username);
      store.set("github_token", next.token);
      return { success: true, switchedTo: next.username };
    } else {
      clearTokenService();
      setActiveUsername(null);
      store.delete("github_token");
      return { success: true, switchedTo: null };
    }
  }
  return { success: true, switchedTo: active };
});

ipcMain.handle("github:get-profile-stats", async () => {
  try {
    return await getUserStats();
  } catch (error: any) {
    console.error("Get Profile Stats Error:", error);
    return null;
  }
});

ipcMain.handle("github:save-token", async (_, token: string) => {
  try {
    const user = await verifyAndSetToken(token);
    store.set("github_token", token);
    const accounts = getAccounts();
    const idx = accounts.findIndex((a) => a.username === user.login);
    const entry: StoredAccount = { username: user.login, avatar_url: user.avatar_url, token };
    if (idx >= 0) accounts[idx] = entry;
    else accounts.push(entry);
    saveAccounts(accounts);
    setActiveUsername(user.login);
    return { success: true, username: user.login };
  } catch (error: any) {
    console.error("Save Token Error:", error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle("github:clear-token", async () => {
  store.delete("github_token");
  clearTokenService();
  return true;
});

ipcMain.handle("github:has-token", async () => {
  const active = getActiveUsername();
  if (active) {
    const accounts = getAccounts();
    return accounts.some((a) => a.username === active);
  }
  const token = store.get("github_token");
  return typeof token === "string" && token.length > 0;
});

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

ipcMain.handle(
  "github:create-pr",
  async (_, fullName: string, title: string, body: string, head: string, base: string) => {
    const [owner, repo] = fullName.split("/");
    return await createPR(owner, repo, title, body, head, base);
  }
);
