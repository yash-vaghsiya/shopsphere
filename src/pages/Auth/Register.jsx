// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { UserPlus } from "lucide-react";
// import { useAuth } from "../../hooks/useAuth";
// import { Button } from "../../components/common/Button";
// import { Input } from "../../components/common/Input";
// import { toast } from "react-hot-toast";

// export const Register = () => {
//   const { register: registerUser } = useAuth();
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name.trim() || !email.trim() || !password.trim()) {
//       toast.error("Please fill in all details.");
//       return;
//     }

//     setLoading(true);
//     try {
//       await registerUser({ name: name.trim(), email: email.trim(), password });
//       toast.success("Registration complete! Welcome aboard ShopSphere.");
//       navigate("/");
//     } catch (err) {
//       toast.error(err || "Registration failed. Try simple credentials.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="space-y-1 text-center">
//         <h2 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
//           Create ShopSphere Space
//         </h2>
//         <p className="text-xs text-gray-400">
//           Unlock premium shopping services with zero platform fees
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           label="Full Name *"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="John Doe"
//           required
//         />
//         <Input
//           label="Email address *"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="john@example.com"
//           required
//         />
//         <div className="space-y-1">
//           <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//             Secure Password *
//           </label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="•••••••• (Min 6 characters)"
//             required
//             className="mt-1 block h-10 w-full px-3.5 bg-white dark:bg-gray-955 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
//           />
//         </div>

//         <Button type="submit" loading={loading} className="w-full h-11 text-xs">
//           <UserPlus size={14} className="mr-2" />
//           Create Account
//         </Button>
//       </form>

//       <p className="text-xs text-gray-450 text-center">
//         Already a premium member?{" "}
//         <Link to="/login" className="text-blue-600 hover:underline font-bold">
//           Sign In
//         </Link>
//       </p>
//     </div>
//   );
// };

// export default Register;





import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { toast } from "react-hot-toast";

export const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://localhost:7015/api";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all details.");
      return;
    }

    setLoading(true);

    try {
      // const response = await fetch(
      //   "https://localhost:7001/api/Auth/register",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       firstName: name,
      //       lastName: "",
      //       email: email.trim(),
      //       password: password,
      //     }),
      //   }
      // );
      const response = await fetch(
  `${API_URL}/Auth/register`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: name,
      lastName: "",
      email: email.trim(),
      password,
    }),
  }
);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.title ||
          "Registration failed."
        );
      }

      // toast.success("Registration complete!");

      // navigate("/login");

      localStorage.setItem("token", data.token);

localStorage.setItem(
  "user",
  JSON.stringify(data.user)
);

navigate("/");
window.location.reload();
    } catch (error) {
      console.error(error);

      toast.error(
        error.message ||
        "Unable to connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
          Create ShopSphere Space
        </h2>
        <p className="text-xs text-gray-400">
          Unlock premium shopping services with zero platform fees
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
        />
        <Input
          label="Email address *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
        />
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Secure Password *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••• (Min 6 characters)"
            required
            className="mt-1 block h-10 w-full px-3.5 bg-white dark:bg-gray-955 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full h-11 text-xs">
          <UserPlus size={14} className="mr-2" />
          Create Account
        </Button>
      </form>

      <p className="text-xs text-gray-450 text-center">
        Already a premium member?{" "}
        <Link to="/login" className="text-blue-600 hover:underline font-bold">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;