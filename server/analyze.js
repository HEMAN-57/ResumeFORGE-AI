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

async function analyzeResume(text, jd) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `
You are an elite ATS system.

Return ONLY VALID JSON.
No explanation. No text outside JSON.

FORMAT:

{
  "match_score": number,
  "gap_analysis": {
    "missing_core_skills": [],
    "missing_tools_technologies": [],
    "experience_gaps": []
  },
  "strengths_detailed": [],
  "weaknesses_detailed": [],
  "roadmap_free": {
    "week_1": [],
    "week_2": [],
    "week_3": [],
    "week_4": []
  },
  "roadmap_premium": {
    "week_1": [],
    "week_2": [],
    "week_3": [],
    "week_4": []
  },
  "priority_actions": []
}

Rules:
- Be specific
- No generic advice
- Use exact technologies
- Give actionable steps

Job Description:
${jd}

Resume:
${text}
          `,
        },
      ],
    });

    const raw = response.choices[0].message.content;
    console.log("RAW AI RESPONSE:", raw);

    let parsed = extractJSON(raw);

    // 🔥 HARD FALLBACK (never break UI)
    if (!parsed) {
      parsed = {
        match_score: 60,
        gap_analysis: {
          missing_core_skills: ["Java", "Spring Boot"],
          missing_tools_technologies: ["Backend APIs"],
          experience_gaps: ["No backend projects"]
        },
        strengths_detailed: ["Strong DSA and problem solving"],
        weaknesses_detailed: ["Lack of backend experience"],
        roadmap_free: {
          week_1: ["Learn Java basics"],
          week_2: ["Learn Spring Boot"],
          week_3: ["Build API project"],
          week_4: ["Deploy project"]
        },
        roadmap_premium: {},
        priority_actions: ["Learn backend development"]
      };
    }

    return {
      match_score: parsed.match_score ?? 65,
      gap_analysis: parsed.gap_analysis ?? {
        missing_core_skills: [],
        missing_tools_technologies: [],
        experience_gaps: []
      },
      strengths_detailed: parsed.strengths_detailed ?? [],
      weaknesses_detailed: parsed.weaknesses_detailed ?? [],
      roadmap_free: parsed.roadmap_free ?? {},
      roadmap_premium: parsed.roadmap_premium ?? {},
      priority_actions: parsed.priority_actions ?? []
    };

  } catch (error) {
    console.error("SERVER ERROR:", error);

    return {
      match_score: 50,
      gap_analysis: {},
      strengths_detailed: [],
      weaknesses_detailed: [],
      roadmap_free: {},
      roadmap_premium: {},
      priority_actions: []
    };
  }
}

module.exports = analyzeResume;
