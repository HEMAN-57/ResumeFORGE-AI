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
You are a strict recruiter.

Compare the resume with the job description.

Return STRICT JSON ONLY. No explanation. No text outside JSON.

Keys must be EXACTLY:

{
  "match_score": number (0-100),
  "missing_skills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Rules:
- match_score must be realistic
- missing_skills must list important missing technologies
- strengths must highlight relevant skills
- weaknesses must be honest
- suggestions must be actionable

Job Description:
${jd}

Resume:
${text}
          `,
        },
      ],
    });

    const raw = response.choices[0].message.content;

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON Parse Failed:", raw);

      return {
        match_score: 0,
        missing_skills: [],
        strengths: ["AI response parsing failed"],
        weaknesses: ["Invalid AI format"],
        suggestions: ["Try again"],
      };
    }

    // 🔥 BULLETPROOF NORMALIZATION
    return {
      match_score:
        parsed.match_score ||
        parsed.score ||
        parsed.rating ||
        0,

      missing_skills:
        parsed.missing_skills ||
        parsed.missing ||
        [],

      strengths:
        parsed.strengths ||
        [],

      weaknesses:
        parsed.weaknesses ||
        [],

      suggestions:
        parsed.suggestions ||
        [],
    };
  } catch (error) {
    console.error("🔥 GROQ ERROR:", error);

    return {
      match_score: 0,
      missing_skills: [],
      strengths: [],
      weaknesses: ["AI processing failed"],
      suggestions: ["Retry after some time"],
    };
  }
}

module.exports = analyzeResume;
