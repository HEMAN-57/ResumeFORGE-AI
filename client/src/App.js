import React, { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a resume");

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
      console.log("API RESPONSE:", data);

      setResult(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Something went wrong");
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1>🚀 ResumeForge AI</h1>
        <p>Get shortlisted, not just reviewed</p>

        {/* FILE INPUT */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* JD INPUT */}
        <textarea
          placeholder="Paste Job Description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        {/* BUTTON */}
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {/* RESULTS */}
        {result && (
          <>
            {/* SCORE */}
            <div className="score-box">
              <h2>
                🎯 {result.match_score || result.score || "N/A"}/100
              </h2>
              <p>Match Score</p>
            </div>

            {/* GAP ANALYSIS */}
            {result.missing_skills?.length > 0 && (
              <div className="section">
                <h3>📊 Gap Analysis</h3>
                <ul>
                  {result.missing_skills.map((item, i) => (
                    <li key={i}>❌ {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* STRENGTHS */}
            {result.strengths?.length > 0 && (
              <div className="section">
                <h3>✅ Strengths</h3>
                <ul>
                  {result.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* WEAKNESSES */}
            {result.weaknesses?.length > 0 && (
              <div className="section">
                <h3>⚠ Weaknesses</h3>
                <ul>
                  {result.weaknesses.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ROADMAP */}
            {result.roadmap ? (
              <div className="section">
                <h3>🚀 Roadmap</h3>
                <div className="roadmap">
                  {Object.entries(result.roadmap).map(([key, val]) => (
                    <div key={key}>
                      <h4>{key.replaceAll("_", " ")}</h4>
                      {val.map((i, idx) => (
                        <p key={idx}>• {i}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="placeholder">
                Roadmap will appear after backend upgrade 🚀
              </p>
            )}

            {/* PRIORITY */}
            {result.priority_actions?.length > 0 && (
              <div className="section">
                <h3>⚡ Priority Actions</h3>
                <ul>
                  {result.priority_actions.map((item, i) => (
                    <li key={i}>🔥 {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
