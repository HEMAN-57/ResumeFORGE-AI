require("dotenv").config();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Safely extract JSON from LLM output even if it has markdown fences or extra text
function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {}

  // Try extracting JSON object from markdown code block
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {}
  }

  // Try extracting the first complete {...} block
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {}
  }

  return null;
}

function sanitizeArray(val) {
  if (Array.isArray(val)) return val.filter((x) => typeof x === "string" && x.trim());
  return [];
}

function sanitizeScore(val, max = 100) {
  const n = Number(val);
  if (!isNaN(n) && n >= 0 && n <= max) return Math.round(n);
  return null;
}

async function analyzeResume(resumeText, jd) {
  const prompt = `You are a strict ATS system and senior recruiter.

Your job is to compare a candidate's resume against a job description and produce a DETAILED, ACTIONABLE evaluation.

STEP 1: Extract ALL technical skills and requirements from the Job Description.
STEP 2: Extract ALL skills, tools, and experiences from the Resume.
STEP 3: Compare them precisely.
STEP 4: Generate a week-by-week learning roadmap with specific resources.

JOB DESCRIPTION:
${jd.substring(0, 2000)}

RESUME:
${resumeText.substring(0, 3000)}

Return ONLY valid JSON — no markdown fences, no explanation text outside the JSON. Use EXACTLY these keys:

{
  "match_score": <number 0-100 based on how well resume matches JD>,
  "missing_skills": [<each specific skill/technology in JD that resume lacks>],
  "matched_skills": [<each skill present in both JD and resume>],
  "strengths": [<2-4 specific strengths with evidence from resume>],
  "weaknesses": [<2-4 specific weaknesses relevant to this JD>],
  "roadmap_free": {
    "week_1_2": [<specific daily tasks, free YouTube/course links, mini-project ideas>],
    "week_3_4": [<next steps building on weeks 1-2>],
    "month_2": [<intermediate goals with project ideas>],
    "month_3": [<polish, deploy, add to resume>]
  },
  "roadmap_premium": {
    "week_1_2": [<same but including Udemy/Coursera/paid resources with estimated cost>],
    "week_3_4": [<paid advanced courses>],
    "month_2": [<mentorship/bootcamp options>],
    "month_3": [<portfolio review, mock interviews>]
  },
  "priority_actions": [<3-5 most urgent things to do THIS WEEK, specific and concrete>]
}

RULES:
- match_score must be a number. Use 0-40 for poor match, 41-60 for partial, 61-80 for good, 81-100 for strong.
- missing_skills must list EXACT technology names from the JD (e.g. "Spring Boot", "Hibernate", "React", "Docker").
- strengths and weaknesses must reference specific resume content, not generic advice.
- roadmap items must be SPECIFIC (e.g. "Watch Java OOP playlist by Telusko on YouTube – 4 hours" NOT "Learn Java").
- priority_actions must be THIS WEEK tasks only.
- Do NOT use the word "consider". Be direct.`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.1,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices?.[0]?.message?.content || "";
    console.log("AI raw length:", raw.length);

    const parsed = extractJSON(raw);

    if (!parsed) {
      console.error("Failed to parse AI JSON. Raw:", raw.substring(0, 300));
      return buildFallback(resumeText, jd);
    }

    return {
      match_score:
        sanitizeScore(parsed.match_score) ??
        sanitizeScore(parsed.score) ??
        55,
      missing_skills: sanitizeArray(parsed.missing_skills),
      matched_skills: sanitizeArray(parsed.matched_skills),
      strengths: sanitizeArray(parsed.strengths),
      weaknesses: sanitizeArray(parsed.weaknesses),
      roadmap_free: parsed.roadmap_free || {},
      roadmap_premium: parsed.roadmap_premium || {},
      priority_actions: sanitizeArray(parsed.priority_actions),
    };
  } catch (err) {
    console.error("Groq API error:", err.message);
    throw new Error("AI analysis failed: " + err.message);
  }
}

// Deterministic fallback when AI fails completely
function buildFallback(resumeText, jd) {
  return {
    match_score: 50,
    missing_skills: ["Unable to extract — please try again"],
    matched_skills: [],
    strengths: ["Resume was uploaded successfully"],
    weaknesses: ["AI analysis returned an unexpected format — retry"],
    roadmap_free: { week_1_2: ["Try again with a clearer job description"] },
    roadmap_premium: {},
    priority_actions: ["Retry the analysis with a complete job description"],
  };
}

module.exports = analyzeResume;
