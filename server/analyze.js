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
Act like a strict recruiter.

Compare the resume with the given job description.

Return ONLY JSON:

{
  "match_score": number,
  "missing_skills": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

Job Description:
${jd}

Resume:
${text}
          `,
        },
      ],
    });

    const raw = response.choices[0].message.content;

    return JSON.parse(raw);
  } catch (error) {
    console.error(error);
    return { error: "AI processing failed" };
  }
}

module.exports = analyzeResume;
