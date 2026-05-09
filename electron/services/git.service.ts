import { simpleGit, SimpleGit } from "simple-git";

export async function getGitStatus(path: string) {
  try {
    const git: SimpleGit = simpleGit(path);
    const status = await git.status();
    const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
    const branches = await git.branchLocal();

    return {
      branch,
      branches: branches.all,
      isDirty: status.files.length > 0,
      ahead: status.ahead,
      behind: status.behind,
    };
  } catch (error) {
    console.error("Git Status Error:", error);
    return null;
  }
}

export async function isGitRepo(path: string) {
  try {
    const git = simpleGit(path);
    return await git.checkIsRepo();
  } catch {
    return false;
  }
}

export async function createBranch(path: string, branchName: string) {
  try {
    const git = simpleGit(path);
    await git.checkoutLocalBranch(branchName);
    return true;
  } catch (error) {
    console.error("Create Branch Error:", error);
    throw error;
  }
}

export async function commitAndPush(path: string, message: string) {
  try {
    const git = simpleGit(path);
    await git.add(".");
    await git.commit(message);
    
    // Get current branch name and push with --set-upstream so new branches work
    const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
    await git.push(["-u", "origin", branch]);
    return true;
  } catch (error) {
    console.error("Commit & Push Error:", error);
    throw error;
  }
}

export async function renameBranch(path: string, oldName: string, newName: string) {
  try {
    const git = simpleGit(path);
    await git.branch(["-m", oldName, newName]);
    return true;
  } catch (error) {
    console.error("Rename Branch Error:", error);
    throw error;
  }
}

export async function deleteBranch(path: string, name: string) {
  try {
    const git = simpleGit(path);
    const branches = await git.branchLocal();
    
    try {
      // Force delete the branch
      await git.branch(["-D", name]);
    } catch (deleteErr: any) {
      // If it fails because it's checked out (used by worktree), switch to another branch and retry
      if (deleteErr.message && (deleteErr.message.includes("used by worktree") || deleteErr.message.includes("checked out at"))) {
        let defaultBranch = branches.all.includes("main") ? "main" : (branches.all.includes("master") ? "master" : null);
        if (!defaultBranch) {
          defaultBranch = branches.all.find(b => b !== name && !b.startsWith("*"));
        }
        
        if (defaultBranch) {
          await git.checkout(defaultBranch);
          await git.branch(["-D", name]); // Retry delete after switching
        } else {
          throw new Error("Cannot delete active branch: No other branch exists to switch to.");
        }
      } else {
        throw deleteErr;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Delete Branch Error:", error);
    throw error;
  }
}
