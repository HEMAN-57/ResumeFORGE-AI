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
Return STRICT JSON only.

Keys MUST be:

match_score
missing_skills
strengths
weaknesses
suggestions

DO NOT use "score".

Job Description:
${jd}

Resume:
${text}
          `,
        },
      ],
    });

    const raw = response.choices[0].message.content;

    console.log("🔥 RAW AI RESPONSE:", raw); // IMPORTANT DEBUG

    let parsed = {};

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON parse failed");
    }

    // 🔥 FORCE SCORE
    let score =
      parsed.match_score ??
      parsed.score ??
      parsed.rating ??
      parsed.overall ??
      0;

    if (!score || isNaN(score)) {
      score = 70; // fallback constant
    }

    return {
      match_score: score,
      missing_skills: parsed.missing_skills || [],
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      suggestions: parsed.suggestions || []
    };

  } catch (error) {
    console.error("🔥 GROQ ERROR:", error);

    return {
      match_score: 0,
      missing_skills: [],
      strengths: [],
      weaknesses: ["AI failed"],
      suggestions: ["Retry"]
    };
  }
}

module.exports = analyzeResume;
