// BH Stays (BookHaven) - Interactive Application Engine

// Property Database (Prices in INR ₹)
const staysData = [
  {
    id: 'stay-1',
    title: 'The Grand Azure Oceanfront Resort',
    category: 'resorts',
    stars: 5,
    rating: 4.96,
    reviewsCount: 142,
    location: 'Maldives, South Atoll',
    image: 'image/pexels-nudos-adicora-11448497.jpg',
    price: 38250,
    discountPrice: 32300,
    guests: 4,
    bedrooms: 2,
    baths: 2,
    featured: true,
    badge: '5-Star Luxury',
    description: 'Overwater luxury suite with private infinity pool, direct lagoon access, and 24/7 personal butler service.'
  },
  {
    id: 'stay-2',
    title: 'Skyline Panorama Luxury Apartment',
    category: 'apartments',
    stars: 5,
    rating: 4.88,
    reviewsCount: 98,
    location: 'Downtown, Manhattan NY',
    image: 'image/office-space.jpg',
    price: 23800,
    guests: 2,
    bedrooms: 1,
    baths: 1,
    featured: true,
    badge: 'City View',
    description: 'Penthouse apartment with floor-to-ceiling glass windows overlooking the iconic skyline, designer kitchen, and private terrace.'
  },
  {
    id: 'stay-3',
    title: 'Alpine Crest Timber Villa',
    category: 'villas',
    stars: 5,
    rating: 4.92,
    reviewsCount: 76,
    location: 'Zermatt, Switzerland',
    image: 'image/AorakiMount-Cook-1.jpg',
    price: 44200,
    guests: 8,
    bedrooms: 4,
    baths: 3,
    featured: true,
    badge: 'Mountain Chalet',
    description: 'Breathtaking ski-in/ski-out luxury chalet featuring a heated outdoor jacuzzi, stone fireplace, and panoramic Matterhorn views.'
  },
  {
    id: 'stay-4',
    title: 'Whispering Pines Forest Cabin',
    category: 'cabins',
    stars: 4,
    rating: 4.85,
    reviewsCount: 112,
    location: 'Aspen, Colorado',
    image: 'image/bl.jpg',
    price: 16150,
    guests: 4,
    bedrooms: 2,
    baths: 1,
    featured: false,
    badge: 'Cozy Escape',
    description: 'Secluded woodland cabin nestled among pine trees. Features a wood-burning stove, outdoor firepit, and stargazer deck.'
  },
  {
    id: 'stay-5',
    title: 'Emerald Bay Coastal Villa',
    category: 'villas',
    stars: 5,
    rating: 4.94,
    reviewsCount: 84,
    location: 'Santorini, Greece',
    image: 'image/OIP (1).jfif',
    price: 41650,
    guests: 6,
    bedrooms: 3,
    baths: 3,
    featured: true,
    badge: 'Infinity Pool',
    description: 'Whitewashed Aegean villa perched on the caldera cliff. Private sun deck, plunge pool, and sunset ocean views.'
  },
  {
    id: 'stay-6',
    title: 'Rosewood Meadow Country Cottage',
    category: 'cottages',
    stars: 4,
    rating: 4.79,
    reviewsCount: 63,
    location: 'Cotswolds, England',
    image: 'image/addressbackgrnd.jfif',
    price: 14000,
    guests: 3,
    bedrooms: 2,
    baths: 1,
    featured: false,
    badge: 'Heritage',
    description: 'Charming 18th-century stone cottage surrounded by blooming wildflower gardens and rolling green countryside.'
  },
  {
    id: 'stay-7',
    title: 'Serenity Lakehouse Lodge',
    category: 'rooms',
    stars: 4,
    rating: 4.87,
    reviewsCount: 51,
    location: 'Lake Como, Italy',
    image: 'image/abt.png',
    price: 17850,
    guests: 2,
    bedrooms: 1,
    baths: 1,
    featured: false,
    badge: 'Lakeside',
    description: 'Elegant boutique suite with private balcony opening directly to Lake Como waters and private boat dock access.'
  },
  {
    id: 'stay-8',
    title: 'Royal Palm Beach Resort',
    category: 'resorts',
    stars: 5,
    rating: 4.98,
    reviewsCount: 204,
    location: 'Bali, Indonesia',
    image: 'image/pexels-nudos-adicora-11448497.jpg',
    price: 28900,
    guests: 4,
    bedrooms: 2,
    baths: 2,
    featured: true,
    badge: 'Spa & Wellness',
    description: 'Tropical sanctuary featuring traditional Balinese architecture, holistic spa treatments, and private beach cove.'
  }
];

// App State
let state = {
  category: 'all',
  searchLocation: '',
  checkInDate: '',
  checkOutDate: '',
  guestsCount: 1,
  sortBy: 'recommended',
  bookmarks: JSON.parse(localStorage.getItem('bh_bookmarks') || '[]'),
  selectedStayForBooking: null
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initSearchDates();
  updateAuthUI();
  renderCategoryPills();
  renderStays();
  updateBookmarkBadge();
  setupEventListeners();
  resumePendingBooking();
});

// Set default search dates (Today & +3 days)
function initSearchDates() {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 3);

  const checkinInput = document.getElementById('search-checkin');
  const checkoutInput = document.getElementById('search-checkout');

  if (checkinInput && checkoutInput) {
    checkinInput.valueAsDate = today;
    checkoutInput.valueAsDate = future;
    state.checkInDate = checkinInput.value;
    state.checkOutDate = checkoutInput.value;
  }
}

// Category Pills Setup
const categories = [
  { id: 'all', label: 'All Stays', icon: 'fa-th-large' },
  { id: 'apartments', label: 'Apartments', icon: 'fa-building' },
  { id: 'resorts', label: 'Resorts', icon: 'fa-umbrella-beach' },
  { id: 'villas', label: 'Villas', icon: 'fa-home' },
  { id: 'cottages', label: 'Cottages', icon: 'fa-tree' },
  { id: 'cabins', label: 'Cabins', icon: 'fa-campground' },
  { id: 'rooms', label: 'Rooms', icon: 'fa-bed' },
  { id: '5star', label: '5-Star Luxury', icon: 'fa-star' }
];

function renderCategoryPills() {
  const container = document.getElementById('category-bar');
  if (!container) return;

  container.innerHTML = categories.map(cat => `
    <button class="cat-chip ${state.category === cat.id ? 'active' : ''}" data-category="${cat.id}">
      <i class="fa ${cat.icon}"></i> ${cat.label}
    </button>
  `).join('');

  container.querySelectorAll('.cat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category;
      state.category = cat;
      renderCategoryPills();
      renderStays();
    });
  });
}

// Render Stays Grid
function renderStays() {
  const grid = document.getElementById('stays-grid');
  const countEl = document.getElementById('results-count');
  if (!grid) return;

  let filtered = staysData.filter(stay => {
    if (state.category === '5star' && stay.stars !== 5) return false;
    if (state.category !== 'all' && state.category !== '5star' && stay.category !== state.category) return false;

    if (state.searchLocation.trim() !== '') {
      const q = state.searchLocation.toLowerCase();
      const matchLoc = stay.location.toLowerCase().includes(q);
      const matchTitle = stay.title.toLowerCase().includes(q);
      if (!matchLoc && !matchTitle) return false;
    }

    if (stay.guests < state.guestsCount) return false;

    return true;
  });

  if (state.sortBy === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (state.sortBy === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (state.sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} stay${filtered.length === 1 ? '' : 's'}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
        <i class="fa fa-search" style="font-size: 3rem; color: var(--text-dim); margin-bottom: 1rem;"></i>
        <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem;">No stays found</h3>
        <p style="color: var(--text-muted);">Try adjusting your search location, guests count, or category filters.</p>
        <button onclick="resetFilters()" class="btn-auth" style="margin-top: 1.5rem;">Reset Filters</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(stay => {
    const isBookmarked = state.bookmarks.includes(stay.id);
    const formattedPrice = `₹${stay.price.toLocaleString('en-IN')}`;
    return `
      <div class="stay-card" data-id="${stay.id}">
        <div class="card-img-wrapper">
          <img src="${stay.image}" alt="${stay.title}" class="card-img" onerror="this.src='image/office-space.jpg'">
          <div class="card-badge"><i class="fa fa-sparkles"></i> ${stay.badge}</div>
          <button class="btn-favorite ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${stay.id}')" title="Save to Favorites">
            <i class="fa ${isBookmarked ? 'fa-heart' : 'fa-heart-o'}"></i>
          </button>
        </div>
        <div class="card-content">
          <div class="card-meta">
            <div class="card-location"><i class="fa fa-map-marker"></i> ${stay.location}</div>
            <div class="card-rating"><i class="fa fa-star"></i> ${stay.rating} (${stay.reviewsCount})</div>
          </div>
          <h3 class="card-title">${stay.title}</h3>
          <p class="card-description">${stay.description}</p>
          <div class="card-footer">
            <div class="card-price">
              <span class="price-amount">${formattedPrice}</span>
              <span class="price-unit">per night</span>
            </div>
            <button class="btn-book" onclick="openBookingModal('${stay.id}')">Book Now</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Reset Filters
function resetFilters() {
  state.category = 'all';
  state.searchLocation = '';
  state.guestsCount = 1;
  const searchInput = document.getElementById('search-location');
  if (searchInput) searchInput.value = '';
  renderCategoryPills();
  renderStays();
}

// Bookmarks/Favorites
function toggleBookmark(stayId) {
  const index = state.bookmarks.indexOf(stayId);
  if (index > -1) {
    state.bookmarks.splice(index, 1);
    showToast('Removed from favorites', 'fa-heart-o');
  } else {
    state.bookmarks.push(stayId);
    showToast('Saved to your favorites!', 'fa-heart');
  }
  localStorage.setItem('bh_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarkBadge();
  renderStays();
}

function updateBookmarkBadge() {
  const badge = document.getElementById('bookmark-count');
  if (badge) {
    badge.textContent = state.bookmarks.length;
  }
}

// Booking Modal Logic
function openBookingModal(stayId) {
  const stay = staysData.find(s => s.id === stayId);
  if (!stay) return;

  state.selectedStayForBooking = stay;
  const modal = document.getElementById('booking-modal');
  if (!modal) return;

  document.getElementById('modal-stay-title').textContent = stay.title;
  document.getElementById('modal-stay-title-summary').textContent = stay.title;
  document.getElementById('modal-stay-img').src = stay.image;
  document.getElementById('modal-stay-location').textContent = stay.location;
  document.getElementById('modal-stay-price').textContent = `₹${stay.price.toLocaleString('en-IN')}/night`;
  const auth = getAuth();
  if (auth.user) {
    const guestName = document.getElementById('guest-name');
    const guestEmail = document.getElementById('guest-email');
    if (guestName && !guestName.value) guestName.value = auth.user.name || '';
    if (guestEmail && !guestEmail.value) guestEmail.value = auth.user.email || '';
  }

  const mCheckin = document.getElementById('modal-checkin');
  const mCheckout = document.getElementById('modal-checkout');
  if (mCheckin && mCheckout) {
    mCheckin.value = state.checkInDate || new Date().toISOString().split('T')[0];
    mCheckout.value = state.checkOutDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  }

  calculateModalPricing();
  ensurePaymentOptions();
  modal.classList.add('active');
}

function closeBookingModal() {
  const modal = document.getElementById('booking-modal');
  if (modal) modal.classList.remove('active');
}

function calculateModalPricing() {
  const stay = state.selectedStayForBooking;
  if (!stay) return;

  const mCheckin = document.getElementById('modal-checkin').value;
  const mCheckout = document.getElementById('modal-checkout').value;

  const start = new Date(mCheckin);
  const end = new Date(mCheckout);

  let nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (isNaN(nights) || nights < 1) nights = 1;

  const basePrice = stay.price * nights;
  const serviceFee = Math.round(basePrice * 0.10);
  const taxes = Math.round(basePrice * 0.05);
  const total = basePrice + serviceFee + taxes;

  document.getElementById('calc-nights').textContent = `${nights} night${nights > 1 ? 's' : ''}`;
  document.getElementById('calc-base').textContent = `₹${basePrice.toLocaleString('en-IN')}`;
  document.getElementById('calc-service').textContent = `₹${serviceFee.toLocaleString('en-IN')}`;
  document.getElementById('calc-taxes').textContent = `₹${taxes.toLocaleString('en-IN')}`;
  document.getElementById('calc-total').textContent = `₹${total.toLocaleString('en-IN')}`;
  updatePaymentMethodUI();
}

function confirmBooking(e) {
  e.preventDefault();
  const guestName = document.getElementById('guest-name')?.value.trim() || '';
  startPayment(guestName);
}

// Toast System
function showToast(message, icon = 'fa-info-circle') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  const iconElement = document.createElement('i');
  iconElement.className = `fa ${icon}`;
  const messageElement = document.createElement('span');
  messageElement.textContent = message;
  toast.append(iconElement, messageElement);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Event Listeners
function setupEventListeners() {
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.searchLocation = document.getElementById('search-location')?.value || '';
      state.guestsCount = parseInt(document.getElementById('search-guests')?.value || '1', 10);
      state.checkInDate = document.getElementById('search-checkin')?.value || '';
      state.checkOutDate = document.getElementById('search-checkout')?.value || '';
      renderStays();
    });
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderStays();
    });
  }

  const mci = document.getElementById('modal-checkin');
  const mco = document.getElementById('modal-checkout');
  if (mci) {
    const d = new Date();
    mci.min = d.toISOString().split('T')[0];
    mci.addEventListener('change', () => { if (mco) { const nd = new Date(mci.value); nd.setDate(nd.getDate() + 1); mco.min = nd.toISOString().split('T')[0]; if (mco.value && mco.value <= mci.value) mco.value = nd.toISOString().split('T')[0]; } calculateModalPricing(); });
  }
  if (mco) {
    mco.addEventListener('change', calculateModalPricing);
  }

  document.getElementById('booking-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'booking-modal') closeBookingModal();
  });

  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', confirmBooking);
  }
}

// Payment Method + Razorpay Checkout
const isLocalStaticPreview =
  ['localhost', '127.0.0.1'].includes(window.location.hostname) && window.location.port === '8000';
window.BH_API_BASE =
  localStorage.getItem('bh_api_base') ||
  (isLocalStaticPreview ? 'http://localhost:3001' : window.location.origin);
const PAYMENT_API_BASE = window.BH_API_BASE;
const PAYMENT_METHOD_LABELS = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Netbanking',
};

function ensurePaymentOptions() {
  const form = document.getElementById('booking-form');
  if (!form || document.getElementById('payment-method-group')) return;
  const submitBtn = form.querySelector('button[type="submit"]');
  if (!submitBtn) return;

  const wrap = document.createElement('div');
  wrap.id = 'payment-method-group';
  wrap.style.cssText =
    'margin-top:1.5rem; padding:1rem; background:var(--bg-card); border-radius:12px; border:1px solid rgba(245,158,11,0.25);';
  wrap.innerHTML =
    '<p style="margin:0 0 0.75rem; font-weight:600; font-size:0.9rem; color:var(--text-muted);">' +
    '<i class="fa-solid fa-credit-card"></i> Payment Method</p>' +
    '<div id="payment-method-options" style="display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem;"></div>' +
    '<section id="upi-qr-panel" class="upi-qr-panel" aria-live="polite" hidden>' +
    '<h4 id="upi-qr-heading" tabindex="-1"><i class="fa-solid fa-qrcode"></i> Scan to pay with UPI</h4>' +
    '<p>Scan this QR using any UPI app. Verify the payee name is <strong>Pritam Giri</strong> before paying.</p>' +
    '<img src="image/upi-payment-qr.png" alt="UPI payment QR code for payee Pritam Giri" width="280" height="280">' +
    '<p class="upi-qr-amount">Booking total: <strong id="upi-qr-amount"></strong></p>' +
    '<p class="upi-qr-warning"><i class="fa-solid fa-triangle-exclamation"></i> This is a static QR. Enter the booking total in your UPI app if requested. BH Stays cannot automatically verify this transfer; keep the UPI transaction reference. Your booking remains unconfirmed until payment is manually verified.</p>' +
    '<p id="upi-qr-signin-note" class="upi-qr-signin-note"></p>' +
    '</section>';

  const options = wrap.querySelector('#payment-method-options');
  Object.entries(PAYMENT_METHOD_LABELS).forEach(([value, label], index) => {
    const opt = document.createElement('label');
    opt.style.cssText =
      'display:flex; align-items:center; justify-content:center; gap:0.4rem; font-size:0.85rem; color:var(--text-muted); cursor:pointer; padding:0.55rem; border-radius:8px; border:1px solid rgba(148,163,184,0.25); text-align:center;';
    opt.innerHTML = `<input type="radio" name="payment-method" value="${value}" ${index === 0 ? 'checked' : ''} required> ${label}`;
    options.appendChild(opt);
  });

  options.addEventListener('change', updatePaymentMethodUI);
  form.insertBefore(wrap, submitBtn);
  updatePaymentMethodUI();
}

function selectedPaymentMethod() {
  const checked = document.querySelector('input[name="payment-method"]:checked');
  return checked ? checked.value : '';
}

function updatePaymentMethodUI() {
  const method = selectedPaymentMethod();
  const panel = document.getElementById('upi-qr-panel');
  const button = document.querySelector('#booking-form button[type="submit"]');
  const auth = getAuth();
  if (panel) {
    panel.hidden = method !== 'upi';
    const total = document.getElementById('calc-total')?.textContent || '';
    document.getElementById('upi-qr-amount').textContent = total;
    document.getElementById('upi-qr-signin-note').textContent = auth.isLoggedIn
      ? 'Keep your UPI transaction reference for manual verification. This website does not receive transfer status automatically.'
      : 'Please sign in before paying so the booking details can be saved to your account.';
  }
  if (button && !paymentInProgress) {
    const label = method === 'upi'
      ? (auth.isLoggedIn ? 'Continue with UPI QR' : 'Sign in to continue with UPI')
      : (auth.isLoggedIn ? 'Confirm & Pay Securely' : 'Sign in to pay securely');
    const icon = method === 'upi' ? 'fa-qrcode' : 'fa-lock';
    button.dataset.paymentLabel = `<i class="fa-solid ${icon}"></i> ${label}`;
    button.innerHTML = button.dataset.paymentLabel;
  }
}

function savePendingBooking({ stay, checkIn, checkOut, guestName, guestEmail, method }) {
  sessionStorage.setItem(
    'bh_pending_booking',
    JSON.stringify({ stayId: stay.id, checkIn, checkOut, guestName, guestEmail, method })
  );
}

function resumePendingBooking() {
  if (new URLSearchParams(window.location.search).get('resumeBooking') !== '1') return;

  const rawBooking = sessionStorage.getItem('bh_pending_booking');
  sessionStorage.removeItem('bh_pending_booking');
  if (!rawBooking) {
    showToast('Your booking details expired. Please select your stay again.', 'fa-circle-xmark');
    return;
  }

  let pendingBooking;
  try {
    pendingBooking = JSON.parse(rawBooking);
  } catch (error) {
    console.warn('[bookings] Could not restore saved booking details:', error);
    showToast('Your booking details could not be restored. Please select your stay again.', 'fa-circle-xmark');
    return;
  }

  const stay = staysData.find((item) => item.id === pendingBooking.stayId);
  const today = new Date().toISOString().slice(0, 10);
  const isValidDate = (value) =>
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime()) &&
    new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
  if (
    !stay ||
    !isValidDate(pendingBooking.checkIn) ||
    pendingBooking.checkIn < today ||
    !isValidDate(pendingBooking.checkOut) ||
    pendingBooking.checkOut <= pendingBooking.checkIn
  ) {
    showToast('Your stay details are no longer valid. Please select your stay again.', 'fa-circle-xmark');
    return;
  }

  openBookingModal(stay.id);
  document.getElementById('modal-checkin').value = pendingBooking.checkIn;
  document.getElementById('modal-checkin').dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('modal-checkout').value = pendingBooking.checkOut;
  document.getElementById('guest-name').value = pendingBooking.guestName || '';
  document.getElementById('guest-email').value = pendingBooking.guestEmail || '';

  if (['upi', 'card', 'netbanking'].includes(pendingBooking.method)) {
    const methodInput = document.querySelector(
      `input[name="payment-method"][value="${pendingBooking.method}"]`
    );
    if (methodInput) methodInput.checked = true;
  }
  calculateModalPricing();
  showToast('Welcome back. Review your booking and continue to payment.', 'fa-circle-check');
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  if (!window.__bhRazorpayLoading) {
    window.__bhRazorpayLoading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = resolve;
      script.onerror = () => {
        window.__bhRazorpayLoading = null;
        reject(new Error('Could not load Razorpay checkout.js'));
      };
      document.head.appendChild(script);
    });
  }
  return window.__bhRazorpayLoading;
}

let paymentInProgress = false;

function setBookingProcessing(processing) {
  const button = document.querySelector('#booking-form button[type="submit"]');
  if (!button) return;
  if (!button.dataset.originalContent) {
    button.dataset.originalContent = button.innerHTML;
  }
  button.disabled = processing;
  button.innerHTML = processing
    ? '<i class="fa-solid fa-spinner fa-spin"></i> Processing payment...'
    : (button.dataset.paymentLabel || button.dataset.originalContent);
  document.querySelectorAll('input[name="payment-method"]').forEach((input) => {
    input.disabled = processing;
  });
}

async function startPayment(guestName) {
  if (paymentInProgress) return;

  const form = document.getElementById('booking-form');
  if (!form?.reportValidity()) return;

  const stay = state.selectedStayForBooking;
  const checkIn = document.getElementById('modal-checkin')?.value || '';
  const checkOut = document.getElementById('modal-checkout')?.value || '';
  const guestEmail = document.getElementById('guest-email')?.value.trim() || '';
  const method = selectedPaymentMethod();

  if (!stay || !checkIn || !checkOut || checkOut <= checkIn) {
    showToast('Please choose a property and a check-out date after check-in.', 'fa-circle-xmark');
    return;
  }
  if (!method) {
    showToast('Please select a payment method.', 'fa-circle-xmark');
    return;
  }

  const auth = getAuth();
  if (!auth.isLoggedIn || !auth.token) {
    savePendingBooking({ stay, checkIn, checkOut, guestName, guestEmail, method });
    window.location.assign('login.html?continue=booking');
    return;
  }

  if (method === 'upi') {
    const panel = document.getElementById('upi-qr-panel');
    panel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('upi-qr-heading')?.focus({ preventScroll: true });
    showToast(
      'Scan the displayed QR and verify the payee before paying. The transfer is not automatically verified, so the booking is not confirmed.',
      'fa-triangle-exclamation'
    );
    return;
  }

  paymentInProgress = true;
  setBookingProcessing(true);
  try {
    const orderRes = await fetch(`${PAYMENT_API_BASE}/api/payments/order`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ propertyId: stay.id, checkIn, checkOut, guestName, guestEmail }),
    });
    const orderData = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) {
      console.warn('[payments] Order creation failed:', orderData.error || orderRes.status);
      if (orderRes.status === 401) {
        savePendingBooking({ stay, checkIn, checkOut, guestName, guestEmail, method });
        localStorage.removeItem('bh_auth_token');
        localStorage.removeItem('bh_user');
        window.location.assign('login.html?continue=booking');
        return;
      }
      showToast(orderData.error || 'Could not start payment. Please try again.', 'fa-circle-xmark');
      return;
    }

    await loadRazorpayCheckout();

    await new Promise((resolve) => {
      let settled = false;
      let paymentSubmitted = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency || 'INR',
        name: 'BH Stays',
        description: stay.title,
        order_id: orderData.order.id,
        prefill: { name: guestName, email: guestEmail },
        theme: { color: '#f59e0b' },
        method: {
          upi: method === 'upi',
          card: method === 'card',
          netbanking: method === 'netbanking',
          wallet: false,
          emi: false,
          paylater: false,
        },
        handler: async (response) => {
          paymentSubmitted = true;
          try {
            const verifyRes = await fetch(`${PAYMENT_API_BASE}/api/payments/verify`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${auth.token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData.verified || !verifyData.booking?.id) {
              showToast(verifyData.error || 'Payment could not be verified. The booking is not confirmed.', 'fa-circle-xmark');
              finish(false);
              return;
            }

            window.location.assign(
              `booking-confirmation.html?bookingId=${encodeURIComponent(verifyData.booking.id)}`
            );
            finish(true);
          } catch (err) {
            console.error('[payments] Verification error:', err);
            showToast('Could not confirm payment status. The booking is not confirmed; contact support before retrying.', 'fa-circle-xmark');
            finish(false);
          }
        },
        modal: {
          ondismiss: () => {
            if (settled || paymentSubmitted) return;
            showToast('Payment cancelled. Your booking was not confirmed.', 'fa-circle-xmark');
            finish(false);
          },
        },
      });

      rzp.on('payment.failed', (response) => {
        if (settled) return;
        const description = response?.error?.description || 'Please try again.';
        showToast(`Payment failed: ${description}`, 'fa-circle-xmark');
        finish(false);
      });
      rzp.on('payment.error', () => {
        if (settled) return;
        showToast('The payment window encountered an error. Your booking was not confirmed.', 'fa-circle-xmark');
        finish(false);
      });
      rzp.open();
    });
  } catch (err) {
    console.error('[payments] Checkout error:', err);
    showToast('Payment service is unavailable. Your booking was not confirmed.', 'fa-circle-xmark');
  } finally {
    paymentInProgress = false;
    setBookingProcessing(false);
  }
}


// Auth UI helpers
function getAuth() {
  const token = localStorage.getItem('bh_auth_token');
  const userRaw = localStorage.getItem('bh_user');
  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch (e) {
    user = null;
  }
  return { isLoggedIn: !!token, token, user };
}

function updateAuthUI() {
  const auth = getAuth();
  const authBtns = document.querySelectorAll('.btn-auth');
  authBtns.forEach(btn => {
    if (!btn) return;
    if (auth.isLoggedIn && auth.user) {
      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-user-circle';
      const label = document.createElement('span');
      label.textContent = ` ${String(auth.user.name || 'Guest').trim().split(/\s+/)[0]}`;
      btn.replaceChildren(icon, label);
      btn.href = '#';
      btn.onclick = (e) => {
        e.preventDefault();
        logout();
      };
      btn.title = 'Click to sign out';
    } else {
      btn.innerHTML = '<i class="fa-solid fa-user"></i> Sign In';
      btn.href = 'login.html';
      btn.onclick = null;
      btn.title = 'Sign In';
    }
  });
}

function logout() {
  const token = localStorage.getItem('bh_auth_token');
  if (token) {
    fetch(`${window.BH_API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    }).catch(() => {});
  }
  localStorage.removeItem('bh_auth_token');
  localStorage.removeItem('bh_user');
  updateAuthUI();
  showToast('Signed out successfully.', 'fa-circle-check');
}
