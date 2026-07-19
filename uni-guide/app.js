/* ── STATE ──────────────────────────────────────────────────────────────── */
const state = {
  currentStep: 0,
  totalSteps: 10,
  ratings: { original: 0, local: 0 },
  choice4: null,
};

const STORAGE_KEY = 'uni-guide-state';

/* ── PERSISTENCE ─────────────────────────────────────────────────────────── */
function saveState() {
  const data = {
    // Checkboxes: step 1
    s1: [...document.querySelectorAll('input[name="s1"]:checked')].map(cb => cb.value),
    // Checkboxes: step 2
    s2: [...document.querySelectorAll('input[name="s2"]:checked')].map(cb => cb.value),
    // Textareas
    note1: document.getElementById('note-1')?.value || '',
    note2: document.getElementById('note-2')?.value || '',
    note3: document.getElementById('note-3')?.value || '',
    note4: document.getElementById('note-4')?.value || '',
    note5: document.getElementById('note-5')?.value || '',
    note6: document.getElementById('note-6')?.value || '',
    note7: document.getElementById('note-7')?.value || '',
    note9: document.getElementById('note-9')?.value || '',
    note10: document.getElementById('note-10')?.value || '',
    // Step 3 accordion textareas
    q3a: document.querySelector('#q3a textarea')?.value || '',
    q3b: document.querySelector('#q3b textarea')?.value || '',
    q3c: document.querySelector('#q3c textarea')?.value || '',
    q3d: document.querySelector('#q3d textarea')?.value || '',
    // Step 4 choice
    choice4: state.choice4,
    // Step 5 sliders
    fs_confidence: document.getElementById('fs-confidence')?.value || 5,
    fs_independence: document.getElementById('fs-independence')?.value || 5,
    fs_opportunities: document.getElementById('fs-opportunities')?.value || 5,
    fs_freedom: document.getElementById('fs-freedom')?.value || 5,
    // Step 6 radio buttons
    short_term: document.querySelector('input[name="short-term"]:checked')?.value || '',
    long_term: document.querySelector('input[name="long-term"]:checked')?.value || '',
    options_later: document.querySelector('input[name="options-later"]:checked')?.value || '',
    regret: document.querySelector('input[name="regret"]:checked')?.value || '',
    // Step 7 relationship slider
    rel_confidence: document.getElementById('rel-confidence')?.value || 5,
    // Step 8 comparison table
    c_orig_opp: document.getElementById('c-orig-opp')?.value || '',
    c_loc_opp: document.getElementById('c-loc-opp')?.value || '',
    c_orig_ind: document.getElementById('c-orig-ind')?.value || '',
    c_loc_ind: document.getElementById('c-loc-ind')?.value || '',
    c_orig_grow: document.getElementById('c-orig-grow')?.value || '',
    c_loc_grow: document.getElementById('c-loc-grow')?.value || '',
    c_orig_lt: document.getElementById('c-orig-lt')?.value || '',
    c_loc_lt: document.getElementById('c-loc-lt')?.value || '',
    c_orig_com: document.getElementById('c-orig-com')?.value || '',
    c_loc_com: document.getElementById('c-loc-com')?.value || '',
    c_orig_goal: document.getElementById('c-orig-goal')?.value || '',
    c_loc_goal: document.getElementById('c-loc-goal')?.value || '',
    // Step 8 star ratings
    rating_original: state.ratings.original || 0,
    rating_local: state.ratings.local || 0,
    // Step 9 fear check
    fear_check: document.querySelector('input[name="fear-check"]:checked')?.value || '',
    // Current step
    currentStep: state.currentStep,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    // Silently fail if localStorage is unavailable
  }
}

function restoreState() {
  let data;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    data = JSON.parse(raw);
  } catch (e) {
    return;
  }

  // Restore checkboxes: step 1
  if (data.s1) {
    data.s1.forEach(val => {
      const cb = document.querySelector(`input[name="s1"][value="${val}"]`);
      if (cb) {
        cb.checked = true;
        cb.closest('.check-item')?.classList.add('checked');
      }
    });
  }

  // Restore checkboxes: step 2
  if (data.s2) {
    data.s2.forEach(val => {
      const cb = document.querySelector(`input[name="s2"][value="${val}"]`);
      if (cb) {
        cb.checked = true;
        cb.closest('.check-item')?.classList.add('checked');
      }
    });
  }

  // Restore textareas
  const textareaMap = {
    note1: 'note-1', note2: 'note-2', note3: 'note-3', note4: 'note-4',
    note5: 'note-5', note6: 'note-6', note7: 'note-7', note9: 'note-9', note10: 'note-10',
  };
  Object.entries(textareaMap).forEach(([key, id]) => {
    if (data[key]) {
      const el = document.getElementById(id);
      if (el) el.value = data[key];
    }
  });

  // Restore step 3 accordion textareas
  if (data.q3a) {
    const ta = document.querySelector('#q3a textarea');
    if (ta) ta.value = data.q3a;
  }
  if (data.q3b) {
    const ta = document.querySelector('#q3b textarea');
    if (ta) ta.value = data.q3b;
  }
  if (data.q3c) {
    const ta = document.querySelector('#q3c textarea');
    if (ta) ta.value = data.q3c;
  }
  if (data.q3d) {
    const ta = document.querySelector('#q3d textarea');
    if (ta) ta.value = data.q3d;
  }

  // Restore step 4 choice
  if (data.choice4) {
    state.choice4 = data.choice4;
    const btn = document.getElementById('choice-' + data.choice4);
    if (btn) btn.classList.add('selected-' + data.choice4);
    const resp = document.getElementById('choice-response');
    if (resp) {
      resp.classList.remove('d-none');
      const messages = {
        original: '✨ That\'s a strong signal. When you remove the noise — the worry, the pressure — your instinct points to your original choice. That instinct is worth listening to.',
        local: '🏠 That\'s honest. It might mean the alternative option genuinely suits you better — or it might mean the comfort of familiarity is pulling hard. Either way, it\'s worth exploring why.',
        unsure: '🤔 That\'s completely okay. Uncertainty is normal. Keep going through this guide — the comparison and reflection steps ahead may help things become clearer.',
      };
      resp.innerHTML = `<i class="bi bi-lightbulb-fill me-2"></i>${messages[data.choice4]}`;
    }
  }

  // Restore step 5 sliders
  const sliderMap = {
    fs_confidence: 'fs-confidence',
    fs_independence: 'fs-independence',
    fs_opportunities: 'fs-opportunities',
    fs_freedom: 'fs-freedom',
  };
  Object.entries(sliderMap).forEach(([key, id]) => {
    if (data[key]) {
      const el = document.getElementById(id);
      if (el) {
        el.value = data[key];
        // Derive key name for updateSlider
        const sliderKey = id.replace('fs-', '');
        updateSlider(sliderKey);
      }
    }
  });

  // Restore step 6 radio buttons
  const radioMap = {
    short_term: 'short-term',
    long_term: 'long-term',
    options_later: 'options-later',
    regret: 'regret',
  };
  Object.entries(radioMap).forEach(([key, name]) => {
    if (data[key]) {
      const rb = document.querySelector(`input[name="${name}"][value="${data[key]}"]`);
      if (rb) rb.checked = true;
    }
  });

  // Restore step 7 relationship slider
  if (data.rel_confidence) {
    const el = document.getElementById('rel-confidence');
    if (el) {
      el.value = data.rel_confidence;
      updateRelConfidence();
    }
  }

  // Restore step 8 comparison table
  const compMap = {
    c_orig_opp: 'c-orig-opp', c_loc_opp: 'c-loc-opp',
    c_orig_ind: 'c-orig-ind', c_loc_ind: 'c-loc-ind',
    c_orig_grow: 'c-orig-grow', c_loc_grow: 'c-loc-grow',
    c_orig_lt: 'c-orig-lt', c_loc_lt: 'c-loc-lt',
    c_orig_com: 'c-orig-com', c_loc_com: 'c-loc-com',
    c_orig_goal: 'c-orig-goal', c_loc_goal: 'c-loc-goal',
  };
  Object.entries(compMap).forEach(([key, id]) => {
    if (data[key]) {
      const el = document.getElementById(id);
      if (el) el.value = data[key];
    }
  });

  // Restore step 8 star ratings
  if (data.rating_original) {
    state.ratings.original = parseInt(data.rating_original);
    const container = document.getElementById('stars-original');
    if (container) highlightStars(container, state.ratings.original);
  }
  if (data.rating_local) {
    state.ratings.local = parseInt(data.rating_local);
    const container = document.getElementById('stars-local');
    if (container) highlightStars(container, state.ratings.local);
  }
  if (data.rating_original || data.rating_local) {
    updateRatingResult();
  }

  // Restore step 9 fear check
  if (data.fear_check) {
    const rb = document.querySelector(`input[name="fear-check"][value="${data.fear_check}"]`);
    if (rb) {
      rb.checked = true;
      updateFearCheck();
    }
  }

  // Restore current step (but don't auto-navigate — user will click "Start the Guide")
  if (data.currentStep && data.currentStep > 0) {
    state.currentStep = data.currentStep;
  }
}

function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Silently fail
  }
  // Reset state
  state.ratings = { original: 0, local: 0 };
  state.choice4 = null;
  state.currentStep = 0;
  // Reload the page to reset all UI
  location.reload();
}

/* ── AUTO-SAVE ON INPUT ──────────────────────────────────────────────────── */
function setupAutoSave() {
  // Save on checkbox changes (delegated)
  document.addEventListener('change', (e) => {
    if (e.target.matches('input[type="checkbox"][name^="s"]') ||
        e.target.matches('input[type="radio"]') ||
        e.target.matches('input[type="range"]')) {
      saveState();
    }
  });

  // Save on textarea input (debounced)
  let saveTimer;
  document.addEventListener('input', (e) => {
    if (e.target.matches('textarea') || e.target.matches('.comp-input')) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(saveState, 300);
    }
  });

  // Save on star clicks (delegated)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.star-rating') || e.target.closest('.choice-btn')) {
      // Save after a tiny delay to let state update first
      setTimeout(saveState, 50);
    }
  });
}

/* ── INIT ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCheckItems();
  initStarRatings();
  updateRelConfidence();
  restoreState();
  setupAutoSave();
});

/* ── START GUIDE ────────────────────────────────────────────────────────── */
function startGuide() {
  document.getElementById('hero').classList.add('d-none');
  document.getElementById('progress-bar-wrap').classList.remove('d-none');
  document.getElementById('steps-container').classList.remove('d-none');
  goToStep(state.currentStep > 0 ? state.currentStep : 1);
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
    saveState();
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
    item.addEventListener('click', (e) => {
      e.preventDefault();
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
    local: '🏠 That\'s honest. It might mean the alternative option genuinely suits you better — or it might mean the comfort of familiarity is pulling hard. Either way, it\'s worth exploring why.',
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
  if (val <= 3)      text = 'Leans alternative option';
  else if (val <= 4) text = 'Slightly alternative';
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
    summary.innerHTML = '<i class="bi bi-house-heart-fill me-2"></i><strong>Your future self seems to lean towards the alternative option</strong> — you\'ve rated it higher across most dimensions. Is that a genuine preference or a comfort pull?';
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
    result.innerHTML = `<i class="bi bi-house-heart-fill me-2"></i><strong>You've rated the alternative option higher (${l} vs ${o} stars).</strong> That's worth sitting with. Is it because it genuinely suits you better, or because it feels safer right now?`;
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
    genuine: '✅ <strong>That\'s a solid foundation for a decision.</strong> If the alternative option genuinely fits your goals, your course, your future — then it\'s a legitimate choice. Just make sure you can articulate <em>why</em> it\'s better, not just why it feels easier.',
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
  const choiceLabels = { original: 'Original uni', local: 'Alternative option', unsure: 'Still unsure' };
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
    ? `Original uni: <strong>${'★'.repeat(state.ratings.original)}${'☆'.repeat(5 - state.ratings.original)}</strong> &nbsp;|&nbsp; Alternative option: <strong>${'★'.repeat(state.ratings.local)}${'☆'.repeat(5 - state.ratings.local)}</strong>`
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
  return str.replace(/&/g,'&').replace(/</g,'<').replace(/>/g,'>');
}

/* ── PRINT ──────────────────────────────────────────────────────────────── */
function printSummary() {
  window.print();
}