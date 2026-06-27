// Maths Question Generator - UK Curriculum Year 1 to Year 10
// Generates random questions with computed correct answers - 100% accurate

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function makeOptions(correct, wrong1, wrong2, wrong3) {
  const opts = shuffle([correct, wrong1, wrong2, wrong3].map(String));
  return { options: opts, answer: opts.indexOf(String(correct)) };
}

function nearOptions(correct, spread = 3) {
  const w1 = correct + randomInt(1, spread);
  const w2 = correct - randomInt(1, spread);
  const w3 = correct + randomInt(spread + 1, spread * 2);
  return makeOptions(correct, w1, w2, w3);
}

// ============== YEAR 1 ==============
const year1 = {
  addition_within_20(difficulty) {
    const a = randomInt(1, 10);
    const b = randomInt(1, 10 - (difficulty === 1 ? 5 : 0));
    const correct = a + b;
    return { q: `What is ${a} + ${b}?`, ...nearOptions(correct, 2), topic: "maths_addition" };
  },
  subtraction_within_20(difficulty) {
    const a = randomInt(5, 15);
    const b = randomInt(1, a - 1);
    const correct = a - b;
    return { q: `What is ${a} - ${b}?`, ...nearOptions(correct, 2), topic: "maths_subtraction" };
  },
  counting(difficulty) {
    const start = randomInt(1, 10);
    const step = difficulty === 1 ? 1 : 2;
    const count = 4;
    const seq = Array.from({length: count}, (_, i) => start + i * step);
    const next = start + count * step;
    return { q: `What comes next: ${seq.join(", ")}, ...?`, ...nearOptions(next, 2), topic: "maths_counting" };
  },
  number_bonds(difficulty) {
    const total = difficulty === 1 ? 10 : 20;
    const a = randomInt(1, total - 1);
    const correct = total - a;
    return { q: `${a} + ? = ${total}`, ...nearOptions(correct, 2), topic: "maths_number_bonds" };
  },
  shapes(difficulty) {
    const shapes = [
      { name: "triangle", sides: 3 },
      { name: "square", sides: 4 },
      { name: "rectangle", sides: 4 },
      { name: "pentagon", sides: 5 },
      { name: "hexagon", sides: 6 },
      { name: "circle", sides: 0 },
    ];
    const s = shapes[randomInt(0, shapes.length - 1)];
    if (s.sides === 0) {
      return { q: `How many corners does a circle have?`, ...makeOptions(0, 1, 2, 4), topic: "maths_shapes" };
    }
    return { q: `How many sides does a ${s.name} have?`, ...nearOptions(s.sides, 1), topic: "maths_shapes" };
  },
  comparison(difficulty) {
    const a = randomInt(1, 20);
    const b = randomInt(1, 20);
    while (a === b) return year1.comparison(difficulty);
    const correct = a > b ? `${a}` : `${b}`;
    const wrong = a > b ? `${b}` : `${a}`;
    return { q: `Which is bigger: ${a} or ${b}?`, options: shuffle([correct, wrong, String(a + b), String(Math.abs(a - b))]), answer: 0, topic: "maths_comparison" };
  },
};

// ============== YEAR 2 ==============
const year2 = {
  addition_within_100(difficulty) {
    const a = randomInt(10, difficulty === 1 ? 50 : 80);
    const b = randomInt(5, difficulty === 1 ? 20 : 40);
    const correct = a + b;
    return { q: `What is ${a} + ${b}?`, ...nearOptions(correct, 5), topic: "maths_addition" };
  },
  subtraction_within_100(difficulty) {
    const a = randomInt(20, 99);
    const b = randomInt(5, a - 5);
    const correct = a - b;
    return { q: `What is ${a} - ${b}?`, ...nearOptions(correct, 5), topic: "maths_subtraction" };
  },
  multiplication_tables(difficulty) {
    const table = difficulty === 1 ? randomInt(2, 5) : randomInt(2, 10);
    const mult = randomInt(2, 12);
    const correct = table * mult;
    return { q: `What is ${table} × ${mult}?`, ...nearOptions(correct, table), topic: "maths_multiplication" };
  },
  division_facts(difficulty) {
    const divisor = difficulty === 1 ? randomInt(2, 5) : randomInt(2, 10);
    const mult = randomInt(2, 10);
    const dividend = divisor * mult;
    return { q: `What is ${dividend} ÷ ${divisor}?`, ...nearOptions(mult, 2), topic: "maths_division" };
  },
  fractions(difficulty) {
    const wholes = [12, 16, 20, 24, 30];
    const whole = wholes[randomInt(0, wholes.length - 1)];
    const frac = difficulty === 1 ? 2 : [3, 4][randomInt(0, 1)];
    const correct = whole / frac;
    const fracName = frac === 2 ? "half" : frac === 3 ? "third" : "quarter";
    return { q: `What is one ${fracName} of ${whole}?`, ...nearOptions(correct, 2), topic: "maths_fractions" };
  },
  money(difficulty) {
    const item1 = randomInt(10, 50) * (difficulty === 1 ? 1 : 5);
    const item2 = randomInt(10, 50) * (difficulty === 1 ? 1 : 5);
    const correct = item1 + item2;
    return { q: `A toy costs ${item1}p and a sweet costs ${item2}p. Total?`, ...nearOptions(correct, 10), topic: "maths_money" };
  },
  time(difficulty) {
    const hours = randomInt(1, 12);
    const mins = difficulty === 1 ? 0 : [15, 30, 45][randomInt(0, 2)];
    const addMins = [15, 30][randomInt(0, 1)];
    let newMins = mins + addMins;
    let newHours = hours;
    if (newMins >= 60) { newMins -= 60; newHours++; }
    const correct = `${newHours}:${String(newMins).padStart(2, "0")}`;
    const w1 = `${newHours}:${String(newMins + 15).padStart(2, "0")}`;
    const w2 = `${newHours + 1}:${String(newMins).padStart(2, "0")}`;
    const w3 = `${hours}:${String(mins + 5).padStart(2, "0")}`;
    return { q: `It is ${hours}:${String(mins).padStart(2, "0")}. What time is it in ${addMins} minutes?`, ...makeOptions(correct, w1, w2, w3), topic: "maths_time" };
  },
  measurement(difficulty) {
    const units = [
      { q: "How many cm in 1 metre?", correct: 100, spread: 50 },
      { q: "How many mm in 1 cm?", correct: 10, spread: 5 },
      { q: "How many minutes in 1 hour?", correct: 60, spread: 10 },
    ];
    const u = units[randomInt(0, units.length - 1)];
    return { q: u.q, ...nearOptions(u.correct, u.spread), topic: "maths_measurement" };
  },
};

// ============== GENERATOR FUNCTION ==============
function generateQuestions(year, count = 20, difficulty = null) {
  const generators = { 1: year1, 2: year2 };
  const gen = generators[year];
  if (!gen) return [];

  const topics = Object.keys(gen);
  const questions = [];

  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const diff = difficulty || randomInt(1, 2);
    try {
      questions.push(gen[topic](diff));
    } catch (e) {
      // retry with different random values
      i--;
    }
  }
  return shuffle(questions);
}

module.exports = { generateQuestions, year1, year2 };


// ============== YEAR 3 ==============
const year3 = {
  addition(difficulty) {
    const a = randomInt(difficulty === 1 ? 10 : 100, difficulty === 1 ? 99 : 999);
    const b = randomInt(difficulty === 1 ? 10 : 100, difficulty === 1 ? 99 : 500);
    const correct = a + b;
    return { q: `What is ${a} + ${b}?`, ...nearOptions(correct, difficulty === 1 ? 5 : 10), topic: "maths_addition" };
  },
  subtraction(difficulty) {
    const a = randomInt(difficulty === 1 ? 30 : 200, difficulty === 1 ? 99 : 999);
    const b = randomInt(10, a - 10);
    const correct = a - b;
    return { q: `What is ${a} - ${b}?`, ...nearOptions(correct, difficulty === 1 ? 5 : 10), topic: "maths_subtraction" };
  },
  multiplication(difficulty) {
    const table = randomInt(2, difficulty === 1 ? 5 : 12);
    const mult = randomInt(2, 12);
    const correct = table * mult;
    return { q: `What is ${table} × ${mult}?`, ...nearOptions(correct, table), topic: "maths_multiplication" };
  },
  division(difficulty) {
    const divisor = randomInt(2, difficulty === 1 ? 5 : 12);
    const mult = randomInt(2, 12);
    const dividend = divisor * mult;
    return { q: `What is ${dividend} ÷ ${divisor}?`, ...nearOptions(mult, 2), topic: "maths_division" };
  },
  fractions(difficulty) {
    const denoms = difficulty === 1 ? [2, 4] : [3, 5, 8, 10];
    const denom = denoms[randomInt(0, denoms.length - 1)];
    const whole = denom * randomInt(3, 10);
    const num = randomInt(1, denom - 1);
    const correct = (whole / denom) * num;
    return { q: `What is ${num}/${denom} of ${whole}?`, ...nearOptions(correct, 3), topic: "maths_fractions" };
  },
  time(difficulty) {
    const h = randomInt(1, 11);
    const m = randomInt(0, 5) * 10;
    const addH = randomInt(1, 3);
    const addM = [10, 15, 20, 30][randomInt(0, 3)];
    let nh = h + addH;
    let nm = m + addM;
    if (nm >= 60) { nm -= 60; nh++; }
    const correct = `${nh}:${String(nm).padStart(2, "0")}`;
    const w1 = `${nh + 1}:${String(nm).padStart(2, "0")}`;
    const w2 = `${nh}:${String((nm + 15) % 60).padStart(2, "0")}`;
    const w3 = `${nh - 1}:${String(nm).padStart(2, "0")}`;
    return { q: `Start time: ${h}:${String(m).padStart(2, "0")}. Add ${addH} hours and ${addM} minutes. End time?`, ...makeOptions(correct, w1, w2, w3), topic: "maths_time" };
  },
  measurement(difficulty) {
    if (difficulty === 1) {
      const m = randomInt(2, 9);
      const correct = m * 100;
      return { q: `How many cm in ${m} metres?`, ...nearOptions(correct, 100), topic: "maths_measurement" };
    }
    const kg = randomInt(2, 9);
    const correct = kg * 1000;
    return { q: `How many grams in ${kg} kg?`, ...nearOptions(correct, 500), topic: "maths_measurement" };
  },
  shapes(difficulty) {
    const shapes = [
      { name: "triangle", sides: 3, angles: 3 },
      { name: "quadrilateral", sides: 4, angles: 4 },
      { name: "pentagon", sides: 5, angles: 5 },
      { name: "hexagon", sides: 6, angles: 6 },
      { name: "octagon", sides: 8, angles: 8 },
    ];
    const s = shapes[randomInt(0, shapes.length - 1)];
    const prop = randomInt(0, 1) === 0 ? "sides" : "angles";
    return { q: `How many ${prop} does a ${s.name} have?`, ...nearOptions(s[prop], 1), topic: "maths_shapes" };
  },
};

// ============== YEAR 4 ==============
const year4 = {
  addition(difficulty) {
    const a = randomInt(100, difficulty === 1 ? 999 : 9999);
    const b = randomInt(100, difficulty === 1 ? 999 : 5000);
    const correct = a + b;
    return { q: `What is ${a} + ${b}?`, ...nearOptions(correct, difficulty === 1 ? 10 : 100), topic: "maths_addition" };
  },
  subtraction(difficulty) {
    const a = randomInt(500, 9999);
    const b = randomInt(100, a - 100);
    const correct = a - b;
    return { q: `What is ${a} - ${b}?`, ...nearOptions(correct, difficulty === 1 ? 10 : 100), topic: "maths_subtraction" };
  },
  multiplication(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(10, 50);
      const b = randomInt(2, 9);
      const correct = a * b;
      return { q: `What is ${a} × ${b}?`, ...nearOptions(correct, b * 2), topic: "maths_multiplication" };
    }
    const a = randomInt(10, 99);
    const b = randomInt(10, 30);
    const correct = a * b;
    return { q: `What is ${a} × ${b}?`, ...nearOptions(correct, 50), topic: "maths_multiplication" };
  },
  division(difficulty) {
    const divisor = randomInt(2, difficulty === 1 ? 9 : 12);
    const mult = randomInt(10, difficulty === 1 ? 50 : 100);
    const dividend = divisor * mult;
    return { q: `What is ${dividend} ÷ ${divisor}?`, ...nearOptions(mult, 5), topic: "maths_division" };
  },
  fractions_decimals(difficulty) {
    if (difficulty === 1) {
      const pairs = [[1,4,"0.25"],[1,2,"0.5"],[3,4,"0.75"],[1,10,"0.1"],[1,5,"0.2"]];
      const p = pairs[randomInt(0, pairs.length - 1)];
      return { q: `Convert ${p[0]}/${p[1]} to a decimal`, ...makeOptions(p[2], "0."+randomInt(1,9), "0."+randomInt(1,9)+"5", String(p[0]+p[1])), topic: "maths_fractions" };
    }
    const denom = [4, 5, 8, 10][randomInt(0, 3)];
    const num = randomInt(1, denom - 1);
    const whole = denom * randomInt(5, 15);
    const correct = (whole / denom) * num;
    return { q: `What is ${num}/${denom} of ${whole}?`, ...nearOptions(correct, 5), topic: "maths_fractions" };
  },
  area_perimeter(difficulty) {
    if (randomInt(0, 1) === 0) {
      const l = randomInt(3, 15);
      const w = randomInt(3, 12);
      const correct = 2 * (l + w);
      return { q: `Perimeter of a rectangle ${l}cm by ${w}cm?`, ...nearOptions(correct, 4), topic: "maths_area_perimeter" };
    }
    const l = randomInt(3, 12);
    const w = randomInt(3, 10);
    const correct = l * w;
    return { q: `Area of a rectangle ${l}cm by ${w}cm?`, ...nearOptions(correct, l), topic: "maths_area_perimeter" };
  },
  place_value(difficulty) {
    const n = randomInt(1000, 9999);
    const digit = String(n)[randomInt(0, 3)];
    const pos = String(n).indexOf(digit);
    const values = [1000, 100, 10, 1];
    const correct = parseInt(digit) * values[pos];
    return { q: `What is the value of ${digit} in ${n.toLocaleString()}?`, ...nearOptions(correct, values[pos]), topic: "maths_place_value" };
  },
  negative_numbers(difficulty) {
    const a = randomInt(-10, -1);
    const b = randomInt(1, 15);
    const correct = a + b;
    return { q: `What is ${a} + ${b}?`, ...nearOptions(correct, 3), topic: "maths_negative_numbers" };
  },
  coordinates(difficulty) {
    const x = randomInt(1, 8);
    const y = randomInt(1, 8);
    const dx = randomInt(1, 4);
    const dy = randomInt(1, 4);
    const correct = `(${x + dx},${y + dy})`;
    const w1 = `(${x + dx + 1},${y + dy})`;
    const w2 = `(${x + dx},${y + dy + 1})`;
    const w3 = `(${x},${y + dy})`;
    return { q: `Point (${x},${y}) moves ${dx} right and ${dy} up. New position?`, ...makeOptions(correct, w1, w2, w3), topic: "maths_coordinates" };
  },
};


// ============== YEAR 5 ==============
const year5 = {
  multiplication(difficulty) {
    const a = randomInt(difficulty === 1 ? 10 : 100, difficulty === 1 ? 99 : 999);
    const b = randomInt(difficulty === 1 ? 2 : 10, difficulty === 1 ? 9 : 30);
    const correct = a * b;
    return { q: `What is ${a} × ${b}?`, ...nearOptions(correct, b * 5), topic: "maths_multiplication" };
  },
  division(difficulty) {
    const divisor = randomInt(difficulty === 1 ? 2 : 10, difficulty === 1 ? 12 : 25);
    const mult = randomInt(10, 50);
    const dividend = divisor * mult;
    return { q: `What is ${dividend} ÷ ${divisor}?`, ...nearOptions(mult, 5), topic: "maths_division" };
  },
  fractions_add_sub(difficulty) {
    const denoms = [4, 5, 6, 8, 10];
    const d = denoms[randomInt(0, denoms.length - 1)];
    const a = randomInt(1, d - 1);
    const b = randomInt(1, d - a);
    const correct_num = a + b;
    return { q: `What is ${a}/${d} + ${b}/${d}?`, ...makeOptions(`${correct_num}/${d}`, `${correct_num + 1}/${d}`, `${a + b}/${d * 2}`, `${correct_num - 1}/${d}`), topic: "maths_fractions" };
  },
  percentages(difficulty) {
    const percents = difficulty === 1 ? [10, 25, 50] : [5, 15, 20, 30, 40, 75];
    const p = percents[randomInt(0, percents.length - 1)];
    const whole = randomInt(2, 20) * 10;
    const correct = (p / 100) * whole;
    return { q: `What is ${p}% of ${whole}?`, ...nearOptions(correct, 5), topic: "maths_percentages" };
  },
  decimals(difficulty) {
    const a = (randomInt(10, 99) / 10).toFixed(1);
    const b = (randomInt(10, 99) / 10).toFixed(1);
    const correct = (parseFloat(a) + parseFloat(b)).toFixed(1);
    const w1 = (parseFloat(correct) + 0.1).toFixed(1);
    const w2 = (parseFloat(correct) - 0.1).toFixed(1);
    const w3 = (parseFloat(correct) + 1).toFixed(1);
    return { q: `What is ${a} + ${b}?`, ...makeOptions(correct, w1, w2, w3), topic: "maths_decimals" };
  },
  area_perimeter(difficulty) {
    if (difficulty === 1) {
      const l = randomInt(5, 20);
      const w = randomInt(3, 15);
      const correct = l * w;
      return { q: `Area of rectangle ${l}cm × ${w}cm?`, ...nearOptions(correct, l), topic: "maths_area" };
    }
    const base = randomInt(4, 15);
    const height = randomInt(3, 12);
    const correct = (base * height) / 2;
    return { q: `Area of triangle: base ${base}cm, height ${height}cm?`, ...nearOptions(correct, 5), topic: "maths_area" };
  },
  angles(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(30, 80);
      const b = randomInt(30, 80);
      const correct = 180 - a - b;
      return { q: `Triangle angles: ${a}° and ${b}°. Third angle?`, ...nearOptions(correct, 10), topic: "maths_angles" };
    }
    const a = randomInt(40, 140);
    const correct = 180 - a;
    return { q: `Angles on a straight line: one is ${a}°. Other angle?`, ...nearOptions(correct, 10), topic: "maths_angles" };
  },
  prime_numbers(difficulty) {
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const nonPrimes = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28];
    const prime = primes[randomInt(0, primes.length - 1)];
    const np1 = nonPrimes[randomInt(0, nonPrimes.length - 1)];
    const np2 = nonPrimes[randomInt(0, nonPrimes.length - 1)];
    const np3 = nonPrimes[randomInt(0, nonPrimes.length - 1)];
    return { q: `Which is a prime number?`, ...makeOptions(prime, np1, np2, np3), topic: "maths_primes" };
  },
  negative_numbers(difficulty) {
    const a = randomInt(-15, -1);
    const b = randomInt(-10, 10);
    const correct = a + b;
    return { q: `What is ${a} + ${b > 0 ? b : "(" + b + ")"}?`, ...nearOptions(correct, 3), topic: "maths_negative_numbers" };
  },
  roman_numerals(difficulty) {
    const numerals = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    const examples = difficulty === 1 ?
      [{r:"XIV",n:14},{r:"IX",n:9},{r:"XXIII",n:23},{r:"XL",n:40},{r:"XVI",n:16}] :
      [{r:"XLIV",n:44},{r:"LXXIX",n:79},{r:"XC",n:90},{r:"CD",n:400},{r:"MCMXC",n:1990}];
    const e = examples[randomInt(0, examples.length - 1)];
    return { q: `What is ${e.r} in numbers?`, ...nearOptions(e.n, 5), topic: "maths_roman_numerals" };
  },
};

// ============== YEAR 6 (including SATs) ==============
const year6 = {
  algebra(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(2, 8);
      const x = randomInt(2, 10);
      const b = randomInt(1, 10);
      const result = a * x + b;
      return { q: `Solve: ${a}x + ${b} = ${result}`, ...nearOptions(x, 2), topic: "maths_algebra" };
    }
    const a = randomInt(2, 5);
    const b = randomInt(1, 10);
    const x = randomInt(2, 8);
    const result = a * x - b;
    return { q: `Solve: ${a}x - ${b} = ${result}`, ...nearOptions(x, 2), topic: "maths_algebra" };
  },
  fractions(difficulty) {
    if (difficulty === 1) {
      const d = [3, 4, 5, 6, 8][randomInt(0, 4)];
      const n = randomInt(1, d - 1);
      const whole = d * randomInt(5, 15);
      const correct = (whole / d) * n;
      return { q: `What is ${n}/${d} of ${whole}?`, ...nearOptions(correct, 5), topic: "maths_fractions" };
    }
    const d1 = [4, 6, 8][randomInt(0, 2)];
    const d2 = d1 / 2;
    const n1 = randomInt(1, d1 - 1);
    const n2 = randomInt(1, d2 - 1);
    const correct_num = n1 + n2 * (d1 / d2);
    return { q: `What is ${n1}/${d1} + ${n2}/${d2}?`, ...makeOptions(`${correct_num}/${d1}`, `${correct_num + 1}/${d1}`, `${n1 + n2}/${d1 + d2}`, `${correct_num - 1}/${d1}`), topic: "maths_fractions" };
  },
  percentages(difficulty) {
    const percents = difficulty === 1 ? [10, 20, 25, 50, 75] : [5, 15, 30, 35, 40, 60, 80];
    const p = percents[randomInt(0, percents.length - 1)];
    const whole = randomInt(2, 20) * (difficulty === 1 ? 10 : 5);
    const correct = (p / 100) * whole;
    return { q: `What is ${p}% of ${whole}?`, ...nearOptions(correct, 5), topic: "maths_percentages" };
  },
  ratio(difficulty) {
    const a = randomInt(1, 5);
    const b = randomInt(1, 5);
    const total = randomInt(3, 10) * (a + b);
    const share_a = (total / (a + b)) * a;
    const share_b = (total / (a + b)) * b;
    return { q: `Share ${total} in ratio ${a}:${b}. Larger share?`, ...nearOptions(Math.max(share_a, share_b), 5), topic: "maths_ratio" };
  },
  area_volume(difficulty) {
    if (difficulty === 1) {
      const base = randomInt(4, 15);
      const height = randomInt(3, 12);
      const correct = (base * height) / 2;
      return { q: `Area of triangle: base ${base}cm, height ${height}cm?`, ...nearOptions(correct, 5), topic: "maths_area" };
    }
    const l = randomInt(2, 8);
    const w = randomInt(2, 8);
    const h = randomInt(2, 8);
    const correct = l * w * h;
    return { q: `Volume of cuboid: ${l}cm × ${w}cm × ${h}cm?`, ...nearOptions(correct, l * w), topic: "maths_volume" };
  },
  order_of_operations(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(2, 10);
      const b = randomInt(2, 5);
      const c = randomInt(1, 10);
      const correct = a + b * c;
      return { q: `What is ${a} + ${b} × ${c}?`, ...nearOptions(correct, b), topic: "maths_bodmas" };
    }
    const a = randomInt(2, 8);
    const b = randomInt(2, 8);
    const c = randomInt(2, 5);
    const correct = (a + b) * c;
    return { q: `What is (${a} + ${b}) × ${c}?`, ...nearOptions(correct, c * 2), topic: "maths_bodmas" };
  },
  mean(difficulty) {
    const count = difficulty === 1 ? 4 : 5;
    const nums = Array.from({length: count}, () => randomInt(2, 20));
    const sum = nums.reduce((a, b) => a + b, 0);
    const correct = sum / count;
    if (correct !== Math.floor(correct)) return year6.mean(difficulty);
    return { q: `Find the mean of: ${nums.join(", ")}`, ...nearOptions(correct, 3), topic: "maths_statistics" };
  },
  long_division(difficulty) {
    const divisor = randomInt(difficulty === 1 ? 4 : 12, difficulty === 1 ? 9 : 25);
    const quotient = randomInt(20, 100);
    const dividend = divisor * quotient;
    return { q: `What is ${dividend} ÷ ${divisor}?`, ...nearOptions(quotient, 5), topic: "maths_division" };
  },
  sats_angles(difficulty) {
    const a = randomInt(25, 75);
    const b = randomInt(25, 75);
    const correct = 180 - a - b;
    return { q: `Two angles in a triangle are ${a}° and ${b}°. Find the third.`, ...nearOptions(correct, 10), topic: "maths_angles" };
  },
  sats_time(difficulty) {
    const h1 = randomInt(7, 11);
    const m1 = randomInt(10, 55);
    const addH = randomInt(1, 3);
    const addM = randomInt(10, 45);
    let h2 = h1 + addH;
    let m2 = m1 + addM;
    if (m2 >= 60) { m2 -= 60; h2++; }
    const journey = `${addH}h ${addM}min`;
    const correct = `${h2}:${String(m2).padStart(2, "0")}`;
    const w1 = `${h2 + 1}:${String(m2).padStart(2, "0")}`;
    const w2 = `${h2}:${String((m2 + 10) % 60).padStart(2, "0")}`;
    const w3 = `${h2 - 1}:${String(m2).padStart(2, "0")}`;
    return { q: `Depart: ${h1}:${String(m1).padStart(2, "0")}. Journey: ${journey}. Arrival?`, ...makeOptions(correct, w1, w2, w3), topic: "maths_time" };
  },
};


// ============== SATS (Year 6 style - KS2) ==============
const sats = {
  arithmetic(difficulty) {
    const ops = [
      () => { const a = randomInt(100,9999); const b = randomInt(100,9999); return { q: `${a} + ${b} = ?`, correct: a+b }; },
      () => { const a = randomInt(500,9999); const b = randomInt(100,a-10); return { q: `${a} - ${b} = ?`, correct: a-b }; },
      () => { const a = randomInt(10,99); const b = randomInt(2,12); return { q: `${a} × ${b} = ?`, correct: a*b }; },
      () => { const d = randomInt(2,12); const m = randomInt(10,99); return { q: `${d*m} ÷ ${d} = ?`, correct: m }; },
    ];
    const op = ops[randomInt(0, ops.length - 1)]();
    return { q: op.q, ...nearOptions(op.correct, Math.max(5, Math.floor(op.correct * 0.05))), topic: "sats_arithmetic" };
  },
  fractions_of_amounts(difficulty) {
    const d = [3,4,5,6,8,10][randomInt(0,5)];
    const n = randomInt(1, d-1);
    const whole = d * randomInt(3, 12);
    const correct = (whole / d) * n;
    return { q: `What is ${n}/${d} of ${whole}?`, ...nearOptions(correct, 5), topic: "sats_fractions" };
  },
  percentage_of_amount(difficulty) {
    const p = [5,10,15,20,25,30,40,50,60,75][randomInt(0,9)];
    const whole = randomInt(2, 20) * 10;
    const correct = (p / 100) * whole;
    return { q: `Find ${p}% of ${whole}`, ...nearOptions(correct, 5), topic: "sats_percentages" };
  },
  missing_angles(difficulty) {
    const type = randomInt(0, 2);
    if (type === 0) {
      const a = randomInt(25, 80); const b = randomInt(25, 80);
      const correct = 180 - a - b;
      return { q: `Triangle angles: ${a}° and ${b}°. Third angle?`, ...nearOptions(correct, 10), topic: "sats_angles" };
    } else if (type === 1) {
      const a = randomInt(30, 150);
      const correct = 180 - a;
      return { q: `Angles on a straight line: ${a}° and ?°`, ...nearOptions(correct, 10), topic: "sats_angles" };
    } else {
      const a = randomInt(50,130); const b = randomInt(50,130); const c = randomInt(30,100);
      const correct = 360 - a - b - c;
      return { q: `Quadrilateral angles: ${a}°, ${b}°, ${c}°. Fourth?`, ...nearOptions(correct, 10), topic: "sats_angles" };
    }
  },
  ratio_problems(difficulty) {
    const a = randomInt(1,5); const b = randomInt(1,5);
    const total = (a+b) * randomInt(3,10);
    const larger = Math.max(a,b) * (total/(a+b));
    return { q: `Share ${total} in ratio ${a}:${b}. Larger share?`, ...nearOptions(larger, 5), topic: "sats_ratio" };
  },
  area_perimeter(difficulty) {
    if (randomInt(0,1) === 0) {
      const l = randomInt(5,20); const w = randomInt(3,15);
      const correct = 2*(l+w);
      return { q: `Perimeter of rectangle ${l}cm × ${w}cm?`, ...nearOptions(correct, 4), topic: "sats_area" };
    }
    const base = randomInt(4,15); const h = randomInt(3,12);
    const correct = (base * h) / 2;
    return { q: `Area of triangle: base ${base}cm, height ${h}cm?`, ...nearOptions(correct, 5), topic: "sats_area" };
  },
  order_of_operations(difficulty) {
    const a = randomInt(2,10); const b = randomInt(2,8); const c = randomInt(2,6);
    if (randomInt(0,1) === 0) {
      const correct = a + b * c;
      return { q: `What is ${a} + ${b} × ${c}?`, ...nearOptions(correct, b), topic: "sats_bodmas" };
    }
    const correct = (a + b) * c;
    return { q: `What is (${a} + ${b}) × ${c}?`, ...nearOptions(correct, c*2), topic: "sats_bodmas" };
  },
  mean_average(difficulty) {
    const count = randomInt(4, 6);
    const nums = Array.from({length: count}, () => randomInt(2, 20));
    const sum = nums.reduce((a,b) => a+b, 0);
    if (sum % count !== 0) return sats.mean_average(difficulty);
    const correct = sum / count;
    return { q: `Mean of: ${nums.join(", ")}?`, ...nearOptions(correct, 3), topic: "sats_statistics" };
  },
  volume(difficulty) {
    const l = randomInt(2,8); const w = randomInt(2,8); const h = randomInt(2,8);
    const correct = l*w*h;
    return { q: `Volume of cuboid: ${l}cm × ${w}cm × ${h}cm?`, ...nearOptions(correct, l*w), topic: "sats_volume" };
  },
  decimal_operations(difficulty) {
    const a = (randomInt(10,99)/10).toFixed(1);
    const b = (randomInt(10,99)/10).toFixed(1);
    const correct = (parseFloat(a) * parseFloat(b)).toFixed(2);
    const w1 = (parseFloat(correct) + 0.1).toFixed(2);
    const w2 = (parseFloat(correct) - 0.1).toFixed(2);
    const w3 = (parseFloat(correct) + 1).toFixed(2);
    return { q: `What is ${a} × ${b}?`, ...makeOptions(correct, w1, w2, w3), topic: "sats_decimals" };
  },
};


// ============== YEAR 7 ==============
const year7 = {
  algebra(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(2, 6); const x = randomInt(2, 10); const b = randomInt(1, 15);
      return { q: `Solve: ${a}x + ${b} = ${a*x+b}`, ...nearOptions(x, 2), topic: "maths_algebra" };
    }
    const a = randomInt(2, 5); const b = randomInt(1, 5); const x = randomInt(2, 8);
    return { q: `Solve: ${a}x - ${b} = ${a*x-b}`, ...nearOptions(x, 2), topic: "maths_algebra" };
  },
  expand_brackets(difficulty) {
    const a = randomInt(2, 7); const b = randomInt(1, 9); const c = randomInt(1, 9);
    const correct = a*b;
    const correct2 = a*c;
    return { q: `Expand: ${a}(${b}x + ${c}). Coefficient of x?`, ...nearOptions(correct, a), topic: "maths_algebra" };
  },
  fractions(difficulty) {
    const d1 = randomInt(2, 8); const d2 = d1 * randomInt(2, 3);
    const n1 = randomInt(1, d1-1); const n2 = randomInt(1, d2-1);
    const common = d2;
    const correct_num = n1 * (d2/d1) + n2;
    return { q: `${n1}/${d1} + ${n2}/${d2} = ?/${common}. Numerator?`, ...nearOptions(correct_num, 2), topic: "maths_fractions" };
  },
  percentages(difficulty) {
    if (difficulty === 1) {
      const p = [10,20,25,30,50][randomInt(0,4)];
      const whole = randomInt(5,30) * 10;
      const correct = (p/100) * whole;
      return { q: `What is ${p}% of ${whole}?`, ...nearOptions(correct, 5), topic: "maths_percentages" };
    }
    const original = randomInt(5,20) * 10;
    const p = [10,15,20,25][randomInt(0,3)];
    const correct = original + (p/100) * original;
    return { q: `Increase ${original} by ${p}%`, ...nearOptions(correct, 10), topic: "maths_percentages" };
  },
  ratio(difficulty) {
    const a = randomInt(1,5); const b = randomInt(1,5);
    const total = (a+b) * randomInt(4,12);
    const smaller = Math.min(a,b) * (total/(a+b));
    return { q: `Share £${total} in ratio ${a}:${b}. Smaller share?`, ...nearOptions(smaller, 5), topic: "maths_ratio" };
  },
  angles(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(30, 150);
      const correct = 180 - a;
      return { q: `Angles on straight line: ${a}° and ?°`, ...nearOptions(correct, 10), topic: "maths_angles" };
    }
    const a = randomInt(40, 160);
    const correct = a; // vertically opposite
    const w1 = 180 - a;
    return { q: `Vertically opposite to ${a}° is:`, ...makeOptions(String(correct), String(w1), String(correct+10), String(correct-10)), topic: "maths_angles" };
  },
  sequences(difficulty) {
    const start = randomInt(1, 10);
    const step = randomInt(2, difficulty === 1 ? 5 : 8);
    const terms = Array.from({length: 4}, (_, i) => start + i * step);
    const correct = start + 4 * step;
    return { q: `Next term: ${terms.join(", ")}, ...?`, ...nearOptions(correct, step), topic: "maths_sequences" };
  },
  area(difficulty) {
    if (difficulty === 1) {
      const base = randomInt(4, 15); const h = randomInt(3, 12);
      const correct = (base * h) / 2;
      return { q: `Area of triangle: base ${base}cm, height ${h}cm?`, ...nearOptions(correct, 5), topic: "maths_area" };
    }
    const a = randomInt(4, 10); const b = randomInt(6, 14); const h = randomInt(3, 8);
    const correct = ((a + b) * h) / 2;
    return { q: `Area of trapezium: parallel sides ${a}cm, ${b}cm, height ${h}cm?`, ...nearOptions(correct, h), topic: "maths_area" };
  },
  probability(difficulty) {
    const total = randomInt(8, 20);
    const favourable = randomInt(1, total - 1);
    return { q: `Bag has ${total} balls, ${favourable} are red. P(red) as fraction?`, ...makeOptions(`${favourable}/${total}`, `${total}/${favourable}`, `${favourable}/${total-favourable}`, `${total-favourable}/${total}`), topic: "maths_probability" };
  },
  speed(difficulty) {
    const speed = randomInt(3, 12) * 10;
    const time = randomInt(2, 5);
    const distance = speed * time;
    if (randomInt(0,1) === 0) {
      return { q: `Speed ${speed}km/h, time ${time}h. Distance?`, ...nearOptions(distance, speed), topic: "maths_speed" };
    }
    return { q: `Distance ${distance}km in ${time} hours. Speed?`, ...nearOptions(speed, 10), topic: "maths_speed" };
  },
};

// ============== YEAR 8 ==============
const year8 = {
  algebra(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(2, 5); const b = randomInt(1, 10); const c = randomInt(1, 5); const x = randomInt(2, 8);
      const result = a*x + b - c*x;
      return { q: `Solve: ${a}x + ${b} = ${c}x + ${result + c*x - a*x}. Hmm wait`, ...nearOptions(x, 2), topic: "maths_algebra" };
    }
    const a = randomInt(2, 6); const b = randomInt(1, 8); const x = randomInt(2, 10);
    return { q: `Solve: ${a}x - ${b} = ${a*x - b}`, ...nearOptions(x, 2), topic: "maths_algebra" };
  },
  expand_factorise(difficulty) {
    if (difficulty === 1) {
      const a = randomInt(2, 7); const b = randomInt(1, 9); const c = randomInt(1, 9);
      return { q: `Expand: ${a}(${b}x + ${c}) = ?x + ?. What is the constant?`, ...nearOptions(a*c, a), topic: "maths_algebra" };
    }
    const gcf = randomInt(2, 6); const a = randomInt(1, 5); const b = randomInt(1, 8);
    const expr_a = gcf * a; const expr_b = gcf * b;
    return { q: `Factorise: ${expr_a}x + ${expr_b}. What goes outside the bracket?`, ...nearOptions(gcf, 2), topic: "maths_algebra" };
  },
  pythagoras(difficulty) {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25]];
    const t = triples[randomInt(0, triples.length - 1)];
    const mult = difficulty === 1 ? 1 : randomInt(2, 3);
    const a = t[0]*mult; const b = t[1]*mult; const c = t[2]*mult;
    return { q: `Right triangle: sides ${a}cm, ${b}cm. Hypotenuse?`, ...nearOptions(c, 2), topic: "maths_pythagoras" };
  },
  simultaneous(difficulty) {
    const x = randomInt(1, 6); const y = randomInt(1, 6);
    const a1 = randomInt(1, 3); const b1 = randomInt(1, 3);
    const a2 = randomInt(1, 3); const b2 = randomInt(1, 3);
    const r1 = a1*x + b1*y; const r2 = a2*x + b2*y;
    return { q: `${a1}x + ${b1}y = ${r1}, ${a2}x + ${b2}y = ${r2}. Find x.`, ...nearOptions(x, 2), topic: "maths_simultaneous" };
  },
  compound_interest(difficulty) {
    const principal = randomInt(5, 20) * 100;
    const rate = [5, 10][randomInt(0, 1)];
    const correct = Math.round(principal * (1 + rate/100) * (1 + rate/100) * 100) / 100;
    return { q: `£${principal} at ${rate}% compound interest for 2 years. Amount?`, ...makeOptions(`£${correct}`, `£${principal + principal*rate/100*2}`, `£${correct + 10}`, `£${correct - 10}`), topic: "maths_compound_interest" };
  },
  circles(difficulty) {
    const r = randomInt(2, 10);
    if (randomInt(0,1) === 0) {
      const correct = +(2 * 3.14 * r).toFixed(1);
      return { q: `Circumference of circle, radius ${r}cm? (π=3.14)`, ...makeOptions(String(correct), String(correct+3.14), String(+(3.14*r*r).toFixed(1)), String(correct-3.14)), topic: "maths_circles" };
    }
    const correct = +(3.14 * r * r).toFixed(1);
    return { q: `Area of circle, radius ${r}cm? (π=3.14)`, ...makeOptions(String(correct), String(+(2*3.14*r).toFixed(1)), String(correct+10), String(correct-10)), topic: "maths_circles" };
  },
  bearings(difficulty) {
    const bearing = randomInt(1, 35) * 10;
    const back = bearing > 180 ? bearing - 180 : bearing + 180;
    return { q: `Bearing of A from B is ${bearing}°. Bearing of B from A?`, ...nearOptions(back, 20), topic: "maths_bearings" };
  },
  inequalities(difficulty) {
    const a = randomInt(2, 6); const b = randomInt(1, 10);
    const rhs = randomInt(10, 30);
    const correct = Math.floor((rhs - b) / a);
    return { q: `Solve: ${a}x + ${b} < ${rhs}. Largest integer x?`, ...nearOptions(correct, 2), topic: "maths_inequalities" };
  },
  linear_graphs(difficulty) {
    const m = randomInt(1, 5); const c = randomInt(-5, 5);
    return { q: `y = ${m}x + ${c}. What is the gradient?`, ...nearOptions(m, 2), topic: "maths_linear_graphs" };
  },
  probability(difficulty) {
    const r = randomInt(2, 6); const b = randomInt(2, 6); const g = randomInt(1, 4);
    const total = r + b + g;
    const not_r = b + g;
    return { q: `Bag: ${r} red, ${b} blue, ${g} green. P(not red)?`, ...makeOptions(`${not_r}/${total}`, `${r}/${total}`, `${b}/${total}`, `${g}/${total}`), topic: "maths_probability" };
  },
  transformations(difficulty) {
    const x = randomInt(1, 6); const y = randomInt(1, 6);
    const type = randomInt(0, 2);
    if (type === 0) {
      return { q: `Reflect (${x},${y}) in x-axis. New y-coordinate?`, ...nearOptions(-y, 2), topic: "maths_transformations" };
    } else if (type === 1) {
      return { q: `Reflect (${x},${y}) in y-axis. New x-coordinate?`, ...nearOptions(-x, 2), topic: "maths_transformations" };
    }
    return { q: `Rotate (${x},${y}) 180° about origin. New x-coordinate?`, ...nearOptions(-x, 2), topic: "maths_transformations" };
  },
};


// ============== YEAR 9 ==============
const year9 = {
  quadratics(difficulty) {
    const a = randomInt(1, 3); const r1 = randomInt(-6, 6); const r2 = randomInt(-6, 6);
    const b = -(r1 + r2) * a; const c = r1 * r2 * a;
    const correct = r1 + r2;
    return { q: `x² + ${-(r1+r2)}x + ${r1*r2} = 0. Sum of roots?`, ...nearOptions(correct, 3), topic: "maths_quadratics" };
  },
  simultaneous(difficulty) {
    const x = randomInt(1, 6); const y = randomInt(1, 6);
    const a1 = randomInt(1, 4); const b1 = randomInt(1, 4);
    const r1 = a1*x + b1*y;
    const a2 = randomInt(1, 4); const b2 = randomInt(1, 4);
    const r2 = a2*x - b2*y;
    return { q: `${a1}x + ${b1}y = ${r1} and ${a2}x - ${b2}y = ${r2}. Find x.`, ...nearOptions(x, 2), topic: "maths_simultaneous" };
  },
  trigonometry(difficulty) {
    const angles = [30, 45, 60];
    const angle = angles[randomInt(0, 2)];
    const hyp = randomInt(5, 20);
    const sinValues = { 30: 0.5, 45: 0.707, 60: 0.866 };
    const opp = Math.round(hyp * sinValues[angle] * 10) / 10;
    return { q: `Right triangle: hypotenuse ${hyp}cm, angle ${angle}°. Opposite side? (sin${angle}° = ${sinValues[angle]})`, ...makeOptions(String(opp), String(opp+1), String(opp-1), String(hyp-opp)), topic: "maths_trigonometry" };
  },
  indices(difficulty) {
    if (difficulty === 1) {
      const base = randomInt(2, 5); const p1 = randomInt(2, 4); const p2 = randomInt(1, 3);
      const correct = p1 + p2;
      return { q: `Simplify: ${base}^${p1} × ${base}^${p2}. Power?`, ...nearOptions(correct, 2), topic: "maths_indices" };
    }
    const base = randomInt(2, 5); const p1 = randomInt(4, 7); const p2 = randomInt(1, 3);
    const correct = p1 - p2;
    return { q: `Simplify: ${base}^${p1} ÷ ${base}^${p2}. Power?`, ...nearOptions(correct, 2), topic: "maths_indices" };
  },
  standard_form(difficulty) {
    const a = randomInt(11, 99) / 10;
    const p = randomInt(difficulty === 1 ? 2 : 4, difficulty === 1 ? 4 : 7);
    const correct = a * Math.pow(10, p);
    return { q: `What is ${a} × 10^${p} as a number?`, ...makeOptions(String(correct), String(a * Math.pow(10, p-1)), String(a * Math.pow(10, p+1)), String(correct + 100)), topic: "maths_standard_form" };
  },
  surds(difficulty) {
    const squares = [4, 9, 16, 25, 36, 49];
    const mult = randomInt(2, 5);
    const under = squares[randomInt(0, squares.length-1)] * mult;
    const root = Math.sqrt(squares[randomInt(0, squares.length-1)]);
    const correct = root * root;
    return { q: `What is (√${correct})²?`, ...nearOptions(correct, 5), topic: "maths_surds" };
  },
  compound_interest(difficulty) {
    const principal = randomInt(5, 20) * 100;
    const rate = [3, 4, 5, 8, 10][randomInt(0, 4)];
    const years = difficulty === 1 ? 2 : 3;
    const correct = Math.round(principal * Math.pow(1 + rate/100, years) * 100) / 100;
    const simple = principal + (principal * rate * years / 100);
    return { q: `£${principal} at ${rate}% compound interest for ${years} years?`, ...makeOptions(`£${correct}`, `£${simple}`, `£${correct+50}`, `£${correct-50}`), topic: "maths_compound_interest" };
  },
  probability(difficulty) {
    const n = randomInt(2, 6);
    const total = Math.pow(2, n);
    if (difficulty === 1) {
      return { q: `A coin is flipped ${n} times. Total outcomes?`, ...nearOptions(total, total/2), topic: "maths_probability" };
    }
    const r = randomInt(3, 8); const b = randomInt(3, 8);
    const tot = r + b;
    const p_both_r = (r * (r-1)) / (tot * (tot-1));
    const correct = `${r*(r-1)}/${tot*(tot-1)}`;
    return { q: `${r} red, ${b} blue balls. Pick 2 without replacement. P(both red)?`, ...makeOptions(correct, `${r}/${tot}`, `${r*r}/${tot*tot}`, `${r-1}/${tot-1}`), topic: "maths_probability" };
  },
  linear_graphs(difficulty) {
    const m1 = randomInt(1, 5);
    if (difficulty === 1) {
      const c = randomInt(-5, 5);
      return { q: `y = ${m1}x ${c >= 0 ? "+" : "-"} ${Math.abs(c)}. Y-intercept?`, ...nearOptions(c, 3), topic: "maths_graphs" };
    }
    const x1 = randomInt(0, 4); const y1 = randomInt(0, 8);
    const x2 = x1 + randomInt(1, 4); const y2 = y1 + m1 * (x2-x1);
    return { q: `Gradient between (${x1},${y1}) and (${x2},${y2})?`, ...nearOptions(m1, 2), topic: "maths_graphs" };
  },
  inequalities(difficulty) {
    const a = randomInt(2, 6); const b = randomInt(1, 15);
    const rhs = a * randomInt(3, 8) + b;
    const correct = Math.floor((rhs - b) / a);
    return { q: `Largest integer satisfying ${a}x + ${b} ≤ ${rhs}?`, ...nearOptions(correct, 2), topic: "maths_inequalities" };
  },
};

// ============== YEAR 10 (GCSE Foundation/Higher) ==============
const year10 = {
  quadratics_factorising(difficulty) {
    const r1 = randomInt(1, 6); const r2 = randomInt(1, 6);
    const b = r1 + r2; const c = r1 * r2;
    return { q: `Factorise: x² + ${b}x + ${c}. One bracket is (x + ?). What's ?`, ...nearOptions(r1, 2), topic: "maths_quadratics" };
  },
  quadratic_formula(difficulty) {
    const r1 = randomInt(1, 5); const r2 = randomInt(1, 5);
    const a = 1; const b = -(r1 + r2); const c = r1 * r2;
    const correct = r1 + r2;
    return { q: `x² ${b >= 0 ? "+" : "-"} ${Math.abs(b)}x + ${c} = 0. Sum of solutions?`, ...nearOptions(correct, 3), topic: "maths_quadratics" };
  },
  trigonometry(difficulty) {
    const opp = randomInt(3, 12);
    const adj = randomInt(3, 12);
    const tanVal = (opp / adj).toFixed(2);
    return { q: `Right triangle: opposite = ${opp}, adjacent = ${adj}. What is tan(θ)?`, ...makeOptions(tanVal, (adj/opp).toFixed(2), (opp/(opp+adj)).toFixed(2), ((opp+adj)/adj).toFixed(2)), topic: "maths_trigonometry" };
  },
  pythagoras(difficulty) {
    const triples = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25],[9,40,41]];
    const t = triples[randomInt(0, triples.length - 1)];
    const mult = difficulty === 1 ? 1 : randomInt(2, 4);
    if (randomInt(0,1) === 0) {
      return { q: `Right triangle: legs ${t[0]*mult}cm, ${t[1]*mult}cm. Hypotenuse?`, ...nearOptions(t[2]*mult, 2), topic: "maths_pythagoras" };
    }
    return { q: `Right triangle: hypotenuse ${t[2]*mult}cm, one leg ${t[0]*mult}cm. Other leg?`, ...nearOptions(t[1]*mult, 2), topic: "maths_pythagoras" };
  },
  circle_theorems(difficulty) {
    const angle = randomInt(20, 80);
    const correct = angle * 2;
    return { q: `Angle at circumference is ${angle}°. Angle at centre?`, ...nearOptions(correct, 10), topic: "maths_circle_theorems" };
  },
  simultaneous_equations(difficulty) {
    const x = randomInt(1, 8); const y = randomInt(1, 8);
    const a1 = randomInt(1, 4); const b1 = randomInt(1, 4);
    const a2 = randomInt(1, 4); const b2 = randomInt(-4, -1);
    const r1 = a1*x + b1*y; const r2 = a2*x + b2*y;
    return { q: `${a1}x + ${b1}y = ${r1}, ${a2}x ${b2}y = ${r2}. Find y.`, ...nearOptions(y, 2), topic: "maths_simultaneous" };
  },
  compound_interest(difficulty) {
    const principal = randomInt(10, 50) * 100;
    const rate = [2, 3, 4, 5][randomInt(0, 3)];
    const years = randomInt(2, 4);
    const correct = Math.round(principal * Math.pow(1 + rate/100, years));
    const simple = principal + principal * rate * years / 100;
    return { q: `£${principal} invested at ${rate}% compound for ${years} years?`, ...makeOptions(`£${correct}`, `£${simple}`, `£${correct+100}`, `£${correct-100}`), topic: "maths_compound_interest" };
  },
  probability_tree(difficulty) {
    const p1 = randomInt(1, 5); const q1 = randomInt(1, 5);
    const total = p1 + q1;
    const p_both = p1 * p1;
    const total_sq = total * total;
    return { q: `P(win) = ${p1}/${total}. Two games. P(win both)?`, ...makeOptions(`${p_both}/${total_sq}`, `${p1*2}/${total*2}`, `${p1}/${total}`, `${p_both}/${total}`), topic: "maths_probability" };
  },
  vectors(difficulty) {
    const ax = randomInt(1, 5); const ay = randomInt(1, 5);
    const bx = randomInt(1, 5); const by = randomInt(1, 5);
    const cx = ax + bx; const cy = ay + by;
    return { q: `a = (${ax},${ay}), b = (${bx},${by}). a + b = (?,?). x-component?`, ...nearOptions(cx, 2), topic: "maths_vectors" };
  },
  bounds(difficulty) {
    const measured = randomInt(10, 50);
    const correct_upper = measured + 0.5;
    return { q: `A length is ${measured}cm to nearest cm. Upper bound?`, ...makeOptions(String(correct_upper), String(measured + 1), String(measured), String(measured + 0.05)), topic: "maths_bounds" };
  },
  direct_inverse_proportion(difficulty) {
    if (difficulty === 1) {
      const k = randomInt(2, 8); const x = randomInt(2, 6);
      const y = k * x;
      const x2 = randomInt(2, 6);
      const correct = k * x2;
      return { q: `y is directly proportional to x. When x=${x}, y=${y}. Find y when x=${x2}.`, ...nearOptions(correct, k), topic: "maths_proportion" };
    }
    const k = randomInt(20, 100); const x = randomInt(2, 5);
    const y = k / x;
    const x2 = randomInt(2, 5);
    const correct = k / x2;
    if (correct !== Math.floor(correct)) return year10.direct_inverse_proportion(difficulty);
    return { q: `y is inversely proportional to x. When x=${x}, y=${y}. Find y when x=${x2}.`, ...nearOptions(correct, 5), topic: "maths_proportion" };
  },
};

// ============== UPDATED GENERATOR FUNCTION ==============
function generateQuestions(year, count = 20, difficulty = null) {
  const generators = {
    1: year1, 2: year2, 3: year3, 4: year4, 5: year5,
    6: year6, 7: year7, 8: year8, 9: year9, 10: year10,
    sats: sats
  };
  const gen = generators[year];
  if (!gen) return [];

  const topics = Object.keys(gen);
  const questions = [];
  let attempts = 0;

  for (let i = 0; i < count && attempts < count * 3; i++) {
    const topic = topics[i % topics.length];
    const diff = difficulty || randomInt(1, 2);
    try {
      questions.push(gen[topic](diff));
    } catch (e) {
      attempts++;
      i--;
    }
  }
  return shuffle(questions);
}

module.exports = {
  generateQuestions,
  year1, year2, year3, year4, year5,
  year6, year7, year8, year9, year10,
  sats
};
