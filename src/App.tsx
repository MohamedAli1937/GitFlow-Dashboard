import { useEffect, useState } from "react";
import { electronAPI } from "./api/bridge";

export default function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");
  
  const [localPaths, setLocalPaths] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("local_repo_paths");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [gitStatus, setGitStatus] = useState<any>(null);
  
  const [manualLinks, setManualLinks] = useState<Record<number, number[]>>(() => {
    try {
      const saved = localStorage.getItem("manual_links_v2");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [manualBranchLinks, setManualBranchLinks] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem("manual_branch_links");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    electronAPI.getRepos().then(setRepos).catch(console.error);
  }, []);

  useEffect(() => {
    localStorage.setItem("local_repo_paths", JSON.stringify(localPaths));
  }, [localPaths]);

  useEffect(() => {
    localStorage.setItem("manual_links_v2", JSON.stringify(manualLinks));
  }, [manualLinks]);

  useEffect(() => {
    localStorage.setItem("manual_branch_links", JSON.stringify(manualBranchLinks));
  }, [manualBranchLinks]);

  useEffect(() => {
    if (!selectedRepo || !localPaths[selectedRepo]) {
      setGitStatus(null);
      return;
    }
    const refresh = async () => {
      try {
        const status = await electronAPI.getGitStatus(localPaths[selectedRepo]);
        setGitStatus(status);
      } catch (err) { console.error(err); }
    };
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [selectedRepo, localPaths]);

  // Silent GitHub auto-refresh
  useEffect(() => {
    if (!selectedRepo) return;
    const interval = setInterval(() => {
      openRepo(selectedRepo, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedRepo]);

  async function linkLocalFolder() {
    if (!selectedRepo) return;
    try {
      const path = await electronAPI.selectFolder();
      if (path) setLocalPaths(prev => ({ ...prev, [selectedRepo]: path }));
    } catch (err: any) { alert(err.message); }
  }

  const [renamingBranch, setRenamingBranch] = useState<string | null>(null);

  async function handleCreateBranch(branchName: string) {
    if (!selectedRepo) return;
    if (!localPaths[selectedRepo]) {
      alert("Please link a local folder first (use the button on the detail page).");
      return;
    }
    if (!branchName) return;
    try {
      await electronAPI.createBranch(localPaths[selectedRepo], branchName);
      
      // Always auto-link the branch to the current item
      if (selectedItem?.number) {
        setManualBranchLinks(prev => ({ ...prev, [selectedItem.number]: branchName }));
      }

      const status = await electronAPI.getGitStatus(localPaths[selectedRepo]);
      setGitStatus(status);
    } catch (err: any) { alert(err.message); }
  }

  async function submitRename(oldName: string, newName: string) {
    if (!selectedRepo || !localPaths[selectedRepo] || !newName || newName === oldName) {
      setRenamingBranch(null);
      return;
    }
    try {
      await electronAPI.renameBranch(localPaths[selectedRepo], oldName, newName);
      setRenamingBranch(null);
      
      // Auto-link the new name to any issue that was linked to the old name
      setManualBranchLinks(prev => {
        const next = { ...prev };
        for (const [key, linkedName] of Object.entries(next)) {
          if (linkedName === oldName) next[Number(key)] = newName;
        }
        return next;
      });

      // Also link to the current selectedItem's issue if viewing detail page
      if (selectedItem?.number) {
        setManualBranchLinks(prev => ({ ...prev, [selectedItem.number]: newName }));
      }

      const status = await electronAPI.getGitStatus(localPaths[selectedRepo]);
      setGitStatus(status);
    } catch (err: any) { alert(err.message); }
  }

  async function handleDeleteBranch(name: string) {
    if (!selectedRepo || !localPaths[selectedRepo]) return;
    if (!confirm(`Delete branch "${name}"?`)) return;
    
    // Always clear manual links for this branch name, regardless of success/failure
    setManualBranchLinks(prev => {
      const next = { ...prev };
      for (const [key, linkedName] of Object.entries(next)) {
        if (linkedName === name) delete next[Number(key)];
      }
      return next;
    });

    // Optimistically remove from gitStatus so UI updates immediately
    setGitStatus((prev: any) => prev ? { 
      ...prev, 
      branches: prev.branches.filter((b: string) => b !== name),
      branch: prev.branch === name ? "main" : prev.branch
    } : null);

    try {
      await electronAPI.deleteBranch(localPaths[selectedRepo], name);
    } catch (err: any) { 
      if (!err.message.includes("not found")) {
        alert(err.message); 
      }
    }
    
    // Refresh real status from git
    try {
      const status = await electronAPI.getGitStatus(localPaths[selectedRepo]);
      setGitStatus(status);
    } catch (e) { console.error(e); }
  }

  const handleManualLinkBranch = (issueNumber: number, branchName: string) => {
    setManualBranchLinks(prev => ({ ...prev, [issueNumber]: branchName }));
  };

  async function handleOpenVSCode() {
    if (!selectedRepo) return;
    if (!localPaths[selectedRepo]) {
      alert("Please link a local folder first.");
      return;
    }
    try {
      await electronAPI.openVSCode(localPaths[selectedRepo]);
    } catch (err: any) { alert(err.message); }
  }

  async function handleCommitAndPush() {
    if (!selectedRepo) return;
    if (!localPaths[selectedRepo]) {
      alert("Please link a local folder first.");
      return;
    }
    if (!commitMessage.trim()) {
      alert("Please enter a commit message.");
      return;
    }
    try {
      await electronAPI.commitAndPush(localPaths[selectedRepo], commitMessage.trim());
      setCommitMessage("");
      const status = await electronAPI.getGitStatus(localPaths[selectedRepo]);
      setGitStatus(status);
    } catch (err: any) { alert("Commit & Push failed: " + err.message); }
  }

  async function handleCreateNewIssue(title: string, body: string) {
    if (!selectedRepo) return;
    try {
      const newIssue = await electronAPI.createIssue(selectedRepo, title, body);
      setIsCreateModalOpen(false);
      
      // Optimistically add to the UI immediately
      setData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          issues: [{
            id: newIssue.id,
            number: newIssue.number,
            title: newIssue.title,
            state: newIssue.state,
            html_url: newIssue.html_url,
            body: newIssue.body || "",
            repo: selectedRepo.split("/")[1]
          }, ...(prev.issues || [])]
        };
      });
    } catch (err: any) { alert(err.message); }
  }

  async function handleCreatePR() {
    if (!selectedRepo || !gitStatus?.branch) return;
    const head = gitStatus.branch;
    const title = prTitle.trim() || head;
    try {
      await electronAPI.createPR(selectedRepo, title, prBody, head, "main");
      setPrTitle("");
      setPrBody("");
      setTimeout(() => {
        openRepo(selectedRepo);
      }, 1500);
    } catch (err: any) { alert("Create PR failed: " + err.message); }
  }

  async function openRepo(fullName: string, silent = false) {
    if (!silent) {
      setSelectedRepo(fullName);
      setLoading(true);
      setData(null);
      setSelectedItem(null);
    }
    try {
      const details = await electronAPI.getRepoDetails(fullName);
      setData(details);
      
      // If silently refreshing, keep the currently selected item up to date
      if (silent) {
        setSelectedItem((prev: any) => {
          if (!prev) return null;
          if (prev.type === "issue") {
            const updated = (details.issues || []).find((i: any) => i.id === prev.id);
            return updated ? { type: "issue", ...updated } : prev;
          }
          if (prev.type === "pr") {
            const updated = (details.prs || []).find((p: any) => p.id === prev.id);
            return updated ? { type: "pr", ...updated } : prev;
          }
          return prev;
        });
      }
    } catch (err: any) { alert(err.message); } finally { if (!silent) setLoading(false); }
  }

  const handleLinkIssue = (prNumber: number, issueNumber: number) => {
    setManualLinks((prev) => {
      const existing = prev[prNumber] || [];
      if (existing.includes(issueNumber)) return prev;
      return { ...prev, [prNumber]: [...existing, issueNumber] };
    });
  };

  const handleUnlinkIssue = (prNumber: number, issueNumber: number) => {
    setManualLinks((prev) => {
      const existing = prev[prNumber] || [];
      return { ...prev, [prNumber]: existing.filter((n) => n !== issueNumber) };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "merged_pr": return { bg: "#7c3aed", text: "#fff" };
      case "open_pr": return { bg: "#22c55e", text: "#fff" };
      case "in_progress": return { bg: "#f97316", text: "#fff" };
      case "closed_pr": return { bg: "#ef4444", text: "#fff" };
      case "closed_issue": return { bg: "#6b7280", text: "#fff" };
      default: return { bg: "#6b7280", text: "#fff" };
    }
  };

  if (selectedRepo && loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", backgroundColor: "#f3f4f6", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#1f2937" }}>
        <div style={{ fontSize: "40px", marginBottom: "20px" }}>⏳</div>
        <h2 style={{ color: "#1f2937" }}>Loading Data...</h2>
        <p style={{ color: "#6b7280" }}>Fetching issues and pull requests from GitHub</p>
      </div>
    );
  }

  // --- VIEW 1: DETAIL PAGE ---
  if (selectedRepo && data && selectedItem) {
    const isIssue = selectedItem.type === "issue";
    const isPR = selectedItem.type === "pr";
    const itemNum = selectedItem.number;
    const itemTitle = selectedItem.title;
    const currentBranches: string[] = gitStatus?.branches || [];
    const linkedPR = isIssue ? (data.prs || []).find((p: any) => [p.title||"",p.body||"",p.head_ref||""].join(" ").includes(`#${itemNum}`)) : null;
    const autoBranch = currentBranches.find((b: string) => { const m = b.match(/feature\/(\d+)/); return m && m[1] === itemNum?.toString(); });
    const manualBranch = manualBranchLinks[itemNum];
    const validManualBranch = manualBranch && currentBranches.includes(manualBranch) ? manualBranch : null;
    const activeBranch = autoBranch || validManualBranch || (isPR ? selectedItem.head_ref : null);
    const isClosed = selectedItem.state === "closed";
    const isMerged = isPR && selectedItem.merged;
    const done = isClosed || isMerged;

    return (
      <div style={{ padding: "20px", fontFamily: "sans-serif", backgroundColor: "#f3f4f6", minHeight: "100vh", color: "#1f2937", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <button onClick={() => setSelectedItem(null)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#1f2937", cursor: "pointer", fontWeight: 600 }}>← Back</button>
          <h2 style={{ margin: 0, marginLeft: "20px", fontSize: "24px" }}>{isIssue ? "📋" : "🔀"} #{itemNum} {itemTitle}</h2>
          {selectedItem.html_url && <button onClick={() => window.open(selectedItem.html_url, "_blank")} style={{ marginLeft: "auto", padding: "6px 12px", borderRadius: "4px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#1f2937", cursor: "pointer", fontWeight: 600, fontSize: "12px" }}>View on GitHub</button>}
        </div>
        <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", width: "100%", flex: 1, boxSizing: "border-box" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Step 1 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
              <div style={{ fontWeight: 700 }}>1. Create Issue</div>
              <div style={{ color: "#10b981", fontWeight: 700 }}>✓ {isIssue ? `#${itemNum}` : (linkedPR ? "Linked" : "N/A")}</div>
            </div>
            {/* Step 2: Branch */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ fontWeight: 700 }}>2. Create Branch</div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {done ? (<div style={{ color: "#10b981", fontWeight: 700 }}>✓ Completed ({activeBranch || "branch"})</div>
                ) : activeBranch ? (
                  renamingBranch === activeBranch ? (
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      <input id="renameInput" defaultValue={activeBranch} style={{ padding: "4px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "12px", width: "200px", color: "#1f2937", backgroundColor: "#fff" }} />
                      <button onClick={() => submitRename(activeBranch, (document.getElementById("renameInput") as HTMLInputElement).value)} style={{ background: "#10b981", border: "none", color: "#fff", cursor: "pointer", fontSize: "12px", padding: "4px 8px", borderRadius: "4px" }}>Save</button>
                      <button onClick={() => setRenamingBranch(null)} style={{ background: "#ef4444", border: "none", color: "#fff", cursor: "pointer", fontSize: "12px", padding: "4px 8px", borderRadius: "4px" }}>Cancel</button>
                    </div>
                  ) : (<>
                    <span style={{ backgroundColor: "#e0e7ff", color: "#4f46e5", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", fontWeight: 600 }}>{activeBranch}</span>
                    <button onClick={() => setRenamingBranch(activeBranch)} style={{ background: "none", border: "none", color: "#4f46e5", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>Rename</button>
                    <button onClick={() => handleDeleteBranch(activeBranch)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>Delete</button>
                  </>)
                ) : (<>
                  <select onChange={(e) => handleManualLinkBranch(itemNum, e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "12px", color: "#1f2937", backgroundColor: "#fff" }}>
                    <option value="">Link existing branch...</option>
                    {gitStatus?.branches?.map((b: string) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>or</span>
                  <input key={`input-${itemNum}`} id="newBranchName" defaultValue={`feature/${itemNum}-${(itemTitle||"").toLowerCase().replace(/[^a-z0-9]/g,"-")}`} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #d1d5db", width: "220px", fontSize: "13px", color: "#1f2937", backgroundColor: "#fff" }} />
                  <button onClick={() => { const el = document.getElementById("newBranchName") as HTMLInputElement; handleCreateBranch(el?.value); }} style={{ padding: "6px 12px", borderRadius: "4px", border: "none", backgroundColor: "#4f46e5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>Create</button>
                </>)}
              </div>
            </div>
            {/* Step 3: Code */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
              <div style={{ fontWeight: 700 }}>3. Update Code</div>
              {done ? <div style={{ color: "#10b981", fontWeight: 700 }}>✓ Completed</div> : <button onClick={handleOpenVSCode} style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#1f2937", cursor: "pointer", fontWeight: 600 }}>Open VS Code</button>}
            </div>
            {/* Step 4: Commit */}
            <div style={{ padding: "15px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: gitStatus?.isDirty && !done ? "12px" : "0" }}>
                <div style={{ fontWeight: 700 }}>4. Commit & Push</div>
                {done ? <div style={{ color: "#10b981", fontWeight: 700 }}>✓ Completed</div> : <span style={{ fontSize: "13px", color: gitStatus?.isDirty ? "#d97706" : "#6b7280" }}>{gitStatus?.isDirty ? "Uncommitted changes" : "Clean"}</span>}
              </div>
              {gitStatus?.isDirty && !done && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input value={commitMessage} onChange={(e) => setCommitMessage(e.target.value)} placeholder="Commit message..." style={{ flex: 1, padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1f2937", backgroundColor: "#fff" }} />
                  <button onClick={handleCommitAndPush} style={{ padding: "8px 16px", borderRadius: "4px", border: "none", backgroundColor: "#10b981", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Commit & Push</button>
                </div>
              )}
            </div>
            {/* Step 5: PR */}
            <div style={{ padding: "15px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: activeBranch && !done && !linkedPR && isIssue ? "12px" : "0" }}>
                <div style={{ fontWeight: 700 }}>5. Pull Request</div>
                {done ? <div style={{ color: "#10b981", fontWeight: 700 }}>✓ {isMerged ? "Merged" : "Completed"}</div>
                  : linkedPR ? <div style={{ color: "#10b981", fontWeight: 700 }}>✓ PR #{linkedPR.number}</div>
                  : isPR && selectedItem.state === "open" ? <div style={{ color: "#10b981", fontWeight: 700 }}>✓ Open</div>
                  : !activeBranch ? <span style={{ fontSize: "13px", color: "#6b7280", fontStyle: "italic" }}>Create a branch first</span> : null}
              </div>
              {activeBranch && !done && !linkedPR && isIssue && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input value={prTitle} onChange={(e) => setPrTitle(e.target.value)} placeholder={`PR title (default: ${activeBranch})`} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "13px", color: "#1f2937", backgroundColor: "#fff" }} />
                  <textarea value={prBody} onChange={(e) => setPrBody(e.target.value)} placeholder="PR description (optional)" rows={3} style={{ padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db", fontSize: "13px", fontFamily: "inherit", color: "#1f2937", backgroundColor: "#fff" }} />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}><button onClick={handleCreatePR} style={{ padding: "8px 16px", borderRadius: "4px", border: "none", backgroundColor: "#4f46e5", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Create PR</button></div>
                </div>
              )}
            </div>
            {/* Step 6: Status */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
              <div style={{ fontWeight: 700 }}>6. Status</div>
              {isMerged ? <span style={{ backgroundColor: "#ede9fe", color: "#7c3aed", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", fontWeight: 600 }}>Merged</span>
                : isClosed ? <span style={{ backgroundColor: "#fee2e2", color: "#ef4444", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", fontWeight: 600 }}>Closed</span>
                : <span style={{ backgroundColor: "#dcfce7", color: "#16a34a", padding: "4px 8px", borderRadius: "4px", fontSize: "13px", fontWeight: 600 }}>Open</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }




  // --- Helper: extract issue numbers from text ---
  const extractIssueNumbers = (text: string): number[] => {
    if (!text) return [];
    const regex = /(?:fixes|closes|resolves|addresses)?\s*#(\d+)/gi;
    return [...text.matchAll(regex)].map((m) => parseInt(m[1], 10));
  };

  // --- VIEW 2: KANBAN BOARD ---
  if (selectedRepo && data) {
    // Build link maps: issue# -> PR#[] and PR# -> issue#[]
    const issueToPRs: Record<number, number[]> = {};
    const prToIssues: Record<number, number[]> = {};

    const issues = data.issues || [];
    const prs = data.prs || [];
    const issueNumberSet = new Set(issues.map((i: any) => i.number));
    const prNumberSet = new Set(prs.map((p: any) => p.number));

    (data.prs || []).forEach((pr: any) => {
      const nums = [...new Set([
        ...extractIssueNumbers(pr.title || ""),
        ...extractIssueNumbers(pr.body || ""),
        ...extractIssueNumbers(pr.head_ref || ""),
      ])].filter((n) => issueNumberSet.has(n)); // Only link to real issues
      nums.forEach((n) => {
        if (!issueToPRs[n]) issueToPRs[n] = [];
        if (!issueToPRs[n].includes(pr.number)) issueToPRs[n].push(pr.number);
        if (!prToIssues[pr.number]) prToIssues[pr.number] = [];
        if (!prToIssues[pr.number].includes(n)) prToIssues[pr.number].push(n);
      });
    });

    // Add manual links (only if PR and issue numbers are real)
    Object.entries(manualLinks).forEach(([prNum, issueNums]) => {
      const pn = Number(prNum);
      if (!prNumberSet.has(pn)) return; // skip if PR doesn't exist
      issueNums.forEach((n) => {
        if (!issueNumberSet.has(n)) return; // skip if issue doesn't exist
        if (!issueToPRs[n]) issueToPRs[n] = [];
        if (!issueToPRs[n].includes(pn)) issueToPRs[n].push(pn);
        if (!prToIssues[pn]) prToIssues[pn] = [];
        if (!prToIssues[pn].includes(n)) prToIssues[pn].push(n);
      });
    });



    const openIssues = issues.filter((i: any) => i.state === "open");
    const closedIssues = issues.filter((i: any) => i.state === "closed");
    const openPRs = prs.filter((p: any) => p.state === "open" && !p.merged);
    const mergedPRs = prs.filter((p: any) => p.merged);
    const closedPRs = prs.filter((p: any) => p.state === "closed" && !p.merged);

    const cardStyle = (highlight = false) => ({ backgroundColor: "#fff", borderRadius: "8px", padding: "14px", border: highlight ? "2px solid #4f46e5" : "1px solid #d1d5db", cursor: "pointer", transition: "box-shadow 0.15s", color: "#1f2937" });
    const colStyle = { minWidth: "280px", flex: 1, backgroundColor: "#e5e7eb", borderRadius: "12px", padding: "14px" };
    const headStyle = { margin: 0, textTransform: "uppercase" as const, fontSize: "12px", color: "#4b5563", letterSpacing: "0.5px" };
    const badgeStyle = { backgroundColor: "#d1d5db", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", color: "#1f2937" };
    const linkBadge = (color: string) => ({ display: "inline-flex", alignItems: "center", gap: "3px", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700 as const, backgroundColor: color, color: "#fff", marginRight: "4px" });

    const renderIssueCard = (issue: any) => {
      const linkedPRs = issueToPRs[issue.number] || [];
      const branchName = manualBranchLinks[issue.number];
      const autoBranch = gitStatus?.branches?.find((b: string) => { const m = b.match(/feature\/(\d+)/); return m && m[1] === issue.number.toString(); });
      const activeBranch = autoBranch || branchName;
      const isCurrent = gitStatus?.branch === activeBranch;
      return (
        <div key={issue.id} onClick={() => setSelectedItem({ type: "issue", ...issue })} style={cardStyle(isCurrent)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ backgroundColor: issue.state === "open" ? "#22c55e" : "#6b7280", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 800 }}>{issue.state.toUpperCase()}</span>
            {isCurrent && <span title="Current Branch">💻</span>}
            {!isCurrent && activeBranch && <span title="Branch exists" style={{ opacity: 0.5 }}>📁</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}><span style={{ color: "#f97316" }}>#{issue.number}</span> {issue.title}</div>
          {linkedPRs.length > 0 && (
            <div style={{ marginTop: "6px" }}>
              {linkedPRs.map((prn) => <span key={prn} style={linkBadge("#4f46e5")}>🔗 PR #{prn}</span>)}
            </div>
          )}
        </div>
      );
    };

    const renderPRCard = (pr: any) => {
      const linkedIssueNums = prToIssues[pr.number] || [];
      const isCurrent = gitStatus?.branch === pr.head_ref;
      const statusColor = pr.merged ? "#7c3aed" : pr.state === "open" ? "#22c55e" : "#ef4444";
      const statusLabel = pr.merged ? "MERGED" : pr.state.toUpperCase();
      return (
        <div key={pr.id} onClick={() => setSelectedItem({ type: "pr", ...pr })} style={cardStyle(isCurrent)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { const num = parseInt(e.dataTransfer.getData("issueNumber")); if (num) handleLinkIssue(pr.number, num); }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ backgroundColor: statusColor, color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 800 }}>{statusLabel}</span>
            {isCurrent && <span title="Current Branch">💻</span>}
          </div>
          <div style={{ fontWeight: 700, fontSize: "14px", marginBottom: "6px" }}><span style={{ color: "#4f46e5" }}>#{pr.number}</span> {pr.title}</div>
          {linkedIssueNums.length > 0 && (
            <div style={{ marginTop: "6px" }}>
              {linkedIssueNums.map((n) => {
                const isManual = manualLinks[pr.number]?.includes(n);
                return (
                  <span key={n} style={{ ...linkBadge(isManual ? "#f97316" : "#10b981"), position: "relative" as const }}>
                    🔗 Issue #{n}
                    {isManual && <button onClick={(e) => { e.stopPropagation(); handleUnlinkIssue(pr.number, n); }} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0 0 0 4px", fontSize: "12px", fontWeight: "bold", lineHeight: 1 }} title="Unlink">×</button>}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      );
    };

    return (
      <div style={{ padding: "30px", fontFamily: "sans-serif", backgroundColor: "#f3f4f6", minHeight: "100vh", color: "#1f2937" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "24px" }}>Pipeline: <span style={{ color: "#4f46e5" }}>{selectedRepo}</span></h1>
            <div style={{ display: "flex", gap: "10px", marginTop: "5px", fontSize: "12px", alignItems: "center" }}>
              {localPaths[selectedRepo] ? (
                <>
                  <span style={{ color: "#6b7280" }}>📁 {localPaths[selectedRepo]}</span>
                  <button onClick={linkLocalFolder} style={{ padding: "2px 8px", fontSize: "10px", borderRadius: "4px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#1f2937", cursor: "pointer", fontWeight: 600 }}>Change</button>
                  {gitStatus && <span style={{ color: "#059669", fontWeight: 800 }}>🌿 {gitStatus.branch} {gitStatus.isDirty && "*(dirty)*"}</span>}
                </>
              ) : (
                <button onClick={linkLocalFolder} style={{ color: "#4f46e5", border: "none", background: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>🔗 Link Local Folder</button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setIsCreateModalOpen(true)} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#4f46e5", color: "#fff", cursor: "pointer", fontWeight: 600 }}>+ New Issue</button>
            <button onClick={() => setSelectedRepo(null)} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", backgroundColor: "#1f2937", color: "#fff", cursor: "pointer", fontWeight: 600 }}>← Change Repo</button>
          </div>
        </div>

        {/* ISSUES SECTION */}
        <h2 style={{ fontSize: "16px", marginBottom: "12px", color: "#374151" }}>📋 Issues</h2>
        <div style={{ display: "flex", gap: "16px", marginBottom: "30px", overflowX: "auto", paddingBottom: "10px" }}>
          {[{ title: "Open", items: openIssues }, { title: "Closed", items: closedIssues }].map(({ title, items }) => (
            <div key={title} style={colStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={headStyle}>{title}</h3>
                <span style={badgeStyle}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((i: any) => renderIssueCard(i))}
              </div>
            </div>
          ))}
        </div>

        {/* PRS SECTION */}
        <h2 style={{ fontSize: "16px", marginBottom: "12px", color: "#374151" }}>🔀 Pull Requests</h2>
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "10px" }}>
          {[{ title: "Open", items: openPRs }, { title: "Merged", items: mergedPRs }, { title: "Closed", items: closedPRs }].map(({ title, items }) => (
            <div key={title} style={colStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={headStyle}>{title}</h3>
                <span style={badgeStyle}>{items.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {items.map((p: any) => renderPRCard(p))}
              </div>
            </div>
          ))}
        </div>

        {/* Create Issue Modal */}
        {isCreateModalOpen && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", zIndex: 10001, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "450px", backgroundColor: "#fff", borderRadius: "12px", padding: "30px", color: "#1f2937" }}>
              <h2 style={{ marginTop: 0 }}>New GitHub Issue</h2>
              <form onSubmit={(e: any) => { e.preventDefault(); handleCreateNewIssue(e.target.title.value, e.target.body.value); }}>
                <div style={{ marginBottom: "15px" }}><label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "5px" }}>Title</label><input name="title" required style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", color: "#1f2937", backgroundColor: "#fff", boxSizing: "border-box" }} /></div>
                <div style={{ marginBottom: "20px" }}><label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "5px" }}>Description</label><textarea name="body" rows={4} style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #d1d5db", color: "#1f2937", backgroundColor: "#fff", boxSizing: "border-box" }} /></div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none", backgroundColor: "#4f46e5", color: "#fff", fontWeight: 700, cursor: "pointer" }}>CREATE ISSUE</button>
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#fff", color: "#1f2937", cursor: "pointer", fontWeight: 600 }}>CANCEL</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- VIEW 3: HOME SCREEN ---
  return (
    <div style={{ padding: "40px", backgroundColor: "#f3f4f6", minHeight: "100vh", fontFamily: "sans-serif", color: "#1f2937" }}>
      <h1 style={{ textAlign: "center", marginBottom: "10px", fontSize: "32px", color: "#111827" }}>🚀 GitFlow Dashboard</h1>
      <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "40px", fontSize: "14px" }}>Select a repository to manage your workflow</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
        {repos.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#6b7280", padding: "60px 0" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
            Loading repositories...
          </div>
        ) : (
          repos.map((repo) => (
            <div key={repo.id} onClick={() => openRepo(repo.full_name)} style={{ padding: "24px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "12px", color: "#4f46e5", fontWeight: 700 }}>{repo.owner?.login}</div>
                {repo.private && <span style={{ fontSize: "10px", backgroundColor: "#fef3c7", color: "#92400e", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>PRIVATE</span>}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{repo.name}</div>
              <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{repo.description || "No description provided."}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
