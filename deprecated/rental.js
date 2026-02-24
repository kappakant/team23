import React, { useState } from 'react';
import { Car, MapPin, Calendar, Users, Star, Menu, X, ChevronRight, Shield, Clock, Award } from 'lucide-react';

export default function CarRentalWebsite() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');

  const cars = [
    {
      id: 1,
      name: 'Tesla Model 3',
      category: 'Electric',
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80',
      price: 89,
      seats: 5,
      transmission: 'Auto',
      rating: 4.9
    },
    {
      id: 2,
      name: 'BMW 3 Series',
      category: 'Luxury',
      image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
      price: 95,
      seats: 5,
      transmission: 'Auto',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Jeep Wrangler',
      category: 'SUV',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80',
      price: 79,
      seats: 5,
      transmission: 'Auto',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Toyota Camry',
      category: 'Sedan',
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=80',
      price: 59,
      seats: 5,
      transmission: 'Auto',
      rating: 4.6
    },
    {
      id: 5,
      name: 'Mercedes-Benz GLC',
      category: 'Luxury SUV',
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80',
      price: 125,
      seats: 5,
      transmission: 'Auto',
      rating: 4.9
    },
    {
      id: 6,
      name: 'Honda Civic',
      category: 'Compact',
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80',
      price: 45,
      seats: 5,
      transmission: 'Auto',
      rating: 4.5
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-slate-950/80 backdrop-blur-lg z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Car className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">DriveNow</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-slate-300 hover:text-white transition">Home</a>
              <a href="#cars" className="text-slate-300 hover:text-white transition">Cars</a>
              <a href="#about" className="text-slate-300 hover:text-white transition">About</a>
              <a href="#contact" className="text-slate-300 hover:text-white transition">Contact</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="text-slate-300 hover:text-white transition">Sign In</button>
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-full hover:opacity-90 transition">Sign Up</button>
            </div>

            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-4 py-4 space-y-3">
              <a href="#" className="block text-slate-300 hover:text-white transition">Home</a>
              <a href="#cars" className="block text-slate-300 hover:text-white transition">Cars</a>
              <a href="#about" className="block text-slate-300 hover:text-white transition">About</a>
              <a href="#contact" className="block text-slate-300 hover:text-white transition">Contact</a>
              <button className="w-full text-left text-slate-300 hover:text-white transition">Sign In</button>
              <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-2 rounded-full">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Find Your Perfect Ride
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Premium car rentals at your fingertips. Choose from our fleet of luxury, electric, and economy vehicles.
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-800 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Pickup Location
                </label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="City or Airport"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Dropoff Location
                </label>
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="City or Airport"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dropoff Date
                </label>
                <input
                  type="date"
                  value={dropoffDate}
                  onChange={(e) => setDropoffDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition flex items-center justify-center gap-2">
              Search Available Cars
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition">
                <Shield className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fully Insured</h3>
              <p className="text-slate-400">Comprehensive coverage included with every rental</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition">
                <Clock className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
              <p className="text-slate-400">Round-the-clock customer service and roadside assistance</p>
            </div>

            <div className="text-center group hover:scale-105 transition-transform">
              <div className="bg-gradient-to-br from-pink-500/10 to-blue-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-pink-500/20 group-hover:to-blue-500/20 transition">
                <Award className="w-10 h-10 text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
              <p className="text-slate-400">Lowest prices with no hidden fees or surprises</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cars Section */}
      <section id="cars" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Premium Fleet</h2>
            <p className="text-slate-400 text-lg">Choose from our diverse selection of vehicles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cars.map((car) => (
              <div key={car.id} className="bg-slate-900/50 backdrop-blur-lg rounded-2xl overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group hover:scale-105">
                <div className="relative h-56 overflow-hidden">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    {car.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{car.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-slate-300">{car.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        ${car.price}
                      </div>
                      <div className="text-sm text-slate-400">per day</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {car.seats} Seats
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      {car.transmission}
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                    Rent Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Hit the Road?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of satisfied customers who trust DriveNow for their car rental needs.
          </p>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 px-12 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition">
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-bold">DriveNow</span>
              </div>
              <p className="text-slate-400 text-sm">
                Your trusted partner for premium car rentals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 DriveNow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
