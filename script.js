// State management
let isLoggedIn = false;
let userName = '';
let authMode = 'signin';
let selectedCar = null;

// Car data
const cars = [
  {
    id: 1,
    name: 'Tesla Model 3',
    category: 'Electric',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
    price: 89,
    seats: 5,
    transmission: 'Auto',
    rating: 4.9,
    mileage: 'Unlimited',
    color: 'Pearl White'
  },
  {
    id: 2,
    name: 'BMW 3 Series',
    category: 'Luxury',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    price: 95,
    seats: 5,
    transmission: 'Auto',
    rating: 4.8,
    mileage: 'Unlimited',
    color: 'Jet Black'
  },
  {
    id: 3,
    name: 'Jeep Wrangler',
    category: 'SUV',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
    price: 79,
    seats: 5,
    transmission: 'Auto',
    rating: 4.7,
    mileage: 'Unlimited',
    color: 'Forest Green'
  },
  {
    id: 4,
    name: 'Toyota Camry',
    category: 'Sedan',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
    price: 59,
    seats: 5,
    transmission: 'Auto',
    rating: 4.6,
    mileage: 'Unlimited',
    color: 'Silver'
  },
  {
    id: 5,
    name: 'Mercedes-Benz GLC',
    category: 'Luxury SUV',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
    price: 125,
    seats: 5,
    transmission: 'Auto',
    rating: 4.9,
    mileage: 'Unlimited',
    color: 'Obsidian Black'
  },
  {
    id: 6,
    name: 'Honda Civic',
    category: 'Compact',
    image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
    price: 45,
    seats: 5,
    transmission: 'Auto',
    rating: 4.5,
    mileage: 'Unlimited',
    color: 'Navy Blue'
  }
];

// DOM Elements
const authModal = document.getElementById('authModal');
const rentalModal = document.getElementById('rentalModal');
const authButtons = document.getElementById('authButtons');
const userSection = document.getElementById('userSection');
const welcomeMsg = document.getElementById('welcomeMsg');
const mobileMenu = document.getElementById('mobileMenu');
const carsGrid = document.getElementById('carsGrid');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderCars();
  setupEventListeners();
  updateAuthUI();
});

// Render cars
function renderCars() {
  carsGrid.innerHTML = cars.map(car => `
    <div class="bg-slate-900/50 backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group hover:scale-105">
      <div class="relative h-56 overflow-hidden">
        <img src="${car.image}" alt="${car.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div class="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
          ${car.category}
        </div>
      </div>
      
      <div class="p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h3 class="text-xl font-semibold mb-1">${car.name}</h3>
            <div class="flex items-center gap-1 text-yellow-400">
              <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span class="text-sm text-slate-300">${car.rating}</span>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              $${car.price}
            </div>
            <div class="text-sm text-slate-400">per day</div>
          </div>
        </div>

        <div class="flex items-center gap-4 mb-4 text-sm text-slate-400">
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            ${car.seats} Seats
          </div>
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            ${car.transmission}
          </div>
        </div>

        <button onclick="handleRentNow(${car.id})" class="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 transition">
          Rent Now
        </button>
      </div>
    </div>
  `).join('');
}

// Setup event listeners
function setupEventListeners() {
  // Auth buttons
  document.getElementById('signInBtn').addEventListener('click', () => openAuthModal('signin'));
  document.getElementById('signUpBtn').addEventListener('click', () => openAuthModal('signup'));
  document.getElementById('mobileSignInBtn').addEventListener('click', () => openAuthModal('signin'));
  document.getElementById('mobileSignUpBtn').addEventListener('click', () => openAuthModal('signup'));
  document.getElementById('signOutBtn').addEventListener('click', handleSignOut);
  
  // Modal close buttons
  document.getElementById('closeAuthModal').addEventListener('click', closeAuthModal);
  document.getElementById('closeRentalModal').addEventListener('click', closeRentalModal);
  
  // Auth modal
  document.getElementById('authSubmitBtn').addEventListener('click', handleAuth);
  document.getElementById('authToggleBtn').addEventListener('click', toggleAuthMode);
  
  // Rental modal
  document.getElementById('confirmRentalBtn').addEventListener('click', handleConfirmRental);
  
  // Mobile menu
  document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
}

// Auth functions
function openAuthModal(mode) {
  authMode = mode;
  authModal.classList.remove('hidden');
  updateAuthModalUI();
}

function closeAuthModal() {
  authModal.classList.add('hidden');
}

function updateAuthModalUI() {
  const title = document.getElementById('authTitle');
  const submitBtn = document.getElementById('authSubmitBtn');
  const toggleText = document.getElementById('authToggleText');
  const toggleBtn = document.getElementById('authToggleBtn');
  const fullNameField = document.getElementById('fullNameField');
  const licenseField = document.getElementById('licenseField');
  
  if (authMode === 'signin') {
    title.textContent = 'Sign In';
    submitBtn.textContent = 'Sign In';
    toggleText.textContent = "Don't have an account? ";
    toggleBtn.textContent = 'Sign Up';
    fullNameField.classList.add('hidden');
    licenseField.classList.add('hidden');
  } else {
    title.textContent = 'Sign Up';
    submitBtn.textContent = 'Create Account';
    toggleText.textContent = 'Already have an account? ';
    toggleBtn.textContent = 'Sign In';
    fullNameField.classList.remove('hidden');
    licenseField.classList.remove('hidden');
  }
}

function toggleAuthMode() {
  authMode = authMode === 'signin' ? 'signup' : 'signin';
  updateAuthModalUI();
}

function handleAuth() {
  isLoggedIn = true;
  userName = 'John Doe';
  closeAuthModal();
  updateAuthUI();
  
  if (selectedCar) {
    openRentalModal();
  }
}

function handleSignOut() {
  isLoggedIn = false;
  userName = '';
  updateAuthUI();
}

function updateAuthUI() {
  if (isLoggedIn) {
    authButtons.classList.add('hidden');
    userSection.classList.remove('hidden');
    welcomeMsg.textContent = `Welcome, ${userName}`;
  } else {
    authButtons.classList.remove('hidden');
    userSection.classList.add('hidden');
  }
}

// Rental functions
function handleRentNow(carId) {
  const car = cars.find(c => c.id === carId);
  
  if (!isLoggedIn) {
    selectedCar = car;
    openAuthModal('signin');
  } else {
    selectedCar = car;
    openRentalModal();
  }
}

function openRentalModal() {
  if (!selectedCar) return;
  
  rentalModal.classList.remove('hidden');
  
  // Update selected car info
  const carInfo = document.getElementById('selectedCarInfo');
  carInfo.innerHTML = `
    <div class="flex gap-4 mb-4">
      <img src="${selectedCar.image}" alt="${selectedCar.name}" class="w-32 h-24 object-cover rounded-lg" />
      <div class="flex-1">
        <h3 class="text-xl font-semibold">${selectedCar.name}</h3>
        <p class="text-slate-400 text-sm">${selectedCar.category}</p>
        <div class="flex items-center gap-4 mt-2 text-sm text-slate-400">
          <span>${selectedCar.color}</span>
          <span>•</span>
          <span>${selectedCar.mileage}</span>
        </div>
      </div>
      <div class="text-right">
        <div class="text-2xl font-bold text-blue-400">$${selectedCar.price}</div>
        <div class="text-sm text-slate-400">per day</div>
      </div>
    </div>
  `;
  
  // Update price summary
  const priceSummary = document.getElementById('priceSummary');
  const total = selectedCar.price * 3 + 25;
  priceSummary.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <span class="text-slate-300">Rental Duration</span>
      <span class="font-semibold">3 days</span>
    </div>
    <div class="flex justify-between items-center mb-2">
      <span class="text-slate-300">Daily Rate</span>
      <span class="font-semibold">$${selectedCar.price}</span>
    </div>
    <div class="flex justify-between items-center mb-2">
      <span class="text-slate-300">Insurance</span>
      <span class="font-semibold">$25</span>
    </div>
    <div class="border-t border-slate-700 pt-2 mt-2">
      <div class="flex justify-between items-center">
        <span class="text-lg font-semibold">Total</span>
        <span class="text-2xl font-bold text-blue-400">$${total}</span>
      </div>
    </div>
  `;
  
  // Pre-fill locations and dates from search form
  document.getElementById('rentalPickupLocation').value = document.getElementById('pickupLocation').value;
  document.getElementById('rentalDropoffLocation').value = document.getElementById('dropoffLocation').value;
  document.getElementById('rentalPickupDate').value = document.getElementById('pickupDate').value;
  document.getElementById('rentalDropoffDate').value = document.getElementById('dropoffDate').value;
}

function closeRentalModal() {
  rentalModal.classList.add('hidden');
  selectedCar = null;
}

function handleConfirmRental() {
  alert('Rental confirmed! Confirmation email sent.');
  closeRentalModal();
}

// Mobile menu
function toggleMobileMenu() {
  mobileMenu.classList.toggle('hidden');
}

// Make handleRentNow available globally
window.handleRentNow = handleRentNow;
