import { Octokit } from "@octokit/rest";

let octokit: Octokit | null = null;
let cachedUsername: string | null = null;

export function setToken(token: string) {
  octokit = new Octokit({
    auth: token,
  });
  cachedUsername = null;
}

export async function getRepos() {
  if (!octokit) throw new Error("No GitHub token set");

  const res = await octokit.rest.repos.listForAuthenticatedUser({
    per_page: 20,
  });

  return res.data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    private: repo.private,
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
        }),

        octokit!.paginate(octokit!.rest.pulls.list, {
          owner: t.owner,
          repo: t.repo,
          state: "all",
          per_page: 100,
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

  const extractIssueNumbers = (text: string): number[] => {
    if (!text) return [];
    const regex = /(?:fixes|closes|resolves|addresses)?\s*#(\d+)/gi;
    const matches = [...text.matchAll(regex)];
    return matches.map((m) => parseInt(m[1], 10));
  };
  const issueMap = new Map<number, any>();
  for (const i of allIssues) {
    if (!i.pull_request) {
      issueMap.set(i.number, i);
    }
  }

  const linkedIssueNumbers = new Set<number>();

  const prPipeline = myPRs.map((pr) => {
    const foundNumbers = extractIssueNumbers(pr.title || "")
      .concat(extractIssueNumbers(pr.body || ""))
      .concat(extractIssueNumbers(pr.head?.ref || ""));

    const linkedIssue = foundNumbers
      .map((num) => issueMap.get(num))
      .find((issue) => issue !== undefined);

    if (linkedIssue) {
      linkedIssueNumbers.add(linkedIssue.number);
    }

    let status = "open_pr";
    if (pr.merged_at) {
      status = "merged_pr";
    } else if (pr.state === "closed") {
      status = "closed_pr";
    }

    return {
      issue: linkedIssue || null,
      pr: {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        merged: pr.merged_at !== null,
        repo: pr.base.repo.full_name,
      },
      status,
    };
  });

  const issuePipeline = myIssues
    .filter((i) => !linkedIssueNumbers.has(i.number))
    .map((i) => ({
      issue: {
        id: i.id,
        number: i.number,
        title: i.title,
        state: i.state,
        repo: i.repository_url.split("/").slice(-2).join("/"),
      },
      pr: null,
      status: "in_progress",
    }));

  const finalPipeline = [...issuePipeline, ...prPipeline];

  return {
    issues: myIssues.map((i) => ({
      id: i.id,
      number: i.number,
      title: i.title,
      state: i.state,
      repo: i.repository_url.split("/").slice(-2).join("/"),
    })),
    prs: myPRs.map((p) => ({
      id: p.id,
      number: p.number,
      title: p.title,
      state: p.state,
      merged: p.merged_at !== null,
      repo: p.base.repo.full_name,
    })),
    pipeline: finalPipeline,
  };
}
