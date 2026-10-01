// Storage: one family's data in this browser's localStorage.
// The shape (family -> children -> progress) matches the future database so data can move there later.
window.KT = window.KT || {};

KT.store = (function () {
  const KEY = 'kt.v1';
  let data = null;

  const id = prefix => prefix + '-' + Math.random().toString(36).slice(2, 10);
  const blank = () => ({ version: 1, familyId: id('fam'), children: [] });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      data = raw ? JSON.parse(raw) : blank();
    } catch (e) {
      console.warn('Could not read saved data; starting fresh.', e);
      data = blank();
    }
    return data;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save progress.', e);
    }
  }

  function addChild(name, avatar) {
    const child = { id: id('kid'), name, avatar, settings: { minutes: 20 }, progress: {}, placed: {}, sessions: [] };
    data.children.push(child);
    save();
    return child;
  }

  function removeChild(childId) {
    data.children = data.children.filter(c => c.id !== childId);
    save();
  }

  function exportJson() { return JSON.stringify(data, null, 2); }

  function importJson(text) {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.children)) throw new Error('This file is not a tutor backup.');
    data = parsed;
    save();
  }

  return { load, save, addChild, removeChild, exportJson, importJson, get data() { return data; } };
})();
