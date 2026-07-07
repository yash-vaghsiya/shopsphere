import React, { useState } from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

const CONTACT_API = "https://localhost:7015/api/ContactQueries";

const getAuthHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
};

export const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !msg.trim()) {
      toast.error("Please fill in all details.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(CONTACT_API, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ Name: name.trim(), Email: email.trim(), Subject: subject.trim(), Message: msg.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.Message || `Server returned ${res.status}`);
      }

      setName("");
      setEmail("");
      setSubject("");
      setMsg("");
      toast.success("Message dispatched successfully! We'll reply within 24 hours.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to submit query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumb items={[{ label: "Get In Touch", path: "/contact" }]} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Contact Info (Takes 5 columns) */}
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tighter">
              Get In Touch
            </h1>
            <p className="text-xs text-gray-450 uppercase tracking-widest font-bold">
              We respond to all queries within 1 business day
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-150">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                <Mail size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400">Email Dispatch</h4>
                <p className="text-xs font-bold text-gray-750 dark:text-gray-300 mt-0.5">support@shopsphere.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                <Phone size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400">Direct Line</h4>
                <p className="text-xs font-bold text-gray-750 dark:text-gray-300 mt-0.5">+91 9999999999</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
                <MapPin size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400">Headquarters</h4>
                <p className="text-xs font-bold text-gray-750 dark:text-gray-300 mt-0.5">A-12 Luxury Tower, G-Block BKC, Mumbai 400051</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (Takes 7 columns) */}
        <div className="md:col-span-7 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 mb-2">
              <MessageSquare size={14} className="text-blue-500" />
              Write Your Message
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <Input
              label="Subject *"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Wholesale Inquiry, Order Support, Feedback"
              required
            />

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Detailed Message *
              </label>
              <textarea
                required
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Brief us about your wholesale inquiry or support request..."
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading} className="px-6 py-3.5">
                <Send size={14} className="mr-2" />
                Dispatch Query
              </Button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
