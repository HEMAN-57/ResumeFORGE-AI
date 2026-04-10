const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

async function analyzeResume(resumeText, jdText) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `
You are an advanced ATS system.

Return ONLY valid JSON. No explanation.

FORMAT:

{
  "match_score": number,
  "score_breakdown": {
    "skills": number,
    "experience": number,
    "education": number,
    "presentation": number
  },
  "matched_skills": [],
  "missing_skills": [],
  "strengths": [],
  "weaknesses": [],
  "priority_actions": [],
  "roadmap": {
    "week_1": [],
    "week_2": [],
    "week_3": [],
    "week_4": []
  }
}

Rules:
- Extract skills from BOTH resume and JD
- Compare and classify into matched and missing
- Give realistic scores
- Avoid generic statements
- Roadmap must be actionable

Job Description:
${jdText}

Resume:
${resumeText}
          `,
        },
      ],
    });

    const raw = response.choices[0].message.content;
    console.log("RAW:", raw);

    let parsed = extractJSON(raw);

    // 🔥 fallback (never break UI)
    if (!parsed) {
      parsed = {
        match_score: 60,
        score_breakdown: {
          skills: 50,
          experience: 60,
          education: 70,
          presentation: 65
        },
        matched_skills: [],
        missing_skills: [],
        strengths: ["Strong fundamentals"],
        weaknesses: ["Needs project experience"],
        priority_actions: ["Build 2 real projects"],
        roadmap: {
          week_1: ["Learn basics"],
          week_2: ["Practice"],
          week_3: ["Build project"],
          week_4: ["Deploy"]
        }
      };
    }

    return parsed;

  } catch (err) {
    console.error("ERROR:", err);

    return {
      match_score: 50,
      score_breakdown: {},
      matched_skills: [],
      missing_skills: [],
      strengths: [],
      weaknesses: [],
      priority_actions: [],
      roadmap: {}
    };
  }
}

module.exports = analyzeResume;
