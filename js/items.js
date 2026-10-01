// Item generators: each turns a skill into one practice question.
// An item is { key, say, prompt, html, input: 'choice' | 'keypad', choices, answer, choiceStyle }.
// `say` is spoken aloud; reading items never speak the words the child must read.
window.KT = window.KT || {};

KT.items = (function () {
  const OBJECTS = ['🍎', '🐟', '⭐', '🚗', '🐞', '🍓', '⚽', '🦆', '🧁', '🌸'];

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };

  // Three distinct number choices including the answer, kept inside [min, max].
  function numberChoices(ans, spread, min, max) {
    const set = new Set([ans]);
    let guard = 0;
    while (set.size < 3 && guard++ < 50) {
      const n = ans + rnd(-spread, spread);
      if (n >= min && n <= max) set.add(n);
    }
    return shuffle([...set].map(String));
  }

  function objects(emoji, n, faded) {
    let html = '<div class="objects">';
    for (let i = 0; i < n; i++) {
      const cls = faded && i >= n - faded ? 'obj gone' : 'obj';
      html += `<span class="${cls}">${emoji}</span>`;
      if (i % 5 === 4 && i < n - 1) html += '<span class="gap"></span>';
    }
    return html + '</div>';
  }

  function vertical(a, op, b) {
    return `<div class="vert"><div>${a}</div><div><span class="op">${op}</span>${b}</div><div class="rule"></div></div>`;
  }

  const gens = {
    firstSound(p) {
      const list = KT.firstSounds[p.kind];
      const [letter, word, emoji] = pick(list);
      const others = shuffle(list.filter(x => x[0] !== letter)).slice(0, 2).map(x => x[0]);
      return {
        key: word, say: `Which letter does ${word} start with?`, prompt: 'Which letter does it start with?',
        html: `<div class="picture">${emoji}</div><div class="caption">${word}</div>`,
        input: 'choice', choices: shuffle([letter, ...others]), answer: letter, choiceStyle: 'word'
      };
    },

    wordPick(p) {
      const pool = [].concat(...p.sets.map(s => KT.words[s]));
      const target = pick(pool);
      // Prefer distractors that look like the target, so the child has to decode every letter.
      const score = w => (w.length === target.length ? 1 : 0) + [...w].filter((ch, i) => target[i] === ch).length;
      const near = shuffle(pool.filter(w => w !== target)).sort((a, b) => score(b) - score(a)).slice(0, 6);
      const distractors = shuffle(near).slice(0, 2);
      return {
        key: target, say: `Tap the word: ${target}.`, prompt: 'Listen, then tap the word.',
        html: '<div class="listen">🔊</div>',
        input: 'choice', choices: shuffle([target, ...distractors]), answer: target, choiceStyle: 'word'
      };
    },

    passage(p) {
      const it = pick(KT.passages[p.set]);
      return {
        key: it.q, say: it.q, prompt: it.q,
        html: `<div class="passage">${it.text}</div>`,
        input: 'choice', choices: shuffle([it.a, ...it.d]), answer: it.a, choiceStyle: 'phrase'
      };
    },

    countObjects(p) {
      const n = rnd(p.min, p.max), e = pick(OBJECTS);
      return {
        key: 'c' + n, say: 'How many?', prompt: 'How many?', html: objects(e, n),
        input: 'choice', choices: numberChoices(n, 2, 0, p.max + 2), answer: String(n), choiceStyle: 'big'
      };
    },

    numeralPick(p) {
      const n = rnd(0, p.max);
      const set = new Set([n]);
      const rev = Number(String(n).split('').reverse().join(''));
      if (n > 9 && rev !== n && rev <= p.max) set.add(rev);
      while (set.size < 3) set.add(rnd(0, p.max));
      return {
        key: 'n' + n, say: `Tap the number ${n}.`, prompt: 'Listen, then tap the number.', html: '<div class="listen">🔊</div>',
        input: 'choice', choices: shuffle([...set].map(String)), answer: String(n), choiceStyle: 'big'
      };
    },

    compare(p) {
      const a = rnd(0, p.max);
      let b = rnd(0, p.max);
      while (b === a) b = rnd(0, p.max);
      const bigger = Math.random() < 0.7;
      const ans = bigger ? Math.max(a, b) : Math.min(a, b);
      const word = bigger ? 'bigger' : 'smaller';
      return {
        key: `${a}${word}${b}`, say: `Which number is ${word}?`, prompt: `Which number is ${word}?`, html: '',
        input: 'choice', choices: [String(a), String(b)], answer: String(ans), choiceStyle: 'big'
      };
    },

    addPics(p) {
      const a = rnd(1, p.max - 1), b = rnd(1, p.max - a), e = pick(OBJECTS);
      return {
        key: `${a}+${b}`, say: `${a} plus ${b}. How many in all?`, prompt: `${a} + ${b} = ?`,
        html: `<div class="sum">${objects(e, a)}<span class="plus">+</span>${objects(e, b)}</div>`,
        input: 'choice', choices: numberChoices(a + b, 2, 0, p.max + 2), answer: String(a + b), choiceStyle: 'big'
      };
    },

    subPics(p) {
      const n = rnd(2, p.max), b = rnd(1, n), e = pick(OBJECTS);
      return {
        key: `${n}-${b}`, say: `${n} take away ${b}. How many are left?`, prompt: `${n} − ${b} = ?`,
        html: objects(e, n, b),
        input: 'choice', choices: numberChoices(n - b, 2, 0, p.max), answer: String(n - b), choiceStyle: 'big'
      };
    },

    addFacts(p) {
      let a, b;
      do { a = rnd(0, p.max); b = rnd(0, p.max - a); } while (p.max > 10 && a + b <= 10 && Math.random() < 0.7);
      return { key: `${a}+${b}`, say: `${a} plus ${b}`, prompt: '', html: `<div class="equation">${a} + ${b} = ?</div>`, input: 'keypad', answer: String(a + b) };
    },

    subFacts(p) {
      let a, b;
      do { a = rnd(1, p.max); b = rnd(0, a); } while (p.max > 10 && a <= 10 && Math.random() < 0.7);
      return { key: `${a}-${b}`, say: `${a} minus ${b}`, prompt: '', html: `<div class="equation">${a} − ${b} = ?</div>`, input: 'keypad', answer: String(a - b) };
    },

    bonds(p) {
      const a = rnd(0, p.total);
      let frame = '<div class="tenframe">';
      for (let i = 0; i < p.total; i++) frame += `<span class="${i < a ? 'dot on' : 'dot'}"></span>`;
      frame += '</div>';
      return {
        key: 'b' + a, say: `${a} and what make ${p.total}?`, prompt: `${a} + ? = ${p.total}`, html: frame,
        input: 'keypad', answer: String(p.total - a)
      };
    },

    beforeAfter(p) {
      const n = rnd(2, p.max - 2);
      const after = Math.random() < 0.6;
      const word = after ? 'after' : 'before';
      return {
        key: word + n, say: `What number comes ${word} ${n}?`, prompt: `What comes ${word}?`,
        html: `<div class="equation">${after ? `${n}, ?` : `?, ${n}`}</div>`, input: 'keypad', answer: String(after ? n + 1 : n - 1)
      };
    },

    placeTens() {
      const n = rnd(11, 99), t = Math.floor(n / 10), o = n % 10;
      let blocks = '<div class="blocks">';
      for (let i = 0; i < t; i++) blocks += '<span class="ten"></span>';
      for (let i = 0; i < o; i++) blocks += '<span class="one"></span>';
      blocks += '</div>';
      const v = rnd(0, 2);
      if (v === 0) return { key: 'pt' + n, say: `How many tens are in ${n}?`, prompt: `How many tens in ${n}?`, html: '', input: 'keypad', answer: String(t) };
      if (v === 1) return { key: 'pw' + n, say: 'What number is this? Each long block is ten.', prompt: 'What number is this?', html: blocks, input: 'keypad', answer: String(n) };
      return { key: 'pc' + n, say: `What number has ${t} tens and ${o} ones?`, prompt: `${t} tens and ${o} ones`, html: '', input: 'keypad', answer: String(n) };
    },

    placeHundreds() {
      let digits;
      do { digits = [rnd(1, 9), rnd(1, 9), rnd(1, 9)]; } while (new Set(digits).size < 3);
      const n = digits.join(''), pos = rnd(0, 2), d = digits[pos];
      const value = d * [100, 10, 1][pos];
      return {
        key: n + pos, say: `What is the value of the ${d} in ${n}?`, prompt: `What is the ${d} worth in ${n}?`,
        html: `<div class="equation">${n}</div>`, input: 'choice', choices: [String(d), String(d * 10), String(d * 100)], answer: String(value), choiceStyle: 'big'
      };
    },

    skipCount() {
      const step = pick([2, 5, 10]), start = step * rnd(0, 6);
      const seq = [start, start + step, start + 2 * step];
      return { key: `s${step}-${start}`, say: `Count by ${step}s. What comes next?`, prompt: `Count by ${step}s`, html: `<div class="equation">${seq.join(', ')}, ?</div>`, input: 'keypad', answer: String(start + 3 * step) };
    },

    patternNumber() {
      const step = pick([2, 3, 5, 10]), start = rnd(1, 20);
      const seq = [0, 1, 2, 3].map(i => start + i * step);
      return { key: `p${step}-${start}`, say: 'What comes next in the pattern?', prompt: 'What comes next?', html: `<div class="equation">${seq.join(', ')}, ?</div>`, input: 'keypad', answer: String(start + 4 * step) };
    },

    patternRepeat() {
      const unit = pick(['ab', 'abb', 'aab', 'abc']);
      const [x, y, z] = shuffle(OBJECTS).slice(0, 3);
      const map = { a: x, b: y, c: z };
      const len = rnd(unit.length + 2, unit.length * 2 + 1);
      const seq = Array.from({ length: len }, (_, i) => map[unit[i % unit.length]]);
      const ans = map[unit[len % unit.length]];
      return {
        key: unit + len, say: 'What comes next?', prompt: 'What comes next?',
        html: `<div class="objects">${seq.map(e => `<span class="obj">${e}</span>`).join('')}<span class="obj q">?</span></div>`,
        input: 'choice', choices: shuffle([x, y, z]), answer: ans, choiceStyle: 'big'
      };
    },

    add2d(p) {
      let a, b;
      for (;;) {
        a = rnd(10, 89); b = rnd(10, 89);
        const carry = (a % 10) + (b % 10) >= 10;
        if (a + b <= 99 && carry === p.regroup) break;
      }
      return { key: `${a}+${b}`, say: `${a} plus ${b}`, prompt: '', html: vertical(a, '+', b), input: 'keypad', answer: String(a + b) };
    },

    sub2d(p) {
      let a, b;
      for (;;) {
        a = rnd(20, 99); b = rnd(10, a - 1);
        const borrow = (a % 10) < (b % 10);
        if (borrow === p.regroup) break;
      }
      return { key: `${a}-${b}`, say: `${a} minus ${b}`, prompt: '', html: vertical(a, '−', b), input: 'keypad', answer: String(a - b) };
    },

    add3d() {
      let a, b;
      do { a = rnd(100, 899); b = rnd(100, 899); } while (a + b > 999);
      return { key: `${a}+${b}`, say: `${a} plus ${b}`, prompt: '', html: vertical(a, '+', b), input: 'keypad', answer: String(a + b) };
    },

    equalGroups() {
      const g = rnd(2, 5), k = rnd(2, 5), e = pick(OBJECTS);
      let html = '<div class="groups">';
      for (let i = 0; i < g; i++) html += `<div class="group">${e.repeat(k)}</div>`;
      html += '</div>';
      return { key: `${g}x${k}`, say: `${g} groups of ${k}. How many in all?`, prompt: `${g} groups of ${k}`, html, input: 'keypad', answer: String(g * k) };
    },

    mulFacts(p) {
      let a = pick(p.factors), b = rnd(1, 10);
      if (Math.random() < 0.5) [a, b] = [b, a];
      return { key: `${a}x${b}`, say: `${a} times ${b}`, prompt: '', html: `<div class="equation">${a} × ${b} = ?</div>`, input: 'keypad', answer: String(a * b) };
    },

    divShare() {
      const kids = rnd(2, 5), each = rnd(1, 5), total = kids * each;
      return {
        key: `${total}/${kids}`, say: `${total} cookies are shared by ${kids} kids. How many does each kid get?`,
        prompt: `${total} cookies, ${kids} kids`, html: objects('🍪', total), input: 'keypad', answer: String(each)
      };
    },

    fracUnit() {
      const opts = [2, 3, 4, 6, 8];
      const n = pick(opts);
      let bar = '<div class="bar">';
      for (let i = 0; i < n; i++) bar += `<span class="${i === 0 ? 'part on' : 'part'}"></span>`;
      bar += '</div>';
      const others = shuffle(opts.filter(x => x !== n)).slice(0, 2);
      return {
        key: 'f' + n, say: 'What fraction of the bar is shaded?', prompt: 'What fraction is shaded?', html: bar,
        input: 'choice', choices: shuffle([n, ...others].map(x => `1/${x}`)), answer: `1/${n}`, choiceStyle: 'big'
      };
    }
  };

  // Make an item for a skill, avoiding the last few questions asked for that skill.
  function make(skill, recent) {
    const gen = gens[skill.gen];
    if (!gen) throw new Error('No generator ' + skill.gen + ' for ' + skill.id);
    const seen = recent[skill.id] || (recent[skill.id] = []);
    let item;
    for (let i = 0; i < 8; i++) {
      item = gen(skill.params);
      if (!seen.includes(item.key)) break;
    }
    seen.push(item.key);
    if (seen.length > 4) seen.shift();
    return item;
  }

  return { make, gens, pick, shuffle };
})();
