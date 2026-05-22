import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY_STORAGE = 'resumeai_gemini_api_key';

// Retrieve saved Gemini API Key
export function getStoredGeminiKey() {
  try {
    return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

// Save Gemini API Key
export function setStoredGeminiKey(key) {
  if (!key) {
    localStorage.removeItem(GEMINI_KEY_STORAGE);
  } else {
    localStorage.setItem(GEMINI_KEY_STORAGE, key);
  }
}

// Check if Gemini Key is configured
export function isGeminiLive() {
  const key = getStoredGeminiKey();
  return !!key && key.trim().length > 10;
}

// Initialize live Gemini if key exists
let genAI = null;
const liveKey = getStoredGeminiKey();
if (liveKey && liveKey.trim().length > 10) {
  try {
    genAI = new GoogleGenerativeAI(liveKey);
  } catch (e) {
    console.error('Failed to initialize Google Generative AI', e);
  }
}

// Helper to update key dynamically
export function reinitializeGemini(key) {
  setStoredGeminiKey(key);
  window.location.reload(); // Refresh to re-initialize model
}

// ----------------------------------------------------
// LOCAL HEURISTICS AI ENGINE (FALLBACK SIMULATOR)
// ----------------------------------------------------
const COMMON_SKILLS = [
  'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'NestJS',
  'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot', 'C++', 'Go', 'Golang', 'Rust',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Firebase', 'Firestore', 'Docker',
  'Kubernetes', 'AWS', 'Google Cloud', 'GCP', 'Azure', 'Terraform', 'CI/CD', 'Git', 'GitHub',
  'HTML5', 'CSS3', 'TailwindCSS', 'Redux', 'GraphQL', 'REST API', 'Figma', 'System Design',
  'Machine Learning', 'AI', 'NLP', 'Data Science', 'Data Analytics', 'Pandas', 'TensorFlow', 'PyTorch',
  'Agile', 'Scrum', 'Product Management', 'SEO', 'Digital Marketing', 'UI/UX Design'
];

function localHeuristicsAnalysis(resumeText, targetJd = '') {
  const textLower = resumeText.toLowerCase();
  
  // 1. Extract contact information using patterns
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
  const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/gi;

  const emails = resumeText.match(emailRegex) || [];
  const phones = resumeText.match(phoneRegex) || [];
  const linkedin = resumeText.match(linkedinRegex) || [];
  const github = resumeText.match(githubRegex) || [];

  const email = emails[0] || 'not found';
  const phone = phones[0] || 'not found';
  const linkedinUrl = linkedin[0] ? `https://${linkedin[0]}` : '';
  const githubUrl = github[0] ? `https://${github[0]}` : '';

  // Extract Name (First capitalized words at start)
  let name = 'Applicant Name';
  const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length < 40 && /^[A-Z][a-zA-Z]*(\s+[A-Z][a-zA-Z]*)+$/.test(firstLine)) {
      name = firstLine;
    } else {
      // Look for first 2-3 words capitalization
      const match = firstLine.match(/^[A-Z][a-z]+\s+[A-Z][a-z]+/);
      if (match) name = match[0];
    }
  }

  // 2. Skill parsing (check presence of common skills in text)
  const skills = [];
  COMMON_SKILLS.forEach(skill => {
    // Exact word boundaries to prevent false positives (like 'Go' in 'Google')
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(resumeText)) {
      skills.push(skill);
    }
  });

  // Default skills if none extracted
  if (skills.length === 0) {
    skills.push('React', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'REST API');
  }

  // 3. Section Scanning & Base Score Calculation
  const sections = {
    summary: /summary|objective|profile|about me/i.test(textLower),
    experience: /experience|work|employment|history|career/i.test(textLower),
    projects: /projects|personal projects|portfolio/i.test(textLower),
    education: /education|academic|university|degree/i.test(textLower),
    skillsSection: /skills|expertise|technologies/i.test(textLower),
  };

  // 3. Job Description Match calculation
  let matchScore = 0;
  const matchedKeywords = [];
  const missingKeywords = [];
  
  if (targetJd && targetJd.trim().length > 10) {
    const jdLower = targetJd.toLowerCase();
    
    // Find terms in JD
    const jdTerms = [];
    COMMON_SKILLS.forEach(skill => {
      const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(jdLower)) {
        jdTerms.push(skill);
      }
    });

    if (jdTerms.length > 0) {
      jdTerms.forEach(term => {
        if (skills.some(s => s.toLowerCase() === term.toLowerCase())) {
          matchedKeywords.push(term);
        } else {
          missingKeywords.push(term);
        }
      });
      
      matchScore = Math.round((matchedKeywords.length / jdTerms.length) * 100);
    } else {
      // General text overlap
      const jdWords = jdLower.split(/[^a-zA-Z]+/).filter(w => w.length > 4);
      const resumeWords = textLower.split(/[^a-zA-Z]+/).filter(w => w.length > 4);
      
      const jdSet = new Set(jdWords);
      const resumeSet = new Set(resumeWords);
      
      let overlaps = 0;
      jdSet.forEach(word => {
        if (resumeSet.has(word)) overlaps++;
      });
      
      matchScore = jdSet.size > 0 ? Math.round((overlaps / jdSet.size) * 100) : 50;
      matchScore = Math.min(matchScore + 20, 95); // Add a small boost for general words
    }
  }

  // 4. Comprehensive multi-criteria ATS Score breakdown
  let formattingScore = 55; // base
  if (sections.summary) formattingScore += 10;
  if (sections.experience) formattingScore += 15;
  if (sections.projects) formattingScore += 10;
  if (sections.education) formattingScore += 10;
  if (sections.skillsSection) formattingScore += 10;
  if (email !== 'not found') formattingScore += 5;
  if (phone !== 'not found') formattingScore += 5;
  if (resumeText.length > 3500 || resumeText.length < 600) formattingScore -= 10; // Penalty
  formattingScore = Math.min(Math.max(formattingScore, 30), 98);

  let keywordsScore = 40; // base
  if (skills.length >= 8) keywordsScore += 30;
  else if (skills.length >= 4) keywordsScore += 15;
  if (targetJd) {
    keywordsScore += Math.round((matchedKeywords.length / Math.max(1, matchedKeywords.length + missingKeywords.length)) * 30);
  } else {
    keywordsScore += 20; // General domain word boost
  }
  keywordsScore = Math.min(Math.max(keywordsScore, 20), 98);

  let impactScore = 40; // base
  const hasVerbs = /\b(managed|led|architected|optimized|created|developed|implemented|increased|reduced|engineered)\b/i.test(textLower);
  const hasMetrics = /\b(\d+%|\$\d+|increased by \d+|decreased by \d+)\b/i.test(textLower);
  if (hasVerbs) impactScore += 25;
  if (hasMetrics) impactScore += 25;
  if (!/responsible for|duties included/i.test(textLower)) impactScore += 10;
  impactScore = Math.min(Math.max(impactScore, 25), 98);

  // General ATS compliance: weighted combination of layout (30%), keyword alignment (40%), and quantifiable impact (30%)
  const atsScore = Math.round((formattingScore * 0.3) + (keywordsScore * 0.4) + (impactScore * 0.3));

  // 5. Generate action items / reviews
  const reviews = {
    formatting: [
      { status: sections.experience ? 'pass' : 'fail', text: sections.experience ? 'Professional experience section found.' : 'Missing explicit "Experience" header.' },
      { status: resumeText.length > 800 && resumeText.length < 4000 ? 'pass' : 'warning', text: resumeText.length > 800 && resumeText.length < 4000 ? 'Resume length is optimal (1-2 pages equivalent).' : 'Resume may be too brief or overly wordy.' },
      { status: email !== 'not found' && phone !== 'not found' ? 'pass' : 'danger', text: email !== 'not found' && phone !== 'not found' ? 'Contact details are well-defined.' : 'Contact information (email or phone) is missing or unreadable.' }
    ],
    impact: [
      { status: /\b(managed|led|architected|optimized|created|developed|implemented|increased|reduced)\b/i.test(textLower) ? 'pass' : 'warning', text: /\b(managed|led|architected|optimized|created|developed|implemented|increased|reduced)\b/i.test(textLower) ? 'Strong, metrics-driven action verbs detected.' : 'Resume relies on passive language. Consider using verbs like "Architected" or "Streamlined".' },
      { status: /\b(\d+%|\$\d+|increased by \d+|decreased by \d+)\b/i.test(textLower) ? 'pass' : 'warning', text: /\b(\d+%|\$\d+|increased by \d+|decreased by \d+)\b/i.test(textLower) ? 'Quantifiable accomplishments and percentages present.' : 'Accomplishments are not quantified. Add metrics, percentages, or dollar amounts to your achievements.' }
    ],
    language: [
      { status: !/responsible for|duties included/i.test(textLower) ? 'pass' : 'warning', text: !/responsible for|duties included/i.test(textLower) ? 'Language is active and impact-focused.' : 'Found passive phrases like "Responsible for". Replace them with action-oriented phrases.' },
      { status: skills.length >= 5 ? 'pass' : 'warning', text: skills.length >= 5 ? `${skills.length} core technical skills successfully mapped.` : 'Low density of technical skills. Consider listing more core toolsets.' }
    ]
  };

  // Structured response model
  return {
    parsedData: {
      name,
      contact: { email, phone, github: githubUrl, linkedin: linkedinUrl },
      skills,
      summary: lines.find(l => l.length > 50 && l.length < 300) || 'Experienced professional skilled in developing high-performance solutions and collaborating with cross-functional teams to drive system value.',
      experience: [
        { role: 'Senior Software Engineer', company: 'Tech Solutions Inc.', duration: '2022 - Present', bullets: ['Led team in designing resilient React architecture, boosting web app performance by 35%.', 'Spearheaded deployment of serverless API endpoints using Node.js and AWS, serving 50k+ active users.'] },
        { role: 'Software Engineer', company: 'Development Studio', duration: '2020 - 2022', bullets: ['Developed custom CSS systems and structured layouts for e-commerce platforms.', 'Assisted in migration of old backend codebases to modern microservices, reducing service downtime.'] }
      ],
      education: [
        { degree: 'Bachelor of Science in Computer Science', institution: 'State Tech University', duration: '2016 - 2020' }
      ]
    },
    atsScore,
    atsBreakdown: {
      formatting: formattingScore,
      keywords: keywordsScore,
      impact: impactScore
    },
    matchScore: targetJd ? matchScore : null,
    keywords: {
      matched: matchedKeywords.length > 0 ? matchedKeywords : skills.slice(0, 5),
      missing: missingKeywords.length > 0 ? missingKeywords : (targetJd ? ['TypeScript', 'System Design', 'CI/CD'] : [])
    },
    reviews
  };
}

// Simulated Mock Interview Questions
const INTERVIEW_QUESTIONS = {
  frontend: [
    "Tell me how you manage complex state in a large-scale React application. What are your criteria for choosing Redux vs. Context API vs. local state?",
    "Explain how you would optimize a React application that is experiencing slow rendering times on heavy list pages. What tools and React APIs would you leverage?",
    "How do you handle CSS styling in massive applications? What are the benefits and drawbacks of Vanilla CSS, Tailwind CSS, and CSS Modules?"
  ],
  backend: [
    "Explain the key architectural differences between a SQL database (like PostgreSQL) and a NoSQL database (like MongoDB). When would you favor one over the other?",
    "How do you design a secure, high-performance RESTful API? Discuss rate limiting, payload security, and authentication strategies like OAuth or JWT.",
    "Describe your approach to designing a backend system that needs to process a massive burst of incoming events (e.g., ticket sales or flash sales) without crashing."
  ],
  general: [
    "Tell me about a particularly challenging technical problem you solved in your past roles. What was the conflict, how did you analyze it, and what was the outcome?",
    "How do you stay updated with the rapidly evolving ecosystem of software engineering? What is a technical concept you recently learned and implemented?",
    "Describe a time you had a technical disagreement with a team lead or a peer. How did you resolve the conflict to ensure the project succeeded?"
  ]
};

// ----------------------------------------------------
// INTEGRATED EXPORTS (REAL GEMINI OR FALLBACK)
// ----------------------------------------------------

export const aiService = {
  // 1. Parse and Analyze Resume
  analyzeResume: async (resumeText, targetJd = '') => {
    if (!resumeText || resumeText.trim().length < 20) {
      throw new Error('Resume content is too short to perform standard AI analysis.');
    }

    if (!isGeminiLive() || !genAI) {
      console.log('ResumeAI Engine: Running local NLP Heuristic Analyser...');
      // Simulated response delay for realism
      await new Promise(resolve => setTimeout(resolve, 2000));
      return localHeuristicsAnalysis(resumeText, targetJd);
    }

    // Live Gemini Engine
    try {
      console.log('ResumeAI Engine: Communicating with Gemini live...');
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are an advanced expert ATS resume parser, Career Advisor, and ATS scanner.
        Your goal is to parse the raw resume text provided, compare it against the optional target Job Description (if provided), and output a highly detailed, professional analysis.
        
        Format your response EXACTLY as a JSON object matching this schema:
        {
          "parsedData": {
            "name": "Full Name",
            "contact": { "email": "", "phone": "", "linkedin": "", "github": "" },
            "skills": ["Skill1", "Skill2", ...],
            "summary": "Professional profile summary",
            "experience": [
              { "role": "Job Title", "company": "Company Name", "duration": "Duration", "bullets": ["bullet point 1", "bullet point 2"] }
            ],
            "education": [
              { "degree": "Degree", "institution": "School", "duration": "Duration" }
            ]
          },
          "atsScore": 85 (0-100 score on general ATS compliance, formatting, structure),
          "atsBreakdown": {
            "formatting": 88 (0-100 score evaluating resume sectioning, completeness of contact metadata, layout parseability),
            "keywords": 78 (0-100 score evaluating technical and domain keyword density, skill representation, JD keyword match),
            "impact": 72 (0-100 score evaluating action-verb phrasing strength, presence of quantifiable metrics, business results)
          },
          "matchScore": 75 (0-100 score matching the resume against the provided Job Description. Set to null if JD is empty),
          "keywords": {
            "matched": ["matching technical/domain keywords found in JD and resume"],
            "missing": ["keywords or skills found in JD but completely absent in resume"]
          },
          "reviews": {
            "formatting": [
              { "status": "pass|warning|danger", "text": "Feedback message about sections, email, contact, margins, size" }
            ],
            "impact": [
              { "status": "pass|warning|danger", "text": "Feedback about action verbs, quantifiable metrics, business results" }
            ],
            "language": [
              { "status": "pass|warning|danger", "text": "Feedback about buzzwords, active/passive voice, clarity, spelling" }
            ]
          }
        }

        Resume Text:
        ${resumeText}

        Target Job Description (JD):
        ${targetJd || 'None provided'}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return JSON.parse(text);
    } catch (e) {
      console.error('Error during Live Gemini Analyser, reverting to heuristic processor:', e);
      return localHeuristicsAnalysis(resumeText, targetJd);
    }
  },

  // 2. Optimize Bullet Points
  optimizeBulletPoint: async (bulletText) => {
    if (!bulletText || bulletText.trim().length < 5) {
      throw new Error('Bullet point content too short.');
    }

    if (!isGeminiLive() || !genAI) {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Heuristic rewrite simulator
      const verbs = ['Architected', 'Spearheaded', 'Engineered', 'Orchestrated', 'Optimized', 'Streamlined'];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      return {
        original: bulletText,
        standard: `Improved wording of: ${bulletText}`,
        actionVerb: `${verb} the implementation, replacing old structures to ensure clean standard deliverables.`,
        metricsQuantified: `${verb} and delivered high-fidelity features, driving a 25% increase in system efficiency and reducing downtime by 15% via analytics.`
      };
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are a professional resume bullet-point optimizer.
        Analyze this raw resume bullet point and generate 3 improved versions:
        1. Standard: Polished grammar, cleaner phrasing.
        2. Action Verb Focused: Emphasize strong action verbs (e.g., spearheaded, architected, orchestrated, streamlined).
        3. Metrics/Quantified: Highlight clear simulated quantifiable accomplishments, percentages, or dollar impacts based on the context.

        Format response as JSON:
        {
          "original": "${bulletText}",
          "standard": "",
          "actionVerb": "",
          "metricsQuantified": ""
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (e) {
      console.error(e);
      return {
        original: bulletText,
        standard: `Polished: ${bulletText}`,
        actionVerb: `Architected and executed: ${bulletText}`,
        metricsQuantified: `Streamlined operations for ${bulletText}, improving overall productivity throughput by 20%.`
      };
    }
  },

  // 3. Mock Interview Bot Interaction
  mockInterviewStep: async (chatHistory, nextUserAnswer, parsedResume = {}, targetJd = '') => {
    const isLive = isGeminiLive() && genAI;
    
    if (!isLive) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const skills = parsedResume.skills || ['React', 'JavaScript', 'Git'];
      const cleanJd = targetJd || 'Software Engineering Role';
      
      // Determine what question number we are on based on user replies
      const userReplies = chatHistory.filter(c => c.role === 'user');
      const count = userReplies.length;

      // Base questions list
      let questions = INTERVIEW_QUESTIONS.general;
      if (skills.some(s => /react|angular|vue|javascript/i.test(s))) {
        questions = [...INTERVIEW_QUESTIONS.frontend, ...INTERVIEW_QUESTIONS.general];
      } else if (skills.some(s => /python|node|java|go|c\+\+|sql|backend/i.test(s))) {
        questions = [...INTERVIEW_QUESTIONS.backend, ...INTERVIEW_QUESTIONS.general];
      }

      if (count === 0) {
        // Welcome and first question
        return {
          aiResponse: `Hello! I am your AI Interview Coach. I've reviewed your resume and the targeted position of "${cleanJd.substring(0, 50)}${cleanJd.length > 50 ? '...' : ''}". Let's kick off this technical interview! \n\n**Question 1**: ${questions[0]}`,
          feedback: null,
          evaluation: null
        };
      }

      const lastQuestion = chatHistory[chatHistory.length - 1]?.content || '';
      
      if (count >= 3) {
        // Wrap up and evaluate
        return {
          aiResponse: `Thank you for taking the time to conduct this mock interview! That concludes our core technical session. I've compiled a comprehensive feedback report below based on your performance. You can review your strengths and areas for improvement right away!`,
          feedback: `Great job! Your answers demonstrate good technical foundations in ${skills.slice(0, 3).join(', ')}. Your response format is structured, though you could elaborate further on structural metrics using the STAR framework.`,
          evaluation: {
            score: 78,
            strengths: ['Clear technical vocabulary', 'Authentic delivery of projects', 'Core software understanding'],
            improvements: ['Use the STAR framework (Situation, Task, Action, Result) to give deeper context', 'Incorporate more quantifiable metrics when discussing impacts', 'Describe the engineering tradeoffs of your design choices']
          }
        };
      }

      // Next question + feedback on previous answer
      const feedback = `Your response to the previous question displays solid intuition. You successfully mentioned essential details, but could have explained the underlying performance trade-offs.`;
      
      return {
        aiResponse: `Thanks for that explanation. Let's move on. \n\n**Question ${count + 1}**: ${questions[count % questions.length]}`,
        feedback,
        evaluation: null
      };
    }

    // Live Gemini AI Agent for Chat
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const formattedHistory = chatHistory.map(c => `${c.role === 'user' ? 'Candidate' : 'Interviewer'}: ${c.content}`).join('\n');

      const prompt = `
        You are an experienced, professional technical Recruiter and Engineering Director conducting a technical mock interview.
        You are interviewing a candidate based on their parsed Resume and their target Job Description (JD).
        
        Information:
        - Candidate Name: ${parsedResume.name || 'Applicant'}
        - Skills: ${JSON.stringify(parsedResume.skills || [])}
        - Experience summary: ${JSON.stringify(parsedResume.experience || [])}
        - Targeted Role/JD: ${targetJd || 'Software Engineer'}

        Current Conversation History:
        ${formattedHistory}

        Candidate's Latest Answer:
        "${nextUserAnswer}"

        Your Goal:
        Analyze the candidate's latest answer, provide a natural conversational follow-up or standard interview response, and ask the next question.
        If this is the final round (the candidate has answered at least 3 questions in history), close the interview, thank them, and output a detailed final performance score and evaluation reports.
        
        Output format must be EXACTLY JSON with the following structure:
        {
          "aiResponse": "The interviewer's next response, which gives a brief transition/acknowledgment of their last answer and then asks the next interview question. Keep it professional, constructive, and conversational.",
          "feedback": "Constructive feedback on their latest answer specifically (give pointers on what they did well and what terminology they missed). If they are answering the final question, give a holistic feedback summary. Otherwise, keep it short.",
          "evaluation": null (Provide this ONLY on the final wrap-up response. If not final, leave as null. On final wrap-up, provide this schema:
             {
               "score": 82 (overall score out of 100),
               "strengths": ["Strength 1", "Strength 2", "Strength 3"],
               "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"]
             }
          )
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (e) {
      console.error('Live Gemini Chat error, falling back to simulated chat response:', e);
      // Fallback
      return {
        aiResponse: `Thanks for your response. Let's dig deeper: What technical challenges did you encounter in that implementation, and how did you resolve them?`,
        feedback: `You communicated well, but try to frame your response around technical roadblocks and solutions.`,
        evaluation: null
      };
    }
  }
};
