import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const DEFAULT_MODEL = PRIMARY_MODEL;

// Retry helper with automatic quota fallback to gemini-3.1-flash-lite
async function callGeminiWithRetry(params: any, retries = 2, delayMs = 1000): Promise<any> {
  const modelsToTry = [params.model || PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: any = null;

  for (const currentModel of modelsToTry) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await ai.models.generateContent({
          ...params,
          model: currentModel,
        });
      } catch (err: any) {
        lastError = err;
        const errStr = String(err?.message || err);
        const isQuotaOrTransient =
          errStr.includes('429') ||
          errStr.includes('RESOURCE_EXHAUSTED') ||
          errStr.includes('quota') ||
          errStr.includes('503') ||
          errStr.includes('UNAVAILABLE') ||
          errStr.includes('high demand');

        if (isQuotaOrTransient) {
          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
            continue;
          }
          // If all retries for primary model exhausted, break inner loop to try FALLBACK_MODEL
          console.warn(`Primary model ${currentModel} exhausted, attempting fallback ${FALLBACK_MODEL}...`);
          break;
        } else {
          // Non-transient error, don't loop
          throw err;
        }
      }
    }
  }

  throw lastError;
}

// System prompt helper for EduGenie
function getEduGenieSystemPrompt(options: {
  language?: string;
  level?: string;
  style?: string;
}) {
  const lang = options.language || 'English';
  const lvl = options.level || 'School Student';
  const style = options.style || 'Balanced';

  let languageRules = `
LANGUAGE RULES:
- If the student asks in Tamil, answer in clear, student-friendly Tamil (தமிழ்). Keep scientific formulas and terms accurate, including standard English technical terms in parentheses (e.g., ஒளிச்சேர்க்கை (Photosynthesis)).
- If the student asks in English, answer in English.
- If the student mixes Tamil and English (Tanglish / code-mixed, e.g., "Photosynthesis pathi explain pannunga"), understand the question naturally and answer clearly in the same accessible style with proper terms unless another language is requested.
- If the student asks in Hindi, Telugu, or Kannada, answer cleanly in that language.
- Otherwise, default to ${lang}.
`;

  return `You are EduGenie, an exceptionally accurate AI academic tutor and learning companion.
Your highest duty is ACCURATE QUESTION ANSWERING. You must read and understand the complete question correctly, and provide the most accurate, pedagogical, and reliable answer possible.

========================================
QUESTION ANSWERING RULES (MANDATORY)
========================================

1. UNDERSTAND FIRST: Read and understand the complete question before answering. Identify the exact subject, concept, constraints, and requested format.
2. ANSWER THE EXACT QUESTION: Answer the exact question asked. Do not change the question, omit constraints, or answer a different question.
3. DIRECT ANSWER FIRST: Give the direct answer first, followed by a clear explanation when necessary. Never bury the final answer under paragraphs of introductory fluff.
4. ACADEMIC QUESTIONS: Provide:
   - Correct answer
   - Step-by-step explanation
   - Important formula/rule if applicable
   - Example when useful
5. MULTIPLE-CHOICE QUESTIONS (MCQ):
   - Identify the correct option.
   - Clearly display:
     **Correct Answer: Option [X] — [Answer]**
   - Explain why it is correct.
   - Briefly explain why the other options are incorrect when useful.
6. MATHEMATICS:
   - Show the calculation step by step.
   - Check the arithmetic and algebraic steps before displaying the answer.
   - Clearly display the final answer with proper notation.
7. PHYSICS AND CHEMISTRY:
   - Use the correct formula, standard SI units, correct symbols, and accurate calculations.
   - Show all steps clearly (Given, Formula, Substitution, Final Answer).
   - Never invent numerical values or physical constants. Use standard values (e.g. g = 9.8 m/s² or 10 m/s² as specified).
8. PROGRAMMING QUESTIONS:
   - Understand the requested input/output behavior and constraints.
   - Provide clean, syntactically correct, and bug-free code.
   - Explain the code briefly and clearly.
   - If the student's code contains an error, identify the exact bug, explain why it occurred, and provide the corrected version.
9. IMAGE-BASED QUESTIONS:
   - Carefully inspect the uploaded image.
   - Read the question visible in the image.
   - Extract the required information and given data.
   - Solve the exact question visible in the image.
   - Give the final answer clearly.
   - CRITICAL BLURRY IMAGE RULE: If the image is blurry, cropped, or the question cannot be read accurately, state:
     “I cannot clearly read the question in the image. Please upload a clearer image.”
   - Never guess or hallucinate unreadable text or numbers.
10. UPLOADED STUDY MATERIAL:
    - Use the uploaded study material as the primary authority and source of truth.
    - Answer strictly according to the content of the uploaded material.
    - Do not replace the material's definitions or terminology with unrelated information.
11. INSUFFICIENT INFORMATION:
    - If a question lacks necessary values or constraints to solve, DO NOT invent missing information.
    - Clearly state what information is required to solve it.
12. UNCERTAINTY HANDLING:
    - If you are uncertain about an answer or historical/domain detail, do not confidently provide a potentially false answer.
    - Clearly communicate the uncertainty and ask for clarification.
13. NO HALLUCINATION: Never create fake facts, fake formulas, fake references, or imaginary scientific principles.
14. FACTUAL RIGOR: For factual questions, prioritize absolute factual accuracy over making the answer sound impressive.
15. "JUST GIVE THE ANSWER": If the student asks “Just give the answer”, provide the direct final answer first without unnecessary explanation.
16. "EXPLAIN": If the student asks “Explain”, provide a comprehensive, detailed step-by-step explanation.
17. "IN SIMPLE WORDS": If the student asks “In simple words” or requests beginner level, explain using simple everyday language, intuitive analogies, and zero unnecessary jargon.
18-20. MULTILINGUAL & MIXED LANGUAGE:
${languageRules}

ADAPTATION TO STUDENT LEVEL: "${lvl}"
- Beginner: Simple everyday words, relatable analogies, step-by-step intuitive guidance.
- School Student: Clear curriculum-aligned explanations, foundation building, and practical textbook examples.
- College Student: Rigorous conceptual reasoning, underlying mathematical/scientific mechanisms, and proofs.
- Advanced: Formal derivations, edge cases, technical precision, and academic depth.
Response style preference: "${style}".

========================================
MANDATORY RESPONSE FORMATS
========================================

For a Normal Academic Question:
**Answer:**
[Correct answer]

**Explanation:**
[Clear, step-by-step explanation]

For a Numerical / Math / Physics / Chemistry Problem:
**Given:**
[Values with units]

**Formula:**
[Standard formula used]

**Calculation:**
[Step-by-step calculation showing substitutions and arithmetic]

**Final Answer:**
[Exact answer with correct units]

For a Multiple Choice Question (MCQ):
**Correct Answer:** Option [X] — [Answer]

**Explanation:**
[Reason why Option X is correct]

[Brief explanation of why options A/B/C/D are incorrect, if applicable]

For an Image-Based Question:
**🖼️ Question detected:**
[Question text extracted from the image]

**✅ Answer:**
[Correct answer]

**📖 Explanation:**
[Step-by-step explanation based on visible image data]

========================================
FINAL VERIFICATION (INTERNAL CHECK)
========================================
Before rendering every answer, verify:
✓ Did I understand the question correctly?
✓ Did I answer the exact question asked without shifting topics?
✓ Is the final answer consistent with the explanation?
✓ Are the arithmetic, algebraic, and scientific calculations 100% correct?
✓ Are units correct (e.g. m/s², Joules, N, mol, kg)?
✓ Did I avoid inventing data or missing constants?
✓ If an image was provided, did I base the response on actual visible image content?
✓ If the question is unclear or blurry, did I ask for clarification instead of guessing?
`;
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    model: DEFAULT_MODEL,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// 2. Chat / Tutor endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, message, image, language, level, style } = req.body;

    if (!message && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const systemInstruction = getEduGenieSystemPrompt({ language, level, style });

    // Format conversation contents for Gemini
    // If messages array is provided (multi-turn history), reconstruct contents
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }> = [];

    if (Array.isArray(messages) && messages.length > 0) {
      for (const m of messages) {
        const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
        if (m.image && m.image.data) {
          parts.push({
            inlineData: {
              mimeType: m.image.mimeType || 'image/jpeg',
              data: m.image.data.replace(/^data:[^;]+;base64,/, ''),
            },
          });
        }
        if (m.content) {
          parts.push({ text: m.content });
        }
        contents.push({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts,
        });
      }
    } else {
      const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];
      if (image && image.data) {
        parts.push({
          inlineData: {
            mimeType: image.mimeType || 'image/jpeg',
            data: image.data.replace(/^data:[^;]+;base64,/, ''),
          },
        });
      }
      parts.push({ text: message || 'Hello EduGenie!' });
      contents.push({ role: 'user', parts });
    }

    const response = await callGeminiWithRetry({
      model: DEFAULT_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const replyText = response.text || 'I could not generate an answer right now. Please try again.';
    res.json({ text: replyText });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    let msg = 'Sorry, I could not process that right now. Please try again.';
    if (String(error?.message || error).includes('high demand') || String(error?.message || error).includes('503')) {
      msg = 'Gemini servers are experiencing high traffic right now. Please retry in a moment.';
    }
    res.status(500).json({ error: msg });
  }
});

// 3. Smart Summarizer endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text, length = 'Medium', difficulty = 'Intermediate', language = 'English', options = {} } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text to summarize is required.' });
    }

    const prompt = `Please summarize and analyze the following academic study material.
Target Length: ${length}
Target Difficulty: ${difficulty}
Language: ${language}

Provide a structured, beautifully formatted JSON output matching this exact JSON schema:
{
  "summary": "Clear, comprehensive summary tailored to the requested length and difficulty.",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "definitions": [
    {"term": "Term Name", "definition": "Clear concise student-friendly definition"}
  ],
  "formulas": ["Formula or law 1 (if applicable)", "Formula 2"],
  "examPoints": ["Important exam tip / high-yield question concept 1", "Exam tip 2"],
  "flashcards": [
    {"question": "Quick recall question 1", "answer": "Clear precise answer"}
  ]
}

Return ONLY the raw JSON without markdown code fences or backticks.

Study Material:
"""
${text.slice(0, 45000)}
"""`;

    const response = await callGeminiWithRetry({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text?.trim() || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      // Clean fallback if any wrap
      const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
      data = JSON.parse(cleaned);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Summarize API Error:', error);
    let msg = 'Failed to generate summary. Please try again.';
    if (String(error?.message || error).includes('high demand') || String(error?.message || error).includes('503')) {
      msg = 'Gemini servers are experiencing high traffic right now. Please retry in a moment.';
    }
    res.status(500).json({ error: msg });
  }
});

// 4. Concept Simplifier ("Explain Simply")
app.post('/api/simplify', async (req, res) => {
  try {
    const { concept, level = 'Beginner', language = 'English' } = req.body;

    if (!concept || concept.trim().length === 0) {
      return res.status(400).json({ error: 'Concept is required.' });
    }

    const prompt = `You are EduGenie's Concept Simplifier.
Explain the following concept specifically for the level: "${level}".
Language: ${language}

Rules:
- Beginner (👶): Explain as if talking to a curious 8-year-old. Use everyday metaphors like toys, cooking, playground. No jargon.
- School Student (🎓): Explain with clear textbook principles, intuitive diagrams/steps, and relatable everyday examples.
- College Student (📚): Structured conceptual explanation including underlying mechanics, trade-offs, and practical application.
- Advanced (🧠): In-depth, technically rigorous explanation including formal abstractions and nuance.

Output JSON with this schema:
{
  "level": "${level}",
  "simpleExplanation": "The core explanation written specifically for this level",
  "analogy": "A vivid, memorable real-life analogy",
  "realLifeExample": "A practical real-world scenario where this concept applies",
  "stepByStep": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "quickCheckQuestion": "A fun 1-sentence question to test understanding"
}

Return ONLY raw valid JSON.

Concept to simplify:
"${concept}"`;

    const response = await callGeminiWithRetry({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text?.trim() || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
      data = JSON.parse(cleaned);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Simplify API Error:', error);
    let msg = 'Failed to simplify concept.';
    if (String(error?.message || error).includes('high demand') || String(error?.message || error).includes('503')) {
      msg = 'Gemini servers are experiencing high traffic right now. Please retry in a moment.';
    }
    res.status(500).json({ error: msg });
  }
});

// 5. AI Quiz Generator
app.post('/api/quiz', async (req, res) => {
  try {
    const {
      subject = 'General Science',
      topic = 'Fundamentals',
      difficulty = 'Medium',
      questionType = 'Multiple Choice',
      numQuestions = 5,
      language = 'English',
      studyMaterial = '',
    } = req.body;

    const count = Math.min(Math.max(Number(numQuestions) || 5, 3), 10);

    const prompt = `You are EduGenie's Exam Master. Generate an educational quiz.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty} (Easy, Medium, or Hard)
Question Type preference: ${questionType} (Multiple Choice, True/False, Short Answer, or Mixed)
Number of questions: ${count}
Language: ${language}
${studyMaterial ? `Base questions directly on this study material:\n"""\n${studyMaterial.slice(0, 30000)}\n"""` : ''}

Generate exactly ${count} high-quality, pedagogically sound questions.
For each Multiple Choice question, provide 4 distinct options (A, B, C, D) where only one is unequivocally correct, and 3 realistic distractors that address common student misconceptions.
For True/False questions, options must be ["True", "False"].

Return JSON in this schema:
{
  "title": "${subject}: ${topic} Quiz",
  "difficulty": "${difficulty}",
  "totalQuestions": ${count},
  "questions": [
    {
      "id": "q1",
      "type": "mcq",
      "question": "Clear, precise academic question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Detailed explanation of why this is correct and why other options are incorrect.",
      "hint": "Helpful nudge without giving away the answer directly"
    }
  ],
  "revisionTopics": ["Key topic 1 to revise", "Key topic 2", "Key topic 3"]
}

Return ONLY valid JSON without markdown code blocks.`;

    const response = await callGeminiWithRetry({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text?.trim() || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
      data = JSON.parse(cleaned);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Quiz API Error:', error);
    let msg = 'Failed to generate quiz. Please try again.';
    if (String(error?.message || error).includes('503') || String(error?.message || error).includes('high demand')) {
      msg = 'Gemini servers are experiencing high traffic right now. Please retry in a moment.';
    }
    res.status(500).json({ error: msg });
  }
});

// 6. Personalized Learning Path Generator
app.post('/api/learning-path', async (req, res) => {
  try {
    const {
      subject,
      currentLevel = 'Beginner',
      goal = 'Master the subject for exams',
      availableTime = '5 hours per week',
      targetDate = '4 weeks',
      language = 'English',
    } = req.body;

    if (!subject) {
      return res.status(400).json({ error: 'Subject is required.' });
    }

    const prompt = `You are EduGenie's Academic Curriculum Designer.
Design a highly structured, realistic, step-by-step personalized learning path.
Subject: ${subject}
Student's Current Level: ${currentLevel}
Goal: ${goal}
Available Study Time: ${availableTime}
Target Duration: ${targetDate}
Language: ${language}

Create a progressive 4-week roadmap (Week 1: Fundamentals, Week 2: Core Concepts, Week 3: Deep Practice & Problem Solving, Week 4: Mastery, Testing & Revision).
Each week must have 2 to 3 actionable milestones.

Return JSON in this exact schema:
{
  "title": "Mastery Roadmap: ${subject}",
  "subject": "${subject}",
  "overview": "Encouraging, realistic overview of the journey",
  "estimatedHours": "e.g. 20 hours total",
  "weeks": [
    {
      "weekNumber": 1,
      "title": "Week 1: Fundamentals & Core Vocabulary",
      "objective": "Primary learning goal for this week",
      "milestones": [
        {
          "id": "w1-m1",
          "topic": "Topic Name",
          "objective": "Specific learning objective",
          "recommendedActivity": "Actionable task",
          "practiceTask": "Concrete exercise to prove mastery",
          "completed": false
        }
      ]
    }
  ],
  "studyTips": ["Top tip 1 for success", "Top tip 2"]
}

Return ONLY valid JSON.`;

    const response = await callGeminiWithRetry({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text?.trim() || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
      data = JSON.parse(cleaned);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Learning Path API Error:', error);
    let msg = 'Failed to create learning path.';
    if (String(error?.message || error).includes('503') || String(error?.message || error).includes('high demand')) {
      msg = 'Gemini servers are experiencing high traffic right now. Please retry in a moment.';
    }
    res.status(500).json({ error: msg });
  }
});

// 7. Document / PDF Study Material Deep Analyzer
app.post('/api/document-analyze', async (req, res) => {
  try {
    const { text, fileName = 'Study Material', language = 'English' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Document text is required.' });
    }

    const prompt = `Analyze this uploaded educational study material ("${fileName}").
Language: ${language}

Provide a comprehensive study pack in JSON with:
1. "chapterSummary": A clear, executive 2-3 paragraph summary of the entire chapter/material.
2. "keyConcepts": An array of objects [{ "title": "Concept Name", "description": "Concise explanation", "importance": "High/Medium" }]
3. "importantQuestions": An array of potential exam questions [{ "question": "Question text", "type": "Short Answer / Long Answer / Numerical", "modelAnswer": "How to score full marks on this" }]
4. "flashcards": An array of 6-8 flashcards [{ "id": "fc-1", "front": "Core question / term", "back": "Clear answer / definition" }]
5. "practiceQuiz": 4 multiple-choice questions [{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "...", "explanation": "..." }]

Study Material Text:
"""
${text.slice(0, 45000)}
"""

Return ONLY valid JSON matching the schema above.`;

    const response = await callGeminiWithRetry({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text?.trim() || '{}';
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
      data = JSON.parse(cleaned);
    }

    res.json(data);
  } catch (error: any) {
    console.error('Document Analyze API Error:', error);
    let msg = 'Failed to analyze study material.';
    if (String(error?.message || error).includes('503') || String(error?.message || error).includes('high demand')) {
      msg = 'Gemini servers are experiencing high traffic right now. Please retry in a moment.';
    }
    res.status(500).json({ error: msg });
  }
});

// Mount Vite or serve static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGenie server running on port ${PORT}`);
  });
}

startServer();
