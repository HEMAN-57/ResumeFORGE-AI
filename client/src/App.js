import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("https://resumeforge-ai-09n7.onrender.com/api/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      setResult(data);

    } catch (error) {
      console.error(error);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score > 80) return "#22c55e";
    if (score > 60) return "#facc15";
    return "#ef4444";
  };

  const Progress = ({ label, value, max }) => {
    const percent = (value / max) * 100;

    return (
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>

        <div style={{
          height: "8px",
          background: "#374151",
          borderRadius: "5px",
          overflow: "hidden",
          marginTop: "4px"
        }}>
          <div style={{
            width: percent + "%",
            height: "100%",
            background: "linear-gradient(90deg, #6366f1, #22c55e)",
            transition: "0.5s"
          }} />
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="card">

        <h1 className="title">🚀 ResumeForge AI</h1>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
          Powered by AI • Built by Himanshu
        </p>

        <p className="subtitle">
          Get recruiter-level feedback instantly
        </p>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Analyzing Resume..." : "Analyze Resume"}
        </button>

        {result && (
          <div className="result">

            {/* SCORE */}
            <div className="score-box">
              <h2
                className="score"
                style={{ color: getScoreColor(result.score) }}
              >
                {result.score}/100
              </h2>
              <p>Overall Resume Score</p>
            </div>

            {/* PROGRESS BARS */}
            <div>
              <Progress label="Skills" value={result.score_breakdown.skills} max={30} />
              <Progress label="Projects" value={result.score_breakdown.projects} max={30} />
              <Progress label="Experience" value={result.score_breakdown.experience} max={20} />
              <Progress label="Presentation" value={result.score_breakdown.presentation} max={20} />
            </div>

            {/* STRENGTHS */}
            <div className="section">
              <h3>✅ Strengths</h3>
              <ul>
                {result.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* WEAKNESSES */}
            <div className="section">
              <h3>⚠ Weaknesses</h3>
              <ul>
                {result.weaknesses.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>

            {/* SUGGESTIONS */}
            <div className="section">
              <h3>🚀 Suggestions</h3>
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;
