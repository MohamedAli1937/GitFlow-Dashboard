import { useEffect, useState, useRef } from "react";
import { electronAPI } from "./api/bridge";

// --- GitHub Octicons & Custom SVGs ---
const GithubLogoIcon = ({ size = 20, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.88.01.64.01 1.22.01 1.35 0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
  </svg>
);

const IssueOpenedIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    <path
      fillRule="evenodd"
      d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0z"
    />
  </svg>
);

const IssueClosedIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path d="M11.28 4.72a.75.75 0 0 0-1.06 0L8 6.94 5.78 4.72a.75.75 0 0 0-1.06 1.06L6.94 8l-2.22 2.22a.75.75 0 1 0 1.06 1.06L8 9.06l2.22 2.22a.75.75 0 1 0 1.06-1.06L9.06 8l2.22-2.22a.75.75 0 0 0 0-1.06z" />
    <path
      fillRule="evenodd"
      d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-1.5 0a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z"
    />
  </svg>
);

const PrOpenedIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <circle cx="4" cy="3.5" r="1.5" />
    <circle cx="4" cy="12.5" r="1.5" />
    <circle cx="12" cy="3.5" r="1.5" />
    <path d="M4 5v6" />
    <path d="M12 5v2.5a2.5 2.5 0 0 1-2.5 2.5H4" />
  </svg>
);

const PrMergedIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <circle cx="4" cy="3.5" r="1.5" />
    <circle cx="4" cy="12.5" r="1.5" />
    <circle cx="12" cy="12.5" r="1.5" />
    <path d="M4 5v6" />
    <path d="M12 11V8.5a2.5 2.5 0 0 0-2.5-2.5H4" />
  </svg>
);

const PrClosedIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <circle cx="4" cy="3.5" r="1.5" />
    <circle cx="4" cy="12.5" r="1.5" />
    <circle cx="12" cy="3.5" r="1.5" />
    <path d="M4 5v6" />
    <path d="M12 5v2.5a2.5 2.5 0 0 1-2.5 2.5H4" />
    <path d="M10.5 10.5l3 3" />
    <path d="M13.5 10.5l-3 3" />
  </svg>
);

const BranchIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.378a2.251 2.251 0 1 1-1.5 0V5.372a2.251 2.251 0 1 1 1.5 0v3.128A2.5 2.5 0 0 1 7.5 6h2.5a1 1 0 0 0 1-1V5.372a2.25 2.25 0 0 1-1.5-2.122zM4.25 13.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5zM3.5 3.25a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0z"
    />
  </svg>
);

const RepoIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const LinkIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-2" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const UnlinkIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
    {...props}
  >
    <path d="M18.84 12.2a4.5 4.5 0 0 0-5.17-5.17" />
    <path d="M5.17 11.8a4.5 4.5 0 0 0 5.17 5.17" />
    <line x1="3" y1="3" x2="21" y2="21" />
  </svg>
);

const VSCodeIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    style={{
      display: "inline-block",
      verticalAlign: "middle",
      ...style,
    }}
    {...props}
  >
    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" />
  </svg>
);

const TrashIcon = ({ size = 16, style = {}, ...props }: any) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const PencilIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25a1.75 1.75 0 0 1 .445-.758l8.61-8.61zm1.414 1.06a.25.25 0 0 0-.353 0L10.5 4.06l1.44 1.44 1.573-1.573a.25.25 0 0 0 0-.353l-1.086-1.086zM9.44 5.12L8 3.68 2.81 8.87a.25.25 0 0 0-.064.108l-.58 2.03 2.03-.58a.25.25 0 0 0 .108-.064L9.44 5.12z"
    />
  </svg>
);

const BackIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.22 8.03a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.31 7.5h7.44a.75.75 0 0 1 0 1.5H4.31l3.47 3.47a.75.75 0 0 1 0 1.06z"
    />
  </svg>
);

const CheckIcon = ({ size = 16, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
    />
  </svg>
);

const ExternalLinkIcon = ({ size = 14, style = {}, ...props }) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M10.604 1h4.146a.25.25 0 0 1 .25.25v4.146a.25.25 0 0 1-.427.177L13.03 4.03 9.28 7.78a.75.75 0 0 1-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0 1 10.604 1zM3.75 2A1.75 1.75 0 0 0 2 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0 0 14 12.25v-3.5a.75.75 0 0 0-1.5 0v3.5a.25.25 0 0 1-.25.25h-8.5a.25.25 0 0 1-.25-.25v-8.5a.25.25 0 0 1 .25-.25h3.5a.75.75 0 0 0 0-1.5h-3.5z"
    />
  </svg>
);

const ChevronIcon = ({ size = 16, direction = "down", style = {}, ...props }: any) => (
  <svg
    viewBox="0 0 16 16"
    width={size}
    height={size}
    fill="currentColor"
    style={{
      display: "inline-block",
      verticalAlign: "middle",
      transition: "transform 0.2s ease",
      transform: direction === "up" ? "rotate(180deg)" : "rotate(0deg)",
      ...style,
    }}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12.78 6.22a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.22 7.28a.75.75 0 0 1 1.06-1.06L8 9.94l3.72-3.72a.75.75 0 0 1 1.06 0z"
    />
  </svg>
);

const HelpIcon = ({ size = 16, style = {}, ...props }: any) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = ({ size = 16, style = {}, ...props }: any) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prBody, setPrBody] = useState("");
  const [branchListOpen, setBranchListOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [accounts, setAccounts] = useState<
    { username: string; avatar_url: string; active: boolean }[]
  >([]);
  const [profileStats, setProfileStats] = useState<any>(null);
  const [showAddAccount, setShowAddAccount] = useState(false);

  const branchDropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchAccountsAndStats = async () => {
    try {
      const accList = await electronAPI.getAccounts();
      setAccounts(accList);
      const stats = await electronAPI.getProfileStats();
      setProfileStats(stats);
    } catch (err) {
      console.error("Error loading accounts or stats:", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setBranchListOpen(false);
      }
    }
    if (branchListOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [branchListOpen]);

  const [localPaths, setLocalPaths] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem("local_repo_paths");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [gitStatus, setGitStatus] = useState<any>(null);

  const [manualLinks, setManualLinks] = useState<Record<number, number[]>>(() => {
    try {
      const saved = localStorage.getItem("manual_links_v2");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [manualBranchLinks, setManualBranchLinks] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem("manual_branch_links");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    electronAPI.hasToken().then((has) => {
      if (has) {
        setIsAuthenticated(true);
        electronAPI
          .getRepos()
          .then(setRepos)
          .catch((err) => {
            console.error(err);
            setIsAuthenticated(false);
          });
        fetchAccountsAndStats();
      } else {
        setIsAuthenticated(false);
        electronAPI.getAccounts().then(setAccounts).catch(console.error);
      }
    });
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
      } catch (err) {
        console.error(err);
      }
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setVerifying(true);
    setLoginError("");
    try {
      const res = await electronAPI.addAccount(tokenInput.trim());
      if (res.success) {
        setIsAuthenticated(true);
        const repoList = await electronAPI.getRepos();
        setRepos(repoList);
        await fetchAccountsAndStats();
        setTokenInput("");
        setShowAddAccount(false);
      } else {
        setLoginError(
          res.error || "Failed to verify token. Please check your token validity and network."
        );
      }
    } catch (err: any) {
      setLoginError(err.message || "An error occurred during verification.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleLogout() {
    if (confirm("Are you sure you want to sign out?")) {
      await electronAPI.clearToken();
      setIsAuthenticated(false);
      setRepos([]);
      setSelectedRepo(null);
      setTokenInput("");
      const accList = await electronAPI.getAccounts();
      setAccounts(accList);
      setProfileStats(null);
    }
  }

  async function handleSwitchAccount(username: string) {
    setLoading(true);
    try {
      const res = await electronAPI.switchAccount(username);
      if (res.success) {
        setIsAuthenticated(true);
        const repoList = await electronAPI.getRepos();
        setRepos(repoList);
        await fetchAccountsAndStats();
      } else {
        alert("Failed to switch account: " + res.error);
      }
    } catch (err: any) {
      alert("Error switching account: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount(e: React.MouseEvent, username: string) {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the account "${username}"?`)) {
      try {
        const res = await electronAPI.deleteAccount(username);
        const accList = await electronAPI.getAccounts();
        setAccounts(accList);
        if (res.switchedTo) {
          const repoList = await electronAPI.getRepos();
          setRepos(repoList);
          await fetchAccountsAndStats();
        } else {
          setIsAuthenticated(false);
          setRepos([]);
          setSelectedRepo(null);
          setProfileStats(null);
        }
      } catch (err: any) {
        alert("Error deleting account: " + err.message);
      }
    }
  }

  async function linkLocalFolder() {
    if (!selectedRepo) return;
    try {
      const path = await electronAPI.selectFolder();
      if (path) setLocalPaths((prev) => ({ ...prev, [selectedRepo]: path }));
    } catch (err: any) {
      alert(err.message);
    }
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
        setManualBranchLinks((prev) => ({ ...prev, [selectedItem.number]: branchName }));
      }

      const status = await electronAPI.getGitStatus(localPaths[selectedRepo]);
      setGitStatus(status);
    } catch (err: any) {
      alert(err.message);
    }
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
      setManualBranchLinks((prev) => {
        const next = { ...prev };
        for (const [key, linkedName] of Object.entries(next)) {
          if (linkedName === oldName) next[Number(key)] = newName;
        }
        return next;
      });

      // Also link to the current selectedItem's issue if viewing detail page
      if (selectedItem?.number) {
        setManualBranchLinks((prev) => ({ ...prev, [selectedItem.number]: newName }));
      }

      const status = await electronAPI.getGitStatus(localPaths[selectedRepo]);
      setGitStatus(status);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeleteBranch(name: string) {
    if (!selectedRepo || !localPaths[selectedRepo]) return;
    if (!confirm(`Delete branch "${name}"?`)) return;

    // Always clear manual links for this branch name, regardless of success/failure
    setManualBranchLinks((prev) => {
      const next = { ...prev };
      for (const [key, linkedName] of Object.entries(next)) {
        if (linkedName === name) delete next[Number(key)];
      }
      return next;
    });

    // Optimistically remove from gitStatus so UI updates immediately
    setGitStatus((prev: any) =>
      prev
        ? {
            ...prev,
            branches: prev.branches.filter((b: string) => b !== name),
            branch: prev.branch === name ? "main" : prev.branch,
          }
        : null
    );

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
    } catch (e) {
      console.error(e);
    }
  }

  const handleManualLinkBranch = (issueNumber: number, branchName: string) => {
    setManualBranchLinks((prev) => ({ ...prev, [issueNumber]: branchName }));
  };

  async function handleOpenVSCode() {
    if (!selectedRepo) return;
    if (!localPaths[selectedRepo]) {
      alert("Please link a local folder first.");
      return;
    }
    try {
      await electronAPI.openVSCode(localPaths[selectedRepo]);
    } catch (err: any) {
      alert(err.message);
    }
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
    } catch (err: any) {
      alert("Commit & Push failed: " + err.message);
    }
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
          issues: [
            {
              id: newIssue.id,
              number: newIssue.number,
              title: newIssue.title,
              state: newIssue.state,
              html_url: newIssue.html_url,
              body: newIssue.body || "",
              repo: selectedRepo.split("/")[1],
            },
            ...(prev.issues || []),
          ],
        };
      });
    } catch (err: any) {
      alert(err.message);
    }
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
    } catch (err: any) {
      alert("Create PR failed: " + err.message);
    }
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
    } catch (err: any) {
      alert(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
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

  if (selectedRepo && loading) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          backgroundColor: "var(--bg-main)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid var(--border-muted)",
            borderTop: "4px solid var(--color-blue)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "24px",
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <h2 style={{ color: "var(--text-primary)" }}>Loading Data...</h2>
        <p style={{ color: "var(--text-muted)" }}>Fetching issues and pull requests from GitHub</p>
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
    const linkedPR = isIssue
      ? (data.prs || []).find((p: any) =>
          [p.title || "", p.body || "", p.head_ref || ""].join(" ").includes(`#${itemNum}`)
        )
      : null;
    const autoBranch = currentBranches.find((b: string) => {
      const m = b.match(/feature\/(\d+)/);
      return m && m[1] === itemNum?.toString();
    });
    const manualBranch = manualBranchLinks[itemNum];
    const validManualBranch =
      manualBranch && currentBranches.includes(manualBranch) ? manualBranch : null;
    const activeBranch = autoBranch || validManualBranch || (isPR ? selectedItem.head_ref : null);
    const isClosed = selectedItem.state === "closed";
    const isMerged = isPR && selectedItem.merged;
    const done = isClosed || isMerged;

    // Status config for headers & status cards
    const statusConfig = isMerged
      ? {
          label: "Merged",
          bg: "var(--color-purple-bg)",
          border: "var(--color-purple-border)",
          color: "var(--color-purple)",
          icon: <PrMergedIcon size={16} />,
        }
      : isClosed
        ? {
            label: "Closed",
            bg: "var(--color-red-bg)",
            border: "var(--color-red-border)",
            color: "var(--color-red)",
            icon: isIssue ? <IssueClosedIcon size={16} /> : <PrClosedIcon size={16} />,
          }
        : {
            label: "Open",
            bg: "var(--color-green-bg)",
            border: "var(--color-green-border)",
            color: "var(--color-green)",
            icon: isIssue ? <IssueOpenedIcon size={16} /> : <PrOpenedIcon size={16} />,
          };

    return (
      <div
        style={{
          padding: "20px",
          fontFamily: "inherit",
          backgroundColor: "var(--bg-main)",
          minHeight: "100vh",
          color: "var(--text-primary)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <button
            onClick={() => setSelectedItem(null)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid var(--border-muted)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-primary)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <BackIcon size={14} /> Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "20px" }}>
            <span style={{ color: statusConfig.color }}>
              {isIssue ? (
                isClosed ? (
                  <IssueClosedIcon size={24} />
                ) : (
                  <IssueOpenedIcon size={24} />
                )
              ) : isMerged ? (
                <PrMergedIcon size={24} />
              ) : isClosed ? (
                <PrClosedIcon size={24} />
              ) : (
                <PrOpenedIcon size={24} />
              )}
            </span>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 600 }}>
              #{itemNum} {itemTitle}
            </h2>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              onClick={() => setIsHelpOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border-muted)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              <HelpIcon size={14} /> Help
            </button>
            {selectedItem.html_url && (
              <button
                onClick={() => electronAPI.openExternal(selectedItem.html_url)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-muted)",
                  backgroundColor: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                }}
              >
                View on GitHub <ExternalLinkIcon size={12} />
              </button>
            )}
          </div>
        </div>
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            padding: "30px",
            borderRadius: "12px",
            border: "1px solid var(--border-muted)",
            width: "100%",
            flex: 1,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Step 1 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                border: "1px solid var(--border-muted)",
                borderRadius: "8px",
                backgroundColor: "var(--bg-hover)",
              }}
            >
              <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 }}>
                  1.
                </span>{" "}
                Create Issue
              </div>
              <div
                style={{
                  color: "var(--color-green)",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckIcon size={16} /> {isIssue ? `#${itemNum}` : linkedPR ? "Linked" : "N/A"}
              </div>
            </div>
            {/* Step 2: Branch */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                border: "1px solid var(--border-muted)",
                borderRadius: "8px",
                backgroundColor: "var(--bg-hover)",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 }}>
                  2.
                </span>{" "}
                Create Branch
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {done ? (
                  <div
                    style={{
                      color: "var(--color-green)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckIcon size={16} /> Completed ({activeBranch || "branch"})
                  </div>
                ) : activeBranch ? (
                  renamingBranch === activeBranch ? (
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <input
                        id="renameInput"
                        defaultValue={activeBranch}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-muted)",
                          fontSize: "13px",
                          width: "200px",
                          color: "var(--text-primary)",
                          backgroundColor: "var(--bg-main)",
                        }}
                      />
                      <button
                        onClick={() =>
                          submitRename(
                            activeBranch,
                            (document.getElementById("renameInput") as HTMLInputElement).value
                          )
                        }
                        style={{
                          background: "var(--color-green)",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "13px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setRenamingBranch(null)}
                        style={{
                          background: "var(--color-red)",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "13px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          backgroundColor: "var(--bg-main)",
                          border: "1px solid var(--border-muted)",
                          color: "var(--text-link)",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        <BranchIcon size={14} /> {activeBranch}
                      </span>
                      <button
                        onClick={() => setRenamingBranch(activeBranch)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--text-link)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                          textDecoration: "underline",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <PencilIcon size={12} /> Rename
                      </button>
                      <button
                        onClick={() => handleDeleteBranch(activeBranch)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-red)",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: 600,
                          textDecoration: "underline",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <TrashIcon size={12} /> Delete
                      </button>
                    </div>
                  )
                ) : (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
                  >
                    <select
                      onChange={(e) => handleManualLinkBranch(itemNum, e.target.value)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-muted)",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        backgroundColor: "var(--bg-main)",
                      }}
                    >
                      <option value="">Link existing branch...</option>
                      {gitStatus?.branches?.map((b: string) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>or</span>
                    <input
                      key={`input-${itemNum}`}
                      id="newBranchName"
                      defaultValue={`feature/${itemNum}-${(itemTitle || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-muted)",
                        width: "220px",
                        fontSize: "13px",
                        color: "var(--text-primary)",
                        backgroundColor: "var(--bg-main)",
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById("newBranchName") as HTMLInputElement;
                        handleCreateBranch(el?.value);
                      }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "var(--color-blue)",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <BranchIcon size={14} /> Create
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Step 3: Code */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                border: "1px solid var(--border-muted)",
                borderRadius: "8px",
                backgroundColor: "var(--bg-hover)",
              }}
            >
              <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 }}>
                  3.
                </span>{" "}
                Update Code
              </div>
              {done ? (
                <div
                  style={{
                    color: "var(--color-green)",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckIcon size={16} /> Completed
                </div>
              ) : (
                <button
                  onClick={handleOpenVSCode}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-muted)",
                    backgroundColor: "var(--bg-main)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "13px",
                  }}
                >
                  <VSCodeIcon size={14} style={{ color: "#29b6f6" }} /> Open VS Code
                </button>
              )}
            </div>
            {/* Step 4: Commit */}
            <div
              style={{
                padding: "16px 20px",
                border: "1px solid var(--border-muted)",
                borderRadius: "8px",
                backgroundColor: "var(--bg-hover)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: gitStatus?.isDirty && !done ? "12px" : "0",
                }}
              >
                <div
                  style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 }}>
                    4.
                  </span>{" "}
                  Commit & Push
                </div>
                {done ? (
                  <div
                    style={{
                      color: "var(--color-green)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <CheckIcon size={16} /> Completed
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontWeight: 600,
                      color: gitStatus?.isDirty ? "var(--color-red)" : "var(--color-green)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: gitStatus?.isDirty
                          ? "var(--color-red)"
                          : "var(--color-green)",
                      }}
                    />
                    {gitStatus?.isDirty ? "Uncommitted changes" : "Clean repository"}
                  </span>
                )}
              </div>
              {gitStatus?.isDirty && !done && (
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <input
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Enter commit message..."
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      fontSize: "13px",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-main)",
                    }}
                  />
                  <button
                    onClick={handleCommitAndPush}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "var(--color-green)",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "13px",
                    }}
                  >
                    Commit & Push
                  </button>
                </div>
              )}
            </div>
            {/* Step 5: PR */}
            <div
              style={{
                padding: "16px 20px",
                border: "1px solid var(--border-muted)",
                borderRadius: "8px",
                backgroundColor: "var(--bg-hover)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: activeBranch && !done && !linkedPR && isIssue ? "12px" : "0",
                }}
              >
                <div
                  style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 }}>
                    5.
                  </span>{" "}
                  Pull Request
                </div>
                {done ? (
                  <div
                    style={{
                      color: "var(--color-purple)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <PrMergedIcon size={16} /> {isMerged ? "Merged" : "Closed"}
                  </div>
                ) : linkedPR ? (
                  <div
                    style={{
                      color: "var(--color-green)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <PrOpenedIcon size={16} /> PR #{linkedPR.number}
                  </div>
                ) : isPR && selectedItem.state === "open" ? (
                  <div
                    style={{
                      color: "var(--color-green)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <PrOpenedIcon size={16} /> Open Pull Request
                  </div>
                ) : !activeBranch ? (
                  <span
                    style={{ fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic" }}
                  >
                    Create a branch first
                  </span>
                ) : null}
              </div>
              {activeBranch && !done && !linkedPR && isIssue && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  <input
                    value={prTitle}
                    onChange={(e) => setPrTitle(e.target.value)}
                    placeholder={`PR title (default: ${activeBranch})`}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      fontSize: "13px",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-main)",
                    }}
                  />
                  <textarea
                    value={prBody}
                    onChange={(e) => setPrBody(e.target.value)}
                    placeholder="PR description (optional)"
                    rows={3}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-main)",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleCreatePR}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "var(--color-blue)",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      <PrOpenedIcon size={14} /> Create PR
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* Step 6: Status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                border: "1px solid var(--border-muted)",
                borderRadius: "8px",
                backgroundColor: "var(--bg-hover)",
              }}
            >
              <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 700 }}>
                  6.
                </span>{" "}
                Status
              </div>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                  border: `1px solid ${statusConfig.border}`,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {statusConfig.icon} {statusConfig.label}
              </span>
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
    const issueToPRs: Record<number, number[]> = {};
    const prToIssues: Record<number, number[]> = {};

    const issues = data.issues || [];
    const prs = data.prs || [];
    const issueNumberSet = new Set(issues.map((i: any) => i.number));
    const prNumberSet = new Set(prs.map((p: any) => p.number));

    (data.prs || []).forEach((pr: any) => {
      const nums = [
        ...new Set([
          ...extractIssueNumbers(pr.title || ""),
          ...extractIssueNumbers(pr.body || ""),
          ...extractIssueNumbers(pr.head_ref || ""),
        ]),
      ].filter((n) => issueNumberSet.has(n));
      nums.forEach((n) => {
        if (!issueToPRs[n]) issueToPRs[n] = [];
        if (!issueToPRs[n].includes(pr.number)) issueToPRs[n].push(pr.number);
        if (!prToIssues[pr.number]) prToIssues[pr.number] = [];
        if (!prToIssues[pr.number].includes(n)) prToIssues[pr.number].push(n);
      });
    });

    Object.entries(manualLinks).forEach(([prNum, issueNums]) => {
      const pn = Number(prNum);
      if (!prNumberSet.has(pn)) return;
      issueNums.forEach((n) => {
        if (!issueNumberSet.has(n)) return;
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

    const colStyle = {
      minWidth: "300px",
      flex: 1,
      backgroundColor: "var(--bg-surface)",
      border: "1px solid var(--border-muted)",
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
    };
    const headStyle = {
      margin: 0,
      textTransform: "uppercase" as const,
      fontSize: "12px",
      fontWeight: 700,
      color: "var(--text-muted)",
      letterSpacing: "0.5px",
    };
    const badgeStyle = {
      backgroundColor: "var(--bg-hover)",
      border: "1px solid var(--border-muted)",
      padding: "2px 8px",
      borderRadius: "12px",
      fontSize: "11px",
      color: "var(--text-primary)",
      fontWeight: 600,
    };
    const linkBadge = (colorClass: string) => ({
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: 600 as const,
      backgroundColor: `var(${colorClass}-bg)`,
      color: `var(${colorClass})`,
      border: `1px solid var(${colorClass}-border)`,
      marginRight: "6px",
      marginTop: "4px",
    });

    const renderIssueCard = (issue: any) => {
      const linkedPRs = issueToPRs[issue.number] || [];
      const branchName = manualBranchLinks[issue.number];
      const autoBranch = gitStatus?.branches?.find((b: string) => {
        const m = b.match(/feature\/(\d+)/);
        return m && m[1] === issue.number.toString();
      });
      const activeBranch = autoBranch || branchName;
      const isCurrent = gitStatus?.branch === activeBranch;

      const isOpen = issue.state === "open";
      const bgStyle = isOpen ? "var(--color-green-bg)" : "var(--color-red-bg)";
      const borderStyle = isOpen ? "var(--color-green-border)" : "var(--color-red-border)";
      const accentStyle = isOpen ? "var(--color-green)" : "var(--color-red)";

      return (
        <div
          key={issue.id}
          onClick={() => setSelectedItem({ type: "issue", ...issue })}
          style={{
            backgroundColor: bgStyle,
            borderRadius: "8px",
            padding: "14px",
            border: `1px solid ${borderStyle}`,
            borderLeft: isCurrent ? "4px solid var(--color-blue)" : `1px solid ${borderStyle}`,
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
            color: "var(--text-primary)",
          }}
          className="interactive-card"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 12px ${isOpen ? "rgba(63, 185, 80, 0.12)" : "rgba(248, 81, 73, 0.12)"}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {/* Left: Icon & Bold Number (Without ##) */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: accentStyle, display: "flex", alignItems: "center" }}>
                {isOpen ? <IssueOpenedIcon size={14} /> : <IssueClosedIcon size={14} />}
              </span>
              <span style={{ fontWeight: 800, fontSize: "14px", color: accentStyle }}>
                #{issue.number}
              </span>
            </div>

            {/* Right: Checkout branch indicator & linked items */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {linkedPRs.length > 0 &&
                linkedPRs.map((prn) => (
                  <span key={prn} style={linkBadge("--color-blue")}>
                    <LinkIcon size={10} /> PR #{prn}
                  </span>
                ))}
              {isCurrent && (
                <span
                  title="Currently checked out branch"
                  style={{ display: "flex", alignItems: "center", color: "var(--color-blue)" }}
                >
                  <BranchIcon size={14} />
                </span>
              )}
              {!isCurrent && activeBranch && (
                <span
                  title="Branch exists"
                  style={{
                    opacity: 0.6,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <BranchIcon size={14} />
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "1.4",
              color: "var(--text-primary)",
            }}
          >
            {issue.title}
          </div>
        </div>
      );
    };

    const renderPRCard = (pr: any) => {
      const linkedIssueNums = prToIssues[pr.number] || [];
      const isCurrent = gitStatus?.branch === pr.head_ref;

      const isMerged = pr.merged;
      const isOpen = pr.state === "open" && !isMerged;
      const bgStyle = isMerged
        ? "var(--color-purple-bg)"
        : isOpen
          ? "var(--color-green-bg)"
          : "var(--color-red-bg)";
      const borderStyle = isMerged
        ? "var(--color-purple-border)"
        : isOpen
          ? "var(--color-green-border)"
          : "var(--color-red-border)";
      const accentStyle = isMerged
        ? "var(--color-purple)"
        : isOpen
          ? "var(--color-green)"
          : "var(--color-red)";

      return (
        <div
          key={pr.id}
          onClick={() => setSelectedItem({ type: "pr", ...pr })}
          style={{
            backgroundColor: bgStyle,
            borderRadius: "8px",
            padding: "14px",
            border: `1px solid ${borderStyle}`,
            borderLeft: isCurrent ? "4px solid var(--color-blue)" : `1px solid ${borderStyle}`,
            cursor: "pointer",
            transition: "transform 0.15s, box-shadow 0.15s",
            color: "var(--text-primary)",
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const num = parseInt(e.dataTransfer.getData("issueNumber"));
            if (num) handleLinkIssue(pr.number, num);
          }}
          className="interactive-card"
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = `0 4px 12px ${isMerged ? "rgba(163, 113, 247, 0.12)" : isOpen ? "rgba(63, 185, 80, 0.12)" : "rgba(248, 81, 73, 0.12)"}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {/* Left: Icon & Bold Number (Without ##) */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: accentStyle, display: "flex", alignItems: "center" }}>
                {isMerged ? (
                  <PrMergedIcon size={14} />
                ) : isOpen ? (
                  <PrOpenedIcon size={14} />
                ) : (
                  <PrClosedIcon size={14} />
                )}
              </span>
              <span style={{ fontWeight: 800, fontSize: "14px", color: accentStyle }}>
                #{pr.number}
              </span>
            </div>

            {/* Right: checkout indicators & linked issues */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              {linkedIssueNums.length > 0 &&
                linkedIssueNums.map((n) => {
                  const isManual = manualLinks[pr.number]?.includes(n);
                  return (
                    <span key={n} style={linkBadge(isManual ? "--color-blue" : "--color-green")}>
                      <LinkIcon size={10} /> #{n}
                      {isManual && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlinkIssue(pr.number, n);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "inherit",
                            cursor: "pointer",
                            padding: "0 0 0 4px",
                            fontSize: "11px",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          title="Unlink"
                        >
                          <UnlinkIcon size={10} />
                        </button>
                      )}
                    </span>
                  );
                })}
              {isCurrent && (
                <span
                  title="Currently checked out branch"
                  style={{ display: "flex", alignItems: "center", color: "var(--color-blue)" }}
                >
                  <BranchIcon size={14} />
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              lineHeight: "1.4",
              color: "var(--text-primary)",
            }}
          >
            {pr.title}
          </div>
        </div>
      );
    };

    return (
      <div
        style={{
          padding: "30px",
          fontFamily: "inherit",
          backgroundColor: "var(--bg-main)",
          minHeight: "100vh",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontWeight: 700,
              }}
            >
              <RepoIcon size={24} style={{ color: "var(--text-muted)" }} /> Pipeline:{" "}
              <span style={{ color: "var(--text-link)" }}>{selectedRepo}</span>
            </h1>
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "8px",
                fontSize: "13px",
                alignItems: "center",
                flexWrap: "wrap",
                position: "relative",
              }}
            >
              {localPaths[selectedRepo] ? (
                <>
                  <span
                    style={{
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    📁 {localPaths[selectedRepo]}
                  </span>
                  <button
                    onClick={linkLocalFolder}
                    style={{
                      padding: "4px 10px",
                      fontSize: "11px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Change folder
                  </button>
                  {gitStatus && (
                    <div
                      ref={branchDropdownRef}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        position: "relative",
                      }}
                    >
                      <button
                        onClick={() => setBranchListOpen(!branchListOpen)}
                        style={{
                          color: "var(--color-green)",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          backgroundColor: "var(--color-green-bg)",
                          border: "1px solid var(--color-green-border)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: "13px",
                        }}
                      >
                        <BranchIcon size={12} /> {gitStatus.branch}{" "}
                        {gitStatus.isDirty && "*(dirty)*"}
                        <ChevronIcon
                          size={12}
                          direction={branchListOpen ? "up" : "down"}
                          style={{ marginLeft: "2px", opacity: 0.8 }}
                        />
                      </button>

                      {branchListOpen && gitStatus.branches && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            marginTop: "6px",
                            padding: "10px",
                            borderRadius: "8px",
                            border: "1px solid var(--border-muted)",
                            backgroundColor: "var(--bg-surface)",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            zIndex: 1000,
                            minWidth: "220px",
                            maxHeight: "300px",
                            overflowY: "auto",
                          }}
                        >
                          {gitStatus.branches.map((b: string) => (
                            <span
                              key={b}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                backgroundColor:
                                  gitStatus.branch === b ? "var(--color-blue-bg)" : "transparent",
                                color:
                                  gitStatus.branch === b
                                    ? "var(--color-blue)"
                                    : "var(--text-primary)",
                                border: `1px solid ${gitStatus.branch === b ? "var(--color-blue-border)" : "transparent"}`,
                                cursor: "default",
                              }}
                            >
                              <BranchIcon size={12} /> {b}{" "}
                              {gitStatus.branch === b && (
                                <span
                                  style={{ fontSize: "10px", opacity: 0.7, marginLeft: "auto" }}
                                >
                                  ● current
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={linkLocalFolder}
                  style={{
                    color: "var(--text-link)",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <LinkIcon size={12} /> Link Local Folder
                </button>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setIsHelpOpen(true)}
              title="Show Help Guide"
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-muted)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "var(--border-focus)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border-muted)";
              }}
            >
              <HelpIcon size={16} />
            </button>
            <button
              onClick={() => electronAPI.openExternal(`https://github.com/${selectedRepo}`)}
              title="View on GitHub"
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-muted)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-muted)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "var(--border-focus)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.borderColor = "var(--border-muted)";
              }}
            >
              <GithubLogoIcon size={16} />
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "var(--color-blue)",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <IssueOpenedIcon size={14} /> + New Issue
            </button>
            <button
              onClick={() => setSelectedRepo(null)}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "1px solid var(--border-muted)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <BackIcon size={14} /> Change Repo
            </button>
          </div>
        </div>

        {/* ISSUES SECTION */}
        <h2
          style={{
            fontSize: "16px",
            marginBottom: "12px",
            color: "var(--text-primary)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <IssueOpenedIcon size={16} style={{ color: "var(--text-muted)" }} /> Issues
        </h2>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "30px",
            overflowX: "auto",
            paddingBottom: "10px",
          }}
        >
          {[
            { title: "Open Issues", items: openIssues },
            { title: "Closed Issues", items: closedIssues },
          ].map(({ title, items }) => (
            <div key={title} style={colStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <h3 style={headStyle}>{title}</h3>
                <span style={badgeStyle}>{items.length}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  overflowY: "auto",
                  maxHeight: "450px",
                }}
              >
                {items.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "13px",
                      border: "1px dashed var(--border-muted)",
                      borderRadius: "8px",
                    }}
                  >
                    No issues
                  </div>
                ) : (
                  items.map((i: any) => renderIssueCard(i))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PRS SECTION */}
        <h2
          style={{
            fontSize: "16px",
            marginBottom: "12px",
            color: "var(--text-primary)",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <PrOpenedIcon size={16} style={{ color: "var(--text-muted)" }} /> Pull Requests
        </h2>
        <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "10px" }}>
          {[
            { title: "Open PRs", items: openPRs },
            { title: "Merged PRs", items: mergedPRs },
            { title: "Closed PRs", items: closedPRs },
          ].map(({ title, items }) => (
            <div key={title} style={colStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <h3 style={headStyle}>{title}</h3>
                <span style={badgeStyle}>{items.length}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  overflowY: "auto",
                  maxHeight: "450px",
                }}
              >
                {items.length === 0 ? (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "13px",
                      border: "1px dashed var(--border-muted)",
                      borderRadius: "8px",
                    }}
                  >
                    No PRs
                  </div>
                ) : (
                  items.map((p: any) => renderPRCard(p))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Issue Modal */}
        {isCreateModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.6)",
              zIndex: 10001,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "450px",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-muted)",
                borderRadius: "12px",
                padding: "30px",
                color: "var(--text-primary)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderBottom: "1px solid var(--border-muted)",
                  paddingBottom: "12px",
                }}
              >
                <IssueOpenedIcon size={20} style={{ color: "var(--color-green)" }} /> New GitHub
                Issue
              </h2>
              <form
                onSubmit={(e: any) => {
                  e.preventDefault();
                  handleCreateNewIssue(e.target.title.value, e.target.body.value);
                }}
              >
                <div style={{ marginBottom: "15px", marginTop: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Title
                  </label>
                  <input
                    name="title"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-main)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    name="body"
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      color: "var(--text-primary)",
                      backgroundColor: "var(--bg-main)",
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: "var(--color-blue)",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    CREATE ISSUE
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Help Guide Modal */}
        {isHelpOpen && (
          <div
            onClick={() => setIsHelpOpen(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.85)",
              zIndex: 20000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              boxSizing: "border-box",
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "1100px",
                backgroundColor: "#0B0F19",
                border: "1px solid #1F293D",
                borderRadius: "20px",
                padding: "48px",
                color: "#F8FAFC",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
                position: "relative",
                fontFamily: "inherit",
              }}
            >
              <button
                onClick={() => setIsHelpOpen(false)}
                style={{
                  position: "absolute",
                  top: "24px",
                  right: "24px",
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  fontSize: "24px",
                  fontWeight: 300,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
              >
                ✕
              </button>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginBottom: "50px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <GithubLogoIcon size={32} style={{ color: "#F8FAFC" }} />
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "32px",
                      fontWeight: 800,
                      color: "#fff",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    Help Guide
                  </h2>
                </div>
                <p style={{ color: "#94A3B8", margin: 0, fontSize: "15px", textAlign: "center" }}>
                  See how the app automates your workflow on GitHub
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  position: "relative",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "74px",
                    left: "8%",
                    right: "8%",
                    height: "3px",
                    background:
                      "linear-gradient(to right, #3B82F6 0%, #10B981 20%, #8B5CF6 40%, #F59E0B 60%, #EF4444 80%, #10B981 100%)",
                    zIndex: 1,
                    opacity: 0.8,
                  }}
                />

                {[
                  {
                    num: 1,
                    title: "Create Issue",
                    desc: "The app creates a new GitHub issue.",
                    color: "#3B82F6",
                    glow: "rgba(59, 130, 246, 0.15)",
                    icon: <IssueOpenedIcon size={24} style={{ color: "#3B82F6" }} />,
                    badge: (
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "1px solid rgba(59, 130, 246, 0.3)",
                          backgroundColor: "rgba(59, 130, 246, 0.1)",
                          color: "#3B82F6",
                        }}
                      >
                        #1
                      </span>
                    ),
                  },
                  {
                    num: 2,
                    title: "Create Branch",
                    desc: "",
                    color: "#10B981",
                    glow: "rgba(16, 185, 129, 0.15)",
                    icon: <BranchIcon size={24} style={{ color: "#10B981" }} />,
                    badge: (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            backgroundColor: "rgba(16, 185, 129, 0.1)",
                            color: "#10B981",
                          }}
                        >
                          feature/test
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            fontSize: "11px",
                            color: "#64748B",
                            fontWeight: 600,
                          }}
                        >
                          <span>✏️ Rename</span>
                          <br />
                          <span>🗑️ Delete</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    num: 3,
                    title: "Update Code",
                    desc: "Make changes to your code in VS Code.",
                    color: "#8B5CF6",
                    glow: "rgba(139, 92, 246, 0.15)",
                    icon: <VSCodeIcon size={24} style={{ color: "#8B5CF6" }} />,
                    badge: (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "1px solid rgba(139, 92, 246, 0.3)",
                          backgroundColor: "rgba(139, 92, 246, 0.1)",
                          color: "#a78bfa",
                        }}
                      >
                        <VSCodeIcon size={12} style={{ color: "#29b6f6" }} /> Open VS Code
                      </span>
                    ),
                  },
                  {
                    num: 4,
                    title: "Commit & Push",
                    desc: "The app commits your changes and pushes them to GitHub.",
                    color: "#F59E0B",
                    glow: "rgba(245, 158, 11, 0.15)",
                    icon: (
                      <svg
                        viewBox="0 0 24 24"
                        width={24}
                        height={24}
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ display: "inline-block", verticalAlign: "middle" }}
                      >
                        <circle cx="12" cy="12" r="4" />
                        <line x1="1.05" y1="12" x2="7.95" y2="12" />
                        <line x1="16.05" y1="12" x2="22.95" y2="12" />
                      </svg>
                    ),
                    badge: (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                          backgroundColor: "rgba(245, 158, 11, 0.1)",
                          color: "#F59E0B",
                        }}
                      >
                        <CheckIcon size={12} style={{ color: "#F59E0B" }} /> Clean repository
                      </span>
                    ),
                  },
                  {
                    num: 5,
                    title: "Pull Request",
                    desc: "A pull request is created automatically.",
                    color: "#EF4444",
                    glow: "rgba(239, 68, 68, 0.15)",
                    icon: <PrOpenedIcon size={24} style={{ color: "#EF4444" }} />,
                    badge: (
                      <span
                        style={{
                          display: "inline-flex",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          color: "#EF4444",
                        }}
                      >
                        PR #2
                      </span>
                    ),
                  },
                  {
                    num: 6,
                    title: "Status",
                    desc: "Track the status of your workflow in real time.",
                    color: "#10B981",
                    glow: "rgba(16, 185, 129, 0.15)",
                    icon: <CheckIcon size={24} style={{ color: "#10B981" }} />,
                    badge: (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          color: "#10B981",
                        }}
                      >
                        <CheckIcon size={12} /> Success
                      </span>
                    ),
                  },
                ].map((step, idx) => (
                  <div
                    key={step.num}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      zIndex: 2,
                      position: "relative",
                    }}
                  >
                    {idx < 5 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "72px",
                          left: "calc(100% - 3px)",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#fff",
                          boxShadow: "0 0 8px rgba(255,255,255,0.8)",
                          zIndex: 3,
                        }}
                      />
                    )}

                    <div
                      style={{
                        marginBottom: "14px",
                        display: "flex",
                        justifyContent: "center",
                        height: "30px",
                      }}
                    >
                      {step.icon}
                    </div>

                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#0B0F19",
                        border: `4px solid ${step.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: 800,
                        color: "#fff",
                        boxShadow: `0 0 20px ${step.glow}`,
                        marginBottom: "16px",
                      }}
                    >
                      {step.num}
                    </div>

                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {step.title}
                    </h3>

                    <div
                      style={{
                        marginBottom: "12px",
                        minHeight: "45px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.badge}
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#64748B",
                        lineHeight: 1.4,
                        padding: "0 8px",
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "48px",
                  backgroundColor: "rgba(59, 130, 246, 0.05)",
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ color: "#3B82F6", display: "flex", alignItems: "center" }}>
                  <InfoIcon size={20} />
                </span>
                <p style={{ margin: 0, fontSize: "14px", color: "#94A3B8", fontWeight: 500 }}>
                  From issue creation to pull request – the app handles the entire workflow so you
                  can focus on building.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-main)",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            border: "3px solid var(--border-muted)",
            borderTop: "3px solid var(--color-blue)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-main)",
          color: "var(--text-primary)",
          fontFamily: "inherit",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "460px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-muted)",
            borderRadius: "16px",
            padding: "36px",
            boxShadow: "0 12px 36px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--bg-main)",
                border: "1px solid var(--border-muted)",
                padding: "16px",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <GithubLogoIcon size={48} style={{ color: "#fff" }} />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "24px",
                color: "#fff",
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              {accounts.length > 0 && !showAddAccount ? "Select Account" : "Setup GitHub Token"}
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                marginTop: "8px",
                fontSize: "13px",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              {accounts.length > 0 && !showAddAccount
                ? "Choose an account to sign in or add a new one."
                : "To display and manage your repositories, issues, and pull requests, please provide a GitHub Personal Access Token."}
            </p>
          </div>

          {accounts.length > 0 && !showAddAccount ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  maxHeight: "250px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {accounts.map((acc) => (
                  <div
                    key={acc.username}
                    onClick={() => handleSwitchAccount(acc.username)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-muted)",
                      backgroundColor: "var(--bg-main)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-focus)";
                      e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-muted)";
                      e.currentTarget.style.backgroundColor = "var(--bg-main)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={acc.avatar_url}
                        alt={acc.username}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          border: "1px solid var(--border-muted)",
                        }}
                      />
                      <span style={{ fontWeight: 600, color: "#fff", fontSize: "14px" }}>
                        {acc.username}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteAccount(e, acc.username)}
                      title="Delete Account"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        cursor: "pointer",
                        padding: "6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.stopPropagation();
                        e.currentTarget.style.color = "#ff4d4f";
                        e.currentTarget.style.backgroundColor = "rgba(255, 77, 79, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        e.currentTarget.style.color = "var(--text-muted)";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowAddAccount(true)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px dashed var(--border-muted)",
                  backgroundColor: "transparent",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "14px",
                  marginTop: "10px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-focus)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-muted)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
              >
                + Add GitHub Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    marginBottom: "8px",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Personal Access Token
                </label>
                <input
                  type="password"
                  placeholder="ghp_..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-muted)",
                    color: "var(--text-primary)",
                    backgroundColor: "var(--bg-main)",
                    boxSizing: "border-box",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                />
              </div>
              {loginError && (
                <div
                  style={{
                    color: "#ff4d4f",
                    fontSize: "13px",
                    backgroundColor: "rgba(255, 77, 79, 0.1)",
                    border: "1px solid rgba(255, 77, 79, 0.2)",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    lineHeight: 1.4,
                  }}
                >
                  ⚠️ {loginError}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddAccount(false);
                      setLoginError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-muted)",
                      backgroundColor: "var(--bg-surface)",
                      color: "var(--text-primary)",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "14px",
                    }}
                  >
                    CANCEL
                  </button>
                )}
                <button
                  type="submit"
                  disabled={verifying}
                  style={{
                    flex: 2,
                    padding: "14px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--color-blue)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: verifying ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    transition: "opacity 0.2s",
                  }}
                >
                  {verifying ? "VERIFYING..." : "CONNECT"}
                </button>
              </div>
            </form>
          )}

          <div
            style={{
              marginTop: "24px",
              borderTop: "1px solid var(--border-muted)",
              paddingTop: "16px",
              fontSize: "12px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            💡 <strong>How to create a token:</strong>
            <ol style={{ margin: "6px 0 0 0", paddingLeft: "20px" }}>
              <li>
                Go to{" "}
                <span
                  style={{
                    color: "var(--text-link)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => electronAPI.openExternal("https://github.com/settings/tokens")}
                >
                  GitHub Token Settings
                </span>
              </li>
              <li>
                Generate a new token with <code>repo</code> and <code>user</code> scopes
              </li>
              <li>Copy and paste the token above</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: HOME SCREEN ---
  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "var(--bg-main)",
        minHeight: "100vh",
        fontFamily: "inherit",
        color: "var(--text-primary)",
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "24px",
          marginBottom: "40px",
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border-muted)",
          paddingBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#fff",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            GitFlow Dashboard
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "6px", fontSize: "14px" }}>
            Select a repository to manage your workflow pipelines
          </p>
        </div>

        {/* Profile Card & Account Switcher */}
        {profileStats && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-muted)",
              borderRadius: "12px",
              padding: "16px 20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              minWidth: "320px",
            }}
          >
            <img
              src={profileStats.avatar_url}
              alt={profileStats.username}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "2px solid var(--color-blue)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span
                  onClick={() =>
                    electronAPI.openExternal(
                      profileStats.html_url || `https://github.com/${profileStats.username}`
                    )
                  }
                  style={{
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: "14px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  title="View GitHub Profile"
                >
                  {profileStats.name || profileStats.username}
                </span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  @{profileStats.username}
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  <strong style={{ color: "#fff" }}>{profileStats.total_repos}</strong> Repos
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  <strong style={{ color: "#fff" }}>{profileStats.total_issues}</strong> Issues
                </div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                  <strong style={{ color: "#fff" }}>{profileStats.total_prs}</strong> PRs
                </div>
              </div>
            </div>

            {/* Switch Account Quick Dropdown */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                alignItems: "flex-end",
              }}
            >
              <select
                value={profileStats.username}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__add__") {
                    setShowAddAccount(true);
                    setIsAuthenticated(false);
                  } else {
                    handleSwitchAccount(val);
                  }
                }}
                style={{
                  backgroundColor: "var(--bg-main)",
                  border: "1px solid var(--border-muted)",
                  color: "var(--text-primary)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {accounts.map((acc) => (
                  <option key={acc.username} value={acc.username}>
                    {acc.username} {acc.active ? "(Active)" : ""}
                  </option>
                ))}
                <option value="__add__">+ Add Account...</option>
              </select>

              <button
                onClick={handleLogout}
                style={{
                  border: "none",
                  backgroundColor: "transparent",
                  color: "#ff4d4f",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {repos.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              color: "var(--text-muted)",
              padding: "60px 0",
              border: "1px dashed var(--border-muted)",
              borderRadius: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid var(--border-muted)",
                borderTop: "3px solid var(--color-blue)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px auto",
              }}
            />
            Loading repositories...
          </div>
        ) : (
          repos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => openRepo(repo.full_name)}
              style={{
                padding: "24px",
                backgroundColor: "var(--bg-surface)",
                borderRadius: "12px",
                border: "1px solid var(--border-muted)",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                position: "relative" as const,
              }}
              className="repo-card"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "var(--border-focus)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(47, 129, 247, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-muted)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-link)",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <GithubLogoIcon size={12} /> {repo.owner?.login}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {repo.private && (
                    <span
                      style={{
                        fontSize: "10px",
                        backgroundColor: "rgba(240, 185, 11, 0.15)",
                        border: "1px solid rgba(240, 185, 11, 0.4)",
                        color: "#f0b90b",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      PRIVATE
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      electronAPI.openExternal(
                        repo.html_url || `https://github.com/${repo.full_name}`
                      );
                    }}
                    title="View on GitHub"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-muted)",
                      backgroundColor: "var(--bg-hover)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.borderColor = "var(--border-focus)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "var(--text-muted)";
                      e.currentTarget.style.borderColor = "var(--border-muted)";
                    }}
                  >
                    <GithubLogoIcon size={14} />
                  </button>
                </div>
              </div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <RepoIcon size={16} style={{ color: "var(--text-muted)" }} /> {repo.name}
              </div>
              {repo.description ? (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginTop: "10px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    margin: "10px 0 0 0",
                    lineHeight: "1.5",
                  }}
                >
                  {repo.description}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginTop: "10px",
                    fontStyle: "italic",
                    opacity: 0.5,
                    margin: "10px 0 0 0",
                  }}
                >
                  No description
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
