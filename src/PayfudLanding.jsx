import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function PayfudLanding() {
  const [form, setForm] = useState({
    restaurantName: "",
    contactName: "",
    email: "",
    phone: "",
    city: "St. Petersburg",
    state: "FL",
    website: "",
    role: "Owner",
    accept: false,
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    gclid: "",
    fbclid: "",
    ref: "",
    recaptchaToken: "",
  });

  const [status, setStatus] = useState({ loading: false, success: false, error: "" });
  const ENDPOINT = "https://payfund-backend.onrender.com/api/leads"; // Updated to point to our backend
  const SLACK_WEBHOOK = ""; // optional
  const THANK_YOU_URL = ""; // optional

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const updates = {
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        gclid: params.get("gclid") || "",
        fbclid: params.get("fbclid") || "",
        ref: document.referrer || "",
      };
      setForm((f) => ({ ...f, ...updates }));
    } catch {}
  }, []);

  const validateEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, success: false, error: "" });

    if (!form.restaurantName || !form.contactName || !form.email) {
      return setStatus((s) => ({ ...s, error: "Please fill in restaurant name, your name, and email." }));
    }
    if (!validateEmail(form.email)) {
      return setStatus((s) => ({ ...s, error: "Please enter a valid email address." }));
    }
    if (form.website && !/^https?:\/\//i.test(form.website)) {
      return setStatus((s) => ({ ...s, error: "Website should start with http:// or https://" }));
    }
    if (!form.accept) {
      return setStatus((s) => ({ ...s, error: "Please agree to be contacted." }));
    }

    setStatus({ loading: true, success: false, error: "" });

    try {
      const payload = { 
        ...form, 
        submittedAt: new Date().toISOString(), 
        location: "St. Petersburg, FL", 
        launchStatus: "Launched" 
      };
      
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.message || `Request failed: ${res.status}`);
      }

      // Optional Slack notification
      if (SLACK_WEBHOOK) {
        try {
          await fetch(SLACK_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: `🍽️ New Payfud signup — St. Petersburg\nRestaurant: ${form.restaurantName}\nContact: ${form.contactName}\nEmail: ${form.email}` 
            }),
          });
        } catch (slackError) {
          console.log('Slack notification failed:', slackError);
        }
      }

      setStatus({ loading: false, success: true, error: "" });

      if (THANK_YOU_URL) {
        setTimeout(() => {
          window.location.assign(THANK_YOU_URL);
        }, 2000);
      }

    } catch (err) {
      console.error('Form submission error:', err);
      setStatus({ 
        loading: false, 
        success: false, 
        error: err?.message || "Something went wrong. Please try again." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-slate-900">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Temporary logo replacement */}
            <div className="h-9 w-9 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold tracking-tight text-blue-900">Payfud</span>
          </div>
          <a href="#signup" className="text-sm font-medium text-blue-700 hover:text-blue-800">Get Listed</a>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">Now live in St. Petersburg, FL</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Turn hungry locals into loyal regulars in St. Petersburg with <span className="text-blue-900">Payfud</span>
            </h1>
            <p className="text-slate-600 text-lg">
              Payfud is now active in St. Petersburg, FL. Claim your profile, boost visibility, and turn low-performing reviews into growth.
            </p>
            <a href="#signup" className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-white font-semibold shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500">Get Listed</a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6" id="signup">
            <h2 className="text-xl font-semibold mb-1">Get listed on Payfud — St. Petersburg</h2>
            <p className="text-sm text-slate-600 mb-6">We'll verify your details and publish your listing for diners searching in St. Petersburg, FL.</p>

            {status.success ? (
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
                <p className="font-medium text-blue-800">Thanks — we've got your details! 🎉</p>
                <p className="text-sm text-blue-700 mt-1">We'll confirm your listing details and share a link once it's live. An email has been sent to our team.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Restaurant name *</label>
                  <input 
                    name="restaurantName" 
                    value={form.restaurantName} 
                    onChange={handleChange} 
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="e.g., Bella Napoli" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Your name *</label>
                  <input 
                    name="contactName" 
                    value={form.contactName} 
                    onChange={handleChange} 
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Jane Doe" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="you@restaurant.com" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="(555) 555-5555" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Website</label>
                  <input 
                    type="url" 
                    name="website" 
                    value={form.website} 
                    onChange={handleChange} 
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="https://example.com" 
                  />
                </div>
                <div className="flex items-start gap-3">
                  <input 
                    id="accept" 
                    type="checkbox" 
                    name="accept" 
                    checked={form.accept} 
                    onChange={handleChange} 
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  />
                  <label htmlFor="accept" className="text-sm text-slate-700">I agree to receive email updates from Payfud.</label>
                </div>
                {status.error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-sm">
                    {status.error}
                  </div>
                )}
                <button 
                  type="submit" 
                  disabled={status.loading} 
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-3 text-white font-semibold hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {status.loading ? "Submitting…" : "Create My Profile"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[{
            title: "1) Tell us about your spot",
            text: "Share your basics: cuisine, neighborhood, hours, and website.",
          },{
            title: "2) We build your listing",
            text: "Our team verifies details, optimizes your profile, and adds photos if provided.",
          },{
            title: "3) Get discovered",
            text: "Start showing up for hungry locals in St. Pete and track results.",
          }].map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold mb-1">{card.title}</h3>
              <p className="text-sm text-slate-600">{card.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}