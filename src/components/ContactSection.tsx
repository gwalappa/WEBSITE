import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Navigation,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMsg('Please fill in your name, mobile number, and enquiry message.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim(),
          honeypot,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setSuccessMsg(data.message || 'Message sent! Our reception desk will contact you soon.');
      setName('');
      setPhone('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message. Please call our clinic directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-[#F5F8F8] border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0B6B68] mb-2">
            Visit & Contact Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172B3A]">
            Clinic Location & Enquiries
          </h2>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">
            Conveniently situated at Sankranthi Circle, Hebbal 2nd Stage, Mysuru. Ample parking and ground-floor accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Clinic Contact Details & Map Card */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Contact details card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
              
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#DDF4F0] text-[#0B6B68] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B3A]">Smile Architect Dental Clinic</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    850/S, 25th Cross Road, Manchegowdana Koppalu, Sankranthi Circle, Hebbal 2nd Stage, Mysuru, Karnataka 570017, India.
                  </p>
                  <a
                    href="https://maps.app.goo.gl/m6FKojfRqpNL3FDQ8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#0B6B68] font-bold mt-2 hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open in Google Maps / Directions</span>
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#DDF4F0] text-[#0B6B68] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#172B3A]">Telephone & Appointments</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    For direct enquiries, emergency questions, or telephone bookings:
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <a
                      href="tel:+919036827916"
                      className="px-3.5 py-1.5 bg-[#0B6B68] text-white rounded-lg text-xs font-semibold hover:bg-[#085552] transition-colors"
                    >
                      Call +91 90368 27916
                    </a>
                    <a
                      href="https://wa.me/919036827916?text=Hello%20Smile%20Architect%20Dental%20Clinic%2C%20I%20would%20like%20to%20enquire%20about%20an%20appointment."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Chat</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#DDF4F0] text-[#0B6B68] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="w-full">
                  <h4 className="text-xs font-bold text-[#172B3A] mb-1.5">Clinic Opening Hours</h4>
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">Monday – Saturday</span>
                      <span className="tabular-nums">10:00 AM – 1:30 PM & 5:00 PM – 8:30 PM</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Sunday</span>
                      <span className="tabular-nums">10:00 AM – 1:00 PM (Prior Appointment)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Visual Map card with direct Google directions link */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#172B3A]">
                  Google Maps Interactive Preview
                </span>
                <a
                  href="https://maps.app.goo.gl/m6FKojfRqpNL3FDQ8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#0B6B68] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Responsive map container */}
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] bg-slate-100 border border-slate-200">
                <iframe
                  title="Smile Architect Dental Clinic Google Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3897.643912959648!2d76.606625!3d12.3551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baf71295f10b27b%3A0xc3cf2cb4fb0dd511!2sHebbal%202nd%20Stage%2C%20Mysuru!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Contact Enquiry Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-2xs">
              <h3 className="text-lg font-bold text-[#172B3A] mb-1">
                Send Us an Enquiry
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Have a question about a treatment, appointment timings, or second opinion? Leave a note and our front desk will respond quickly.
              </p>

              {successMsg && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field for anti-spam bots */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anusha Rao"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172B3A] mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 90368 27916"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B3A] mb-1">
                      Email Address <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#172B3A] mb-1">
                    Enquiry Details *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what dental assistance or questions you have..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B6B68]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-xs font-bold text-white bg-[#0B6B68] rounded-xl hover:bg-[#085552] disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Submitting Enquiry...' : 'Send Message to Reception'}</span>
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
