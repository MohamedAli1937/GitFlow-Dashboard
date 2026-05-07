import { useEffect, useState } from "react";
import { electronAPI } from "./api/bridge";

export default function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    electronAPI.getRepos().then(setRepos);
  }, []);

  async function openRepo(fullName: string) {
    setSelectedRepo(fullName);
    setLoading(true);
    setData(null);
    try {
      const details = await electronAPI.getRepoDetails(fullName);
      setData(details);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "merged_pr":
        return { bg: "#7c3aed", text: "#fff", border: "#6d28d9" };
      case "open_pr":
        return { bg: "#22c55e", text: "#fff", border: "#16a34a" };
      case "in_progress":
        return { bg: "#f97316", text: "#fff", border: "#ea580c" };
      case "closed_pr":
        return { bg: "#ef4444", text: "#fff", border: "#dc2626" };
      default:
        return { bg: "#6b7280", text: "#fff", border: "#4b5563" };
    }
  };

  const [manualLinks, setManualLinks] = useState<Record<number, number[]>>(() => {
    const saved = localStorage.getItem("manual_links_v2");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("manual_links_v2", JSON.stringify(manualLinks));
  }, [manualLinks]);

  const handleLinkIssue = (prNumber: number, issueNumber: number) => {
    setManualLinks((prev) => {
      const existing = prev[prNumber] || [];
      if (existing.includes(issueNumber)) return prev;
      return { ...prev, [prNumber]: [...existing, issueNumber] };
    });
  };

  const handleUnlink = (prNumber: number, issueNumber: number) => {
    setManualLinks((prev) => {
      const existing = prev[prNumber] || [];
      const next = existing.filter((n) => n !== issueNumber);
      if (next.length === 0) {
        const copy = { ...prev };
        delete copy[prNumber];
        return copy;
      }
      return { ...prev, [prNumber]: next };
    });
  };

  if (selectedRepo && loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f3f4f6",
          color: "#1f2937",
          zIndex: 9999,
        }}
      >
        <div style={{ fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>
          🚀 Loading Pipeline...
        </div>
        <div style={{ color: "#6b7280" }}>Fetching issues and PRs for {selectedRepo}</div>
      </div>
    );
  }

  if (selectedRepo && data) {
    const allManualIssueNumbers = Object.values(manualLinks).flat();

    const enrichedPipeline = data.pipeline.map((item: any) => {
      const linkedIssues: any[] = [];

      if (item.issue) linkedIssues.push({ ...item.issue, isManual: false });

      if (item.pr && manualLinks[item.pr.number]) {
        manualLinks[item.pr.number].forEach((num) => {
          if (item.issue?.number === num) return;
          const manualIssue = data.issues.find((i: any) => i.number === num);
          if (manualIssue) linkedIssues.push({ ...manualIssue, isManual: true });
        });
      }

      return { ...item, linkedIssues };
    });

    const columns = {
      in_progress: enrichedPipeline.filter(
        (i: any) => i.status === "in_progress" && !allManualIssueNumbers.includes(i.issue?.number)
      ),
      open_pr: enrichedPipeline.filter((i: any) => i.status === "open_pr"),
      merged_pr: enrichedPipeline.filter((i: any) => i.status === "merged_pr"),
      closed_pr: enrichedPipeline.filter((i: any) => i.status === "closed_pr"),
    };

    return (
      <div
        style={{
          padding: "30px",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          backgroundColor: "#f3f4f6",
          minHeight: "100vh",
          color: "#1f2937",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "24px", color: "#111827" }}>
            Pipeline: <span style={{ color: "#4f46e5" }}>{selectedRepo}</span>
          </h1>
          <button
            onClick={() => setSelectedRepo(null)}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#1f2937",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            ← Change Repo
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            paddingBottom: "20px",
            alignItems: "flex-start",
          }}
        >
          {Object.entries(columns).map(([key, items]) => (
            <div
              key={key}
              style={{
                minWidth: "350px",
                width: "350px",
                backgroundColor: "#e5e7eb",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "16px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    textTransform: "uppercase",
                    fontSize: "13px",
                    letterSpacing: "0.05em",
                    color: "#4b5563",
                    fontWeight: 700,
                  }}
                >
                  {key.replace("_", " ")}
                </h3>
                <span
                  style={{
                    backgroundColor: "#d1d5db",
                    color: "#1f2937",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {items.length}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {items.map((item: any, idx: number) => {
                  const colors = getStatusColor(item.status);
                  return (
                    <div
                      key={idx}
                      draggable={item.status === "in_progress"}
                      onDragStart={(e) => {
                        if (item.issue)
                          e.dataTransfer.setData("issueNumber", item.issue.number.toString());
                      }}
                      onDragOver={(e) => {
                        if (item.pr) e.preventDefault();
                      }}
                      onDrop={(e) => {
                        if (item.pr) {
                          const issueNumber = parseInt(e.dataTransfer.getData("issueNumber"));
                          handleLinkIssue(item.pr.number, issueNumber);
                        }
                      }}
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        padding: "16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        border: "1px solid #d1d5db",
                        cursor: item.status === "in_progress" ? "grab" : "default",
                      }}
                    >
                      <div style={{ marginBottom: "12px" }}>
                        <span
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                            padding: "3px 10px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </div>

                      {item.pr && (
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "15px",
                            marginBottom: "12px",
                            color: "#1f2937",
                          }}
                        >
                          <span style={{ color: "#4f46e5", marginRight: "6px" }}>
                            #{item.pr.number}
                          </span>
                          {item.pr.title}
                        </div>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {item.linkedIssues?.map((issue: any) => (
                          <div
                            key={issue.number}
                            style={{
                              padding: "10px",
                              backgroundColor: "#f9fafb",
                              borderRadius: "6px",
                              borderLeft: !item.pr
                                ? "4px solid #f97316"
                                : issue.isManual
                                  ? "4px solid #4f46e5"
                                  : "4px solid #10b981",
                              fontSize: "13px",
                              position: "relative",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div
                                style={{
                                  fontSize: "9px",
                                  color: "#6b7280",
                                  fontWeight: 800,
                                  marginBottom: "4px",
                                }}
                              >
                                {!item.pr
                                  ? "ISSUE TO START"
                                  : issue.isManual
                                    ? "MANUALLY LINKED"
                                    : "AUTO LINKED"}
                              </div>
                              {issue.isManual && (
                                <button
                                  onClick={() => handleUnlink(item.pr.number, issue.number)}
                                  style={{
                                    border: "none",
                                    background: "none",
                                    color: "#ef4444",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                  }}
                                >
                                  UNDO
                                </button>
                              )}
                            </div>
                            <span style={{ fontWeight: 700 }}>#{issue.number}</span> {issue.title}
                          </div>
                        ))}

                        {item.pr && item.linkedIssues.length === 0 && (
                          <div style={{ fontSize: "12px", color: "#ef4444", fontStyle: "italic" }}>
                            ⚠ No issue linked
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🚀 GitFlow Dashboard</h1>

      {repos.map((repo) => (
        <div
          key={repo.id}
          onClick={() => openRepo(repo.full_name)}
          style={{
            padding: 10,
            margin: 5,
            border: "1px solid #ccc",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {repo.full_name}
        </div>
      ))}
    </div>
  );
}
