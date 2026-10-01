// Session planner and placement check.
// Both expose the same runner interface to the app: next() -> { item, skill, label, mode } | null,
// answer(correctFirstTry) -> event | null, progress() -> 0..1, finish() -> summary.
window.KT = window.KT || {};

(function () {
  const E = () => KT.engine;
  const MAX_OPEN_NEW_SKILLS = 2;
  const MAX_WRONG_PER_SKILL = 3;

  class Session {
    constructor(child) {
      this.child = child;
      this.recent = {};
      this.stats = {};
      this.introduced = { reading: [], math: [] };
      this.mastered = [];
      this.current = null;
      this.done = 0;
      this.correct = 0;

      // About 3 questions a minute: warm-up reviews, then reading and math, then one easy finisher.
      const total = Math.max(6, Math.round((child.settings.minutes || 20) * 3));
      const due = E().dueReviews(child);
      const nReview = Math.min(due.length, Math.round(total * 0.25));
      const rest = total - nReview - 1;
      const subjects = KT.subjects.map(s => s.id).filter(s => E().frontier(child, s).length > 0);

      this.phases = [];
      if (nReview) this.phases.push({ label: 'Warm-up', mode: 'review', left: nReview, queue: due.slice(0, nReview) });
      subjects.forEach((s, i) => {
        const share = i === 0 ? Math.ceil(rest / subjects.length) : Math.floor(rest / subjects.length);
        this.phases.push({ label: KT.subjects.find(x => x.id === s).name, mode: 'learn', subject: s, left: share });
      });
      this.phases.push({ label: 'Finish', mode: 'finish', left: 1 });
      this.total = this.phases.reduce((a, p) => a + p.left, 0);
    }

    phase() {
      while (this.phases.length && this.phases[0].left <= 0) this.phases.shift();
      return this.phases[0];
    }

    next() {
      let p = this.phase();
      while (p) {
        const skill = this.pickSkill(p);
        if (skill) {
          this.current = { phase: p, skill };
          return { item: KT.items.make(skill, this.recent), skill, label: p.label, mode: p.mode };
        }
        // Nothing left to do in this phase (e.g. every ready skill paused for today).
        this.total -= p.left;
        p.left = 0;
        p = this.phase();
      }
      return null;
    }

    usable(skill) {
      const st = this.stats[skill.id];
      return !(st && st.stopped) && !E().isMastered(this.child, skill.id);
    }

    pickSkill(p) {
      const child = this.child;
      if (p.mode === 'review') {
        const id = p.queue.shift();
        return id ? KT.skillById[id] : null;
      }
      if (p.mode === 'finish') {
        const known = KT.skills.filter(s => E().isMastered(child, s.id));
        return known.length ? KT.items.pick(known) : null;
      }
      const cur = this.current && this.current.phase === p ? this.current.skill : null;
      if (cur && this.usable(cur)) return cur;

      const options = E().frontier(child, p.subject).filter(s => this.usable(s));
      // Skills already underway come first, closest to mastery first.
      const started = options
        .filter(s => { const st = child.progress[s.id]; return st && (st.status === 'learning' || st.status === 'reteach'); })
        .sort((a, b) => E().recentCorrect(child, b.id) - E().recentCorrect(child, a.id));
      if (started.length) return started[0];
      // Limit how many new skills are open but unfinished, so a child who masters quickly keeps advancing.
      const open = this.introduced[p.subject].filter(id => !E().isMastered(child, id));
      if (open.length < MAX_OPEN_NEW_SKILLS && options.length) {
        this.introduced[p.subject].push(options[0].id);
        return options[0];
      }
      return null;
    }

    answer(correct) {
      const { phase, skill } = this.current;
      phase.left--;
      this.done++;
      if (correct) this.correct++;
      let event = null;
      if (phase.mode === 'review') {
        E().recordReview(this.child, skill.id, correct);
      } else if (phase.mode === 'learn') {
        const st = this.stats[skill.id] || (this.stats[skill.id] = { n: 0, wrong: 0 });
        st.n++;
        if (!correct) st.wrong++;
        if (E().recordPractice(this.child, skill.id, correct)) {
          this.mastered.push(skill.id);
          event = { mastered: skill };
        } else if (st.wrong >= MAX_WRONG_PER_SKILL) {
          st.stopped = true; // Enough for today; it comes back next session.
        }
      }
      KT.store.save();
      return event;
    }

    progress() { return this.total ? Math.min(1, this.done / this.total) : 1; }

    finish() {
      E().endSession(this.child, this.stats);
      const summary = { date: E().today(), kind: 'session', items: this.done, correct: this.correct, mastered: this.mastered.slice() };
      this.child.sessions.push(summary);
      KT.store.save();
      return summary;
    }
  }

  // Placement: a binary search along each subject's skill list (easiest first).
  // A probe passes with 2 of up to 3 correct; passing marks that skill and everything beneath it mastered.
  class Placement {
    constructor(child, subjects) {
      this.child = child;
      this.queue = subjects.slice();
      this.recent = {};
      this.done = 0;
      this.correct = 0;
      this.placedSkills = [];
      this.estimate = subjects.length * 15;
      this.startSubject();
    }

    startSubject() {
      this.subject = this.queue.shift();
      if (!this.subject) return;
      this.list = KT.skills.filter(s => s.subject === this.subject);
      this.lo = 0;
      this.hi = this.list.length - 1;
      this.probes = 0;
      this.newProbe();
    }

    newProbe() {
      if (this.lo > this.hi || this.probes >= 6) {
        this.child.placed[this.subject] = E().today();
        KT.store.save();
        this.startSubject();
        return;
      }
      this.idx = Math.floor((this.lo + this.hi) / 2);
      this.probes++;
      this.asked = 0;
      this.right = 0;
    }

    next() {
      if (!this.subject) return null;
      const skill = this.list[this.idx];
      const name = KT.subjects.find(s => s.id === this.subject).name;
      return { item: KT.items.make(skill, this.recent), skill, label: name + ' check', mode: 'placement' };
    }

    answer(correct) {
      this.asked++;
      this.done++;
      if (correct) { this.right++; this.correct++; }
      const wrong = this.asked - this.right;
      if (this.right >= 2 || wrong >= 2) {
        if (this.right >= 2) {
          E().placeWithAncestors(this.child, this.list[this.idx].id);
          this.placedSkills.push(this.list[this.idx].id);
          this.lo = this.idx + 1;
        } else {
          this.hi = this.idx - 1;
        }
        KT.store.save();
        this.newProbe();
      }
      return null;
    }

    progress() { return Math.min(0.95, this.done / this.estimate); }

    finish() {
      const summary = { date: E().today(), kind: 'placement', items: this.done, correct: this.correct, mastered: [] };
      this.child.sessions.push(summary);
      KT.store.save();
      return summary;
    }
  }

  KT.Session = Session;
  KT.Placement = Placement;
})();
