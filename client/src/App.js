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

      // 🔥 DEBUG (important)
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
    <div className="container">
      <div className="card">
        <h1>🚀 ResumeForge AI</h1>
        <p>Match your resume with real job descriptions</p>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <textarea
          placeholder="Paste Job Description here..."
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <button onClick={handleUpload}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {result && (
          <div className="result">
            <h2>
              🎯 Match Score:{" "}
              {result.match_score !== undefined
                ? result.match_score
                : "N/A"}
              /100
            </h2>

            <h3>❌ Missing Skills</h3>
            <ul>
              {(result.missing_skills || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>✅ Strengths</h3>
            <ul>
              {(result.strengths || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>⚠ Weaknesses</h3>
            <ul>
              {(result.weaknesses || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3>🚀 Suggestions</h3>
            <ul>
              {(result.suggestions || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
