require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function analyzeResume(text) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: `
You are an experienced recruiter evaluating a STUDENT resume (0–2 years experience).

Return ONLY valid JSON in this exact format:

{
  "score": number,
  "score_breakdown": {
    "skills": number,
    "projects": number,
    "experience": number,
    "presentation": number
  },
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

STRICT RULES:
- skills score must be out of 30
- projects score must be out of 30
- experience score must be out of 20
- presentation score must be out of 20
- total score MUST equal sum of all categories
- do NOT exceed category limits
- do NOT add any text outside JSON

Guidelines:
- Be fair (this is a student, not experienced candidate)
- Do NOT be overly harsh
- Keep strengths and weaknesses meaningful
- Suggestions must be actionable and concise

Resume:
${text}
`
        }
      ]
    });

    const raw = response.choices[0].message.content;

    try {
      const parsed = JSON.parse(raw);

      // Optional safety validation
      const total =
        parsed.score_breakdown.skills +
        parsed.score_breakdown.projects +
        parsed.score_breakdown.experience +
        parsed.score_breakdown.presentation;

      return {
        ...parsed,
        score: total // enforce consistency
      };

    } catch (err) {
      console.error("JSON Parse Error:", raw);

      return {
        error: "Invalid JSON from AI",
        raw
      };
    }

  } catch (error) {
    console.error("Groq API Error:", error);

    return {
      error: "AI processing failed",
      details: error.message
    };
  }
}

module.exports = analyzeResume;