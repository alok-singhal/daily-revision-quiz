module.exports = {
  maths: {
    addition: [
      { q: "What is 15 + 8?", options: ["23", "22", "24", "21"], answer: 0 },
      { q: "What is 27 + 16?", options: ["43", "42", "44", "41"], answer: 0 },
      { q: "What is 34 + 29?", options: ["63", "62", "64", "61"], answer: 0 },
      { q: "What is 48 + 37?", options: ["85", "84", "86", "83"], answer: 0 },
      { q: "What is 56 + 28?", options: ["84", "83", "85", "82"], answer: 0 },
    ],
    subtraction: [
      { q: "What is 45 - 18?", options: ["27", "26", "28", "25"], answer: 0 },
      { q: "What is 63 - 29?", options: ["34", "33", "35", "32"], answer: 0 },
      { q: "What is 82 - 37?", options: ["45", "44", "46", "43"], answer: 0 },
      { q: "What is 91 - 48?", options: ["43", "42", "44", "41"], answer: 0 },
      { q: "What is 76 - 39?", options: ["37", "36", "38", "35"], answer: 0 },
    ],
    multiplication: [
      { q: "What is 6 × 7?", options: ["42", "41", "43", "40"], answer: 0 },
      { q: "What is 8 × 9?", options: ["72", "71", "73", "70"], answer: 0 },
      { q: "What is 7 × 8?", options: ["56", "55", "57", "54"], answer: 0 },
      { q: "What is 9 × 6?", options: ["54", "53", "55", "52"], answer: 0 },
      { q: "What is 12 × 4?", options: ["48", "47", "49", "46"], answer: 0 },
    ],
    division: [
      { q: "What is 48 ÷ 6?", options: ["8", "7", "9", "6"], answer: 0 },
      { q: "What is 63 ÷ 7?", options: ["9", "8", "10", "7"], answer: 0 },
      { q: "What is 56 ÷ 8?", options: ["7", "6", "8", "5"], answer: 0 },
      { q: "What is 72 ÷ 9?", options: ["8", "7", "9", "6"], answer: 0 },
      { q: "What is 81 ÷ 9?", options: ["9", "8", "10", "7"], answer: 0 },
    ]
  },
  english: {
    spelling: [
      { q: "Which word is spelled correctly?", options: ["becuase", "because", "becuse", "becase"], answer: 1 },
      { q: "Which word is spelled correctly?", options: ["freind", "friend", "frend", "freend"], answer: 1 },
      { q: "Which word is spelled correctly?", options: ["seperate", "separate", "seprate", "seperete"], answer: 1 },
      { q: "Which word is spelled correctly?", options: ["diffrent", "different", "diferent", "differnt"], answer: 1 },
      { q: "Which word is spelled correctly?", options: ["definitly", "definitely", "definately", "defintely"], answer: 1 },
    ],
    punctuation: [
      { q: "What punctuation mark ends a question?", options: [".", "!", "?", ","], answer: 2 },
      { q: "What punctuation mark shows excitement?", options: [".", "!", "?", ","], answer: 1 },
      { q: "What punctuation mark ends most sentences?", options: [".", "!", "?", ","], answer: 0 },
      { q: "What goes at the beginning of a sentence?", options: ["Small letter", "Capital letter", "Number", "Punctuation"], answer: 1 },
      { q: "Which sentence is punctuated correctly?", options: ["how are you", "How are you.", "how are you.", "How are you"], answer: 1 },
    ],
    conjunctions: [
      { q: "Which is a conjunction?", options: ["and", "cat", "run", "big"], answer: 0 },
      { q: "Complete: I like cats ___ dogs.", options: ["but", "and", "or", "all of these"], answer: 3 },
      { q: "Which is a conjunction?", options: ["happy", "but", "jump", "red"], answer: 1 },
      { q: "Complete: Do you want tea ___ coffee?", options: ["and", "but", "or", "so"], answer: 2 },
      { q: "Which joins two parts of a sentence?", options: ["noun", "verb", "conjunction", "adjective"], answer: 2 },
    ],
    prepositions: [
      { q: "Which is a preposition?", options: ["on", "run", "happy", "dog"], answer: 0 },
      { q: "Complete: The book is ___ the table.", options: ["on", "run", "big", "happy"], answer: 0 },
      { q: "Which is a preposition?", options: ["jump", "under", "cat", "blue"], answer: 1 },
      { q: "Complete: The cat is ___ the box.", options: ["run", "in", "happy", "jump"], answer: 1 },
      { q: "Which word shows position?", options: ["verb", "preposition", "noun", "adjective"], answer: 1 },
    ],
    adjectives: [
      { q: "Which is an adjective?", options: ["run", "big", "jump", "eat"], answer: 1 },
      { q: "What do adjectives describe?", options: ["actions", "nouns", "places", "time"], answer: 1 },
      { q: "Which is an adjective?", options: ["quickly", "beautiful", "running", "softly"], answer: 1 },
      { q: "Complete: The ___ dog barked.", options: ["run", "jump", "loud", "eat"], answer: 2 },
      { q: "Which describes a noun?", options: ["verb", "adjective", "conjunction", "preposition"], answer: 1 },
    ],
    adverbs: [
      { q: "Which is an adverb?", options: ["quickly", "big", "cat", "red"], answer: 0 },
      { q: "What do adverbs describe?", options: ["nouns", "verbs", "places", "things"], answer: 1 },
      { q: "Which is an adverb?", options: ["happy", "soft", "softly", "happiness"], answer: 2 },
      { q: "Complete: She ran ___.", options: ["quick", "quickly", "quicker", "cat"], answer: 1 },
      { q: "Many adverbs end in:", options: ["-ed", "-ly", "-ing", "-er"], answer: 1 },
    ],
    nouns: [
      { q: "Which is a noun?", options: ["run", "quickly", "table", "happy"], answer: 2 },
      { q: "What is a noun?", options: ["action word", "describing word", "naming word", "joining word"], answer: 2 },
      { q: "Which is a proper noun?", options: ["dog", "London", "happy", "run"], answer: 1 },
      { q: "Which is a common noun?", options: ["John", "book", "Friday", "London"], answer: 1 },
      { q: "Proper nouns start with:", options: ["small letter", "capital letter", "number", "punctuation"], answer: 1 },
    ],
    "verbs and tenses": [
      { q: "Which is a verb?", options: ["cat", "big", "run", "red"], answer: 2 },
      { q: "What is a verb?", options: ["naming word", "describing word", "action word", "joining word"], answer: 2 },
      { q: "Which is past tense?", options: ["walk", "walked", "walking", "will walk"], answer: 1 },
      { q: "Which is present tense?", options: ["played", "play", "will play", "had played"], answer: 1 },
      { q: "Which is future tense?", options: ["jump", "jumped", "jumping", "will jump"], answer: 3 },
    ]
  },
  science: {
    plants: [
      { q: "What do plants need to grow?", options: ["Water and sunlight", "Only water", "Only soil", "Only air"], answer: 0 },
      { q: "Which part of a plant takes in water?", options: ["Leaves", "Flowers", "Roots", "Stem"], answer: 2 },
      { q: "What do leaves need to make food?", options: ["Sunlight", "Darkness", "Ice", "Fire"], answer: 0 },
      { q: "Which part of a plant makes seeds?", options: ["Roots", "Stem", "Leaves", "Flower"], answer: 3 },
      { q: "What gas do plants give off?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answer: 1 },
    ]
  }
};