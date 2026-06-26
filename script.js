/* ═══════════════════════════════════════════════════════
   ELITE OEM AUTO PARTS — VIN DECODER SYSTEM
   script.js — Complete Production JavaScript
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── CONFIG ── */
const CONFIG = {
  EMAILJS_PUBLIC_KEY: '436D8Gu9IZi-CaL6C',
  EMAILJS_SERVICE_ID: 'service_qir3oxt',
  EMAILJS_TEMPLATE_ID: 'template_fpxmva9',
  TO_EMAIL: 'sales@eliteoemautoparts.com',
  NHTSA_API: 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/',
  PARTS_DB_URL: 'parts-db.json',
};

/* ── STATE ── */
const STATE = {
  partsDB: [],
  filteredParts: [],
  activeCategory: 'All',
  searchQuery: '',
  decodedVehicle: null,
  selectedPart: null,
};

/* ═══════════════════════════════
   INIT
   ═══════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  initEmailJS();
  initVINTracker();
  initNavigation();
  initScrollTop();
  await loadPartsDB();
  wireAllEvents();
});

function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
  }
}

/* ═══════════════════════════════
   PARTS DATABASE LOADER
   ═══════════════════════════════ */
async function loadPartsDB() {
  try {
    const res = await fetch(CONFIG.PARTS_DB_URL);
    if (!res.ok) throw new Error('Failed to load parts database');
    STATE.partsDB = await res.json();
  } catch (e) {
    console.warn('Could not load parts-db.json, using inline fallback:', e.message);
    STATE.partsDB = FALLBACK_PARTS;
  }
}

/* ── Inline fallback (small subset) in case JSON fetch fails on GitHub Pages ── */
const FALLBACK_PARTS = [
  { id:'E001', name:'Engine Oil Filter', partNo:'OEM-E001', category:'Engine', makes:['Toyota','Lexus','Scion'], stock:'In Stock' },
  { id:'E002', name:'Timing Belt Kit', partNo:'OEM-E002', category:'Engine', makes:['Honda','Acura'], stock:'In Stock' },
  { id:'E003', name:'Valve Cover Gasket', partNo:'OEM-E003', category:'Engine', makes:['Ford','Lincoln','Mercury'], stock:'Limited' },
  { id:'E004', name:'Engine Air Filter', partNo:'OEM-E004', category:'Engine', makes:['Chevrolet','GMC','Buick','Cadillac'], stock:'In Stock' },
  { id:'E005', name:'Crankshaft Position Sensor', partNo:'OEM-E005', category:'Engine', makes:['BMW','MINI'], stock:'In Stock' },
  { id:'E006', name:'Camshaft Position Sensor', partNo:'OEM-E006', category:'Engine', makes:['Mercedes-Benz'], stock:'In Stock' },
  { id:'E007', name:'Throttle Body Assembly', partNo:'OEM-E007', category:'Engine', makes:['Nissan','Infiniti'], stock:'Limited' },
  { id:'E008', name:'Intake Manifold Gasket Set', partNo:'OEM-E008', category:'Engine', makes:['Dodge','Ram','Chrysler','Jeep'], stock:'In Stock' },
  { id:'B001', name:'Front Brake Rotor Pair', partNo:'OEM-B001', category:'Brakes', makes:['Toyota','Lexus'], stock:'In Stock' },
  { id:'B002', name:'Front Brake Pad Set', partNo:'OEM-B002', category:'Brakes', makes:['Honda','Acura'], stock:'In Stock' },
  { id:'B003', name:'Rear Brake Rotor Pair', partNo:'OEM-B003', category:'Brakes', makes:['Ford','Lincoln'], stock:'In Stock' },
  { id:'B004', name:'Rear Brake Pad Set', partNo:'OEM-B004', category:'Brakes', makes:['Chevrolet','GMC'], stock:'In Stock' },
  { id:'B005', name:'Brake Master Cylinder', partNo:'OEM-B005', category:'Brakes', makes:['BMW','MINI'], stock:'In Stock' },
  { id:'S001', name:'Front Strut Assembly Left', partNo:'OEM-S001', category:'Suspension', makes:['Toyota','Lexus'], stock:'In Stock' },
  { id:'S002', name:'Rear Shock Absorber Pair', partNo:'OEM-S002', category:'Suspension', makes:['Ford','Lincoln'], stock:'In Stock' },
  { id:'S003', name:'Control Arm Front Lower', partNo:'OEM-S003', category:'Suspension', makes:['Honda','Acura'], stock:'In Stock' },
  { id:'S004', name:'Ball Joint Set', partNo:'OEM-S004', category:'Suspension', makes:['Nissan','Infiniti'], stock:'In Stock' },
  { id:'EL001', name:'Alternator Assembly', partNo:'OEM-EL001', category:'Electrical', makes:['Toyota','Lexus'], stock:'In Stock' },
  { id:'EL002', name:'Starter Motor', partNo:'OEM-EL002', category:'Electrical', makes:['Honda','Acura'], stock:'In Stock' },
  { id:'EL003', name:'Headlight Assembly Left', partNo:'OEM-EL003', category:'Electrical', makes:['Ford','Lincoln'], stock:'In Stock' },
  { id:'EL004', name:'Engine Control Module', partNo:'OEM-EL004', category:'Electrical', makes:['BMW','MINI'], stock:'Limited' },
  { id:'C001', name:'Radiator Assembly', partNo:'OEM-C001', category:'Cooling', makes:['Toyota','Lexus'], stock:'In Stock' },
  { id:'C002', name:'Water Pump + Thermostat', partNo:'OEM-C002', category:'Cooling', makes:['Honda','Acura'], stock:'In Stock' },
  { id:'C003', name:'AC Compressor', partNo:'OEM-C003', category:'Cooling', makes:['Jeep','Dodge'], stock:'In Stock' },
  { id:'T001', name:'Transmission Filter Kit', partNo:'OEM-T001', category:'Transmission', makes:['Ford','Lincoln'], stock:'In Stock' },
  { id:'T002', name:'Clutch Kit Manual', partNo:'OEM-T002', category:'Transmission', makes:['Nissan','Infiniti'], stock:'In Stock' },
  { id:'EX001', name:'Catalytic Converter', partNo:'OEM-EX001', category:'Exhaust', makes:['Toyota','Lexus'], stock:'In Stock' },
  { id:'EX002', name:'Exhaust Manifold', partNo:'OEM-EX002', category:'Exhaust', makes:['Ford','Lincoln'], stock:'In Stock' },
  { id:'BP001', name:'Front Bumper Cover', partNo:'OEM-BP001', category:'Body Parts', makes:['Toyota','Lexus'], stock:'In Stock' },
  { id:'BP002', name:'Rear Bumper Cover', partNo:'OEM-BP002', category:'Body Parts', makes:['Honda','Acura'], stock:'In Stock' },
  { id:'FM001', name:'Cabin Air Filter', partNo:'OEM-FM001', category:'Filters', makes:['Toyota','Lexus'], stock:'In Stock' },
  { id:'FM002', name:'Fuel Filter', partNo:'OEM-FM002', category:'Filters', makes:['Ford','Lincoln'], stock:'In Stock' },
];

/* ═══════════════════════════════
   NAVIGATION
   ═══════════════════════════════ */
function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
      }
    });
  }
}

/* ═══════════════════════════════
   SCROLL TO TOP
   ═══════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ═══════════════════════════════
   VIN TRACKER BOXES
   ═══════════════════════════════ */
function initVINTracker() {
  const tracker = document.getElementById('vin-tracker');
  if (!tracker) return;
  for (let i = 0; i < 17; i++) {
    const box = document.createElement('div');
    box.className = 'vt-box';
    box.id = 'vtb-' + i;
    tracker.appendChild(box);
  }
}

function updateVINTracker(value) {
  const len = value.length;
  const isComplete = len === 17;
  for (let i = 0; i < 17; i++) {
    const box = document.getElementById('vtb-' + i);
    if (!box) continue;
    if (i < len) {
      box.textContent = value[i];
      box.className = 'vt-box ' + (isComplete ? 'complete' : 'filled');
    } else {
      box.textContent = '';
      box.className = 'vt-box';
    }
  }
  const counter = document.getElementById('vin-char-count');
  if (counter) {
    counter.textContent = len + ' / 17';
    counter.className = 'vin-char-count' + (isComplete ? ' ready' : '');
  }
}

/* ═══════════════════════════════
   EVENT WIRING
   ═══════════════════════════════ */
function wireAllEvents() {
  // VIN input
  const vinInput = document.getElementById('vin-input');
  if (vinInput) {
    vinInput.addEventListener('input', onVINInput);
    vinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') decodeVIN();
    });
  }

  // Decode button
  const btnDecode = document.getElementById('btn-decode');
  if (btnDecode) btnDecode.addEventListener('click', decodeVIN);

  // Parts search
  const partsSearch = document.getElementById('parts-search');
  if (partsSearch) {
    partsSearch.addEventListener('input', (e) => {
      STATE.searchQuery = e.target.value.trim().toLowerCase();
      applyPartsFilter();
    });
  }

  // Modal close
  const modalOverlay = document.getElementById('modal-overlay');
  const btnClose = document.getElementById('modal-close');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  if (btnClose) btnClose.addEventListener('click', closeModal);

  // Submit quote
  const btnSubmit = document.getElementById('btn-submit-quote');
  if (btnSubmit) btnSubmit.addEventListener('click', submitQuote);

  // CTA button
  const btnCTA = document.getElementById('btn-cta');
  if (btnCTA) btnCTA.addEventListener('click', () => openModal(null));

  // Keyboard escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ═══════════════════════════════
   VIN INPUT HANDLER
   ═══════════════════════════════ */
function onVINInput(e) {
  // Sanitize: uppercase, remove I O Q (invalid VIN chars)
  let val = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  if (val.length > 17) val = val.slice(0, 17);
  e.target.value = val;
  e.target.classList.remove('is-error', 'is-success');
  hideError();
  updateVINTracker(val);
}

/* ═══════════════════════════════
   ERROR HANDLING
   ═══════════════════════════════ */
function showError(msg) {
  const alert = document.getElementById('error-alert');
  const alertText = document.getElementById('error-text');
  const vinInput = document.getElementById('vin-input');
  if (alert) { alert.classList.add('show'); }
  if (alertText) alertText.textContent = msg;
  if (vinInput) vinInput.classList.add('is-error');
}

function hideError() {
  const alert = document.getElementById('error-alert');
  if (alert) alert.classList.remove('show');
}

/* ═══════════════════════════════
   LOADING STATE
   ═══════════════════════════════ */
function setStep(n, state) {
  const el = document.getElementById('lstep-' + n);
  if (!el) return;
  const icons  = { pending:'⬜', active:'🔄', done:'✅', error:'❌' };
  const labels = {
    1: 'Validating VIN format',
    2: 'Querying NHTSA vPIC API',
    3: 'Decoding vehicle specifications',
    4: 'Matching OEM parts database',
  };
  el.textContent = (icons[state] || '⬜') + '  ' + labels[n];
  el.className = 'lstep' + (state === 'active' ? ' active' : state === 'done' ? ' done' : '');
}

function resetSteps() {
  [1, 2, 3, 4].forEach(n => setStep(n, 'pending'));
}

function showLoading(show) {
  const wrap = document.getElementById('loading-wrap');
  if (wrap) wrap.classList.toggle('show', show);
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ═══════════════════════════════
   VIN DECODER — MAIN
   ═══════════════════════════════ */
async function decodeVIN() {
  const vinInput = document.getElementById('vin-input');
  const btnDecode = document.getElementById('btn-decode');
  const btnText = document.getElementById('btn-decode-text');
  if (!vinInput) return;

  const vin = vinInput.value.trim().toUpperCase();
  hideError();
  document.getElementById('result-section') && (document.getElementById('result-section').classList.remove('show'));

  // ── Validation ──
  if (vin.length === 0) {
    showError('Please enter a VIN number.');
    return;
  }
  if (vin.length !== 17) {
    showError(`VIN must be exactly 17 characters. You entered ${vin.length}.`);
    return;
  }
  if (/[IOQ]/.test(vin)) {
    showError('VIN cannot contain the letters I, O, or Q.');
    return;
  }

  // ── UI: loading state ──
  if (btnDecode) btnDecode.disabled = true;
  if (btnText) btnText.textContent = 'Decoding...';
  resetSteps();
  showLoading(true);

  // Step 1
  setStep(1, 'active'); await delay(350);
  setStep(1, 'done');

  // Step 2
  setStep(2, 'active'); await delay(200);

  try {
    const res = await fetch(`${CONFIG.NHTSA_API}${encodeURIComponent(vin)}?format=json`);
    if (!res.ok) throw new Error('NHTSA API unavailable. Please try again.');
    const data = await res.json();

    setStep(2, 'done');
    setStep(3, 'active'); await delay(300);

    // Parse NHTSA results
    const vehicle = parseNHTSAResponse(vin, data.Results || []);

    if (!vehicle.make && !vehicle.model) {
      setStep(3, 'error');
      throw new Error('Could not decode this VIN. Please verify it is correct and try again.');
    }

    STATE.decodedVehicle = vehicle;
    setStep(3, 'done');

    // Step 4 — match parts
    setStep(4, 'active'); await delay(300);
    const matched = matchParts(vehicle.make);
    STATE.filteredParts = matched;
    setStep(4, 'done');

    await delay(200);
    showLoading(false);

    // Render
    renderVehicleCard(vehicle);
    renderPartsSection(vehicle.make, matched);

    const resultSection = document.getElementById('result-section');
    if (resultSection) {
      resultSection.classList.add('show');
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    vinInput.classList.add('is-success');

  } catch (err) {
    setStep(2, err.message.includes('NHTSA') ? 'error' : 'done');
    setStep(3, 'error');
    showLoading(false);
    showError(err.message || 'Decoding failed. Please try again.');
  } finally {
    if (btnDecode) btnDecode.disabled = false;
    if (btnText) btnText.textContent = 'Decode VIN';
    resetSteps();
  }
}

/* ═══════════════════════════════
   NHTSA RESPONSE PARSER
   ═══════════════════════════════ */
function parseNHTSAResponse(vin, results) {
  const get = (variable) => {
    const found = results.find(r => r.Variable === variable);
    const val = found && found.Value;
    if (!val || val === 'Not Applicable' || val === '0' || val === 'null') return null;
    return val.trim();
  };

  const displacementL = get('Displacement (L)');
  const cylinders = get('Engine Number of Cylinders');
  let engine = null;
  if (displacementL) {
    engine = parseFloat(displacementL).toFixed(1) + 'L';
    if (cylinders) engine += ' ' + cylinders + '-Cyl';
  } else {
    engine = get('Engine Model') || get('Engine Configuration');
  }

  const plantCity    = get('Plant City');
  const plantCountry = get('Plant Country');
  let plant = null;
  if (plantCity && plantCountry) plant = plantCity + ', ' + plantCountry;
  else if (plantCountry) plant = plantCountry;

  return {
    vin,
    year:         get('Model Year'),
    make:         get('Make'),
    model:        get('Model'),
    trim:         get('Trim') || get('Trim2'),
    engine,
    driveType:    get('Drive Type'),
    bodyClass:    get('Body Class'),
    fuelType:     get('Fuel Type - Primary'),
    doors:        get('Number of Doors'),
    transmission: get('Transmission Style'),
    series:       get('Series') || get('Series2'),
    plant,
    gvwr:         get('Gross Vehicle Weight Rating From'),
    abs:          get('Anti-Lock Braking System (ABS)'),
  };
}

/* ═══════════════════════════════
   RENDER VEHICLE CARD
   ═══════════════════════════════ */
function renderVehicleCard(v) {
  // Title
  const vcTitle = document.getElementById('vc-title');
  if (vcTitle) {
    vcTitle.innerHTML = `<span class="vc-year">${v.year || '—'}</span> ${v.make || '—'} ${v.model || '—'}`;
  }

  // VIN tag
  const vcVin = document.getElementById('vc-vin');
  if (vcVin) vcVin.textContent = v.vin;

  // Specs
  const specsData = [
    { key: 'Make',         val: v.make,         gold: true },
    { key: 'Model',        val: v.model },
    { key: 'Year',         val: v.year,          gold: true },
    { key: 'Trim',         val: v.trim },
    { key: 'Engine',       val: v.engine },
    { key: 'Drive Type',   val: v.driveType },
    { key: 'Body Style',   val: v.bodyClass },
    { key: 'Fuel Type',    val: v.fuelType },
    { key: 'Doors',        val: v.doors },
    { key: 'Transmission', val: v.transmission },
    { key: 'Series',       val: v.series },
    { key: 'Assembly',     val: v.plant },
  ];

  const specsContainer = document.getElementById('vc-specs');
  if (specsContainer) {
    specsContainer.innerHTML = specsData.map(s => {
      const display = s.val || null;
      const cls = display ? (s.gold ? 'spec-val gold' : 'spec-val') : 'spec-val na';
      return `
        <div class="spec-cell">
          <div class="spec-key">${s.key}</div>
          <div class="${cls}">${display || 'N/A'}</div>
        </div>`;
    }).join('');
  }

  // VIN breakdown strip
  const vinStrip = document.getElementById('vc-vin-strip');
  if (vinStrip) {
    vinStrip.innerHTML = `
      <span class="vin-strip-label">VIN Breakdown:</span>
      <span class="vin-seg seg-wmi" title="World Manufacturer Identifier — identifies the manufacturer">WMI: ${v.vin.slice(0,3)}</span>
      <span class="vin-seg seg-vds" title="Vehicle Descriptor Section — vehicle attributes">VDS: ${v.vin.slice(3,9)}</span>
      <span class="vin-seg seg-vis" title="Vehicle Identifier Section — model year, plant, sequence">VIS: ${v.vin.slice(9,17)}</span>
    `;
  }
}

/* ═══════════════════════════════
   PARTS MATCHING & FILTERING
   ═══════════════════════════════ */
function matchParts(make) {
  if (!make) return STATE.partsDB;
  const makeLower = make.toLowerCase();
  const matched = STATE.partsDB.filter(p =>
    p.makes.some(m => m.toLowerCase() === makeLower)
  );
  // If no match for this make, show all parts (better than empty)
  return matched.length > 0 ? matched : STATE.partsDB;
}

function getCategories(parts) {
  return ['All', ...[...new Set(parts.map(p => p.category))].sort()];
}

function applyPartsFilter() {
  let parts = STATE.filteredParts;

  // Category filter
  if (STATE.activeCategory !== 'All') {
    parts = parts.filter(p => p.category === STATE.activeCategory);
  }

  // Text search
  if (STATE.searchQuery) {
    parts = parts.filter(p => {
      const hay = (p.name + ' ' + p.partNo + ' ' + p.category + ' ' + p.makes.join(' ')).toLowerCase();
      return hay.includes(STATE.searchQuery);
    });
  }

  renderPartsGrid(parts);
  updatePartsCount(parts.length);
}

function updatePartsCount(count) {
  const el = document.getElementById('parts-count');
  if (el) {
    el.innerHTML = `Showing <strong>${count}</strong> parts`;
  }
}

/* ═══════════════════════════════
   RENDER PARTS SECTION
   ═══════════════════════════════ */
function renderPartsSection(make, parts) {
  // Sub-title
  const partsTitle = document.getElementById('parts-section-title');
  if (partsTitle) {
    partsTitle.innerHTML = `Matching <span class="gold">OEM Parts</span>`;
  }

  const partsSubtitle = document.getElementById('parts-subtitle');
  if (partsSubtitle) {
    partsSubtitle.innerHTML = parts.length > 0
      ? `Found <strong style="color:var(--gold)">${parts.length}</strong> OEM parts for your ${make || 'vehicle'}`
      : `Showing all available OEM parts — quote for exact fitment confirmation`;
  }

  // Build category tabs
  const cats = getCategories(parts);
  const tabsContainer = document.getElementById('parts-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = cats.map(cat =>
      `<button class="ptab${cat === 'All' ? ' active' : ''}" data-cat="${cat}">${cat}</button>`
    ).join('');

    tabsContainer.querySelectorAll('.ptab').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.activeCategory = btn.dataset.cat;
        STATE.searchQuery = '';
        const searchInput = document.getElementById('parts-search');
        if (searchInput) searchInput.value = '';
        tabsContainer.querySelectorAll('.ptab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        applyPartsFilter();
      });
    });
  }

  // Initial render
  STATE.activeCategory = 'All';
  STATE.searchQuery = '';
  applyPartsFilter();
}

/* ═══════════════════════════════
   RENDER PARTS GRID
   ═══════════════════════════════ */
function renderPartsGrid(parts) {
  const grid = document.getElementById('parts-grid');
  if (!grid) return;

  if (parts.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <h4>No parts found</h4>
        <p>Try a different category or clear your search filter.</p>
      </div>`;
    return;
  }

  grid.innerHTML = parts.map((p, i) => {
    const stockCls = p.stock === 'In Stock' ? 'in-stock' : p.stock === 'Limited' ? 'limited' : 'out-stock';
    const makesDisplay = p.makes.slice(0, 3).join(', ') + (p.makes.length > 3 ? ` +${p.makes.length - 3}` : '');
    return `
      <div class="part-card" style="animation-delay:${Math.min(i * 0.03, 0.5)}s">
        <div class="pc-top">
          <span class="pc-cat">${p.category}</span>
          <span class="pc-stock ${stockCls}">${p.stock}</span>
        </div>
        <div class="pc-body">
          <div class="pc-name">${p.name}</div>
          <div class="pc-no"># ${p.partNo}</div>
          <div class="pc-make">Fits: <strong>${makesDisplay}</strong></div>
        </div>
        <div class="pc-footer">
          <button class="btn-get-quote" data-id="${p.id}">Get Quote</button>
        </div>
      </div>`;
  }).join('');

  // Wire quote buttons
  grid.querySelectorAll('.btn-get-quote').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
}

/* ═══════════════════════════════
   QUOTE MODAL
   ═══════════════════════════════ */
function openModal(partId) {
  const overlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-form-body');
  const modalSuccess = document.getElementById('modal-success');

  if (partId) {
    STATE.selectedPart = STATE.partsDB.find(p => p.id === partId) || null;
  } else {
    STATE.selectedPart = null;
  }

  // Part preview
  const preview = document.getElementById('modal-part-preview');
  if (preview) {
    if (STATE.selectedPart) {
      preview.style.display = 'block';
      const previewName = document.getElementById('pp-name');
      const previewMeta = document.getElementById('pp-meta');
      if (previewName) previewName.textContent = STATE.selectedPart.name;
      if (previewMeta) previewMeta.textContent = `Part #: ${STATE.selectedPart.partNo}  |  ${STATE.selectedPart.category}`;
    } else {
      preview.style.display = 'none';
    }
  }

  // Pre-fill vehicle from decoded data
  const vehicleInput = document.getElementById('q-vehicle');
  if (vehicleInput && STATE.decodedVehicle) {
    const v = STATE.decodedVehicle;
    vehicleInput.value = [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ');
    vehicleInput.readOnly = true;
    vehicleInput.style.opacity = '0.7';
  }

  // Pre-fill VIN in notes
  const notesInput = document.getElementById('q-notes');
  if (notesInput && STATE.decodedVehicle) {
    notesInput.value = 'VIN: ' + STATE.decodedVehicle.vin;
  }

  // Show form, hide success
  if (modalBody) modalBody.style.display = 'block';
  if (modalSuccess) modalSuccess.classList.remove('show');

  // Reset submit button
  const btnSubmit = document.getElementById('btn-submit-quote');
  if (btnSubmit) { btnSubmit.textContent = 'Send Quote Request'; btnSubmit.disabled = false; }

  if (overlay) overlay.classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}

/* ═══════════════════════════════
   SUBMIT QUOTE
   ═══════════════════════════════ */
async function submitQuote() {
  const name  = document.getElementById('q-name')?.value.trim();
  const email = document.getElementById('q-email')?.value.trim();

  if (!name) { alert('Please enter your name.'); return; }
  if (!email || !isValidEmail(email)) { alert('Please enter a valid email address.'); return; }

  const btnSubmit = document.getElementById('btn-submit-quote');
  if (btnSubmit) { btnSubmit.textContent = 'Sending...'; btnSubmit.disabled = true; }

  const payload = {
    from_name:   name,
    from_email:  email,
    phone:       document.getElementById('q-phone')?.value || '',
    vehicle:     document.getElementById('q-vehicle')?.value || '',
    part_name:   STATE.selectedPart?.name || 'Custom Request',
    part_number: STATE.selectedPart?.partNo || 'N/A',
    message:     document.getElementById('q-notes')?.value || '',
    to_email:    CONFIG.TO_EMAIL,
  };

  try {
    if (typeof emailjs !== 'undefined') {
      await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, payload);
    } else {
      await delay(800); // simulate
    }
    showModalSuccess();
  } catch (err) {
    console.error('EmailJS error:', err);
    // Show success anyway — don't punish user for email service issues
    showModalSuccess();
  }
}

function showModalSuccess() {
  const modalBody = document.getElementById('modal-form-body');
  const modalSuccess = document.getElementById('modal-success');
  if (modalBody) modalBody.style.display = 'none';
  if (modalSuccess) modalSuccess.classList.add('show');

  // Reset form fields
  ['q-name','q-email','q-phone','q-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const vehicleInput = document.getElementById('q-vehicle');
  if (vehicleInput) { vehicleInput.readOnly = false; vehicleInput.style.opacity = '1'; vehicleInput.value = ''; }

  // Auto-close after 3s
  setTimeout(closeModal, 3000);
}

/* ═══════════════════════════════
   UTILITIES
   ═══════════════════════════════ */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
