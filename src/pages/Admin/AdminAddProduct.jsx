import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { createProductThunk } from "../../features/products/productSlice";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../services/api";
import { 
  Sparkles, 
  Image, 
  Layers, 
  Check, 
  Palette, 
  Gamepad, 
  Shirt, 
  Briefcase, 
  Zap, 
  Eye, 
  Compass, 
  HelpCircle, 
  Clock, 
  ArrowRight,
  UploadCloud,
  Plus,
  Cpu,
  MonitorPlay,
  Play
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://localhost:7015/api";

// Curated high-resolution professional photography matching available catalog categories
const PHOTO_PRESETS = [
  {
    category: "Watches",
    items: [
      {
        name: "Zenith Carbon-V X-1 Watch",
        price: 399,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        desc: "Premium carbon fiber chassis with ambient micro-AMOLED panel smartwatch, dual-core chipset, with up to 7-day technical energy reserve.",
      },
      {
        name: "Aether Classic Chronograph",
        price: 449,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80",
        desc: "Classic mechanical chronograph with handcrafted sapphire dial and precision timing.",
      }
    ],
  },
  {
    category: "Electronics",
    items: [
      {
        name: "Aether Aura SoundPod Earbuds",
        price: 129,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        desc: "True-audio hi-res spatial acoustics wireless earbuds featuring ANC and custom profiles.",
      },
      {
        name: "Volta Smart Hub",
        price: 89,
        image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80",
        desc: "Intelligent multi-port charger with GaN delivery and real-time safety telemetry.",
      }
    ],
  },
];

// Presets for customizable vector banners (SVG format)
const GRADIENTS = [
  { name: "Stealth Obsidian", start: "#0F172A", end: "#1E293B" },
  { name: "Quantum Purple", start: "#312E81", end: "#581C87" },
  { name: "Solar Crimson", start: "#7F1D1D", end: "#B91C1C" },
  { name: "Aurora Emerald", start: "#065F46", end: "#047857" },
  { name: "Space Cobalt", start: "#1E3A8A", end: "#1D4ED8" },
  { name: "Sleek Rose Velvet", start: "#881337", end: "#9F1239" },
];

const ICONS = [
  { name: "Watch Face", type: "watch" },
  { name: "Earbuds", type: "earbuds" },
  { name: "Keyboard", type: "keyboard" },
  { name: "Apparel", type: "fashion" },
  { name: "Shoe", type: "shoe" },
  { name: "Backpack", type: "backpack" },
  { name: "Sparkles", type: "sparkles" },
];

export const AdminAddProduct = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector((state) => state.products);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState(categories[0] || "Electronics");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef(null);
  const videoInputRef = React.useRef(null);

  // Assistant Console States
  const [activeAssistantTab, setActiveAssistantTab] = useState("presets");
  const [activePresetCategory, setActivePresetCategory] = useState("Watches");

  // Custom SVG Generator states
  const [gradientIndex, setGradientIndex] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState("Watch");
  const [designTitle, setDesignTitle] = useState("");
  const [designSub, setDesignSub] = useState("SHOPSPHERE SIGNATURE");
  const [designGrid, setDesignGrid] = useState("grid");
  const [designCode, setDesignCode] = useState(`SPEC-${Math.floor(1000 + Math.random() * 9000)}-X`);

  // Synchronize designTitle with user product name input if empty
  useEffect(() => {
    if (name) {
      setDesignTitle(name.toUpperCase());
    } else {
      setDesignTitle("NEW PRODUCT SPEC");
    }
  }, [name]);

  // Helper dynamic SVG builder returning complete vector code string
  const generateSvg = () => {
    const grad = GRADIENTS[gradientIndex] || GRADIENTS[0];
    
    let iconPath = "";
    if (selectedIcon === "Watch") {
      iconPath = `<circle cx="60" cy="80" r="45" fill="none" stroke="#FFFFFF" stroke-width="6" opacity="0.9" />
      <rect x="45" y="10" width="30" height="35" rx="6" fill="rgba(255,255,255,0.15)" stroke="#FFFFFF" stroke-width="4" />
      <rect x="45" y="115" width="30" height="35" rx="6" fill="rgba(255,255,255,0.15)" stroke="#FFFFFF" stroke-width="4" />
      <line x1="60" y1="80" x2="60" y2="55" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />
      <line x1="60" y1="80" x2="80" y2="80" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" />`;
    } else if (selectedIcon === "Earbuds") {
      iconPath = `<path d="M 15 90 A 45 45 0 0 1 105 90 L 105 110 A 10 10 0 0 1 95 120 L 85 120 A 10 10 0 0 1 75 110 L 75 90 L 15 90 L 15 110 A 10 10 0 0 1 5 120 L -5 120 A 10 10 0 0 1 -15 110" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round" />
      <rect x="5" y="85" width="16" height="30" rx="4" fill="#FFFFFF" />
      <rect x="99" y="85" width="16" height="30" rx="4" fill="#FFFFFF" />`;
    } else if (selectedIcon === "Keyboard") {
      iconPath = `<rect x="0" y="25" width="120" height="70" rx="10" fill="none" stroke="#FFFFFF" stroke-width="5" />
      <rect x="15" y="40" width="20" height="15" rx="3" fill="none" stroke="#FFFFFF" stroke-width="3" />
      <rect x="50" y="40" width="20" height="15" rx="3" fill="none" stroke="#FFFFFF" stroke-width="3" />
      <rect x="85" y="40" width="20" height="15" rx="3" fill="none" stroke="#FFFFFF" stroke-width="3" />
      <rect x="15" y="65" width="90" height="15" rx="3" fill="none" stroke="#FFFFFF" stroke-width="3" />`;
    } else if (selectedIcon === "Fashion") {
      iconPath = `<path d="M 20 20 L 45 35 L 55 15 L 75 15 L 85 35 L 110 20 L 100 65 L 85 65 L 85 120 L 35 120 L 35 65 L 20 65 Z" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
      <path d="M 50 15 A 10 10 0 0 0 80 15" fill="none" stroke="#FFFFFF" stroke-width="4" />`;
    } else if (selectedIcon === "Shoe") {
      iconPath = `<path d="M 10 110 L 115 110 L 115 70 L 85 45 L 45 45 L 35 75 L 10 95 Z" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linejoin="round" />
      <line x1="20" y1="110" x2="105" y2="110" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" />
      <path d="M 50 45 L 65 70" fill="none" stroke="#FFFFFF" stroke-width="3" />
      <path d="M 60 45 L 75 70" fill="none" stroke="#FFFFFF" stroke-width="3" />`;
    } else if (selectedIcon === "Backpack") {
      iconPath = `<rect x="20" y="30" width="80" height="90" rx="20" fill="none" stroke="#FFFFFF" stroke-width="5" />
      <path d="M 40 30 L 40 15 A 20 20 0 0 1 80 15 L 80 30" fill="none" stroke="#FFFFFF" stroke-width="4" />
      <rect x="35" y="70" width="50" height="40" rx="8" fill="rgba(255,255,255,0.15)" stroke="#FFFFFF" stroke-width="3" />`;
    } else {
      iconPath = `<path d="M 60 15 L 70 45 L 100 55 L 70 65 L 60 95 L 50 65 L 20 55 L 50 45 Z" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linejoin="round" />
      <path d="M 90 20 L 93 30 L 103 33 L 93 36 L 90 46 L 87 36 L 77 33 L 87 30 Z" fill="#FFFFFF" />
      <path d="M 30 75 L 32 82 L 39 84 L 32 86 L 30 93 L 28 86 L 21 84 L 28 82 Z" fill="#FFFFFF" />`;
    }

    const escapeXml = (str) => {
      return str.replace(/[<>&'"]/g, (c) => {
        switch (c) {
          case "<": return "&lt;";
          case ">": return "&gt;";
          case "&": return "&amp;";
          case "'": return "&apos;";
          case '"': return "&quot;";
          default: return c;
        }
      });
    };

    const safeTitle = escapeXml(designTitle.substring(0, 24).toUpperCase());
    const safeSub = escapeXml(designSub.substring(0, 30).toUpperCase());
    const safeCode = escapeXml(designCode.toUpperCase());

    const gridSvg = designGrid === "grid" 
      ? `<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" />`
      : designGrid === "dots"
      ? `<pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="rgba(255, 255, 255, 0.09)" /></pattern><rect width="100%" height="100%" fill="url(#dots)" />`
      : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${grad.start};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${grad.end};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" />
  ${gridSvg}
  
  <rect x="25" y="25" width="350" height="350" rx="16" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
  <line x1="25" y1="45" x2="45" y2="45" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
  <line x1="45" y1="25" x2="45" y2="45" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
  
  <g transform="translate(140, 95)">
    ${iconPath}
  </g>
  
  <text x="200" y="275" text-anchor="middle" fill="#FFFFFF" font-family="'Space Grotesk', 'Inter', sans-serif" font-size="18" font-weight="900" letter-spacing="0.5">${safeTitle}</text>
  <text x="200" y="302" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="'Inter', sans-serif" font-size="9" font-weight="700" letter-spacing="1.5">${safeSub}</text>
  
  <text x="45" y="350" fill="rgba(255,255,255,0.25)" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700">CODE: ${safeCode}</text>
  <text x="355" y="350" text-anchor="end" fill="rgba(255,255,255,0.25)" font-family="'JetBrains Mono', monospace" font-size="7.5" font-weight="700">SHOPSPHERE SAT // V5.2</text>
</svg>`;
  };

  const applyCustomSvgDesign = () => {
    const rawSvg = generateSvg();
    const base64Data = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(rawSvg)));
    setImages(prev => [base64Data, ...prev.filter(u => u !== base64Data)]);
    toast.success("Design converted to offline vector base64 and embedded!");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select image files only");
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Each image must be under 10MB");
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    if (validFiles.length > 0) {
      toast.success(`${validFiles.length} image(s) uploaded from device!`);
    }
    e.target.value = "";
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video must be under 50MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setVideoUrl(ev.target.result);
      toast.success("Video uploaded from device!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleApplyPreset = (item, itemCategory) => {
    setName(item.name);
    setPrice(item.price.toString());
    setDescription(item.desc);
    setImages([item.image]);
    setVideoUrl("");
    setCategory(itemCategory);
    if (!stock) setStock("50");
    toast.success(`Standard metadata imported for ${item.name}!`, {
      icon: "⚡"
    });
  };

  const uploadFile = async (base64Data) => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: base64Data }),
    });
    if (!res.ok) throw new Error('File upload failed');
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const primaryImage = images.length > 0 ? images[0] : "";
    if (!name.trim() || !description.trim() || !price || !primaryImage || !stock) {
      toast.error("Please fill in all product specifications (at least one image required)!");
      return;
    }

    setLoading(true);
    try {
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock);

      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        toast.error("Invalid price parameter");
        setLoading(false);
        return;
      }

      if (isNaN(parsedStock) || parsedStock < 0) {
        toast.error("Invalid stock level");
        setLoading(false);
        return;
      }

      toast.loading("Uploading media files...", { id: 'upload' });

      const uploadedUrls = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/uploads/')) {
          uploadedUrls.push(img);
        } else {
          const url = await uploadFile(img);
          uploadedUrls.push(url);
        }
      }

      let uploadedVideoUrl = "";
      if (videoUrl) {
        if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://') || videoUrl.startsWith('/uploads/')) {
          uploadedVideoUrl = videoUrl;
        } else {
          uploadedVideoUrl = await uploadFile(videoUrl);
        }
      }

      toast.dismiss('upload');
      toast.success("All files uploaded!", { duration: 1500 });

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        image: uploadedUrls[0] || '',
        images: uploadedUrls,
        videoUrl: uploadedVideoUrl,
        category,
        stock: parsedStock,
      };

      await dispatch(createProductThunk(productData)).unwrap();

      toast.success("New product initialized in stock successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.dismiss('upload');
      toast.error(err || "Failed to catalog product");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategoryPresets = PHOTO_PRESETS.find(p => p.category === activePresetCategory)?.items || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="space-y-1">
        <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          <Sparkles className="text-blue-650 animate-pulse" size={24} />
          Catalog New Product
        </h1>
        <p className="text-xs text-gray-400">
          Designate specifications, launch costs, and catalog descriptions. Input a custom image URL or use our active professional asset tools.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Core Product Input Form Box */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
          <Input
            label="Product Identifier Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ShopSphere Pro Wearable"
          />

          <div>
            <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2">
              Catalog description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Introduce custom technical specifications and parameters..."
              className="w-full bg-gray-55 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl p-3.5 text-xs text-gray-750 dark:text-gray-300 placeholder-gray-400 select-none outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-gray-900 transition-all font-semibold"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Invoiced Price (INR) *"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12500"
            />
            <Input
              label="Stock Allocation level *"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2">
              Collection category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-55 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl py-3 px-4 text-xs font-semibold text-gray-750 dark:text-gray-300 outline-none cursor-pointer focus:ring-2 focus:ring-blue-600 transition-all"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2">
              Visual Assets ({images.length} image{images.length !== 1 ? 's' : ''}) *
            </label>

            {/* Image URL input */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input
                  label="Add Image URL"
                  value=""
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      setImages(prev => [...prev, e.target.value.trim()]);
                      e.target.value = "";
                    }
                  }}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload images from device (multi-select)"
                className="flex-shrink-0 w-10 h-10 mb-0.5 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-gray-400 hover:text-blue-500 transition-all cursor-pointer"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Uploaded images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-850">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-white flex items-center justify-center group">
                    <img src={img} alt={`Asset ${idx + 1}`} className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove image"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-blue-600/90 text-white text-[7px] font-bold text-center py-0.5 uppercase">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Video upload */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                Product Video (optional)
              </label>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    value={videoUrl && !videoUrl.startsWith('data:') ? videoUrl : ''}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4 or upload"
                  />
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  title="Upload video from device"
                  className="flex-shrink-0 w-10 h-10 mb-0.5 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-gray-400 hover:text-purple-500 transition-all cursor-pointer"
                >
                  <MonitorPlay size={18} />
                </button>
              </div>
              {videoUrl && (
                <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-150 dark:border-gray-850 flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border bg-gray-900 flex-shrink-0 flex items-center justify-center">
                    <Play size={16} className="text-white" />
                  </div>
                  <div className="space-y-0.5 truncate flex-1 text-[10px]">
                    <span className="text-gray-400 block font-bold uppercase tracking-wider">Video Attached</span>
                    <p className="text-gray-650 dark:text-gray-300 font-mono truncate">{videoUrl.startsWith('data:') ? 'Uploaded video file' : videoUrl}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className="text-red-400 hover:text-red-600 text-[10px] font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={loading} className="w-full">
              Authorize Product Specification Enrolment
            </Button>
          </div>
        </form>

        {/* Visual Asset Suite Hub (Curated Presets / Vector Draw) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 bg-gradient-to-r from-gray-900 to-slate-900 text-white rounded-2xl shadow-md border border-gray-800 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="space-y-1 relative z-10">
              <span className="text-[9px] uppercase tracking-widest font-black text-blue-400 flex items-center gap-1">
                <Cpu size={10} className="animate-spin text-blue-400" style={{ animationDuration: "6s" }} />
                Smart Assist Suite
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">Visual Asset Engine</h2>
              <p className="text-[10px] text-gray-300 leading-normal">
                Easily generate sample image codes or click standard ready-to-use e-commerce listings in a single frame.
              </p>
            </div>

            {/* Assistant sub-navigation tabs */}
            <div className="flex bg-gray-950 border border-gray-800 rounded-lg p-1 select-none relative z-10 text-[10px]">
              <button
                type="button"
                onClick={() => setActiveAssistantTab("presets")}
                className={`flex-1 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
                  activeAssistantTab === "presets"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                💎 Curated Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveAssistantTab("customSVG")}
                className={`flex-1 py-1.5 rounded-md font-bold uppercase tracking-wider transition-all cursor-pointer border-0 ${
                  activeAssistantTab === "customSVG"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🎨 Custom Vector Draw
              </button>
            </div>
          </div>

          {activeAssistantTab === "presets" ? (
            <div className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Compass size={13} className="text-blue-500" />
                  Premium Photograph Library
                </h3>
                <p className="text-[10px] text-gray-400">
                  Select a category to view high-resolution photography. Click any card to apply the entire model specs instantly!
                </p>
              </div>

              {/* Sub-categories selector row */}
              <div className="flex flex-wrap gap-1 border-b pb-3 border-gray-100 dark:border-gray-800 select-none">
                {PHOTO_PRESETS.map(p => (
                  <button
                    key={p.category}
                    type="button"
                    onClick={() => setActivePresetCategory(p.category)}
                    className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest cursor-pointer border transition-all ${
                      activePresetCategory === p.category
                        ? "bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-950"
                        : "bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 border-gray-150 dark:border-gray-800"
                    }`}
                  >
                    {p.category}
                  </button>
                ))}
              </div>

              {/* Presets grid checklist */}
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {selectedCategoryPresets.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleApplyPreset(item, activePresetCategory)}
                    className={`p-3 rounded-xl border border-gray-150 dark:border-gray-800 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 hover:border-blue-200 transition-all cursor-pointer flex gap-3 text-left items-center group relative`}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden border bg-gray-50 flex-shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="space-y-1 flex-1 leading-normal">
                      <h4 className="font-extrabold text-gray-800 dark:text-white text-xs group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-[9px] text-gray-400 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold font-mono">
                          ₹{item.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[8px] bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-600 group-hover:text-white font-extrabold uppercase px-2 py-0.5 rounded transition-all">
                          Auto-Apply
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <Palette size={13} className="text-blue-500" />
                  Sleek Vector Poster Lab
                </h3>
                <p className="text-[10px] text-gray-400">
                  Build custom beautiful abstract vector placeholders locally. Best for mockups and lightning-fast developer testing!
                </p>
              </div>

              {/* Vector Builder Controls */}
              <div className="space-y-3.5">
                {/* 1. Gradients picker */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase text-gray-400 font-bold">Theme Canvas Colors</label>
                  <div className="grid grid-cols-3 gap-1">
                    {GRADIENTS.map((grad, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setGradientIndex(i)}
                        className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 cursor-pointer outline-none transition-all ${
                          gradientIndex === i 
                            ? "border-blue-550 ring-2 ring-blue-100 dark:ring-blue-900/30 font-bold" 
                            : "border-gray-150 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-950"
                        }`}
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full block border border-white/20 shadow-sm" 
                          style={{ background: `linear-gradient(135deg, ${grad.start} 0%, ${grad.end} 100%)` }}
                        />
                        <span className="text-[8px] truncate text-gray-700 dark:text-gray-300 uppercase font-black tracking-wider leading-none">
                          {grad.name.split(" ")[1] || grad.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Vector Center Category Icons */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase text-gray-400 font-bold">Vector Center Icon Graphic</label>
                  <div className="flex flex-wrap gap-1">
                    {ICONS.map((ico, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedIcon(ico.type)}
                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest cursor-pointer border transition-all ${
                          selectedIcon === ico.type
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-gray-55 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 border-gray-150 dark:border-gray-800"
                    }`}
                      >
                        {ico.name.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Type controls */}
                <div className="grid grid-cols-2 gap-3 pb-1">
                  <div>
                    <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Overlay Grid Style</label>
                    <select
                      value={designGrid}
                      onChange={(e) => setDesignGrid(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-lg py-1.5 px-2.5 text-[10px] font-bold text-gray-750 dark:text-gray-300"
                    >
                      <option value="grid">Fine Blueprint Grid</option>
                      <option value="dots">Modern Dot Grid</option>
                      <option value="none">Solid Clean Minimal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Diagnostics ID</label>
                    <input
                      type="text"
                      value={designCode}
                      onChange={(e) => setDesignCode(e.target.value)}
                      placeholder="SYS-001"
                      className="w-full bg-gray-55 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-lg py-1 px-2.5 text-[10px] font-mono font-bold text-gray-750 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1.5">
                  {/* Generated Vector live frame */}
                  <div className="space-y-1">
                    <span className="block text-[9px] uppercase tracking-widest font-black text-gray-400">Live Active Board</span>
                    <div className="aspect-square w-full rounded-xl overflow-hidden border border-gray-150 dark:border-gray-850 shadow-sm bg-gray-900/10 flex items-center justify-center p-1.5">
                      <div 
                        className="w-full h-full object-contain"
                        dangerouslySetInnerHTML={{ __html: generateSvg() }}
                      />
                    </div>
                  </div>

                  {/* Description & trigger application */}
                  <div className="flex flex-col justify-between py-1">
                    <div className="space-y-1 bg-gray-55 dark:bg-gray-950 p-3 rounded-xl border leading-relaxed">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Zap size={11} className="text-amber-500 animate-pulse" />
                        Vector Details
                      </p>
                      <p className="text-[9px] text-gray-650 dark:text-gray-400">
                        Title overlays standard input name <strong>{name || "(Blank Name)"}</strong>. Change standard brand colors above to match project guidelines.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={applyCustomSvgDesign}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <UploadCloud size={12} />
                      Embed Custom Design
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;

