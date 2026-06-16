import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { ProfileCard, ProfileForm, AddressForm } from "../../components/profile/ProfileComponents";
import { ShieldCheck, User } from "lucide-react";

export const Profile = () => {
  const { user, updateProfile } = useAuth();

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="flex justify-center text-gray-400">
          <User size={48} />
        </div>
        <p className="text-sm font-bold text-gray-450 uppercase tracking-widest">
          Authentication Required
        </p>
        <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
          Please sign in to verify your session credentials and configure your delivery destinations.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header text */}
      <div className="text-center sm:text-left space-y-1.5 pb-4 border-b border-gray-105 dark:border-gray-850">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
          <ShieldCheck className="text-blue-500" size={24} />
          Your Safety Cabinet
        </h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          Control session status, contact details, and location defaults
        </p>
      </div>

      {/* Grid template layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar Highlight */}
        <div className="md:col-span-1 space-y-6">
          <ProfileCard user={user} />
          
          <div className="hidden md:block p-4 bg-gray-50 dark:bg-gray-900 border border-dashed rounded-2xl text-[11px] font-semibold text-gray-400 leading-relaxed space-y-1">
            <h5 className="font-extrabold uppercase text-gray-500 tracking-wider">Privacy Standard</h5>
            <p>Your session is guarded by multi-tenant OAuth protocols. Address parameters are only transmitted during checkout events to process customs clearances.</p>
          </div>
        </div>

        {/* Right Side: Credentials & Address Forms */}
        <div className="md:col-span-2 space-y-6">
          <ProfileForm user={user} onUpdate={updateProfile} />
          <AddressForm user={user} onUpdate={updateProfile} />
        </div>

      </div>

    </div>
  );
};

export default Profile;
