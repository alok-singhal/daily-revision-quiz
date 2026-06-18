const fs = require('fs');
let c = fs.readFileSync('./year6_questions.js', 'utf-8');
const oldStr = '      { q: "Which uses subjunctive mood?", options: ["I am here.", "If I were you.", "She went.", "Run!"], answer: 1, difficulty: 2 },\n    ],';
const newStr = `      { q: "Which uses subjunctive mood?", options: ["I am here.", "If I were you.", "She went.", "Run!"], answer: 1, difficulty: 2 },
      { q: "What type of clause begins with when, if, because?", options: ["Main clause", "Subordinate clause", "Noun phrase", "Verb phrase"], answer: 1, difficulty: 1 },
      { q: "Which is a determiner?", options: ["quickly", "the", "run", "happy"], answer: 1, difficulty: 1 },
      { q: "What is an antonym of generous?", options: ["Kind", "Selfish", "Brave", "Tall"], answer: 1, difficulty: 1 },
      { q: "Which uses a colon correctly?", options: ["I need: eggs.", "I need eggs: milk.", "I need these items: eggs, milk and bread.", "I: need eggs."], answer: 2, difficulty: 2 },
      { q: "What is a synonym of enormous?", options: ["Tiny", "Huge", "Fast", "Old"], answer: 1, difficulty: 1 },
      { q: "Which is a preposition?", options: ["run", "behind", "happy", "and"], answer: 1, difficulty: 1 },
      { q: "Identify the subordinate clause: I stayed inside because it rained.", options: ["I stayed inside", "because it rained", "I stayed", "inside because"], answer: 1, difficulty: 2 },
      { q: "What punctuation introduces direct speech?", options: ["Full stop", "Comma", "Inverted commas", "Brackets"], answer: 2, difficulty: 1 },
      { q: "Which has a fronted adverbial?", options: ["The cat sat.", "Slowly, the cat sat.", "Cats sit slowly.", "The slow cat."], answer: 1, difficulty: 1 },
      { q: "What is the plural of sheep?", options: ["sheeps", "sheepes", "sheep", "sheepies"], answer: 2, difficulty: 1 },
      { q: "Which word means to look quickly?", options: ["Stare", "Glance", "Gaze", "Watch"], answer: 1, difficulty: 1 },
      { q: "What is an apostrophe used for?", options: ["Possession and contraction", "Plurals", "Questions", "Exclamations"], answer: 0, difficulty: 1 },
      { q: "Which is a complex sentence?", options: ["I ran.", "I ran and jumped.", "Although tired, I ran.", "Run!"], answer: 2, difficulty: 2 },
      { q: "The suffix -tion usually creates a:", options: ["Verb", "Adjective", "Noun", "Adverb"], answer: 2, difficulty: 2 },
    ],`;
c = c.replace(oldStr, newStr);
fs.writeFileSync('./year6_questions.js', c);
console.log('Done');
