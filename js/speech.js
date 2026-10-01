// Read-aloud using the device's built-in voice. Works offline on iPad and in desktop browsers.
window.KT = window.KT || {};

KT.speech = (function () {
  const supported = 'speechSynthesis' in window;
  let voice = null;

  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    voice = voices.find(v => /en-CA/i.test(v.lang))
      || voices.find(v => /en-US/i.test(v.lang) && /Samantha|Natural|Google/i.test(v.name))
      || voices.find(v => /^en/i.test(v.lang))
      || null;
  }

  if (supported) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  function say(text) {
    if (!supported || !text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.pitch = 1.05;
    speechSynthesis.speak(u);
  }

  return { say, supported };
})();
