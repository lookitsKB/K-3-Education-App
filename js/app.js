// Screens: profile picker, kid home, activity player, celebration, and the grown-ups area.
window.KT = window.KT || {};

(function () {
  const $app = document.getElementById('app');
  const E = KT.engine, S = KT.store;
  const AVATARS = ['🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🐵', '🦄', '🐙', '🦖', '🚀', '🌈'];
  const PRAISE = ['Yes!', 'Great job!', 'You got it!', 'Nice!', 'Awesome!'];
  const STATUS_LABEL = { mastered: 'Mastered', review: 'Review due', learning: 'Learning', reteach: 'Reteach', ready: 'Ready', locked: 'Locked' };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const childById = id => S.data.children.find(c => c.id === id);
  const masteredCount = (child, subject) => KT.skills.filter(s => (!subject || s.subject === subject) && E.isMastered(child, s.id)).length;

  function render(html) { $app.innerHTML = html; }
  function on(sel, fn) { const el = $app.querySelector(sel); if (el) el.addEventListener('click', fn); }

  // ---------- Profiles ----------
  function profiles() {
    const kids = S.data.children;
    render(`
      <div class="screen center">
        <h1 class="hello">Who's learning today?</h1>
        <div class="profiles">
          ${kids.map(c => `<button class="profile" data-id="${c.id}"><span class="avatar">${c.avatar}</span><span>${esc(c.name)}</span></button>`).join('')}
        </div>
        ${kids.length ? '' : '<p class="muted">No learners yet. A grown-up can add one.</p>'}
        <button class="link" id="grownups">Grown-ups</button>
      </div>`);
    $app.querySelectorAll('.profile').forEach(b => b.addEventListener('click', () => kidHome(childById(b.dataset.id))));
    on('#grownups', parentGate);
  }

  // ---------- Kid home ----------
  function kidHome(child) {
    const needsPlacement = KT.subjects.some(s => !child.placed[s.id]);
    render(`
      <div class="screen center">
        <button class="corner" id="back">←</button>
        <div class="avatar big">${child.avatar}</div>
        <h1 class="hello">Hi, ${esc(child.name)}!</h1>
        <div class="stars">${KT.subjects.map(s => `<span>${s.icon} ${masteredCount(child, s.id)} ⭐</span>`).join('')}</div>
        <button class="start" id="start">${needsPlacement ? "Let's see what you know!" : 'Start learning'}</button>
      </div>`);
    on('#back', profiles);
    on('#start', () => {
      // speak() must follow a tap on iPad, so the first words are spoken here.
      const unplaced = KT.subjects.map(s => s.id).filter(s => !child.placed[s]);
      if (unplaced.length) {
        KT.speech.say("Let's see what you already know. Some questions are easy and some are tricky. Just try your best!");
        play(child, new KT.Placement(child, unplaced));
      } else {
        KT.speech.say("Let's learn!");
        play(child, new KT.Session(child));
      }
    });
  }

  // ---------- Activity player ----------
  function play(child, runner) {
    let quitting = false;

    function nextItem() {
      const step = runner.next();
      if (!step) return done(child, runner.finish());
      showItem(step);
    }

    function showItem(step) {
      const { item, label, mode } = step;
      const placement = mode === 'placement';
      let attempt = 1, locked = false;

      const choiceHtml = item.input === 'choice'
        ? `<div class="choices ${item.choiceStyle}">${item.choices.map(c => `<button class="choice" data-v="${esc(c)}">${esc(c)}</button>`).join('')}</div>`
        : `<div class="keypad-wrap"><div class="entry" id="entry"></div><div class="keypad">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-k="${n}">${n}</button>`).join('')}
            <button class="key" data-k="del">⌫</button><button class="key" data-k="0">0</button><button class="key go" data-k="go">✓</button>
          </div></div>`;

      render(`
        <div class="screen play">
          <div class="topbar">
            <button class="icon" id="quit">✕</button>
            <div class="progress"><div style="width:${Math.round(runner.progress() * 100)}%"></div></div>
            <span class="phase">${esc(label)}</span>
            <button class="icon" id="replay">🔊</button>
          </div>
          <div class="stage">
            ${item.prompt ? `<div class="prompt">${esc(item.prompt)}</div>` : ''}
            <div class="visual">${item.html}</div>
            ${choiceHtml}
            <div class="feedback" id="feedback"></div>
          </div>
        </div>`);

      KT.speech.say(item.say);
      on('#replay', () => KT.speech.say(item.say));
      on('#quit', confirmQuit);

      const feedback = $app.querySelector('#feedback');

      function resolve(value, el) {
        if (locked) return;
        const ok = String(value) === item.answer;
        if (placement) {
          locked = true;
          runner.answer(ok);
          KT.speech.say(KT.items.pick(['Okay!', 'Thanks!', 'Got it.']));
          if (el) el.classList.add('picked');
          setTimeout(nextItem, 700);
          return;
        }
        if (ok) {
          locked = true;
          if (el) el.classList.add('right');
          markEntry('right');
          KT.speech.say(KT.items.pick(PRAISE));
          const ev = runner.answer(attempt === 1);
          setTimeout(() => (ev && ev.mastered ? celebrate(ev.mastered, nextItem) : nextItem()), 900);
        } else if (attempt === 1) {
          attempt = 2;
          if (el) { el.classList.add('wrong'); el.disabled = true; }
          markEntry('wrong');
          KT.speech.say('Not quite. Try again.');
        } else {
          locked = true;
          if (el) el.classList.add('wrong');
          runner.answer(false);
          $app.querySelectorAll('.choice').forEach(b => { if (b.dataset.v === item.answer) b.classList.add('right'); });
          const entry = $app.querySelector('#entry');
          if (entry) { entry.textContent = item.answer; entry.className = 'entry right'; }
          KT.speech.say(`The answer is ${item.answer}.`);
          feedback.innerHTML = '<button class="next" id="next">Next →</button>';
          on('#next', nextItem);
        }
      }

      function markEntry(cls) {
        const entry = $app.querySelector('#entry');
        if (!entry) return;
        entry.className = 'entry ' + cls;
        if (cls === 'wrong') setTimeout(() => { entry.textContent = ''; entry.className = 'entry'; }, 700);
      }

      $app.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => resolve(b.dataset.v, b)));
      $app.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => {
        if (locked) return;
        const entry = $app.querySelector('#entry');
        const k = b.dataset.k;
        if (k === 'del') entry.textContent = entry.textContent.slice(0, -1);
        else if (k === 'go') { if (entry.textContent) resolve(entry.textContent, null); }
        else if (entry.textContent.length < 4) entry.textContent += k;
      }));
    }

    function confirmQuit() {
      if (quitting) return;
      quitting = true;
      const box = document.createElement('div');
      box.className = 'overlay';
      box.innerHTML = '<div class="dialog"><p>Stop for today?</p><button class="start small" id="q-yes">Stop</button><button class="link" id="q-no">Keep going</button></div>';
      $app.appendChild(box);
      box.querySelector('#q-yes').addEventListener('click', () => { if (runner.done > 0) runner.finish(); kidHome(child); });
      box.querySelector('#q-no').addEventListener('click', () => { box.remove(); quitting = false; });
    }

    nextItem();
  }

  function celebrate(skill, then) {
    KT.speech.say('You learned a new skill!');
    render(`
      <div class="screen center celebrate">
        <div class="burst">⭐</div>
        <h1 class="hello">New skill!</h1>
        <p class="skill-name">${esc(skill.title)}</p>
        <button class="start" id="go">Keep going</button>
      </div>`);
    on('#go', then);
  }

  function done(child, summary) {
    const placement = summary.kind === 'placement';
    KT.speech.say(placement ? 'All done! Now I know what to teach you next.' : 'Great work today!');
    render(`
      <div class="screen center">
        <div class="burst">🎉</div>
        <h1 class="hello">${placement ? 'All done!' : 'Great work today!'}</h1>
        <p class="muted">You answered ${summary.items} questions.</p>
        ${summary.mastered.length ? `<div class="new-skills">${summary.mastered.map(id => `<div>⭐ ${esc(KT.skillById[id].title)}</div>`).join('')}</div>` : ''}
        <button class="start" id="home">Done</button>
      </div>`);
    on('#home', () => kidHome(child));
  }

  // ---------- Grown-ups ----------
  function parentGate() {
    const a = 12 + Math.floor(Math.random() * 8), b = 3 + Math.floor(Math.random() * 7);
    render(`
      <div class="screen center">
        <button class="corner" id="back">←</button>
        <h2>Grown-ups only</h2>
        <p class="muted">What is ${a} × ${b}?</p>
        <form id="gate"><input id="gate-in" inputmode="numeric" autocomplete="off" class="text-in"> <button class="start small">Enter</button></form>
      </div>`);
    on('#back', profiles);
    $app.querySelector('#gate-in').focus();
    $app.querySelector('#gate').addEventListener('submit', e => {
      e.preventDefault();
      if (Number($app.querySelector('#gate-in').value) === a * b) parent(S.data.children[0] && S.data.children[0].id);
      else profiles();
    });
  }

  function parent(selectedId) {
    const kids = S.data.children;
    const child = childById(selectedId);
    render(`
      <div class="screen parent">
        <div class="parent-head">
          <button class="corner static" id="back">← Exit</button>
          <h2>Grown-ups</h2>
        </div>
        <div class="tabs">
          ${kids.map(c => `<button class="tab ${child && c.id === child.id ? 'on' : ''}" data-id="${c.id}">${c.avatar} ${esc(c.name)}</button>`).join('')}
          <button class="tab" id="add-tab">+ Add learner</button>
        </div>
        <div id="panel">${child ? childPanel(child) : addForm()}</div>
        <div class="card">
          <h3>Backup</h3>
          <p class="muted">Progress is saved in this browser only. Download a backup now and then.</p>
          <button class="btn" id="export">Download backup</button>
          <label class="btn">Restore backup<input type="file" id="import" accept="application/json" hidden></label>
        </div>
      </div>`);

    on('#back', profiles);
    $app.querySelectorAll('.tab[data-id]').forEach(b => b.addEventListener('click', () => parent(b.dataset.id)));
    on('#add-tab', () => { $app.querySelector('#panel').innerHTML = addForm(); wireAdd(); });
    on('#export', () => {
      const blob = new Blob([S.exportJson()], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `tutor-backup-${E.today()}.json`;
      link.click();
    });
    $app.querySelector('#import').addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      file.text().then(text => {
        try { S.importJson(text); parent(S.data.children[0] && S.data.children[0].id); }
        catch (err) { alert(err.message); }
      });
    });
    if (child) wireChild(child); else wireAdd();
  }

  function addForm() {
    return `
      <div class="card">
        <h3>Add a learner</h3>
        <form id="add">
          <input id="add-name" class="text-in" placeholder="First name or nickname" maxlength="20" required>
          <div class="avatars">${AVATARS.map((a, i) => `<label><input type="radio" name="av" value="${a}" ${i === 0 ? 'checked' : ''}><span>${a}</span></label>`).join('')}</div>
          <button class="btn primary">Add</button>
        </form>
      </div>`;
  }

  function wireAdd() {
    const form = $app.querySelector('#add');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $app.querySelector('#add-name').value.trim();
      if (!name) return;
      const c = S.addChild(name, form.querySelector('input[name=av]:checked').value);
      parent(c.id);
    });
  }

  function childPanel(child) {
    const sessions = child.sessions.slice(-10).reverse();
    return `
      <div class="card">
        <h3>Settings</h3>
        <label>Daily session length
          <select id="minutes">${[10, 15, 20, 25, 30].map(m => `<option ${child.settings.minutes === m ? 'selected' : ''}>${m}</option>`).join('')}</select> minutes
        </label>
        <div class="row">
          ${KT.subjects.map(s => `<span>${s.name} placement: ${child.placed[s.id] ? 'done ' + child.placed[s.id] : 'not yet'}</span> <button class="btn" data-replace="${s.id}">Redo</button>`).join(' ')}
        </div>
      </div>
      ${KT.subjects.map(s => skillTable(child, s)).join('')}
      <div class="card">
        <h3>Recent sessions</h3>
        ${sessions.length ? `<table><tr><th>Date</th><th>Type</th><th>Questions</th><th>First-try correct</th><th>New skills</th></tr>
          ${sessions.map(x => `<tr><td>${x.date}</td><td>${x.kind}</td><td>${x.items}</td><td>${x.items ? Math.round(100 * x.correct / x.items) : 0}%</td><td>${x.mastered.map(id => esc(KT.skillById[id].title)).join(', ')}</td></tr>`).join('')}
        </table>` : '<p class="muted">No sessions yet.</p>'}
      </div>
      <div class="card"><button class="btn danger" id="remove">Remove ${esc(child.name)}</button></div>`;
  }

  function skillTable(child, subject) {
    const skills = KT.skills.filter(s => s.subject === subject.id);
    return `
      <div class="card">
        <h3>${subject.icon} ${subject.name}: ${masteredCount(child, subject.id)} of ${skills.length} mastered</h3>
        <table class="skills">
          <tr><th>Skill</th><th>Grade (est.)</th><th>Status</th><th>Last 6</th><th>Next review</th><th></th></tr>
          ${skills.map(s => {
            const st = E.displayState(child, s), p = child.progress[s.id];
            const last = p ? p.hist.slice(-6).map(h => (h.c ? '●' : '○')).join('') : '';
            return `<tr class="${st}">
              <td>${esc(s.title)}</td><td>${s.grade}</td>
              <td><span class="chip ${st}">${STATUS_LABEL[st]}${p && p.placed ? ' (placed)' : ''}</span></td>
              <td class="dots">${last}</td><td>${p && p.nextReview ? p.nextReview : ''}</td>
              <td>${st === 'mastered' || st === 'review'
                ? `<button class="mini" data-reset="${s.id}">Reset</button>`
                : `<button class="mini" data-master="${s.id}">Mark mastered</button>`}</td>
            </tr>`;
          }).join('')}
        </table>
      </div>`;
  }

  function wireChild(child) {
    const refresh = () => { S.save(); parent(child.id); };
    $app.querySelector('#minutes').addEventListener('change', e => { child.settings.minutes = Number(e.target.value); S.save(); });
    $app.querySelectorAll('[data-replace]').forEach(b => b.addEventListener('click', () => { delete child.placed[b.dataset.replace]; refresh(); }));
    $app.querySelectorAll('[data-master]').forEach(b => b.addEventListener('click', () => { E.setMastered(child, b.dataset.master); refresh(); }));
    $app.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', () => { E.reset(child, b.dataset.reset); refresh(); }));
    on('#remove', () => {
      if (confirm(`Remove ${child.name} and all their progress? This cannot be undone.`)) { S.removeChild(child.id); parent(S.data.children[0] && S.data.children[0].id); }
    });
  }

  S.load();
  profiles();
})();
