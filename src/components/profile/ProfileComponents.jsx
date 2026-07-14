import React, { useState } from "react";
import { User, Mail, Phone, MapPin, BadgeCheck, Camera } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { toast } from "react-hot-toast";

// PROFILE HIGHLIGHT CARD

export const ProfileCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
      {/* Avatar node */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg">
          {user.name ? user.name.charAt(0).toUpperCase() : "?"}
        </div>
        <button className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-md text-gray-500 hover:text-blue-600 transition-colors">
          <Camera size={14} />
        </button>
      </div>

      {/* Info labels */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-center gap-1.5">
          <h3 className="text-base font-black text-gray-900 dark:text-white">
            {user.name}
          </h3>
          <BadgeCheck size={16} className="text-blue-500" />
        </div>
        <p className="text-xs text-gray-450 font-semibold flex items-center justify-center gap-1.5">
          <Mail size={12} />
          {user.email}
        </p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-500 mt-2">
          {user.role} Status
        </span>
      </div>
    </div>
  );
};

// PROFILE METADATA DETAILS FORM

export const ProfileForm = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required.");
      return;
    }

    setLoading(true);
    try {
      await onUpdate({ name: name.trim(), email: email.trim(), phone: phone.trim() });
      toast.success("Profile credentials updated successfully!");
    } catch (err) {
      toast.error(err || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
        Personal Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
        <Input
          label="Email Address *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
        />
      </div>

      <Input
        label="Contact Telephone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="9876543210"
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>
          Save Credentials
        </Button>
      </div>
    </form>
  );
};

// PROFILE SHIPPING ADDRESS FORM

export const AddressForm = ({ user, onUpdate }) => {
  const [address, setAddress] = useState(user.address || "");
  const [city, setCity] = useState(user.city || "");
  const [state, setState] = useState(user.state || "");
  const [zipCode, setZipCode] = useState(user.zipCode || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onUpdate({
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
      });
      toast.success("Delivery shipping address saved!");
    } catch (err) {
      toast.error(err || "Failed to save address details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-gray-900 dark:text-gray-100 tracking-wider pb-3 border-b border-gray-100 dark:border-gray-850">
        Default Shipping Address
      </h3>

      <Input
        label="Flat/Street Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="123 Luxury Road, apt 5"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Mumbai"
        />
        <Input
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="Maharashtra"
        />
        <Input
          label="Pincode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="400001"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} variant="primary">
          Save Address
        </Button>
      </div>
    </form>
  );
};
