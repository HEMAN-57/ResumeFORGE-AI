import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Upload resume");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    try {
      setLoading(true);

      const res = await fetch(
        "https://resumeforge-ai-09n7.onrender.com/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      console.log(data);

      setResult(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      alert("Error");
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>🚀 ResumeForge AI</h1>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <textarea
          placeholder="Paste Job Description..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {result && (
          <>
            <div className="score-box">
              <h2>🎯 {result.match_score}/100</h2>
            </div>

            <div className="section">
              <h3>📊 Gap Analysis</h3>
              <ul>
                {(result.gap_analysis?.missing_core_skills || []).map((i, idx) => (
                  <li key={idx}>❌ {i}</li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h3>✅ Strengths</h3>
              <ul>
                {(result.strengths_detailed || []).map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h3>⚠ Weaknesses</h3>
              <ul>
                {(result.weaknesses_detailed || []).map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>

            <div className="section">
              <h3>🚀 Free Roadmap</h3>
              {Object.entries(result.roadmap_free || {}).map(([k, v]) => (
                <div key={k}>
                  <h4>{k}</h4>
                  {v.map((i, idx) => <p key={idx}>• {i}</p>)}
                </div>
              ))}
            </div>

            <div className="section">
              <h3>💎 Premium Roadmap</h3>
              {Object.entries(result.roadmap_premium || {}).map(([k, v]) => (
                <div key={k}>
                  <h4>{k}</h4>
                  {v.map((i, idx) => <p key={idx}>• {i}</p>)}
                </div>
              ))}
            </div>

            <div className="section">
              <h3>⚡ Priority Actions</h3>
              <ul>
                {(result.priority_actions || []).map((i, idx) => (
                  <li key={idx}>🔥 {i}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
