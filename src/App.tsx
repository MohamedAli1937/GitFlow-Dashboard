import { useEffect, useState } from "react";
import { electronAPI } from "./api/bridge";

export default function App() {
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    electronAPI.getRepos().then(setRepos);
  }, []);

  async function openRepo(fullName: string) {
    setSelectedRepo(fullName);
    const details = await electronAPI.getRepoDetails(fullName);
    setData(details);
  }

  if (selectedRepo && data) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setSelectedRepo(null)}>← Back</button>

        <h2>Repo: {selectedRepo}</h2>

        <h3>📌 Issues</h3>
        {data.issues.map((i: any) => (
          <div key={i.id}>
            #{i.number} {i.title} ({i.state})
          </div>
        ))}

        <h3>📌 Pull Requests</h3>
        {data.prs.map((p: any) => (
          <div key={p.id}>
            #{p.number} {p.title} ({p.merged ? "merged" : p.state})
          </div>
        ))}
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
