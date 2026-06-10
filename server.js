const express = require("express");
const fs = require("fs");
const path = require("path");
const questions = require("./questions");
const year3Questions = require("./year3_questions");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const RESULTS_PATH = path.join(__dirname, "results.json");
const PORT = process.env.PORT || 3000;

// Load past results
function getResults() {
  if (fs.existsSync(RESULTS_PATH)) return JSON.parse(fs.readFileSync(RESULTS_PATH, "utf-8"));
  return [];
}

function saveResult(result) {
  const results = getResults();
  results.push(result);
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(results, null, 2));
}

// Get weak topics from last result
function getWeakTopics() {
  const results = getResults();
  if (!results.length) return null;
  const last = results[results.length - 1];
  const weak = [];
  for (const [topic, data] of Object.entries(last.topicScores)) {
    if (data.percent < 60) weak.push(topic);
  }
  return weak.length ? weak : null;
}

// Pick questions adaptively
function generateQuiz() {
  const weakTopics = getWeakTopics();
  const allTopics = {};

  // Flatten all topics
  for (const [subject, topics] of Object.entries(questions)) {
    for (const [topic, qs] of Object.entries(topics)) {
      allTopics[`${subject}_${topic}`] = qs;
    }
  }

  let selected = [];
  const topicKeys = Object.keys(allTopics);

  if (weakTopics && weakTopics.length) {
    // Pick more from weak topics (higher difficulty)
    for (const topic of weakTopics) {
      const qs = allTopics[topic] || [];
      const hard = qs.filter((q) => q.difficulty >= 2);
      const pick = hard.length >= 3 ? hard : qs;
      selected.push(...pickRandom(pick, 3).map((q) => ({ ...q, topic })));
    }
    // Fill remaining from other topics
    const remaining = 18 - selected.length;
    const otherTopics = topicKeys.filter((t) => !weakTopics.includes(t));
    for (const topic of pickRandom(otherTopics, remaining)) {
      const qs = allTopics[topic] || [];
      selected.push(...pickRandom(qs, 2).map((q) => ({ ...q, topic })));
    }
  } else {
    // First time or all good - balanced mix
    for (const topic of topicKeys) {
      const qs = allTopics[topic] || [];
      selected.push(...pickRandom(qs, 2).map((q) => ({ ...q, topic })));
    }
  }

  // Limit to 18 and shuffle
  return pickRandom(selected, 18);
}

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ---------------- ROUTES ----------------
app.get("/", (req, res) => {
  const quiz = generateQuiz();
  const weakTopics = getWeakTopics();
  const results = getResults();
  const lastScore = results.length ? results[results.length - 1].totalPercent : null;

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Daily Revision Quiz</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; }
    .header { text-align: center; color: white; margin-bottom: 30px; }
    .header h1 { font-size: 2em; margin-bottom: 5px; }
    .header p { opacity: 0.9; }
    .stats { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px; margin-bottom: 20px; color: white; text-align: center; }
    .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .card h3 { color: #333; margin-bottom: 5px; font-size: 1em; }
    .card .topic-tag { display: inline-block; background: #667eea; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; margin-bottom: 8px; }
    .card p { color: #555; margin-bottom: 12px; font-size: 1.05em; }
    .options label { display: block; padding: 10px 14px; margin: 5px 0; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .options label:hover { border-color: #667eea; background: #f5f3ff; }
    .options input[type="radio"] { margin-right: 10px; }
    .btn { display: block; width: 100%; padding: 16px; background: #667eea; color: white; border: none; border-radius: 10px; font-size: 1.2em; cursor: pointer; margin-top: 20px; }
    .btn:hover { background: #5a6fd6; }
    .weak { background: #fff3cd; border-radius: 8px; padding: 10px; margin-bottom: 15px; color: #856404; text-align: center; }
  </style></head><body><div class="container">
  <div class="header"><h1>\ud83d\udcda Daily Revision Quiz</h1><p>Year 8 \u2014 Maths & Science</p></div>`;

  if (lastScore !== null) {
    html += `<div class="stats">\ud83d\udcca Last Score: <strong>${lastScore}%</strong></div>`;
  }
  if (weakTopics) {
    html += `<div class="weak">\u26a0\ufe0f Focus areas today: <strong>${weakTopics.map(t => t.replace("_", " \u2192 ")).join(", ")}</strong></div>`;
  }

  html += `<form method="POST" action="/submit">`;

  quiz.forEach((q, i) => {
    const topicLabel = q.topic.replace("_", " \u2192 ").replace(/^\w/, c => c.toUpperCase());
    html += `<div class="card">
      <span class="topic-tag">${topicLabel}</span>
      <h3>Q${i + 1}.</h3>
      <p>${q.q}</p>
      <div class="options">
        ${q.options.map((opt, j) => `<label><input type="radio" name="q${i}" value="${j}" required> ${opt}</label>`).join("")}
      </div>
      <input type="hidden" name="a${i}" value="${q.answer}">
      <input type="hidden" name="t${i}" value="${q.topic}">
    </div>`;
  });

  html += `<input type="hidden" name="total" value="${quiz.length}">
    <button class="btn" type="submit">\u2705 Submit Answers</button></form></div></body></html>`;

  res.send(html);
});

app.post("/submit", (req, res) => {
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

  // Calculate percentages
  for (const t of Object.keys(topicScores)) {
    topicScores[t].percent = Math.round((topicScores[t].correct / topicScores[t].total) * 100);
  }

  const totalPercent = Math.round((correct / total) * 100);
  const date = new Date().toISOString().slice(0, 10);

  saveResult({ date, correct, total, totalPercent, topicScores });

  // Personalized motivation for Aakhya
  let motivationMsg;
  if (totalPercent === 100) motivationMsg = "Aakhya you are AMAZING! \ud83c\udf1f 100% - Perfect score! You're a genius!";
  else if (totalPercent >= 90) motivationMsg = "Aakhya you are BRILLIANT! \ud83c\udf89 Keep shining, you're almost perfect!";
  else if (totalPercent >= 80) motivationMsg = "Aakhya you are GREAT! \ud83d\udcaa Fantastic effort, keep pushing!";
  else if (totalPercent >= 70) motivationMsg = "Aakhya, well done! \ud83d\udc4f You're getting stronger every day!";
  else if (totalPercent >= 60) motivationMsg = "Aakhya, good effort! \ud83d\udcda A little more practice and you'll smash it!";
  else if (totalPercent >= 50) motivationMsg = "Aakhya, don't give up! \ud83c\udf08 You're learning and that's what matters!";
  else motivationMsg = "Aakhya, keep trying! \ud83d\udcaa Every mistake is a step towards success!";

  // Result page
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
    const label = topic.replace("_", " > ").replace(/^\w/, c => c.toUpperCase());
    const cls = data.percent >= 60 ? "good" : "weak";
    if (data.percent < 60) weakAreas.push(label);
    html += `<div class="topic-row"><span class="topic-name">${label}</span><span class="topic-score ${cls}">${data.correct}/${data.total} (${data.percent}%)</span></div>`;
  }

  html += `</div>`;

  if (weakAreas.length) {
    html += `<div style="background:#fff3cd;border-radius:10px;padding:15px;margin-top:20px;text-align:left;color:#856404;"><h3>Aakhya, let's improve these topics:</h3><ul style="margin:8px 0 8px 20px;">${weakAreas.map(t => `<li style="margin:4px 0;font-weight:bold;">${t}</li>`).join("")}</ul><p style="font-style:italic;margin-top:8px;">Revise these tonight and try again tomorrow - you'll see the difference!</p></div>`;
  } else {
    html += `<div style="background:#d4edda;border-radius:10px;padding:15px;margin-top:20px;text-align:center;color:#155724;"><h3>Aakhya, you smashed every topic! Nothing to improve - you're on fire!</h3></div>`;
  }

  html += `</div><a class="btn" href="/">\ud83d\udd04 Try Again</a></div></div></body></html>`;

  res.send(html);
});

// History endpoint
app.get("/history", (req, res) => {
  const results = getResults();
  res.json(results);
});

// ============== YEAR 3 TEST ==============
const YEAR3_RESULTS_PATH = path.join(__dirname, "year3_results.json");

function getYear3Results() {
  if (fs.existsSync(YEAR3_RESULTS_PATH)) return JSON.parse(fs.readFileSync(YEAR3_RESULTS_PATH, "utf-8"));
  return [];
}

function saveYear3Result(result) {
  const results = getYear3Results();
  results.push(result);
  fs.writeFileSync(YEAR3_RESULTS_PATH, JSON.stringify(results, null, 2));
}

function getYear3StrongTopics() {
  const results = getYear3Results();
  if (!results.length) return null;
  const last = results[results.length - 1];
  const strong = [];
  for (const [topic, data] of Object.entries(last.topicScores)) {
    if (data.percent >= 80) strong.push(topic);
  }
  return strong.length ? strong : null;
}

function generateYear3Quiz() {
  const strongTopics = getYear3StrongTopics();
  const allTopics = {};

  for (const [subject, topics] of Object.entries(year3Questions)) {
    for (const [topic, qs] of Object.entries(topics)) {
      allTopics[`${subject}_${topic}`] = qs;
    }
  }

  let selected = [];
  const topicKeys = Object.keys(allTopics);

  if (strongTopics && strongTopics.length) {
    for (const topic of strongTopics) {
      const qs = allTopics[topic] || [];
      const hard = qs.filter((q) => q.difficulty >= 2);
      const pick = hard.length >= 3 ? hard : qs;
      selected.push(...pickRandom(pick, 3).map((q) => ({ ...q, topic })));
    }
    const remaining = 22 - selected.length;
    const otherTopics = topicKeys.filter((t) => !strongTopics.includes(t));
    for (const topic of otherTopics) {
      const qs = allTopics[topic] || [];
      selected.push(...pickRandom(qs, Math.ceil(remaining / otherTopics.length)).map((q) => ({ ...q, topic })));
    }
  } else {
    for (const topic of topicKeys) {
      const qs = allTopics[topic] || [];
      selected.push(...pickRandom(qs, 3).map((q) => ({ ...q, topic })));
    }
  }

  return pickRandom(selected, 22);
}

app.get("/year3", (req, res) => {
  const quiz = generateYear3Quiz();
  const strongTopics = getYear3StrongTopics();
  const results = getYear3Results();
  const lastScore = results.length ? results[results.length - 1].totalPercent : null;

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Year 3 Test</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; }
    .header { text-align: center; color: white; margin-bottom: 30px; }
    .header h1 { font-size: 2em; margin-bottom: 5px; }
    .header p { opacity: 0.9; }
    .stats { background: rgba(255,255,255,0.15); border-radius: 10px; padding: 12px; margin-bottom: 20px; color: white; text-align: center; }
    .card { background: white; border-radius: 12px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
    .card h3 { color: #333; margin-bottom: 5px; font-size: 1em; }
    .card .topic-tag { display: inline-block; background: #f5576c; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7em; margin-bottom: 8px; }
    .card p { color: #555; margin-bottom: 12px; font-size: 1.05em; }
    .options label { display: block; padding: 10px 14px; margin: 5px 0; border: 2px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .options label:hover { border-color: #f5576c; background: #fff0f3; }
    .options input[type="radio"] { margin-right: 10px; }
    .btn { display: block; width: 100%; padding: 16px; background: #f5576c; color: white; border: none; border-radius: 10px; font-size: 1.2em; cursor: pointer; margin-top: 20px; }
    .btn:hover { background: #e0445a; }
    .levelup { background: #d4edda; border-radius: 8px; padding: 10px; margin-bottom: 15px; color: #155724; text-align: center; }
  </style></head><body><div class="container">
  <div class="header"><h1>\ud83d\udcdd Year 3 Test</h1><p>Maths, English & Science</p></div>`;

  if (lastScore !== null) {
    html += `<div class="stats">\ud83d\udcca Last Score: <strong>${lastScore}%</strong></div>`;
  }
  if (strongTopics) {
    html += `<div class="levelup">\u2b06\ufe0f Levelling up: <strong>${strongTopics.map(t => t.replace("_", " \u2192 ")).join(", ")}</strong></div>`;
  }

  html += `<form method="POST" action="/year3/submit">`;

  quiz.forEach((q, i) => {
    const topicLabel = q.topic.replace("_", " \u2192 ").replace(/^\w/, c => c.toUpperCase());
    html += `<div class="card">
      <span class="topic-tag">${topicLabel}</span>
      <h3>Q${i + 1}.</h3>
      <p>${q.q}</p>
      <div class="options">
        ${q.options.map((opt, j) => `<label><input type="radio" name="q${i}" value="${j}" required> ${opt}</label>`).join("")}
      </div>
      <input type="hidden" name="a${i}" value="${q.answer}">
      <input type="hidden" name="t${i}" value="${q.topic}">
    </div>`;
  });

  html += `<input type="hidden" name="total" value="${quiz.length}">
    <button class="btn" type="submit">\u2705 Submit Answers</button></form></div></body></html>`;

  res.send(html);
});

app.post("/year3/submit", (req, res) => {
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

  saveYear3Result({ date, correct, total, totalPercent, topicScores });

  let motivationMsg;
  if (totalPercent === 100) motivationMsg = "You're a SUPERSTAR! \ud83c\udf1f 100% - Perfect!";
  else if (totalPercent >= 90) motivationMsg = "BRILLIANT! \ud83c\udf89 Almost perfect, keep going!";
  else if (totalPercent >= 80) motivationMsg = "GREAT job! \ud83d\udcaa You're doing amazing!";
  else if (totalPercent >= 70) motivationMsg = "Well done! \ud83d\udc4f Getting stronger every day!";
  else if (totalPercent >= 60) motivationMsg = "Good effort! \ud83d\udcda A bit more practice and you'll smash it!";
  else if (totalPercent >= 50) motivationMsg = "Don't give up! \ud83c\udf08 You're learning!";
  else motivationMsg = "Keep trying! \ud83d\udcaa Every mistake helps you learn!";

  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Year 3 Test - Result</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); min-height: 100vh; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; text-align: center; }
    .result-card { background: white; border-radius: 16px; padding: 40px; margin-top: 40px; box-shadow: 0 8px 30px rgba(0,0,0,0.15); }
    .score { font-size: 4em; font-weight: bold; color: ${totalPercent >= 70 ? "#11998e" : totalPercent >= 50 ? "#f39c12" : "#e74c3c"}; }
    .motivation { font-size: 1.3em; margin: 20px 0; color: #2d2d2d; font-weight: bold; background: linear-gradient(135deg, #f093fb22, #f5576c22); padding: 15px; border-radius: 10px; }
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

  const strongAreas = [];
  const weakAreas = [];
  for (const [topic, data] of Object.entries(topicScores)) {
    const label = topic.replace("_", " > ").replace(/^\w/, c => c.toUpperCase());
    const cls = data.percent >= 80 ? "good" : "weak";
    if (data.percent >= 80) strongAreas.push(label);
    else if (data.percent < 60) weakAreas.push(label);
    html += `<div class="topic-row"><span class="topic-name">${label}</span><span class="topic-score ${cls}">${data.correct}/${data.total} (${data.percent}%)</span></div>`;
  }

  html += `</div>`;

  if (strongAreas.length) {
    html += `<div style="background:#d4edda;border-radius:10px;padding:15px;margin-top:20px;text-align:left;color:#155724;"><h3>\u2b06\ufe0f Tomorrow these will be harder to level you up:</h3><ul style="margin:8px 0 8px 20px;">${strongAreas.map(t => `<li style="margin:4px 0;font-weight:bold;">${t}</li>`).join("")}</ul></div>`;
  }

  if (weakAreas.length) {
    html += `<div style="background:#fff3cd;border-radius:10px;padding:15px;margin-top:20px;text-align:left;color:#856404;"><h3>\ud83d\udcda Keep practising these:</h3><ul style="margin:8px 0 8px 20px;">${weakAreas.map(t => `<li style="margin:4px 0;font-weight:bold;">${t}</li>`).join("")}</ul></div>`;
  }

  html += `</div><a class="btn" href="/year3">\ud83d\udd04 Try Again</a></div></div></body></html>`;

  res.send(html);
});

app.get("/year3/history", (req, res) => {
  res.json(getYear3Results());
});

app.listen(PORT, () => {
  console.log(`\n\ud83d\udcda Quiz server running at http://localhost:${PORT}`);
  console.log(`   Share this link with your kid!`);
});
