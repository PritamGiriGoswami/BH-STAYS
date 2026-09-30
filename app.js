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
  renderCategoryPills();
  renderStays();
  updateBookmarkBadge();
  setupEventListeners();
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
  document.getElementById('modal-stay-img').src = stay.image;
  document.getElementById('modal-stay-location').textContent = stay.location;
  document.getElementById('modal-stay-price').textContent = `₹${stay.price.toLocaleString('en-IN')}/night`;

  const mCheckin = document.getElementById('modal-checkin');
  const mCheckout = document.getElementById('modal-checkout');
  if (mCheckin && mCheckout) {
    mCheckin.value = state.checkInDate || new Date().toISOString().split('T')[0];
    mCheckout.value = state.checkOutDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
  }

  calculateModalPricing();
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
}

function confirmBooking(e) {
  e.preventDefault();
  const guestName = document.getElementById('guest-name')?.value || 'Valued Guest';
  const totalAmount = document.getElementById('calc-total')?.textContent || '₹0';

  closeBookingModal();
  showToast(`🎉 Booking Confirmed for ${guestName}! (${totalAmount})`, 'fa-check-circle');
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
  toast.innerHTML = `<i class="fa ${icon}"></i> <span>${message}</span>`;
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

  document.getElementById('modal-checkin')?.addEventListener('change', calculateModalPricing);
  document.getElementById('modal-checkout')?.addEventListener('change', calculateModalPricing);
  document.getElementById('booking-form')?.addEventListener('submit', confirmBooking);

  document.getElementById('booking-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'booking-modal') closeBookingModal();
  });
}
