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
    } catch (err) {
      alert("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
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
        <div>
          <h2>🎯 {result.match_score}/100</h2>

          {/* Score Breakdown */}
          <h3>📊 Score Breakdown</h3>
          <ul>
            <li>Skills: {result.score_breakdown?.skills}</li>
            <li>Experience: {result.score_breakdown?.experience}</li>
            <li>Education: {result.score_breakdown?.education}</li>
            <li>Presentation: {result.score_breakdown?.presentation}</li>
          </ul>

          {/* Skills */}
          <h3>✅ Matched Skills</h3>
          <ul>
            {(result.matched_skills || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h3>❌ Missing Skills</h3>
          <ul>
            {(result.missing_skills || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          {/* Strengths */}
          <h3>💪 Strengths</h3>
          <ul>
            {(result.strengths || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          {/* Weaknesses */}
          <h3>⚠ Weaknesses</h3>
          <ul>
            {(result.weaknesses || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          {/* Actions */}
          <h3>⚡ Priority Actions</h3>
          <ul>
            {(result.priority_actions || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          {/* Roadmap */}
          <h3>🚀 Roadmap</h3>
          {Object.entries(result.roadmap || {}).map(([week, items]) => (
            <div key={week}>
              <h4>{week}</h4>
              {(items || []).map((i, idx) => (
                <p key={idx}>• {i}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
