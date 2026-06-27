const express = require("express");
const { google } = require("googleapis");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3000;

// ============== MONGODB ==============
let db;
async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log("❌ No MONGODB_URI set - database required");
    return;
  }
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  db = client.db("practisetest");
  await db.collection("users").createIndex({ name: 1 }, { unique: true });
  console.log("✅ Connected to MongoDB");
}

// ============== EMAIL CONFIG ==============
const QUIZ_URL = "https://edusphere-central.swatigarg654.repl.co";

function getGmailAuth() {
  const credentials = JSON.parse(process.env.GMAIL_CREDENTIALS || "{}");
  const token = JSON.parse(process.env.GMAIL_TOKEN || "{}");
  if (!credentials.installed && !credentials.web) return null;
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function sendEmail(toEmail, subject, body) {
  // Try App Password method first (simpler and more reliable)
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: subject,
        text: body
      });

      console.log(`✅ Email sent to ${toEmail}: ${subject}`);
      return true;
    } catch (err) {
      console.error(`❌ App Password method failed for ${toEmail}:`, err.message);
    }
  }

  // Fallback to OAuth method
  const auth = getGmailAuth();
  if (!auth) { console.error("❌ Gmail credentials not configured"); return false; }
  const gmail = google.gmail({ version: "v1", auth });
  const message = [
    `To: ${toEmail}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: base64`,
    "",
    Buffer.from(body).toString("base64"),
  ].join("\r\n");
  const encodedMessage = Buffer.from(message).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  try {
    await gmail.users.messages.send({ userId: "me", requestBody: { raw: encodedMessage } });
    console.log(`✅ Email sent to ${toEmail}: ${subject}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send email to ${toEmail}:`, err.message);
    return false;
  }
}

async function sendDailyEmails() {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const config = await getConfig();
  
  console.log(`📧 Starting to send daily emails for ${today}`);
  
  // Send personalized email to each user
  for (const [userName, userConfig] of Object.entries(config)) {
    console.log(`Sending email to ${userName} at ${userConfig.email}`);
    const quizUrl = `${QUIZ_URL}/quiz/${userName}`;
    const body = `\n📚 DAILY REVISION - ${today}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🎯 Hi ${userName}!\n\nYour daily quiz is ready: ${quizUrl}\n(${userConfig.questionsPerQuiz} MCQs - AI Generated!)\n\n💡 Fresh questions every day!\nGood luck! 🚀\n`;
    
    const success = await sendEmail(userConfig.email, `📚 Daily Revision - ${today}`, body);
    console.log(`Email to ${userName}: ${success ? 'SUCCESS' : 'FAILED'}`);
  }
  
  console.log('📧 Daily email sending completed');
}



async function getConfig() {
  if (!db) throw new Error('Database not connected');
  const users = await db.collection("users").find({ active: true }).toArray();
  const config = {};
  for (const user of users) {
    config[user.name] = {
      email: user.email,
      parentEmail: user.parentEmail,
      year: user.year,
      questionsPerQuiz: user.questionsPerQuiz || 25,
      frequency: user.frequency,
      subjects: user.subjects
    };
  }
  return config;
}

// Generate questions - maths from generator, other subjects from Gemini
const { generateQuestions: generateMathsQuestions } = require('./maths_generator.js');

async function generateQuiz(userName) {
  const config = await getConfig();
  const userConfig = config[userName];
  if (!userConfig) throw new Error(`User ${userName} not found`);

  const totalQuestions = userConfig.questionsPerQuiz || 25;
  const subjects = Object.keys(userConfig.subjects);
  const questionsPerSubject = Math.ceil(totalQuestions / subjects.length);
  const allQuestions = [];

  // Get year number for maths generator
  const yearNum = parseInt(userConfig.year.replace('Year ', ''));

  for (const subject of subjects) {
    if (subject === 'maths') {
      // Use maths generator - 100% correct answers
      const mathsQs = generateMathsQuestions(yearNum, questionsPerSubject);
      allQuestions.push(...mathsQs.map(q => ({
        q: q.q,
        options: q.options,
        answer: q.answer,
        topic: q.topic.replace('maths_', ''),
        subject: 'maths'
      })));
    } else {
      // Use Gemini for science, english, history
      const geminiQs = await generateFromGemini(subject, userConfig.subjects[subject], questionsPerSubject, userConfig.year);
      allQuestions.push(...geminiQs);
    }
  }

  // Shuffle and trim to exact count
  return allQuestions.sort(() => 0.5 - Math.random()).slice(0, totalQuestions);
}

async function generateFromGemini(subject, topics, count, year) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const topicsList = topics && topics.length > 0
    ? topics.join(', ')
    : `pick age-appropriate ${subject} topics for ${year}`;

  const prompt = `Generate exactly ${count} multiple choice questions for a UK ${year} student.
Subject: ${subject}
Topics: ${topicsList}

Return ONLY a valid JSON array. Each object must have:
- "q": question text
- "options": array of exactly 4 strings
- "answer": index (0-3) of correct option
- "topic": topic name
- "subject": "${subject}"

Age-appropriate, mix easy and medium difficulty. No duplicates.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (resp.status === 429) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
        continue;
      }
      if (!resp.ok) throw new Error(`Gemini API error: ${resp.status}`);

      const data = await resp.json();
      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('Failed to parse Gemini response');

      return JSON.parse(jsonMatch[0]).slice(0, count);
    } catch (err) {
      if (attempt === 3) {
        console.error(`Gemini failed for ${subject}: ${err.message}`);
        return [];
      }
    }
  }
  return [];
}

// ---- Results helpers ----
async function getResults(userName) {
  if (!db) return [];
  return await db.collection("results").find({ userName }).sort({ date: -1 }).toArray();
}
async function saveResult(userName, result) {
  if (!db) return;
  await db.collection("results").insertOne({ userName, ...result });
}

// ---- Quiz HTML renderer ----
function renderQuizPage(quiz, userName, lastScore, config) {
  const userConfig = config[userName];
  const title = `📚 Daily Revision Quiz`;
  const subtitle = `${userConfig.year} — ${userName}`;
  const gradientBg = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  const tagColor = "#667eea";
  const hoverBorder = "#667eea";
  const hoverBg = "#f5f3ff";
  const btnBg = "#667eea";
  const submitAction = `/submit/${userName}`;

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: ${gradientBg}; min-height: 100vh; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; }
    .header { text-align: center; color: white; margin-bottom: 30px; }
    .header h1 { font-size: 2em; margin-bottom: 5px; }
    .header p { opacity: 0.9; }
    .stats { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px; margin-bottom: 20px; color: white; text-align: center; }
    .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .card h3 { color: #333; margin-bottom: 5px; font-size: 1em; }
    .card .topic-tag { display: inline-block; background: ${tagColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; margin-bottom: 8px; }
    .card p { color: #555; margin-bottom: 12px; font-size: 1.05em; }
    .options label { display: block; padding: 10px 14px; margin: 5px 0; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .options label:hover { border-color: ${hoverBorder}; background: ${hoverBg}; }
    .options input[type="radio"] { margin-right: 10px; }
    .btn { display: block; width: 100%; padding: 16px; background: ${btnBg}; color: white; border: none; border-radius: 10px; font-size: 1.2em; cursor: pointer; margin-top: 20px; }
    .btn:hover { opacity: 0.9; }
    .loading { text-align: center; color: white; font-size: 1.3em; margin-top: 50px; }
  </style></head><body><div class="container">
  <div class="header"><h1>${title}</h1><p>${subtitle}</p></div>`;

  if (lastScore !== null) {
    html += `<div class="stats">📊 Last Score: <strong>${lastScore}%</strong></div>`;
  }

  html += `<form method="POST" action="${submitAction}">`;

  quiz.forEach((q, i) => {
    const topicLabel = `${q.subject} → ${q.topic}`;
    html += `<div class="card">
      <span class="topic-tag">${topicLabel}</span>
      <h3>Q${i + 1}.</h3>
      <p>${q.q}</p>
      <div class="options">
        ${q.options.map((opt, j) => `<label><input type="radio" name="q${i}" value="${j}" required> ${opt}</label>`).join("")}
      </div>
      <input type="hidden" name="a${i}" value="${q.answer}">
      <input type="hidden" name="t${i}" value="${q.subject}_${q.topic}">
    </div>`;
  });

  html += `<input type="hidden" name="total" value="${quiz.length}">
    <button class="btn" type="submit">✅ Submit Answers</button></form></div>
    <script>
      document.querySelector('form').addEventListener('submit', function(e) {
        var totalQuestions = ${quiz.length};
        var answeredCount = 0;
        for (var i = 0; i < totalQuestions; i++) {
          if (document.querySelectorAll('input[name="q' + i + '"]:checked').length > 0) {
            answeredCount++;
          }
        }
        if (answeredCount < totalQuestions) {
          e.preventDefault();
          alert('Please answer all questions! You answered ' + answeredCount + ' out of ' + totalQuestions);
          return false;
        }
        var submitBtn = document.querySelector('.btn');
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
      });
    </script></body></html>`;

  return html;
}

function renderResultPage(correct, total, topicScores, userName, config) {
  const userConfig = config[userName];
  const totalPercent = Math.round((correct / total) * 100);
  const retryLink = `/quiz/${userName}`;

  let motivationMsg;
  if (totalPercent === 100) motivationMsg = `${userName} you are AMAZING! 🌟 100% - Perfect score!`;
  else if (totalPercent >= 90) motivationMsg = `${userName} you are BRILLIANT! 🎉 Keep shining!`;
  else if (totalPercent >= 80) motivationMsg = `${userName} you are GREAT! 💪 Fantastic effort!`;
  else if (totalPercent >= 70) motivationMsg = `${userName}, well done! 👏 Getting stronger every day!`;
  else if (totalPercent >= 60) motivationMsg = `${userName}, good effort! 📚 A little more practice and you'll smash it!`;
  else if (totalPercent >= 50) motivationMsg = `${userName}, don't give up! 🌈 You're learning!`;
  else motivationMsg = `${userName}, keep trying! 💪 Every mistake is a step towards success!`;

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Quiz Result</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; text-align: center; }
    .result-card { background: white; border-radius: 16px; padding: 40px; margin-top: 40px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
    .score { font-size: 4em; font-weight: bold; color: ${totalPercent >= 70 ? "#11998e" : totalPercent >= 50 ? "#f39c12" : "#e74c3c"}; }
    .motivation { font-size: 1.3em; margin: 20px 0; color: #2d2d2d; font-weight: bold; background: linear-gradient(135deg, #667eea22, #764ba222); padding: 15px; border-radius: 10px; }
    .topics { text-align: left; margin-top: 20px; }
    .topic-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .topic-name { color: #555; }
    .topic-score { font-weight: bold; }
    .good { color: #11998e; }
    .weak { color: #e74c3c; }
    .btn { display: inline-block; padding: 12px 30px; background: #11998e; color: white; border-radius: 8px; text-decoration: none; margin-top: 25px; font-size: 1.1em; }
  </style></head><body><div class="container"><div class="result-card">
    <div class="score">${totalPercent}%</div>
    <div class="motivation">${motivationMsg}</div>
    <p>${correct} out of ${total} correct</p>
    <div class="topics"><h3 style="margin:15px 0">Topic Breakdown:</h3>`;

  const weakAreas = [];
  for (const [topic, data] of Object.entries(topicScores)) {
    const label = topic.replace("_", " → ");
    const cls = data.percent >= 60 ? "good" : "weak";
    if (data.percent < 60) weakAreas.push(label);
    html += `<div class="topic-row"><span class="topic-name">${label}</span><span class="topic-score ${cls}">${data.correct}/${data.total} (${data.percent}%)</span></div>`;
  }

  html += `</div>`;

  if (weakAreas.length) {
    html += `<div style="background:#fff3cd;border-radius:10px;padding:15px;margin-top:20px;text-align:left;color:#856404;"><h3>${userName}, let's improve these topics:</h3><ul style="margin:8px 0 8px 20px;">${weakAreas.map(t => `<li style="margin:4px 0;font-weight:bold;">${t}</li>`).join("")}</ul><p style="font-style:italic;margin-top:8px;">Revise these and try again - you'll see the difference!</p></div>`;
  } else {
    html += `<div style="background:#d4edda;border-radius:10px;padding:15px;margin-top:20px;text-align:center;color:#155724;"><h3>${userName}, you smashed every topic! Nothing to improve - you're on fire! 🔥</h3></div>`;
  }

  html += `</div><p style="margin-top:20px;color:#555;font-style:italic;">🚀 Come back tomorrow for fresh new questions!</p></div></div></body></html>`;
  return html;
}

// ---- ROUTES ----

// Loading page HTML
function loadingPage(title, subtitle, gradientBg, loadUrl) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: ${gradientBg}; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .loader { text-align: center; color: white; }
    .loader h1 { font-size: 2em; margin-bottom: 15px; }
    .loader p { font-size: 1.2em; opacity: 0.9; }
    .spinner { margin: 20px auto; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style></head><body>
  <div class="loader"><h1>${title}</h1><p>${subtitle}</p><div class="spinner"></div><p>Generating your quiz...</p></div>
  <script>window.location.href='${loadUrl}';</script>
  </body></html>`;
}

// Check if user already submitted today
async function hasSubmittedToday(userName) {
  if (!db) return false;
  const today = new Date().toISOString().slice(0, 10);
  const found = await db.collection("results").findOne({ userName, date: today });
  return !!found;
}

async function renderAlreadyDonePage(userName, config) {
  const userConfig = config[userName];
  const results = await getResults(userName);
  const lastResult = results[0];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Quiz Complete</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
    .emoji { font-size: 4em; margin-bottom: 15px; }
    h1 { color: #333; margin-bottom: 10px; }
    p { color: #555; font-size: 1.1em; margin: 10px 0; }
    .score { font-size: 1.3em; font-weight: bold; color: #667eea; margin: 15px 0; }
  </style></head><body>
  <div class="card">
    <div class="emoji">✅</div>
    <h1>Great job, ${userName}!</h1>
    <p>You've already completed today's quiz.</p>
    <div class="score">Today's score: ${lastResult.totalPercent}%</div>
    <p>🚀 Come back tomorrow for fresh new questions!</p>
  </div></body></html>`;
}

// Dynamic quiz route for any user
app.get("/quiz/:userName", async (req, res) => {
  const userName = req.params.userName;
  const config = await getConfig();
  if (!config[userName]) {
    return res.status(404).send(`<h1>User not found</h1><p>${userName} is not configured in the system</p>`);
  }
  if (await hasSubmittedToday(userName)) {
    return res.send(await renderAlreadyDonePage(userName, config));
  }
  res.send(loadingPage("📚 Daily Revision Quiz", `${config[userName].year} — ${userName}`, "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", `/generate/${userName}`));
});

app.get("/generate/:userName", async (req, res) => {
  const userName = req.params.userName;
  try {
    const config = await getConfig();
    if (!config[userName]) {
      return res.status(404).send(`<h1>User not found</h1><p>${userName} is not configured</p>`);
    }
    if (await hasSubmittedToday(userName)) {
      return res.send(await renderAlreadyDonePage(userName, config));
    }
    const results = await getResults(userName);
    const lastScore = results.length ? results[0].totalPercent : null;
    const quiz = await generateQuiz(userName);
    res.send(renderQuizPage(quiz, userName, lastScore, config));
  } catch (err) {
    console.error(`Error generating quiz for ${userName}:`, err.message);
    res.status(500).send(`<h1>Error generating quiz</h1><p>${err.message}</p><p>Check your GEMINI_API_KEY environment variable</p>`);
  }
});

app.post("/submit/:userName", async (req, res) => {
  const userName = req.params.userName;
  const config = await getConfig();
  if (!config[userName]) {
    return res.status(404).send(`<h1>User not found</h1><p>${userName} is not configured</p>`);
  }
  
  const total = parseInt(req.body.total);
  let correct = 0;
  const topicScores = {};

  for (let i = 0; i < total; i++) {
    const userAns = req.body[`q${i}`];
    const correctAns = req.body[`a${i}`];
    const topic = req.body[`t${i}`];

    if (!topicScores[topic]) topicScores[topic] = { correct: 0, total: 0 };
    topicScores[topic].total++;

    if (userAns === correctAns) {
      correct++;
      topicScores[topic].correct++;
    }
  }

  for (const t of Object.keys(topicScores)) {
    topicScores[t].percent = Math.round((topicScores[t].correct / topicScores[t].total) * 100);
  }

  const totalPercent = Math.round((correct / total) * 100);
  const date = new Date().toISOString().slice(0, 10);
  await saveResult(userName, { date, correct, total, totalPercent, topicScores });

  // Send result email to parent
  const userConfig = config[userName];
  if (userConfig.parentEmail) {
    const weakTopics = Object.entries(topicScores).filter(([, d]) => d.percent < 60).map(([t]) => t.replace("_", " → "));
    let body = `📊 Quiz Result for ${userName} (${userConfig.year})\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nDate: ${date}\nScore: ${correct}/${total} (${totalPercent}%)\n\nTopic Breakdown:\n`;
    for (const [topic, data] of Object.entries(topicScores)) {
      body += `  ${topic.replace("_", " → ")}: ${data.correct}/${data.total} (${data.percent}%)\n`;
    }
    if (weakTopics.length) body += `\n⚠️ Needs improvement: ${weakTopics.join(", ")}`;
    else body += `\n🌟 All topics passed!`;
    sendEmail(userConfig.parentEmail, `📊 ${userName} scored ${totalPercent}% - Daily Practise Test`, body);
  }

  res.send(renderResultPage(correct, total, topicScores, userName, config));
});

// ============== REGISTER PAGE ==============
app.get("/register", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>QuizBot - Register</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Poppins', sans-serif; background: #0f0c29; min-height: 100vh; padding: 20px; position: relative; overflow-x: hidden; }
    body::before { content: ''; position: fixed; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle at 30% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%); z-index: 0; }
    .container { max-width: 650px; margin: 0 auto; position: relative; z-index: 1; }
    .header { text-align: center; color: white; margin-bottom: 35px; padding-top: 20px; }
    .header .logo { font-size: 3.5em; margin-bottom: 10px; }
    .header h1 { font-size: 2.2em; font-weight: 700; margin-bottom: 8px; background: linear-gradient(135deg, #667eea, #764ba2, #f093fb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .header p { opacity: 0.8; font-size: 1.05em; color: #b8c5e8; }
    .card { background: rgba(255,255,255,0.97); border-radius: 20px; padding: 35px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .section-title { font-weight: 700; color: #667eea; font-size: 1em; margin-bottom: 15px; display: flex; align-items: center; gap: 8px; }
    .field { margin-bottom: 18px; }
    .field > label { display: block; font-weight: 600; color: #1a1a2e; margin-bottom: 6px; font-size: 0.85em; }
    .field input[type="text"], .field input[type="email"], .field input[type="tel"], .field select, .field textarea { width: 100%; padding: 12px 14px; border: 2px solid #e8ecf4; border-radius: 10px; font-size: 0.95em; font-family: 'Poppins', sans-serif; transition: all 0.3s; background: #f8fafc; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: #667eea; outline: none; background: white; box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1); }
    .field textarea { resize: vertical; min-height: 70px; }
    .radio-group { display: flex; gap: 15px; flex-wrap: wrap; }
    .radio-option { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border: 2px solid #e8ecf4; border-radius: 10px; cursor: pointer; font-size: 0.88em; font-weight: 500; transition: all 0.2s; }
    .radio-option:hover { border-color: #667eea; background: #f0f0ff; }
    .radio-option input[type="radio"] { accent-color: #667eea; }
    .checkbox-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .checkbox-option { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 2px solid #e8ecf4; border-radius: 10px; cursor: pointer; font-size: 0.88em; font-weight: 500; transition: all 0.2s; }
    .checkbox-option:hover { border-color: #667eea; background: #f0f0ff; }
    .checkbox-option input[type="checkbox"] { width: 18px; height: 18px; accent-color: #667eea; }
    .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 25px 0; }
    .btn { display: block; width: 100%; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 14px; font-size: 1.1em; font-weight: 600; cursor: pointer; margin-top: 25px; font-family: 'Poppins', sans-serif; transition: all 0.3s; box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35); }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(102, 126, 234, 0.5); }
    .inline-check { display: flex; align-items: center; gap: 10px; margin-top: 15px; font-size: 0.88em; font-weight: 500; cursor: pointer; }
    .inline-check input { width: 18px; height: 18px; accent-color: #667eea; }
    @media (max-width: 500px) { .checkbox-grid { grid-template-columns: 1fr; } .radio-group { flex-direction: column; } .card { padding: 25px 18px; } }
  </style>
  <script>
    function toggleChildEmail() {
      var same = document.getElementById('sameAsParent').checked;
      var childEmailField = document.getElementById('childEmailField');
      childEmailField.style.display = same ? 'none' : 'block';
      document.getElementById('childEmail').required = !same;
    }
  </script>
  </head><body><div class="container">
  <div class="header">
    <div class="logo">🧠</div>
    <h1>QuizBot</h1>
    <p>AI-powered daily revision quizzes for your child</p>
  </div>
  <div class="card">
    <form method="POST" action="/register">

      <div class="section-title">👨‍👩‍👧 Parent Details</div>
      <div class="field"><label>Full Name</label><input type="text" name="parentName" placeholder="Your full name" required></div>
      <div class="field"><label>Phone Number</label><input type="tel" name="phone" placeholder="07xxx xxxxxx" required></div>
      <div class="field"><label>Email Address</label><input type="email" name="parentEmail" id="parentEmail" placeholder="parent@email.com" required></div>

      <div class="divider"></div>

      <div class="section-title">👧 Child Details</div>
      <div class="field"><label>Child's Name</label><input type="text" name="childName" placeholder="e.g. Alex" required></div>
      <div class="field"><label>School Year</label>
        <select name="year" required>
          <option value="">Select year...</option>
          <option value="Year 1">Year 1</option>
          <option value="Year 2">Year 2</option>
          <option value="Year 3">Year 3</option>
          <option value="Year 4">Year 4</option>
          <option value="Year 5">Year 5</option>
          <option value="Year 6">Year 6</option>
          <option value="Year 7">Year 7</option>
          <option value="Year 8">Year 8</option>
          <option value="Year 9">Year 9</option>
          <option value="Year 10">Year 10</option>
          <option value="Year 11">Year 11</option>
        </select>
      </div>
      <div class="field"><label>Child's Email Address</label>
        <div class="radio-group" style="margin-bottom:10px;">
          <label class="radio-option"><input type="radio" name="emailChoice" value="same" id="sameAsParent" onchange="toggleChildEmail()" checked> Same as parent's email</label>
          <label class="radio-option"><input type="radio" name="emailChoice" value="different" onchange="toggleChildEmail()"> Different email</label>
        </div>
        <div id="childEmailField" style="display:none;"><input type="email" name="childEmail" id="childEmail" placeholder="child@email.com"></div>
      </div>

      <div class="divider"></div>

      <div class="section-title">📚 Subject Selection</div>
      <div class="field">
        <div class="checkbox-grid">
          <label class="checkbox-option"><input type="checkbox" name="subjects" value="maths" checked> 📐 Maths</label>
          <label class="checkbox-option"><input type="checkbox" name="subjects" value="science" checked> 🔬 Science</label>
          <label class="checkbox-option"><input type="checkbox" name="subjects" value="english"> 📖 English</label>
          <label class="checkbox-option"><input type="checkbox" name="subjects" value="history"> 🏛️ History</label>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title">📅 Test Frequency</div>
      <div class="field">
        <div class="radio-group">
          <label class="radio-option"><input type="radio" name="frequency" value="biweekly"> Bi-weekly</label>
          <label class="radio-option"><input type="radio" name="frequency" value="daily" checked> Daily practice</label>
        </div>
      </div>

      <div class="divider"></div>

      <div class="field"><label>📝 Additional Notes (optional)</label><textarea name="notes" placeholder="Any specific topics, learning goals, or things we should know..."></textarea></div>

      <label class="inline-check"><input type="checkbox" name="sendNow" value="yes"> 🚀 Send me a practice test link immediately</label>

      <button class="btn" type="submit">Register Now</button>
    </form>
  </div></div></body></html>`);
});

app.post("/register", async (req, res) => {
  const { parentName, phone, parentEmail, childName, year, emailChoice, childEmail, subjects, frequency, notes, sendNow } = req.body;

  if (!parentName || !phone || !parentEmail || !childName || !year) {
    return res.status(400).send("<h1>Missing fields</h1><p>Please fill in all required fields.</p><a href='/register'>Go back</a>");
  }

  const kidEmail = emailChoice === 'same' ? parentEmail : childEmail;
  if (!kidEmail) {
    return res.status(400).send("<h1>Missing email</h1><p>Please provide child's email.</p><a href='/register'>Go back</a>");
  }

  // Parse subjects array
  const subjectList = Array.isArray(subjects) ? subjects : (subjects ? [subjects] : []);
  if (subjectList.length === 0) {
    return res.status(400).send("<h1>No subjects selected</h1><p>Please select at least one subject.</p><a href='/register'>Go back</a>");
  }

  // Build subjects object - topics will be auto-generated by Gemini based on year group
  const subjectsObj = {};
  for (const s of subjectList) {
    subjectsObj[s] = []; // empty = Gemini picks age-appropriate topics
  }

  const userDoc = {
    name: childName,
    parentName,
    phone,
    email: kidEmail,
    parentEmail,
    year,
    questionsPerQuiz: 25,
    frequency: frequency === 'biweekly' ? 'biweekly' : 'daily',
    subjects: subjectsObj,
    notes: notes || '',
    active: true,
    createdAt: new Date()
  };

  if (!db) {
    return res.status(500).send("<h1>Database not connected</h1><p>Please try again later.</p>");
  }

  await db.collection("users").updateOne({ name: childName }, { $set: userDoc }, { upsert: true });

  // Send immediate test if requested
  if (sendNow === 'yes') {
    const quizUrl = `${QUIZ_URL}/quiz/${childName}`;
    const body = `Hi ${childName}!\n\nYour first practice test is ready: ${quizUrl}\n\nGood luck! \ud83d\ude80`;
    sendEmail(kidEmail, `\ud83d\udcda Your Practice Test is Ready!`, body);
  }

  // Success page
  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Registration Complete</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
    .emoji { font-size: 4em; margin-bottom: 15px; }
    h1 { color: #333; margin-bottom: 10px; }
    p { color: #555; font-size: 1.05em; margin: 10px 0; }
    .details { background: #f0f4ff; border-radius: 10px; padding: 15px; margin: 20px 0; text-align: left; }
    .details p { font-size: 0.9em; margin: 5px 0; }
    .btn { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 8px; text-decoration: none; margin-top: 20px; font-size: 1em; font-weight: 600; }
  </style></head><body>
  <div class="card">
    <div class="emoji">\ud83c\udf89</div>
    <h1>Welcome, ${childName}!</h1>
    <p>You're all set for ${frequency === 'biweekly' ? 'bi-weekly' : 'daily'} quizzes!</p>
    <div class="details">
      <p><strong>Child:</strong> ${childName} (${year})</p>
      <p><strong>Quiz email:</strong> ${kidEmail}</p>
      <p><strong>Parent:</strong> ${parentName} (${parentEmail})</p>
      <p><strong>Subjects:</strong> ${subjectList.join(', ')}</p>
      <p><strong>Frequency:</strong> ${frequency === 'biweekly' ? 'Bi-weekly' : 'Daily'}</p>
    </div>
    ${sendNow === 'yes' ? '<p>\ud83d\ude80 A practice test link has been sent!</p>' : '<p>\ud83d\udce7 First quiz link will arrive at 11:00 AM</p>'}
    <a class="btn" href="/quiz/${childName}">\u25b6\ufe0f Try a Quiz Now</a>
  </div></body></html>`);
});

// Home redirects to register
app.get("/", (req, res) => {
  res.redirect("/register");
});

// History endpoints
app.get("/history/:userName", async (req, res) => res.json(await getResults(req.params.userName)));

// Config endpoint - view/update config
app.get("/config", async (req, res) => {
  const config = await getConfig();
  res.json(config);
});

// Manual email trigger
app.get("/send-emails", async (req, res) => {
  await sendDailyEmails();
  res.send("✅ Emails sent!");
});

// Email diagnostic endpoint
app.get("/test-email", async (req, res) => {
  const auth = getGmailAuth();
  if (!auth) {
    return res.json({ status: "error", message: "Gmail credentials not configured" });
  }
  
  try {
    const gmail = google.gmail({ version: "v1", auth });
    const profile = await gmail.users.getProfile({ userId: "me" });
    res.json({ 
      status: "success", 
      message: "Gmail authentication successful",
      emailAddress: profile.data.emailAddress 
    });
  } catch (err) {
    res.json({ 
      status: "error", 
      message: `Gmail authentication failed: ${err.message}` 
    });
  }
});

connectDB().then(async () => {
  app.listen(PORT, async () => {
    console.log(`\n📚 Quiz server running at http://localhost:${PORT}`);
    console.log(`   Register: http://localhost:${PORT}/register`);
    if (db) {
      try {
        const config = await getConfig();
        Object.keys(config).forEach(userName => {
          console.log(`   ${userName} (${config[userName].year}): http://localhost:${PORT}/quiz/${userName}`);
        });
      } catch (e) { /* no users yet */ }
    } else {
      console.log('   ⚠️ No database - register page available, quizzes need MongoDB');
    }
  });
});
