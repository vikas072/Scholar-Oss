import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client (robust pattern to avoid crash if some keys are omitted)
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined in the settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Dual-study DSA & Web Development tracker AI services running." });
});

// 1. Chatbot Tutor Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
       res.status(400).json({ error: "Message is required." });
       return;
    }

    const ai = getAi();
    
    // Construct systems instructions & session
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are StudyBuddy, an expert master tutor for Data Structures & Algorithms (DSA) and Web Development (Full-Stack). " +
          "Your mission is to help the student understand complex coding paradigms, guide them through algorithmic principles, explain time/space complexities step-by-step, troubleshoot bugs, and provide code structure critiques. " +
          "Focus on solid, clean, typed, elegant software design. Always response using precise, neat, highly structured Markdown. " +
          "Format code blocks beautifully with respective syntax highlighting (e.g. ```typescript, ```cpp, ```python). Use analogies when appropriate.",
      }
    });

    // Send history context if present to mock the memory thread
    // Note: To preserve history with gemini-node-sdk chats, we can reconstruct the history.
    // Let's check how chats sendMessage is defined. It handles the session.
    // If we want a simple stateless conversational agent, we can also query generateContent directly with a template.
    // Re-creating the chat on each request using message/history is very robust for stateless deployments like Cloud Run.
    let fullPrompt = "";
    if (history && history.length > 0) {
      fullPrompt += "Context from previous conversational turns:\n";
      history.forEach((h: any) => {
        const senderLabel = h.sender === 'user' ? 'Student' : 'Tutor (StudyBuddy)';
        fullPrompt += `[${senderLabel}]: ${h.text}\n\n`;
      });
      fullPrompt += `Current Student Message:\n${message}\n\nTutor response:`;
    } else {
      fullPrompt = message;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with StudyBuddy AI." });
  }
});

// 2. DSA Code Complexity Analyzer Endpoint
app.post("/api/gemini/analyze-code", async (req, res) => {
  try {
    const { code, problemName, language, topic } = req.body;
    if (!code) {
       res.status(400).json({ error: "Code content is required for analysis." });
       return;
    }

    const ai = getAi();

    const prompt = `Please review and analyze the following solution code for the Data Structures & Algorithms (DSA) problem:
    
- **Problem Title**: ${problemName || "Generic Problem"}
- **DSA Topic Category**: ${topic || "General"}
- **Programming Language**: ${language || "TypeScript/JavaScript"}

### Code to Analyze:
\`\`\`${language || "typescript"}
${code}
\`\`\`

Evaluate carefully and construct a structured JSON object response with time complexity, space complexity, feasibility of optimizations, concrete actionable suggestions, potential boundary edge cases to consider, a refined fully formatted solution block, and a concise explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeComplexity: { type: Type.STRING, description: "Detailed asymptotic time complexity (e.g. O(N log N))." },
            spaceComplexity: { type: Type.STRING, description: "Detailed auxiliary space complexity (e.g. O(N))." },
            canBeOptimized: { type: Type.BOOLEAN, description: "True if a better time or space complexity algorithm exists." },
            optimizationSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of actionable suggestions to improve efficiency or maintainability."
            },
            edgeCasesToConsider: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Critical boundaries or edge states to check (e.g. empty lists, negative values, large numbers)."
            },
            correctedOrImprovedCode: { type: Type.STRING, description: "Corrected, fully indented, clean code block representing the best solution structure." },
            explanation: { type: Type.STRING, description: "Detailed, developer-friendly explanation of why the code behaves this way and how the improved version resolves potential bottlenecks." }
          },
          required: ["timeComplexity", "spaceComplexity", "canBeOptimized", "optimizationSuggestions", "edgeCasesToConsider", "correctedOrImprovedCode", "explanation"]
        }
      }
    });

    const resultText = response.text;
    res.json(JSON.parse(resultText || "{}"));
  } catch (error: any) {
    console.error("Gemini Code Analyzer API Error:", error);
    res.status(500).json({ error: error.message || "Could not analyze the code solution." });
  }
});

// 3. Weekly Roadmap Goal / Milestone recommender Endpoint
app.post("/api/gemini/create-plan", async (req, res) => {
  try {
    const { dsaTopic, webDevTopic, targetDays, cseTopic } = req.body;
    
    const dsaTopicStr = dsaTopic || "Dynamic Programming, Trees & Sorting";
    const webDevTopicStr = webDevTopic || "React State Management, Express routing and API optimization";
    const cseTopicStr = cseTopic || "None (Focus on coding)";
    const days = targetDays || 7;

    const ai = getAi();

    const prompt = `Act as an elite software engineering and computer science university advisor. Generate a highly structured daily study guide and milestone roadmap for a B.Tech CSE student trying to master these topics in exactly ${days} Days.

- **DSA Target Concepts**: ${dsaTopicStr}
- **Web Development Target Technologies**: ${webDevTopicStr}
- **B.Tech CSE Academic Subject / Exam Concept**: ${cseTopicStr}

Please divide the syllabus step-by-step day-by-day and return a structured JSON response matching the required schema. Ensure it is very tactical with highly practical code targets, theory review checklists, and real-world micro-challenges.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            overview: { type: Type.STRING },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: "Day number." },
                  dsaFocus: { type: Type.STRING, description: "DSA theory, problem, and platform tasks for this day." },
                  webDevFocus: { type: Type.STRING, description: "Web Dev build goal, package configurations, or system components to draft." },
                  tip: { type: Type.STRING, description: "Shorthand advice, common bug warns, or visual reminder." }
                },
                required: ["day", "dsaFocus", "webDevFocus", "tip"]
              }
            },
            milestones: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Milestones or exit thresholds verifying that they have mastered the material."
            }
          },
          required: ["title", "overview", "days", "milestones"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini Create Plan API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate dynamic study guide." });
  }
});

// 4. Daily Study Insight Endpoint
app.post("/api/gemini/study-insight", async (req, res) => {
  try {
    const { studyLogs, dsaProblems, webDevLogs, date } = req.body;
    
    const logs = studyLogs || [];
    const problems = dsaProblems || [];
    const devLogs = webDevLogs || [];
    const targetDate = date || new Date().toISOString().split('T')[0];

    const ai = getAi();

    const prompt = `Please analyze the student's study activity logs, solved DSA problems, and logged Web Development sessions for the date ${targetDate} to provide constructive, intelligent, and highly motivating analytical feedback on their learning progress.

### Today's Activity Details:
- **General Study Hours Logs**:
${logs.length > 0 ? logs.map((l: any) => `  * [Category: ${l.category.toUpperCase()}] Title: "${l.title}" for ${l.duration} mins. Notes: "${l.notes || 'None'}"`).join('\n') : "  * No general study logs recorded."}

- **DSA Problems Tracked**:
${problems.length > 0 ? problems.map((p: any) => `  * Problem: "${p.problemName}" on ${p.platform || 'General'}. Topic: ${p.topic || 'General'}. Difficulty: ${p.difficulty || 'General'}. Status: ${p.status || 'General'}. Notes: "${p.notes || 'None'}"`).join('\n') : "  * No DSA problems completed."}

- **Web Development Portfolio Build Logs**:
${devLogs.length > 0 ? devLogs.map((wl: any) => `  * Project: "${wl.projectTitle}" (Skills: ${wl.skillsUsed?.join(', ') || 'General'}). Learnings: "${wl.learnings || 'None'}"`).join('\n') : "  * No web development build activities logged."}

Review their daily output. Generate highly customized, positive, expert, and actionable insights. Deliver a response adhering STRICTLY to the required JSON schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A highly motivating daily diagnostic summary reviewing work and consistency of hours." },
            achievements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 crisp, outstanding accomplishments they succeeded in today."
            },
            feedback: { type: Type.STRING, description: "Actionable, healthy engineering feedback advising on weaknesses, conceptual patterns, or edge-cases to watch out for." },
            nextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 targeted, practical objectives or next steps recommended to maximize tomorrow's session."
            }
          },
          required: ["summary", "achievements", "feedback", "nextSteps"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Gemini Study Insight API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate daily study insights." });
  }
});

// 5. GATE & B.Tech CSE Placement Practice Trainer Endpoint
app.post("/api/gemini/placement-practice", async (req, res) => {
  try {
    const { action, subject, userResponse, questionText } = req.body;
    const ai = getAi();
    
    if (action === "get_question") {
      const selectedSubject = subject || "any computer science engineering Core (DBMS, Operating Systems, Computer Networks, Theory of Computation, Digital Logic, Compiler Design, Computer Architecture, Software Engineering)";
      const prompt = `Act as an elite Computer Science university professor and GATE coach. Create 1 high-quality, conceptual, and highly modern question with exactly 4 options. Make sure it represents core CSE B.Tech curricula.
Subject target: ${selectedSubject}
Return a structured JSON matching the schema. Make the question challenging, testing real structural concepts rather than trivial syntax.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              questionText: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctOptionIndex: { type: Type.INTEGER, description: "0-based index of the correct option (0 to 3)." },
              conceptualExplanation: { type: Type.STRING, description: "Detailed explanation of why the correct answer is right and why other options are wrong." }
            },
            required: ["subject", "questionText", "options", "correctOptionIndex", "conceptualExplanation"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
      return;
    }
    
    if (action === "evaluate") {
      if (!questionText || !userResponse) {
        res.status(400).json({ error: "questionText and userResponse are required for evaluation." });
        return;
      }
      
      const prompt = `Act as an expert GATE CSE / technical Interview examiner. Evaluate the student's explanation to the following concept question:
Question: "${questionText}"
Student Explanation: "${userResponse}"

Rate their answer out of 10, determine if it is conceptually sound, and provide expert corrective feedback with ideal concepts/keypoints they should have included.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Asymptotic score out of 10." },
              isCorrect: { type: Type.BOOLEAN, description: "True if the answer is mostly correct and shows solid understanding." },
              expertFeedback: { type: Type.STRING, description: "Detailed tutoring notes highlighting correct elements and explaining any holes in their logic." },
              idealKeypoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key concepts or keywords they should write down to secure full marks (e.g. 'Semaphores', 'Deadlock prevention', 'Mutex lock')."
              }
            },
            required: ["score", "isCorrect", "expertFeedback", "idealKeypoints"]
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
      return;
    }
    
    res.status(400).json({ error: "Invalid action." });
  } catch (error: any) {
    console.error("Placement practice route error:", error);
    res.status(500).json({ error: error.message || "Endpoint error." });
  }
});

// 5.5 Integrated Scholar OmniSearch & Web Ref Synthesizer Route
app.post("/api/gemini/search-ref", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ error: "Search query string is required." });
      return;
    }

    const ai = getAi();
    const systemPrompt = `You are ScholarOS Google Search & Technical Reference Companion. The student requested to search or understand the term: "${query}".
Because they want to learn directly from the workspace without switching tabs, synthesize a comprehensive, top-tier developer reference guide.
Provide:
1. A descriptive title for the concepts searched.
2. A beautiful, thorough synthesized Markdown answer with clear typography. Include explanation, code snippets (with syntax highlights like typescript or cpp), time/space complexity blocks where relevant, and an actionable "How to use/implement" guide.
3. Pre-formatted reference searches. Construct exact search URLs for Google, StackOverflow, MDN, and GitHub using double-quotes or search terms to help them transition to external lookup with a single click.

Return strictly JSON matching the specified formatting structure.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Descriptive query header matching or summarizing the query." },
            synthesizedAnswer: { type: Type.STRING, description: "The beautiful structured markdown answer complete with code examples, headers, lists, complexity breakdowns." },
            searchLinks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING, description: "The name of the site (e.g. Google, MDN, StackOverflow, GitHub)" },
                  url: { type: Type.STRING, description: "A pre-built URL that executes a web search query for this concept on that domain directly." }
                },
                required: ["label", "url"]
              }
            }
          },
          required: ["title", "synthesizedAnswer", "searchLinks"]
        }
      }
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Scholar Search Synthesizer Route Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with ScholarOS Search." });
  }
});

// 6. YouTube CSE Video & Playlist Finder Proxy Route
app.get("/api/youtube/search", async (req, res) => {
  try {
    const q = req.query.q as string;
    if (!q) {
      res.status(400).json({ error: "Query parameter 'q' is required." });
      return;
    }

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (YOUTUBE_API_KEY && YOUTUBE_API_KEY.trim() !== "" && YOUTUBE_API_KEY !== "MY_YOUTUBE_API_KEY") {
      // Use standard Google YouTube v3 Search API
      console.log(`Querying Google YouTube v3 Data API for: "${q}"`);
      const apiResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(
          q
        )}&type=video,playlist&key=${YOUTUBE_API_KEY}`
      );
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.json() as any;
        throw new Error(errorData?.error?.message || "YouTube API error");
      }
      
      const data = await apiResponse.json() as any;
      const items = data.items || [];
      const formatted = items.map((item: any) => {
        const isVideo = item.id.kind === "youtube#video";
        const id = isVideo ? item.id.videoId : item.id.playlistId;
        const type = isVideo ? "video" : "playlist";
        const url = isVideo
          ? `https://www.youtube.com/watch?v=${id}`
          : `https://www.youtube.com/playlist?list=${id}`;
        return {
          id,
          type,
          title: item.snippet?.title || "Video Lecture",
          description: item.snippet?.description || "YouTube CSE video tutorial study session.",
          thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || `https://img.youtube.com/vi/${id}/0.jpg`,
          url
        };
      });
      
      res.json({ source: "youtube_api", results: formatted });
      return;
    }

    // Fallback: Use Gemini AI to contextually retrieve highly trusted computer science masterclass links
    console.log(`Using Gemini AI YouTube Study proxy search for: "${q}"`);
    const ai = getAi();
    const prompt = `You are an expert Computer Science education search engine directory. A college student is searching for high quality YouTube explanation tutorials, masterclasses, or syllabus playlists on this academic topic: "${q}".
    
Return a JSON array consisting of 6-8 real, legendary, and highly relevant computer science tutorials on YouTube.
Include trusted channels like Gate Smashers, Abdul Bari, CS50, freeCodeCamp, Jenny's Lectures, Fireship, Academind, Traversy Media, or MIT OCW.
Provide true video/playlist IDs and URLs if possible, or correct link slugs they can study.

Deliver a JSON array matching standard format:`;

    const modelResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "The YouTube video ID (e.g. j71E_5p5R28) or playlist ID (e.g. PLxCzCOWd7aiEed7-ADyybK4B9FU696d5U)." },
              type: { type: Type.STRING, description: "'video' or 'playlist'." },
              title: { type: Type.STRING, description: "The correct, high quality CSE YouTube title." },
              description: { type: Type.STRING, description: "Informative summary highlighting specific key algorithms, web mechanics, or GATE definitions reviewed." },
              thumbnail: { type: Type.STRING, description: "A valid high quality YouTube thumbnail image link or empty string." },
              url: { type: Type.STRING, description: "Full YouTube lecture list context link (e.g. https://www.youtube.com/playlist?list=... or https://www.youtube.com/watch?v=...)." }
            },
            required: ["id", "type", "title", "description", "thumbnail", "url"]
          }
        }
      }
    });

    const parsedResults = JSON.parse(modelResponse.text || "[]");
    const fineTunedRes = parsedResults.map((r: any) => {
      // Create backup thumbnails based on YouTube standard layout if empty
      if (!r.thumbnail) {
        if (r.type === "video") {
          r.thumbnail = `https://img.youtube.com/vi/${r.id}/0.jpg`;
        } else {
          r.thumbnail = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60`;
        }
      }
      return r;
    });

    res.json({ source: "gemini_proxy", results: fineTunedRes });

  } catch (error: any) {
    console.error("YouTube Route Search Error:", error);
    res.status(500).json({ error: error.message || "Failed to catalog tutorial search results." });
  }
});

// Vite Middleware for Development / Static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode. Serving precompiled static folder...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
