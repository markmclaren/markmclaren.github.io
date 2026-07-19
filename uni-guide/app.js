/* ── STATE ──────────────────────────────────────────────────────────────── */
const state = {
  currentStep: 0,
  totalSteps: 10,
  ratings: { original: 0, local: 0 },
  choice4: null,
};

/* ── INIT ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCheckItems();
  initStarRatings();
  updateRelConfidence();
  // Trigger truth card / scenario card animations when steps become visible
});

/* ── START GUIDE ────────────────────────────────────────────────────────── */
function startGuide() {
  document.getElementById('hero').classList.add('d-none');
  document.getElementById('progress-bar-wrap').classList.remove('d-none');
  document.getElementById('steps-container').classList.remove('d-none');
  goToStep(1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── STEP NAVIGATION ────────────────────────────────────────────────────── */
function goToStep(n) {
  // Hide all steps
  for (let i = 1; i <= state.totalSteps; i++) {
    const el = document.getElementById(`step-${i}`);
    if (el) el.classList.add('d-none');
  }

  // Show target step
  const target = document.getElementById(`step-${n}`);
  if (target) {
    target.classList.remove('d-none');
    state.currentStep = n;
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    triggerStepAnimations(n);
  }
}

function nextStep(current) {
  if (current < state.totalSteps) goToStep(current + 1);
}

function prevStep(current) {
  if (current > 1) goToStep(current - 1);
}

/* ── PROGRESS ───────────────────────────────────────────────────────────── */
function updateProgress() {
  const pct = ((state.currentStep - 1) / state.totalSteps) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';
  document.getElementById('progress-label').textContent =
    `Step ${state.currentStep} of ${state.totalSteps}`;
}

/* ── CHECKBOX ITEMS ─────────────────────────────────────────────────────── */
function initCheckItems() {
  document.querySelectorAll('.check-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      const cb = item.querySelector('input[type="checkbox"]');
      if (cb) cb.checked = item.classList.contains('checked');
    });
  });
}

/* ── STEP 4: CHOICE ─────────────────────────────────────────────────────── */
function selectChoice(val) {
  state.choice4 = val;
  const btns = document.querySelectorAll('.choice-btn');
  btns.forEach(b => b.className = 'choice-btn');

  const btn = document.getElementById('choice-' + val);
  if (btn) btn.classList.add('selected-' + val);

  const resp = document.getElementById('choice-response');
  resp.classList.remove('d-none');

  const messages = {
    original: '✨ That\'s a strong signal. When you remove the noise — the worry, the pressure — your instinct points to your original choice. That instinct is worth listening to.',
    local: '🏠 That\'s honest. It might mean the local uni genuinely suits you better — or it might mean the comfort of familiarity is pulling hard. Either way, it\'s worth exploring why.',
    unsure: '🤔 That\'s completely okay. Uncertainty is normal. Keep going through this guide — the comparison and reflection steps ahead may help things become clearer.',
  };
  resp.innerHTML = `<i class="bi bi-lightbulb-fill me-2"></i>${messages[val]}`;
}

/* ── STEP 5: FUTURE SLIDERS ─────────────────────────────────────────────── */
function updateSlider(key) {
  const slider = document.getElementById('fs-' + key);
  const val = parseInt(slider.value);
  const label = document.getElementById('sv-' + key);

  let text = '';
  if (val <= 3)      text = 'Leans local uni';
  else if (val <= 4) text = 'Slightly local';
  else if (val === 5) text = 'Balanced';
  else if (val <= 6) text = 'Slightly original';
  else               text = 'Leans original uni';

  label.textContent = text;

  // Compute overall lean
  const keys = ['confidence', 'independence', 'opportunities', 'freedom'];
  const total = keys.reduce((sum, k) => {
    const s = document.getElementById('fs-' + k);
    return sum + (s ? parseInt(s.value) : 5);
  }, 0);
  const avg = total / keys.length;

  const summary = document.getElementById('future-summary');
  summary.classList.remove('d-none');
  if (avg >= 6.5) {
    summary.innerHTML = '<i class="bi bi-send-fill me-2"></i><strong>Your future self seems to lean towards your original uni</strong> — you\'ve rated it higher across most of these dimensions. That\'s worth noting.';
  } else if (avg <= 4.5) {
    summary.innerHTML = '<i class="bi bi-house-heart-fill me-2"></i><strong>Your future self seems to lean towards the local uni</strong> — you\'ve rated it higher across most dimensions. Is that a genuine preference or a comfort pull?';
  } else {
    summary.innerHTML = '<i class="bi bi-yin-yang me-2"></i><strong>You see it as fairly balanced</strong> — both options have merit. The other steps in this guide may help you find the tiebreaker.';
  }
}

/* ── STEP 7: RELATIONSHIP CONFIDENCE ───────────────────────────────────── */
function updateRelConfidence() {
  const slider = document.getElementById('rel-confidence');
  if (!slider) return;
  const val = parseInt(slider.value);
  document.getElementById('rel-conf-val').textContent = val + ' / 10';

  const msg = document.getElementById('rel-conf-msg');
  if (val >= 8) {
    msg.innerHTML = '<i class="bi bi-heart-fill me-2"></i><strong>High confidence.</strong> If you genuinely believe your relationship can handle distance, then it shouldn\'t be the deciding factor in your uni choice. Go where\'s right for your future.';
  } else if (val >= 5) {
    msg.innerHTML = '<i class="bi bi-heart-half me-2"></i><strong>Moderate confidence.</strong> It\'s worth having an honest conversation with your partner about what distance would mean for you both. That conversation might give you more clarity than any guide can.';
  } else {
    msg.innerHTML = '<i class="bi bi-question-circle me-2"></i><strong>Lower confidence.</strong> That\'s honest. But remember — staying local doesn\'t guarantee the relationship survives. It\'s worth asking whether you\'d be making a major life decision to protect something that may not be certain anyway.';
  }
}

/* ── STEP 8: STAR RATINGS ───────────────────────────────────────────────── */
function initStarRatings() {
  document.querySelectorAll('.star-rating').forEach(container => {
    const target = container.dataset.target;
    const stars = container.querySelectorAll('i');

    stars.forEach(star => {
      star.addEventListener('mouseover', () => {
        const val = parseInt(star.dataset.val);
        highlightStars(container, val);
      });
      star.addEventListener('mouseout', () => {
        highlightStars(container, state.ratings[target] || 0);
      });
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.val);
        state.ratings[target] = val;
        highlightStars(container, val);
        updateRatingResult();
      });
    });
  });
}

function highlightStars(container, val) {
  container.querySelectorAll('i').forEach(s => {
    const sv = parseInt(s.dataset.val);
    s.className = sv <= val ? 'bi bi-star-fill lit' : 'bi bi-star';
  });
}

function updateRatingResult() {
  const o = state.ratings.original;
  const l = state.ratings.local;
  if (!o && !l) return;

  const result = document.getElementById('rating-result');
  result.classList.remove('d-none');

  if (o > l) {
    result.innerHTML = `<i class="bi bi-send-fill me-2"></i><strong>You've rated your original uni higher (${o} vs ${l} stars).</strong> That's a meaningful signal — even after thinking through all the factors, it still comes out on top.`;
  } else if (l > o) {
    result.innerHTML = `<i class="bi bi-house-heart-fill me-2"></i><strong>You've rated the local uni higher (${l} vs ${o} stars).</strong> That's worth sitting with. Is it because it genuinely suits you better, or because it feels safer right now?`;
  } else if (o && l) {
    result.innerHTML = `<i class="bi bi-yin-yang me-2"></i><strong>You've rated them equally (${o} stars each).</strong> They're genuinely close for you. The final steps may help you find the deciding factor.`;
  }
}

/* ── STEP 9: FEAR CHECK ─────────────────────────────────────────────────── */
function updateFearCheck() {
  const val = document.querySelector('input[name="fear-check"]:checked')?.value;
  if (!val) return;

  const resp = document.getElementById('fear-response');
  resp.classList.remove('d-none');

  const messages = {
    genuine: '✅ <strong>That\'s a solid foundation for a decision.</strong> If the local uni genuinely fits your goals, your course, your future — then it\'s a legitimate choice. Just make sure you can articulate <em>why</em> it\'s better, not just why it feels easier.',
    mixed: '🤔 <strong>Mixed feelings are honest.</strong> Most big decisions feel this way. The question is which part of the mix is louder — and whether the fear part is making the call. Try to separate the two and see what\'s left.',
    fear: '⚠️ <strong>That\'s a really important thing to recognise.</strong> Choosing a uni out of fear — of results, of distance, of change — is a choice you might regret when the fear fades. Fear is a feeling, not a plan. Your future deserves better than a fear-based decision.',
  };
  resp.innerHTML = `<i class="bi bi-lightbulb-fill me-2"></i>${messages[val]}`;
}

/* ── STEP ANIMATIONS ────────────────────────────────────────────────────── */
function triggerStepAnimations(n) {
  if (n === 7) {
    const cards = document.querySelectorAll('.truth-card');
    cards.forEach((c, i) => {
      setTimeout(() => c.classList.add('visible'), 150 * (i + 1));
    });
  }
  if (n === 9) {
    const cards = document.querySelectorAll('.scenario-card');
    cards.forEach((c, i) => {
      setTimeout(() => c.classList.add('visible'), 200 * (i + 1));
    });
  }
  if (n === 10) {
    const items = document.querySelectorAll('.own-item');
    items.forEach((item, i) => {
      setTimeout(() => item.classList.add('visible'), 120 * (i + 1));
    });
  }
}

/* ── SUMMARY ────────────────────────────────────────────────────────────── */
function showSummary() {
  const body = document.getElementById('summary-body');
  body.innerHTML = buildSummaryHTML();
  const modal = new bootstrap.Modal(document.getElementById('summaryModal'));
  modal.show();
}

function buildSummaryHTML() {
  const sections = [];

  // Step 1 — original reasons
  const s1Checked = [...document.querySelectorAll('input[name="s1"]:checked')].map(cb => {
    const labels = {
      course: 'The course', campus: 'Campus & city', opportunities: 'Career opportunities',
      environment: 'Social environment', independence: 'Living independently', future: 'The future I imagined'
    };
    return labels[cb.value] || cb.value;
  });
  const note1 = document.getElementById('note-1')?.value?.trim();
  sections.push(summarySection('01 — Original Reasons', s1Checked, note1));

  // Step 2 — new factors
  const s2Checked = [...document.querySelectorAll('input[name="s2"]:checked')].map(cb => {
    const labels = {
      'exam-worry': 'Worried about exam results', relationship: 'Wanting to stay close to someone',
      'fomo-rel': 'Fear of missing out on relationship', 'fear-distance': 'Fear of distance',
      'fear-change': 'Fear of change', 'fear-loss': 'Fear of losing something good',
      'results-pressure': 'Pressure from results day'
    };
    return labels[cb.value] || cb.value;
  });
  const note2 = document.getElementById('note-2')?.value?.trim();
  sections.push(summarySection('02 — New Factors', s2Checked, note2));

  // Step 3 — exam results
  const note3 = document.getElementById('note-3')?.value?.trim();
  sections.push(summarySection('03 — Exam Results Reflection', [], note3));

  // Step 4 — clean slate choice
  const choiceLabels = { original: 'Original uni', local: 'Local uni', unsure: 'Still unsure' };
  const note4 = document.getElementById('note-4')?.value?.trim();
  const choiceText = state.choice4 ? `Clean-slate choice: <strong>${choiceLabels[state.choice4]}</strong>` : '';
  sections.push(summarySection('04 — Clean Slate Choice', [], note4, choiceText));

  // Step 5 — future self
  const note5 = document.getElementById('note-5')?.value?.trim();
  sections.push(summarySection('05 — Future Self', [], note5));

  // Step 6 — short vs long term
  const shortTerm = document.querySelector('input[name="short-term"]:checked')?.value;
  const longTerm  = document.querySelector('input[name="long-term"]:checked')?.value;
  const optLater  = document.querySelector('input[name="options-later"]:checked')?.value;
  const regret    = document.querySelector('input[name="regret"]:checked')?.value;
  const note6 = document.getElementById('note-6')?.value?.trim();
  const s6extras = [];
  if (shortTerm) s6extras.push(`Feels easier now: <strong>${shortTerm}</strong>`);
  if (longTerm)  s6extras.push(`Better long-term: <strong>${longTerm}</strong>`);
  if (optLater)  s6extras.push(`More options later: <strong>${optLater}</strong>`);
  if (regret)    s6extras.push(`Might regret: <strong>${regret}</strong>`);
  sections.push(summarySection('06 — Short vs Long Term', [], note6, s6extras.join(' &nbsp;|&nbsp; ')));

  // Step 7 — relationship
  const relConf = document.getElementById('rel-confidence')?.value;
  const note7 = document.getElementById('note-7')?.value?.trim();
  const relText = relConf ? `Relationship confidence: <strong>${relConf} / 10</strong>` : '';
  sections.push(summarySection('07 — Relationship', [], note7, relText));

  // Step 8 — comparison + ratings
  const note8 = '';
  const ratingText = (state.ratings.original || state.ratings.local)
    ? `Original uni: <strong>${'★'.repeat(state.ratings.original)}${'☆'.repeat(5 - state.ratings.original)}</strong> &nbsp;|&nbsp; Local uni: <strong>${'★'.repeat(state.ratings.local)}${'☆'.repeat(5 - state.ratings.local)}</strong>`
    : '';
  sections.push(summarySection('08 — Comparison Ratings', [], note8, ratingText));

  // Step 9 — final question
  const fearVal = document.querySelector('input[name="fear-check"]:checked')?.value;
  const fearLabels = { genuine: 'Genuine preference', mixed: 'Mixed — not entirely sure', fear: 'Mainly fear' };
  const note9 = document.getElementById('note-9')?.value?.trim();
  const fearText = fearVal ? `Motivation: <strong>${fearLabels[fearVal]}</strong>` : '';
  sections.push(summarySection('09 — Fear Check', [], note9, fearText));

  // Step 10 — decision
  const note10 = document.getElementById('note-10')?.value?.trim();
  sections.push(summarySection('10 — My Decision', [], note10));

  return sections.join('');
}

function summarySection(title, chips, note, extra) {
  let html = `<div class="summary-section">`;
  html += `<h6>${title}</h6>`;
  if (chips && chips.length) {
    html += `<div class="summary-chips mb-2">${chips.map(c => `<span class="summary-chip">${c}</span>`).join('')}</div>`;
  }
  if (extra) {
    html += `<p class="mb-2 small text-muted">${extra}</p>`;
  }
  if (note) {
    html += `<p>${escapeHtml(note)}</p>`;
  }
  if (!chips?.length && !extra && !note) {
    html += `<p class="text-muted fst-italic small">No notes added for this step.</p>`;
  }
  html += `</div>`;
  return html;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ── PRINT ──────────────────────────────────────────────────────────────── */
function printSummary() {
  window.print();
}
