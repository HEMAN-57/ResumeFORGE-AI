import React, { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jd", jd);

    const res = await fetch(
      "https://resumeforge-ai-09n7.onrender.com/api/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="bg-[#0e0e0e] text-white min-h-screen">

      {/* HERO */}
      <section className="text-center py-16">
        <h1 className="text-6xl font-bold">
          ResumeForge <span className="text-purple-400">AI</span>
        </h1>
        <p className="text-gray-400 mt-4 text-xl">
          Get shortlisted. Not just reviewed.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-5xl mx-auto">

          {/* Upload */}
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-gray-700">
            <h3 className="text-xl mb-4">Upload Resume</h3>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          </div>

          {/* JD */}
          <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-gray-700">
            <h3 className="text-xl mb-4">Job Description</h3>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              className="w-full h-40 bg-black p-3 rounded"
              placeholder="Paste JD..."
            />
          </div>
        </div>

        <button
          onClick={handleUpload}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl"
        >
          Analyze Resume
        </button>
      </section>

      {/* RESULT DASHBOARD */}
      {result && (
        <section className="max-w-7xl mx-auto px-6">

          {/* SCORE */}
          <div className="flex justify-center mb-12">
            <div className="relative w-64 h-64">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="#262626"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="url(#grad)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="691"
                  strokeDashoffset={
                    691 - (result.match_score / 100) * 691
                  }
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="grad">
                    <stop offset="0%" stopColor="#ba9eff" />
                    <stop offset="100%" stopColor="#53ddfc" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">
                  {result.match_score}
                </span>
                <span className="text-gray-400 text-sm">Match Score</span>
              </div>
            </div>
          </div>

          {/* BREAKDOWN */}
          <div className="grid md:grid-cols-2 gap-10 mb-10">

            {/* Bars */}
            <div>
              {Object.entries(result.score_breakdown || {}).map(
                ([key, val]) => (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between text-sm">
                      <span>{key}</span>
                      <span>{val}%</span>
                    </div>
                    <div className="bg-gray-700 h-2 rounded">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Skills */}
            <div>
              <h3 className="mb-4">Skills</h3>

              <div className="mb-6">
                <p className="text-green-400 mb-2">Matched</p>
                <div className="flex flex-wrap gap-2">
                  {result.matched_skills?.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-red-400 mb-2">Missing</p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills?.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-red-900 text-red-300 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl mb-8">
            <h3 className="text-red-400 mb-4">Priority Actions</h3>
            {result.priority_actions?.map((a, i) => (
              <p key={i}>• {a}</p>
            ))}
          </div>

          {/* STRENGTHS / WEAKNESSES */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">

            <div className="bg-[#1a1a1a] p-6 rounded-xl">
              <h3 className="text-green-400 mb-3">Strengths</h3>
              {result.strengths?.map((s, i) => (
                <p key={i}>• {s}</p>
              ))}
            </div>

            <div className="bg-[#1a1a1a] p-6 rounded-xl">
              <h3 className="text-red-400 mb-3">Weaknesses</h3>
              {result.weaknesses?.map((w, i) => (
                <p key={i}>• {w}</p>
              ))}
            </div>
          </div>

          {/* ROADMAP */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl">
            <h3 className="mb-4">4 Week Roadmap</h3>

            {Object.entries(result.roadmap || {}).map(([week, tasks]) => (
              <div key={week} className="mb-4">
                <h4 className="font-bold">{week}</h4>
                {tasks.map((t, i) => (
                  <p key={i}>• {t}</p>
                ))}
              </div>
            ))}
          </div>

        </section>
      )}
    </div>
  );
}

export default App;
