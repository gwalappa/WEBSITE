import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { PatientJourney } from './components/PatientJourney.tsx';
import { Treatments } from './components/Treatments.tsx';
import { AboutClinic } from './components/AboutClinic.tsx';
import { Doctors } from './components/Doctors.tsx';
import { Gallery } from './components/Gallery.tsx';
import { Reviews } from './components/Reviews.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { ContactSection } from './components/ContactSection.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingWizard } from './components/BookingWizard.tsx';
import { BookingLookup } from './components/BookingLookup.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { Service, Dentist, GalleryItem, Testimonial, FAQItem, UserProfile, Appointment } from './types/index.ts';

export default function App() {
  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Preselected options for booking wizard
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);

  // Clinic dynamic content fetched from database
  const [services, setServices] = useState<Service[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  // Staff authentication state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string>('');

  // Initial data load
  useEffect(() => {
    async function fetchClinicData() {
      try {
        const [srvRes, docRes, galRes, revRes, faqRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/dentists'),
          fetch('/api/gallery'),
          fetch('/api/testimonials'),
          fetch('/api/faqs'),
        ]);

        if (srvRes.ok) setServices(await srvRes.json());
        if (docRes.ok) setDentists(await docRes.json());
        if (galRes.ok) setGalleryItems(await galRes.json());
        if (revRes.ok) setTestimonials(await revRes.json());
        if (faqRes.ok) setFaqs(await faqRes.json());
      } catch (err) {
        console.error('Error fetching clinic data:', err);
      }
    }

    fetchClinicData();

    // Check stored session
    const storedToken = localStorage.getItem('smile_token');
    if (storedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.user) {
            setCurrentUser(data.user);
            setAuthToken(storedToken);
          } else {
            localStorage.removeItem('smile_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('smile_token');
        });
    }
  }, []);

  // Handlers
  const handleOpenBooking = () => {
    setPreselectedService(null);
    setIsBookingOpen(true);
  };

  const handleSelectServiceToBook = (service: Service) => {
    setPreselectedService(service);
    setIsBookingOpen(true);
  };

  const handleBookWithDentist = (_dentistId: string) => {
    setPreselectedService(null);
    setIsBookingOpen(true);
  };

  const handleOpenAdminPortal = () => {
    if (currentUser && authToken) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    setIsAdminDashboardOpen(true);
  };

  const handleLogout = () => {
    if (authToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      }).catch(console.error);
    }
    localStorage.removeItem('smile_token');
    setCurrentUser(null);
    setAuthToken('');
    setIsAdminDashboardOpen(false);
  };

  const handleBookingCompleted = (_apt: Appointment) => {
    // Optional additional side effect
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#172B3A]">
      {/* Top Navigation */}
      <Navbar
        onOpenBooking={handleOpenBooking}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        isLoggedIn={Boolean(currentUser)}
      />

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOpenBooking={handleOpenBooking}
          onExploreTreatments={() => {
            const el = document.getElementById('treatments');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 4-Step Patient Journey */}
        <PatientJourney onStartBooking={handleOpenBooking} />

        {/* Treatments Directory */}
        <Treatments
          services={services}
          onSelectServiceToBook={handleSelectServiceToBook}
        />

        {/* About Clinic, Sterilization, & Modern Facilities */}
        <AboutClinic />

        {/* Dentists Profiles */}
        <Doctors
          dentists={dentists}
          onBookWithDentist={handleBookWithDentist}
        />

        {/* Virtual Clinic Tour & Facility Photos */}
        <Gallery items={galleryItems} />

        {/* Verified Patient Feedback */}
        <Reviews testimonials={testimonials} />

        {/* FAQs */}
        <FaqSection faqs={faqs} />

        {/* Clinic Location & Enquiry Form */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={handleOpenBooking}
        onOpenLookup={() => setIsLookupOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
      />

      {/* Online Booking Wizard Modal */}
      <BookingWizard
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        preselectedService={preselectedService}
        onBookingCompleted={handleBookingCompleted}
      />

      {/* Patient Self-Management Modal (Lookup, Cancel, Reschedule) */}
      <BookingLookup
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        onOpenNewBooking={handleOpenBooking}
      />

      {/* Staff Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Staff Dashboard Management Console */}
      {isAdminDashboardOpen && currentUser && (
        <AdminDashboard
          user={currentUser}
          token={authToken}
          onLogout={handleLogout}
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}
    </div>
  );
}
