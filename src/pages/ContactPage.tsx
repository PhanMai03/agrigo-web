import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  HelpCircle,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { Reveal } from '@/components/Reveal';
import { useToastStore } from '@/stores/toastStore';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    title: 'Head Office',
    detail: 'District 1, Ho Chi Minh City, Vietnam',
    sub: 'Open for visitors & partners (08:30 - 17:30)',
    actionText: 'Get directions',
    actionHref: '#map-section',
  },
  {
    icon: Phone,
    title: 'Customer Support Hotline',
    detail: '+84 1900 6868',
    sub: 'Available 7 days a week (08:00 - 21:00)',
    actionText: 'Call now',
    actionHref: 'tel:19006868',
  },
  {
    icon: Mail,
    title: 'Email Support',
    detail: 'hello@agrigo.vn',
    sub: 'Responses within 2 business hours',
    actionText: 'Send email',
    actionHref: 'mailto:hello@agrigo.vn',
  },
  {
    icon: Clock,
    title: 'Cold-Chain Delivery',
    detail: '24/7 Citywide Service',
    sub: 'Guaranteed 2-hour express delivery',
    actionText: "View today's produce",
    actionHref: '/products',
  },
];

const SUBJECT_OPTIONS = [
  'Produce inquiries & ordering',
  'Order status & delivery tracking',
  'Farm / Cooperative partnership application',
  'Customer feedback & 7-day return request',
  'B2B bulk orders & corporate gifting',
  'Service suggestions & compliments',
];

const FAQS = [
  {
    q: 'How can I verify the origin and safety of Agri-Go produce?',
    a: 'Every produce item delivered includes a verified QR code or tamper-evident seal specifying the cooperative name, growing region (Da Lat, Dak Lak, Long An...), harvest date, and lab inspection certificates. You can also view live audit details on the product details page.',
  },
  {
    q: 'How does Agri-Go’s 7-day return and refund policy work?',
    a: 'We offer an unconditional 7-Day Freshness Guarantee. If any fruit or vegetable arrives bruised, withered, or fails to meet expected quality, simply submit a photo via our hotline 1900 6868 or this contact form. We will issue a 100% refund or redeliver fresh produce within 2 hours.',
  },
  {
    q: 'How long does delivery take in Ho Chi Minh City?',
    a: 'For urban districts of Ho Chi Minh City, you can choose 2-Hour Express Delivery or select scheduled slots (Morning 09:00 - 11:30 or Afternoon 14:00 - 17:30) so your kitchen is stocked right on time for meal prep.',
  },
  {
    q: 'I run an organic farm. How can I become an Agri-Go cooperative supplier?',
    a: 'Please select "Farm / Cooperative partnership application" on our contact form, providing your farm location and acreage. Our agronomists will follow up within 24 hours to conduct soil and water testing and establish purchase agreements.',
  },
  {
    q: 'Does Agri-Go offer recurring weekly subscription discounts?',
    a: 'Yes! We offer curated "Weekly Veggie Boxes" saving 15% - 20%, delivered 2-3 times per week complete with nutritional recipes crafted by wellness experts.',
  },
];

export function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: SUBJECT_OPTIONS[0],
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address (e.g., name@example.com).';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits, e.g., 0912345678).';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please select an inquiry topic.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please enter your message details.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters so we can help effectively.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      useToastStore.getState().push({
        type: 'error',
        message: 'Please review and correct the errors in the form.',
      });
      return;
    }

    setStatus('loading');

    // Simulate reliable dispatch with network delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1400));
      setStatus('success');
      useToastStore.getState().push({
        type: 'success',
        message: 'Message sent successfully! Our Agri-Go team will be in touch shortly.',
      });
    } catch (err) {
      setStatus('error');
      useToastStore.getState().push({
        type: 'error',
        message: 'Unable to send message right now. Please call our hotline 1900 6868.',
      });
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: SUBJECT_OPTIONS[0],
      message: '',
    });
    setErrors({});
    setStatus('idle');
  };

  return (
    <MainLayout>
      {/* 1. HERO SECTION */}
      <section id="contact" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-stone-50/40 to-white pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-lime-100/40 blur-3xl" />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-800 shadow-xs">
                <Sparkles size={13} className="text-emerald-600" />
                Let&apos;s Connect &bull; Support &amp; Partnerships
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#19342b] sm:text-6xl">
                We are always ready to help you
              </h1>
              <p className="mt-5 text-base leading-relaxed text-[#19342b]/75 sm:text-lg">
                Whether you need advice choosing fresh produce, updates on your delivery, or wish
                to partner with our agricultural network, Agri-Go is always here for you.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. CONTACT INFORMATION CARDS */}
      <section className="-mt-6 relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_INFO.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={idx * 0.08}>
                <div className="flex h-full flex-col justify-between rounded-3xl border border-emerald-900/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-emerald-600/30 hover:shadow-xl hover:shadow-emerald-900/5">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon size={22} />
                    </div>
                    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {item.title}
                    </p>
                    <h2 className="mt-1 text-base font-bold text-[#19342b]">{item.detail}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.sub}</p>
                  </div>
                  <a
                    href={item.actionHref}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    {item.actionText} <ArrowRight size={14} />
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* 3. CONTACT FORM & HIGHLIGHTS */}
      <section id="form" className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Left Guidance & Commitment Box */}
            <div className="lg:col-span-5">
              <Reveal>
                <div className="sticky top-28 space-y-8">
                  <div>
                    <p className="eyebrow">Send a Message</p>
                    <h2 className="mt-2 text-3xl font-extrabold text-[#19342b] sm:text-4xl">
                      Leave a note for our team
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#19342b]/75">
                      Please fill in your details. We guarantee absolute data privacy and will respond
                      as promptly as possible.
                    </p>
                  </div>

                  <div className="space-y-4 rounded-3xl border border-emerald-900/10 bg-[#fbfaf7] p-7">
                    <h3 className="text-sm font-bold text-[#19342b] uppercase tracking-wider">
                      Our Service Commitments:
                    </h3>
                    <ul className="space-y-3 text-xs leading-relaxed text-slate-700">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>Prompt responses within 2 business hours.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>Specialized consultants knowledgeable in clean food &amp; nutrition.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                        <span>Hassle-free 7-day replacements and full refund processing.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-amber-900/15 bg-amber-50/60 p-6">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Need urgent help with an active order?
                    </p>
                    <p className="mt-2 text-sm text-amber-950/80">
                      Please call our direct toll-free customer hotline at{' '}
                      <a href="tel:19006868" className="font-extrabold text-amber-800 underline">
                        1900 6868
                      </a>{' '}
                      for immediate assistance.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Right Contact Form Card */}
            <div className="lg:col-span-7">
              <Reveal delay={0.15}>
                <div className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-8 sm:p-12 shadow-xl shadow-emerald-950/5">
                  {status === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 text-center"
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 size={36} />
                      </div>
                      <h3 className="mt-5 text-2xl font-extrabold text-[#19342b]">
                        Message Sent Successfully!
                      </h3>
                      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                        Thank you <strong className="text-slate-800">{formData.fullName}</strong> for
                        reaching out to Agri-Go. Our team will contact you via phone or email shortly.
                      </p>

                      <div className="mt-8 flex justify-center gap-4">
                        <button
                          type="button"
                          onClick={handleResetForm}
                          className="rounded-xl border border-emerald-900/15 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-emerald-50"
                        >
                          Send another message
                        </button>
                        <Link to="/products" className="ink-button py-2.5 px-6">
                          Shop Fresh Produce
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-6">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                        <MessageSquare size={18} className="text-emerald-700" />
                        <h3 className="text-lg font-bold text-[#19342b]">Your Contact Information</h3>
                      </div>

                      {/* Full Name */}
                      <div>
                        <label
                          htmlFor="fullName"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          placeholder="e.g. Alex Nguyen"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className={`paper-input mt-2 w-full text-sm ${
                            errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                          }`}
                        />
                        {errors.fullName && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle size={13} /> {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email & Phone Grid */}
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                          >
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`paper-input mt-2 w-full text-sm ${
                              errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle size={13} /> {errors.email}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                          >
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            placeholder="0912 345 678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`paper-input mt-2 w-full text-sm ${
                              errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle size={13} /> {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Subject Selection */}
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Inquiry Topic <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="paper-input mt-2 w-full text-sm text-slate-800"
                        >
                          {SUBJECT_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message Content */}
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                        >
                          Message Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          rows={5}
                          placeholder="Describe your questions or requirements in detail..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={`paper-input mt-2 w-full text-sm ${
                            errors.message ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''
                          }`}
                        />
                        {errors.message && (
                          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle size={13} /> {errors.message}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="ink-button w-full py-3.5 text-base shadow-emerald-500/25 disabled:opacity-50"
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Sending message...</span>
                          </>
                        ) : (
                          <>
                            <Send size={17} />
                            <span>Send Message Now</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAP SECTION */}
      <section id="map-section" className="bg-[#fbfaf7] py-20 sm:py-28 border-t border-emerald-900/10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="eyebrow">Location Map</p>
                <h2 className="mt-2 text-3xl font-extrabold text-[#19342b] sm:text-4xl">
                  Visit Agri-Go Headquarters
                </h2>
              </div>
              <p className="max-w-md text-sm text-slate-600">
                Located in the heart of Ho Chi Minh City, our representative office warmly welcomes partners
                and clients for consultations and fresh produce tasting.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-white p-3 shadow-xl shadow-emerald-900/5">
              <iframe
                title="Agri-Go Location Map in Ho Chi Minh City"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.494668100784!2d106.69834717587637!3d10.773374289375176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x1787491dd46d36e6!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[380px] w-full rounded-2xl sm:h-[450px]"
              />
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 px-3 pb-2 text-xs text-slate-600">
                <span className="font-semibold text-[#19342b]">
                  Headquarters: AgriGo Tower, District 1, Ho Chi Minh City, Vietnam
                </span>
                <a
                  href="https://maps.google.com/?q=District+1+Ho+Chi+Minh+City"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                >
                  Open in Google Maps <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                <HelpCircle size={14} /> Quick Answers
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-[#19342b] sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                Find quick answers to the most common questions when ordering fresh produce at Agri-Go.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <Reveal key={faq.q} delay={idx * 0.06}>
                  <div className="overflow-hidden rounded-2xl border border-emerald-900/10 bg-[#fbfaf7] transition hover:border-emerald-600/30">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base font-bold text-[#19342b] sm:text-lg pr-4">
                        {faq.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-800 shadow-xs"
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                        >
                          <div className="border-t border-emerald-900/5 px-5 pb-6 pt-3 text-sm leading-relaxed text-slate-600 sm:px-6">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-14 text-center">
            <p className="text-sm text-slate-600">
              Still have questions?{' '}
              <a href="tel:19006868" className="font-bold text-emerald-700 hover:underline">
                Call our hotline 1900 6868
              </a>{' '}
              or reach out via the message form above.
            </p>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default ContactPage;
