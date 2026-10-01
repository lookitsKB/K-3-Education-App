// Curriculum graph: small skills linked by prerequisites.
// Skills within a subject are listed easiest-first; the placement check relies on that order.
// `grade` is an estimated Alberta grade label for reporting only. The engine never uses it to decide what to teach.
window.KT = window.KT || {};

(function () {
  const R = (id, grade, strand, title, prereqs, gen, params) => ({ id, subject: 'reading', grade, strand, title, prereqs, gen, params: params || {} });
  const M = (id, grade, strand, title, prereqs, gen, params) => ({ id, subject: 'math', grade, strand, title, prereqs, gen, params: params || {} });

  KT.skills = [
    // Reading (ELAL)
    R('R.first.cons', 'K', 'Letter sounds', 'First sound of a word (consonants)', [], 'firstSound', { kind: 'cons' }),
    R('R.first.vowel', 'K', 'Letter sounds', 'First sound of a word (short vowels)', ['R.first.cons'], 'firstSound', { kind: 'vowel' }),
    R('R.cvc.a', 'K', 'Short vowels', 'Read short-a words (cat, map)', ['R.first.vowel'], 'wordPick', { sets: ['cvc_a'] }),
    R('R.hf.1', 'K', 'Sight words', 'Sight words, set 1 (the, is, you)', ['R.cvc.a'], 'wordPick', { sets: ['hf1'] }),
    R('R.cvc.i', 'K', 'Short vowels', 'Read short-i words (pig, sit)', ['R.cvc.a'], 'wordPick', { sets: ['cvc_i'] }),
    R('R.cvc.o', 'K', 'Short vowels', 'Read short-o words (dog, top)', ['R.cvc.i'], 'wordPick', { sets: ['cvc_o'] }),
    R('R.cvc.u', 'K', 'Short vowels', 'Read short-u words (bug, sun)', ['R.cvc.o'], 'wordPick', { sets: ['cvc_u'] }),
    R('R.cvc.e', 'K', 'Short vowels', 'Read short-e words (bed, hen)', ['R.cvc.u'], 'wordPick', { sets: ['cvc_e'] }),
    R('R.cvc.mix', '1', 'Short vowels', 'Read mixed short-vowel words', ['R.cvc.e'], 'wordPick', { sets: ['cvc_a', 'cvc_i', 'cvc_o', 'cvc_u', 'cvc_e'] }),
    R('R.sent.1', '1', 'Sentences', 'Read a short sentence and answer', ['R.cvc.mix', 'R.hf.1'], 'passage', { set: 'sent1' }),
    R('R.dig', '1', 'Digraphs', 'Read words with sh, ch, th, wh, ck', ['R.cvc.mix'], 'wordPick', { sets: ['digraph'] }),
    R('R.blend.i', '1', 'Blends', 'Read words that start with blends (stop, frog)', ['R.cvc.mix'], 'wordPick', { sets: ['blend_init'] }),
    R('R.blend.f', '1', 'Blends', 'Read words that end with blends (hand, jump)', ['R.blend.i'], 'wordPick', { sets: ['blend_final'] }),
    R('R.hf.2', '1', 'Sight words', 'Sight words, set 2 (said, they, was)', ['R.hf.1'], 'wordPick', { sets: ['hf2'] }),
    R('R.sent.2', '1', 'Sentences', 'Read sentences with blends and digraphs', ['R.sent.1', 'R.dig', 'R.blend.f', 'R.hf.2'], 'passage', { set: 'sent2' }),
    R('R.vce', '1', 'Long vowels', 'Read magic-e words (cake, bike)', ['R.dig', 'R.blend.f'], 'wordPick', { sets: ['vce'] }),
    R('R.infl', '1', 'Word endings', 'Read words with -s, -ed, -ing', ['R.dig', 'R.blend.f'], 'wordPick', { sets: ['infl'] }),
    R('R.story.1', '1', 'Comprehension', 'Read a short story and answer', ['R.sent.2'], 'passage', { set: 'story1' }),
    R('R.vt.ee', '1', 'Vowel teams', 'Read ee and ea words (tree, leaf)', ['R.vce'], 'wordPick', { sets: ['vt_ee'] }),
    R('R.vt.ai', '2', 'Vowel teams', 'Read ai and ay words (rain, play)', ['R.vt.ee'], 'wordPick', { sets: ['vt_ai'] }),
    R('R.vt.oa', '2', 'Vowel teams', 'Read oa and ow words (boat, snow)', ['R.vt.ai'], 'wordPick', { sets: ['vt_oa'] }),
    R('R.rc', '2', 'R-controlled vowels', 'Read ar, or, er, ir, ur words', ['R.vt.ee'], 'wordPick', { sets: ['rc'] }),
    R('R.syl2', '2', 'Longer words', 'Read two-syllable words (rabbit, picnic)', ['R.vce', 'R.infl'], 'wordPick', { sets: ['syl2'] }),
    R('R.hf.3', '2', 'Sight words', 'Sight words, set 3 (because, friend)', ['R.hf.2'], 'wordPick', { sets: ['hf3'] }),
    R('R.story.2', '2', 'Comprehension', 'Work out what a story does not say', ['R.story.1', 'R.vt.ai'], 'passage', { set: 'story2' }),

    // Math
    M('M.count.10', 'K', 'Counting', 'Count objects to 10', [], 'countObjects', { min: 1, max: 10 }),
    M('M.pattern.ab', 'K', 'Patterns', 'Continue a repeating pattern', [], 'patternRepeat'),
    M('M.numeral.20', 'K', 'Numbers', 'Recognize numbers to 20', ['M.count.10'], 'numeralPick', { max: 20 }),
    M('M.compare.10', 'K', 'Comparing', 'Compare numbers to 10', ['M.count.10'], 'compare', { max: 10 }),
    M('M.count.20', 'K', 'Counting', 'Count objects to 20', ['M.count.10'], 'countObjects', { min: 8, max: 20 }),
    M('M.add.5', 'K', 'Addition', 'Add within 5 with pictures', ['M.count.10'], 'addPics', { max: 5 }),
    M('M.sub.5', 'K', 'Subtraction', 'Take away within 5 with pictures', ['M.add.5'], 'subPics', { max: 5 }),
    M('M.add.10', '1', 'Addition', 'Add within 10', ['M.add.5', 'M.numeral.20'], 'addFacts', { max: 10 }),
    M('M.sub.10', '1', 'Subtraction', 'Subtract within 10', ['M.sub.5', 'M.add.10'], 'subFacts', { max: 10 }),
    M('M.bonds.10', '1', 'Addition', 'Number pairs that make 10', ['M.add.10'], 'bonds', { total: 10 }),
    M('M.after.100', '1', 'Numbers', 'Numbers before and after, to 100', ['M.numeral.20', 'M.count.20'], 'beforeAfter', { max: 100 }),
    M('M.pv.tens', '1', 'Place value', 'Tens and ones', ['M.after.100'], 'placeTens'),
    M('M.compare.100', '1', 'Comparing', 'Compare numbers to 100', ['M.pv.tens', 'M.compare.10'], 'compare', { max: 100 }),
    M('M.add.20', '1', 'Addition', 'Add within 20', ['M.bonds.10'], 'addFacts', { max: 20 }),
    M('M.sub.20', '1', 'Subtraction', 'Subtract within 20', ['M.add.20', 'M.sub.10'], 'subFacts', { max: 20 }),
    M('M.skip', '2', 'Counting', 'Skip count by 2s, 5s and 10s', ['M.after.100'], 'skipCount'),
    M('M.pattern.num', '2', 'Patterns', 'Continue a number pattern', ['M.skip', 'M.pattern.ab'], 'patternNumber'),
    M('M.add.2d', '2', 'Addition', 'Add 2-digit numbers, no regrouping', ['M.pv.tens', 'M.add.10'], 'add2d', { regroup: false }),
    M('M.sub.2d', '2', 'Subtraction', 'Subtract 2-digit numbers, no regrouping', ['M.add.2d', 'M.sub.10'], 'sub2d', { regroup: false }),
    M('M.add.2dr', '2', 'Addition', 'Add 2-digit numbers with regrouping', ['M.add.2d', 'M.add.20'], 'add2d', { regroup: true }),
    M('M.sub.2dr', '2', 'Subtraction', 'Subtract 2-digit numbers with regrouping', ['M.sub.2d', 'M.add.2dr', 'M.sub.20'], 'sub2d', { regroup: true }),
    M('M.pv.hund', '2', 'Place value', 'Hundreds, tens and ones', ['M.pv.tens'], 'placeHundreds'),
    M('M.mul.groups', '2', 'Multiplication', 'Equal groups', ['M.skip'], 'equalGroups'),
    M('M.mul.2510', '3', 'Multiplication', 'Multiply by 2, 5 and 10', ['M.mul.groups'], 'mulFacts', { factors: [2, 5, 10] }),
    M('M.div.share', '3', 'Division', 'Share equally', ['M.mul.2510'], 'divShare'),
    M('M.mul.facts', '3', 'Multiplication', 'Multiply by 3, 4, 6, 7, 8 and 9', ['M.mul.2510'], 'mulFacts', { factors: [3, 4, 6, 7, 8, 9] }),
    M('M.frac.unit', '3', 'Fractions', 'Name unit fractions (1/2, 1/3, 1/4)', ['M.div.share'], 'fracUnit'),
    M('M.add.3d', '3', 'Addition', 'Add 3-digit numbers', ['M.add.2dr', 'M.pv.hund'], 'add3d')
  ];

  KT.skillById = {};
  KT.skills.forEach(s => { KT.skillById[s.id] = s; });
  KT.subjects = [
    { id: 'reading', name: 'Reading', icon: '📖' },
    { id: 'math', name: 'Math', icon: '🔢' }
  ];

  // Catch typos in prerequisite ids early.
  KT.skills.forEach(s => s.prereqs.forEach(p => {
    if (!KT.skillById[p]) console.error('Unknown prerequisite', p, 'on', s.id);
  }));
})();
