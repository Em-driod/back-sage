import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
  let { resume, jobDescription } = req.body;

  if (!resume || !jobDescription) {
    return res.status(400).json({ error: "Missing resume or job description" });
  }

  // Sanitize input
  resume = resume.trim();
  jobDescription = jobDescription.trim();

  const prompt = `
You are a world-class executive resume expert trusted by Fortune 500 CEOs and elite professionals. Your job is to generate a **comprehensive, high-impact, achievement-driven executive resume package** in strict JSON format with the following keys:

{
  "name": "Full Name",
  "summary": "i want "Full NAME"  A powerful 2-3 sentence executive summary highlighting leadership, vision, and industry impact.",
  "resume": [
    "A bulleted list of 5-7 quantifiable achievements and key responsibilities. Each point should be concise, impactful, use metrics, and demonstrate leadership or innovation."
  ],
  "coverLetter": "A concise, bold 15-20 word statement with executive presence and unique value.",
  "linkedIn": "A 2-line executive bio blending  thought leadership, domain expertise, and visionary ambition with heavy neccesary emojis.",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "dates": "Start Date - End Date",
      "details": "Brief summary of role and key accomplishments."
    }
    // Include 2-3 recent or relevant roles, focused on impact
  ],
  "qualifications": {
    "education": [
      {
        "degree": "Degree Name",
        "institution": "Institution Name",
        "year": "Graduation Year"
      }
    ],
    "certifications": [
      "Certification 1",
      "Certification 2"
    ],
    "skills": [
      "Skill 1",
      "Skill 2",
      "Skill 3"
    ]
  }
}

**Important Instructions:**
- Output ONLY the JSON object, no extra commentary or markdown.
- Tailor the content specifically to the resume and job description provided.
- Avoid generic boilerplate.
- Ensure valid JSON syntax. Escape quotes if needed.
- Executive tone only — results-driven and leadership-oriented.

Resume input:
${resume}

Job Description:
${jobDescription}
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.7,
      maxOutputTokens: 900,
    });

    const rawOutput = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    console.log("🟡 Gemini raw output:\n", rawOutput);

    let aiOutput;
    try {
      aiOutput = JSON.parse(rawOutput.trim());
    } catch (parseErr) {
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiOutput = JSON.parse(jsonMatch[0]);
        } catch {
          aiOutput = {
            error: "Error parsing AI output JSON",
          };
        }
      } else {
        aiOutput = {
          error: "No valid JSON output from AI",
        };
      }
    }

    // Ensure 'resume' is always an array
    if (aiOutput && typeof aiOutput.resume === "string") {
      aiOutput.resume = [aiOutput.resume];
    }

    res.json(aiOutput);
  } catch (err) {
    console.error("🔥 Gemini API error:", err.message || err);
    res.status(500).json({ error: "Gemini API error: " + (err.message || err) });
  }
});

export default router;
