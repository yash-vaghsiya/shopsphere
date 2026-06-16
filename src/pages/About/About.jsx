import React from "react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Award, ShieldCheck, HeartPulse, Sparkles } from "lucide-react";

export const About = () => {
  const values = [
    {
      title: "Tactile Quality First",
      desc: "We prioritize weight, thermal conduction, and durability before distribution.",
      icon: <Award size={20} className="text-blue-500" />,
    },
    {
      title: "Complete Security",
      desc: "No plaintext logins or exposed storage variables. Your payment records are isolated via encrypted secure tunnels.",
      icon: <ShieldCheck size={20} className="text-blue-500" />,
    },
    {
      title: "Eco Conscious Craft",
      desc: "Our global partners utilize hypo-allergenic, recyclable, or organically certified materials for production.",
      icon: <HeartPulse size={20} className="text-blue-500" />,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <Breadcrumb items={[{ label: "About Our Story", path: "/about" }]} />

      {/* Grid cover block */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-500 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles size={12} className="text-yellow-500" />
            Vetted Brand Distribution
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tighter">
            Our Mission: Shaping Premium E-Commerce
          </h1>
          <p className="text-sm text-gray-650 dark:text-gray-350 leading-relaxed">
            At ShopSphere, we are on a quest to strip away the clutter of standard online buying. We build a fully integrated, state-synced, and beautifully presented showcase of curated luxury luxury showcases.
          </p>
          <p className="text-sm text-gray-650 dark:text-gray-350 leading-relaxed">
            From tactical VR gear to surgical-grade titanium smartphones, we secure authentic partnerships directly with brands. This completely bypasses secondary resellers, guaranteeing authentic models with active warranty protections.
          </p>
        </div>

        {/* Highlight illustration */}
        <div className="md:col-span-5 flex justify-center">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden bg-gray-50 border border-gray-150">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600"
              alt="Luxury clothing distribution apparel hanger"
              className="w-full h-full object-cover rounded-2xl shadow-md scale-105 hover:scale-100 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="space-y-8 pt-10 border-t border-gray-150 dark:border-gray-850">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Our Core Anchors</h2>
          <p className="text-xs text-gray-450 font-bold uppercase tracking-widest">Principles driving the ShopSphere experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 shadow-sm space-y-4"
            >
              <div className="p-3 bg-gray-55 dark:bg-gray-850 rounded-xl w-fit">
                {v.icon}
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{v.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
