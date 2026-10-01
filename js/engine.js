// Mastery engine: tracks every skill for every child and decides what is ready to learn.
// Skill state: { status: 'new' | 'learning' | 'mastered' | 'reteach', hist: [{d, c}], step, fails, struggle, nextReview, placed }
window.KT = window.KT || {};

KT.engine = (function () {
  const REVIEW_DAYS = [1, 3, 7, 21, 60];
  const MASTERY_WINDOW = 6, MASTERY_NEEDED = 5;

  function dayStr(t) {
    const d = new Date(t);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function today() { return dayStr(Date.now()); }
  function addDays(day, n) {
    const [y, m, d] = day.split('-').map(Number);
    return dayStr(new Date(y, m - 1, d + n).getTime());
  }

  function state(child, id) {
    return child.progress[id] || (child.progress[id] = { status: 'new', hist: [], step: 0, fails: 0, struggle: 0 });
  }
  function isMastered(child, id) {
    const s = child.progress[id];
    return !!s && s.status === 'mastered';
  }
  function prereqsMet(child, skill) {
    return skill.prereqs.every(p => isMastered(child, p));
  }

  // Skills not yet mastered whose prerequisites are all mastered, easiest first. Grade is ignored.
  function frontier(child, subject) {
    return KT.skills.filter(s => s.subject === subject && !isMastered(child, s.id) && prereqsMet(child, s));
  }

  function dueReviews(child) {
    const t = today();
    return KT.skills
      .filter(s => isMastered(child, s.id) && child.progress[s.id].nextReview <= t)
      .sort((a, b) => child.progress[a.id].nextReview.localeCompare(child.progress[b.id].nextReview))
      .map(s => s.id);
  }

  function recentCorrect(child, id) {
    const s = child.progress[id];
    return s ? s.hist.slice(-MASTERY_WINDOW).filter(h => h.c).length : 0;
  }

  function markMastered(s, gapDays) {
    s.status = 'mastered';
    s.step = 0;
    s.fails = 0;
    s.masteredOn = today();
    s.nextReview = addDays(today(), gapDays);
  }

  // Practice on a skill being learned. Returns true when this answer completes mastery.
  function recordPractice(child, id, correct) {
    const s = state(child, id);
    if (s.status === 'new') s.status = 'learning';
    s.hist.push({ d: today(), c: !!correct });
    if (s.hist.length > 12) s.hist.shift();
    const win = s.hist.slice(-MASTERY_WINDOW);
    if (win.filter(h => h.c).length >= MASTERY_NEEDED) {
      // Proven on one day only: check again tomorrow. Proven across days: first review in 3 days.
      const days = new Set(win.map(h => h.d)).size;
      markMastered(s, days >= 2 ? 3 : 1);
      return true;
    }
    return false;
  }

  // A review of a mastered skill. Two failed reviews in a row sends it back to be retaught.
  function recordReview(child, id, correct) {
    const s = state(child, id);
    s.hist.push({ d: today(), c: !!correct });
    if (s.hist.length > 12) s.hist.shift();
    if (correct) {
      s.step = Math.min(s.step + 1, REVIEW_DAYS.length - 1);
      s.fails = 0;
      s.nextReview = addDays(today(), REVIEW_DAYS[s.step]);
      return;
    }
    s.fails++;
    if (s.fails >= 2) {
      s.status = 'reteach';
      s.hist = [];
      s.fails = 0;
      delete s.nextReview;
      reviewPrereqsNow(child, id);
    } else {
      s.nextReview = addDays(today(), 1);
    }
  }

  function reviewPrereqsNow(child, id) {
    KT.skillById[id].prereqs.forEach(p => {
      if (isMastered(child, p)) child.progress[p].nextReview = today();
    });
  }

  // Placement: mark a skill and everything beneath it as mastered, with reviews spread over the next week.
  function placeWithAncestors(child, id) {
    const seen = new Set();
    const walk = sid => {
      if (seen.has(sid)) return;
      seen.add(sid);
      if (!isMastered(child, sid)) {
        const s = state(child, sid);
        markMastered(s, 2 + Math.floor(Math.random() * 6));
        s.step = 1;
        s.placed = true;
      }
      KT.skillById[sid].prereqs.forEach(walk);
    };
    walk(id);
  }

  // After a session: repeated struggle over 3 sessions sends the child back to check prerequisites.
  function endSession(child, stats) {
    Object.keys(stats).forEach(id => {
      const st = stats[id];
      if (st.n < 4 || st.wrong / st.n <= 0.5) return;
      const s = state(child, id);
      s.struggle = (s.struggle || 0) + 1;
      if (s.struggle >= 3) {
        s.struggle = 0;
        reviewPrereqsNow(child, id);
      }
    });
  }

  // What the parent sees for a skill.
  function displayState(child, skill) {
    const s = child.progress[skill.id];
    if (s && s.status === 'mastered') return s.nextReview <= today() ? 'review' : 'mastered';
    if (!prereqsMet(child, skill)) return 'locked';
    if (s && s.status === 'reteach') return 'reteach';
    if (s && s.status === 'learning') return 'learning';
    return 'ready';
  }

  function setMastered(child, id) { markMastered(state(child, id), 3); }
  function reset(child, id) { delete child.progress[id]; }

  return {
    today, addDays, frontier, dueReviews, isMastered, recentCorrect, recordPractice, recordReview,
    placeWithAncestors, endSession, displayState, setMastered, reset
  };
})();
