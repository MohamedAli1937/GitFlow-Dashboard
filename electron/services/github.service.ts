import { Octokit } from "@octokit/rest";

let octokit: Octokit | null = null;
let cachedUsername: string | null = null;

export function setToken(token: string) {
  if (!token) {
    octokit = null;
    cachedUsername = null;
    return;
  }
  octokit = new Octokit({
    auth: token,
  });
  cachedUsername = null;
}

export async function verifyAndSetToken(token: string) {
  if (!token) throw new Error("Token cannot be empty");
  const tempOctokit = new Octokit({ auth: token });
  const user = await tempOctokit.rest.users.getAuthenticated();
  octokit = tempOctokit;
  cachedUsername = user.data.login;
  return user.data;
}

export function clearTokenService() {
  octokit = null;
  cachedUsername = null;
}

export async function createIssue(owner: string, repo: string, title: string, body: string) {
  if (!octokit) throw new Error("No GitHub token set");
  try {
    const response = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body,
    });
    return response.data;
  } catch (error) {
    console.error("Create Issue Error:", error);
    throw error;
  }
}

export async function createPR(
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string
) {
  if (!octokit) throw new Error("No GitHub token set");
  try {
    const response = await octokit.rest.pulls.create({
      owner,
      repo,
      title,
      body,
      head,
      base,
    });
    return response.data;
  } catch (error) {
    console.error("Create PR Error:", error);
    throw error;
  }
}

export async function getRepos() {
  if (!octokit) throw new Error("No GitHub token set");

  const res = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: 100,
    sort: "updated",
  });

  return res.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
    owner: { login: repo.owner.login, avatar_url: repo.owner.avatar_url },
    description: repo.description || "",
    html_url: repo.html_url,
  }));
}

export async function getRepoDetails(owner: string, repo: string) {
  if (!octokit) throw new Error("No GitHub token set");

  if (!cachedUsername) {
    const user = await octokit.rest.users.getAuthenticated();
    cachedUsername = user.data.login;
  }
  const username = cachedUsername;

  const repoInfo = await octokit.rest.repos.get({
    owner,
    repo,
  });

  const targets = [{ owner, repo }];

  if (repoInfo.data.parent) {
    targets.push({
      owner: repoInfo.data.parent.owner.login,
      repo: repoInfo.data.parent.name,
    });
  }

  const results = await Promise.all(
    targets.map(async (t) => {
      const [allIssues, allPRs] = await Promise.all([
        octokit!.paginate(octokit!.rest.issues.listForRepo, {
          owner: t.owner,
          repo: t.repo,
          state: "all",
          per_page: 100,
          headers: { "If-None-Match": "", "Cache-Control": "no-cache", Pragma: "no-cache" },
        }),

        octokit!.paginate(octokit!.rest.pulls.list, {
          owner: t.owner,
          repo: t.repo,
          state: "all",
          per_page: 100,
          headers: { "If-None-Match": "", "Cache-Control": "no-cache", Pragma: "no-cache" },
        }),
      ]);

      return {
        issues: allIssues,
        prs: allPRs,
      };
    })
  );

  const allIssues = results.flatMap((r) => r.issues);
  const allPRs = results.flatMap((r) => r.prs);

  const myIssues = allIssues.filter((i) => {
    const isRealIssue = !i.pull_request;
    const isCreator = i.user?.login === username;
    const isAssignee =
      i.assignee?.login === username || i.assignees?.some((a: any) => a.login === username);
    return isRealIssue && (isCreator || isAssignee);
  });

  const myPRs = allPRs.filter((p) => {
    const isCreator = p.user?.login === username;
    const isAssignee =
      p.assignee?.login === username || p.assignees?.some((a: any) => a.login === username);
    return isCreator || isAssignee;
  });

  return {
    issues: myIssues.map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      html_url: i.html_url,
      body: i.body || "",
      repo: i.repository_url.split("/").slice(-2).join("/"),
    })),
    prs: myPRs.map((p) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      state: p.state,
      merged: p.merged_at !== null,
      html_url: p.html_url,
      head_ref: p.head?.ref || "",
      body: p.body || "",
      repo: p.base.repo.full_name,
    })),
  };
}

export async function getUserStats() {
  if (!octokit) throw new Error("No GitHub token set");

  if (!cachedUsername) {
    const user = await octokit.rest.users.getAuthenticated();
    cachedUsername = user.data.login;
  }
  const username = cachedUsername;

  const userInfo = await octokit.rest.users.getAuthenticated();

  // Use Search API to count issues and PRs authored by this user
  let totalIssues = 0;
  let totalPRs = 0;
  try {
    const issueSearch = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${username} is:issue`,
      per_page: 1,
    });
    totalIssues = issueSearch.data.total_count;
  } catch {
    /* search may fail on rate limit, default to 0 */
  }

  try {
    const prSearch = await octokit.rest.search.issuesAndPullRequests({
      q: `author:${username} is:pr`,
      per_page: 1,
    });
    totalPRs = prSearch.data.total_count;
  } catch {
    /* search may fail on rate limit, default to 0 */
  }

  return {
    username: userInfo.data.login,
    avatar_url: userInfo.data.avatar_url,
    name: userInfo.data.name || userInfo.data.login,
    bio: userInfo.data.bio || "",
    followers: userInfo.data.followers,
    following: userInfo.data.following,
    public_repos: userInfo.data.public_repos,
    total_repos: userInfo.data.public_repos + (userInfo.data.total_private_repos || 0),
    total_issues: totalIssues,
    total_prs: totalPRs,
    html_url: userInfo.data.html_url,
  };
}
