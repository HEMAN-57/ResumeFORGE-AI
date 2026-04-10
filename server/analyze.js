const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeResume(text, jd) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: `
You are an elite recruiter + career mentor.

Your job is to generate a DETAILED EXECUTION PLAN.

Return STRICT JSON:

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
- No generic advice
- Be specific
- Mention exact technologies
- Give step-by-step roadmap

Job Description:
${jd}

Resume:
${text}
          `,
        },
      ],
    });

    const raw = response.choices[0].message.content;
    console.log("AI RAW:", raw);

    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Parse failed:", raw);
    }

    return {
      match_score: parsed.match_score || parsed.score || 70,

      gap_analysis: parsed.gap_analysis || {
        missing_core_skills: [],
        missing_tools_technologies: [],
        experience_gaps: []
      },

      strengths_detailed: parsed.strengths_detailed || [],
      weaknesses_detailed: parsed.weaknesses_detailed || [],

      roadmap_free: parsed.roadmap_free || {},
      roadmap_premium: parsed.roadmap_premium || {},

      priority_actions: parsed.priority_actions || []
    };

  } catch (error) {
    console.error(error);

    return {
      match_score: 0,
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
