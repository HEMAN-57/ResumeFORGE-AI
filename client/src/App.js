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
      setResult(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>🚀 ResumeForge AI</h1>
        <p>Get shortlisted, not just reviewed</p>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <textarea
          placeholder="Paste Job Description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {result && (
          <>
            {/* 🎯 SCORE */}
            <div className="score-box">
              <h2>
                🎯 {result.match_score || result.score || "N/A"}/100
              </h2>
              <p>Match Score</p>
            </div>

            {/* 📊 GAP */}
            <div className="section">
              <h3>📊 Gap Analysis</h3>
              <ul>
                {(result.missing_skills || []).map((item, i) => (
                  <li key={i}>❌ {item}</li>
                ))}
              </ul>
            </div>

            {/* 🚀 ROADMAP */}
            {result.roadmap && (
              <div className="section">
                <h3>🚀 Roadmap</h3>

                <div className="roadmap">
                  <div>
                    <h4>Week 1–2</h4>
                    {(result.roadmap.week_1_2 || []).map((i, idx) => (
                      <p key={idx}>• {i}</p>
                    ))}
                  </div>

                  <div>
                    <h4>Week 3–4</h4>
                    {(result.roadmap.week_3_4 || []).map((i, idx) => (
                      <p key={idx}>• {i}</p>
                    ))}
                  </div>

                  <div>
                    <h4>Month 2</h4>
                    {(result.roadmap.month_2 || []).map((i, idx) => (
                      <p key={idx}>• {i}</p>
                    ))}
                  </div>

                  <div>
                    <h4>Month 3</h4>
                    {(result.roadmap.month_3 || []).map((i, idx) => (
                      <p key={idx}>• {i}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ⚡ ACTIONS */}
            <div className="section">
              <h3>⚡ Priority Actions</h3>
              <ul>
                {(result.priority_actions || []).map((item, i) => (
                  <li key={i}>🔥 {item}</li>
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
