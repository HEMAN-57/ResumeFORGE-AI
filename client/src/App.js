import React, { useState, useRef } from "react";
import "./App.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://resumeforge-ai-09n7.onrender.com";

function ScoreRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="score-ring-container">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"
        />
        <circle
          cx="70" cy="70" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px", transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text x="70" y="66" textAnchor="middle" fill={color} fontSize="28" fontWeight="700">{score}</text>
        <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11">/ 100</text>
      </svg>
      <div className="score-label" style={{ color }}>
        {score >= 75 ? "Strong Match" : score >= 50 ? "Partial Match" : "Weak Match"}
      </div>
    </div>
  );
}

function Section({ icon, title, items, colorClass }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`section-card ${colorClass}`}>
      <div className="section-header">
        <span className="section-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function RoadmapCard({ title, roadmap }) {
  const [open, setOpen] = useState(false);
  const phases = [
    { key: "week_1_2", label: "Week 1–2" },
    { key: "week_3_4", label: "Week 3–4" },
    { key: "month_2", label: "Month 2" },
    { key: "month_3", label: "Month 3" },
  ];

  const hasContent = phases.some(
    (p) => roadmap[p.key] && roadmap[p.key].length > 0
  );
  if (!hasContent) return null;

  return (
    <div className="roadmap-card">
      <button className="roadmap-toggle" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="toggle-arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="roadmap-body">
          {phases.map((phase) =>
            roadmap[phase.key] && roadmap[phase.key].length > 0 ? (
              <div key={phase.key} className="roadmap-phase">
                <div className="phase-label">{phase.label}</div>
                <ul>
                  {roadmap[phase.key].map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

function SkillPill({ label, type }) {
  return <span className={`skill-pill ${type}`}>{label}</span>;
}

export default function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB.");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return setError("Please upload your resume PDF.");
    if (!jd.trim()) return setError("Please paste the job description.");
    setError("");
    setResult(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      console.log("API response:", data);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong. The server may be waking up — wait 30s and retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ResumeFORGE<span className="logo-ai">AI</span></span>
        </div>
        <p className="tagline">Know exactly what to fix to get shortlisted</p>
      </div>

      <div className="main-grid">
        {/* Left panel: inputs */}
        <div className="input-panel">
          <div
            className={`drop-zone ${dragOver ? "drag-over" : ""} ${file ? "has-file" : ""}`}
            onClick={() => fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <>
                <div className="file-icon">📄</div>
                <div className="file-name">{file.name}</div>
                <div className="file-hint">Click to change</div>
              </>
            ) : (
              <>
                <div className="upload-icon">↑</div>
                <div className="upload-title">Drop your resume PDF</div>
                <div className="upload-hint">or click to browse · max 5 MB</div>
              </>
            )}
          </div>

          <div className="jd-block">
            <label className="jd-label">Paste Job Description</label>
            <textarea
              className="jd-textarea"
              placeholder="Paste the full job description here. The more detail you provide, the more precise your analysis will be..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={10}
            />
            <div className="jd-char-count">{jd.length} characters</div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !file}
          >
            {loading ? (
              <span className="spinner-row">
                <span className="spinner" /> Analyzing...
              </span>
            ) : (
              "Analyze Resume →"
            )}
          </button>

          {loading && (
            <p className="loading-note">
              This can take 20–40 seconds if the server is waking up from sleep.
            </p>
          )}
        </div>

        {/* Right panel: results */}
        <div className="results-panel">
          {!result && !loading && (
            <div className="results-empty">
              <div className="empty-icon">🎯</div>
              <p>Your analysis will appear here</p>
              <p className="empty-hint">Upload your resume and paste a job description to get started</p>
            </div>
          )}

          {result && (
            <div className="results-content">
              {/* Score */}
              <div className="score-section">
                <ScoreRing score={result.match_score ?? 0} />
                <div className="score-detail">
                  <h2>Resume–JD Match</h2>
                  <p>Based on skill alignment, experience, and keyword coverage</p>
                  {result.priority_actions && result.priority_actions.length > 0 && (
                    <div className="priority-block">
                      <div className="priority-label">⚡ Do this week:</div>
                      <ul>
                        {result.priority_actions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills grid */}
              {(result.missing_skills?.length > 0 || result.matched_skills?.length > 0) && (
                <div className="skills-block">
                  {result.missing_skills?.length > 0 && (
                    <div>
                      <div className="skills-group-label missing-label">Missing from your resume</div>
                      <div className="pills-row">
                        {result.missing_skills.map((s, i) => <SkillPill key={i} label={s} type="missing" />)}
                      </div>
                    </div>
                  )}
                  {result.matched_skills?.length > 0 && (
                    <div>
                      <div className="skills-group-label matched-label">Already in your resume</div>
                      <div className="pills-row">
                        {result.matched_skills.map((s, i) => <SkillPill key={i} label={s} type="matched" />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="sw-grid">
                <Section icon="✓" title="Strengths" items={result.strengths} colorClass="green-card" />
                <Section icon="✗" title="Weaknesses" items={result.weaknesses} colorClass="red-card" />
              </div>

              {/* Roadmaps */}
              <div className="roadmaps-block">
                <h3 className="roadmap-heading">Your Personalized Roadmap</h3>
                <RoadmapCard title="🆓  Free Resources Path" roadmap={result.roadmap_free || {}} />
                <RoadmapCard title="💎  Free + Paid Resources Path" roadmap={result.roadmap_premium || {}} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
