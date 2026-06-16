// import React, { useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { LogIn, HelpCircle } from "lucide-react";
// import { useAuth } from "../../hooks/useAuth";
// import { Button } from "../../components/common/Button";
// import { Input } from "../../components/common/Input";
// import { toast } from "react-hot-toast";

// export const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Safe redirect path lookup
//   const fromPath = (location.state)?.from?.pathname || "/";

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!email.trim() || !password.trim()) {
//       toast.error("Both email and password are required.");
//       return;
//     }

//     setLoading(true);
//     try {
//       await login({ email: email.trim(), password });
//       toast.success("Welcome back! Signed in securely.");
//       navigate(fromPath, { replace: true });
//     } catch (err) {
//       toast.error(err || "Check your credentials and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="space-y-1 text-center">
//         <h2 className="text-xl font-black text-gray-950 dark:text-white tracking-tight">
//           Sign In to ShopSphere
//         </h2>
//         <p className="text-xs text-gray-400">
//           Access your personalized cart, likes and historical order receipt
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Input
//           label="Email address *"
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="yourname@example.com"
//           required
//         />

//         <div className="space-y-1">
//           <div className="flex justify-between items-center">
//             <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
//               Password *
//             </label>
//             <Link
//               to="/forgot-password"
//               className="text-[10px] text-blue-600 dark:text-blue-500 font-bold hover:underline uppercase tracking-wide"
//             >
//               Forgot code?
//             </Link>
//           </div>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             placeholder="••••••••"
//             required
//             className="mt-1 block h-10 w-full px-3.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
//           />
//         </div>

//         <Button type="submit" loading={loading} className="w-full h-11 text-xs">
//           <LogIn size={14} className="mr-2" />
//           Continue to Store
//         </Button>
//       </form>

//       {/* Guest mock logins hint box to ease evaluation */}
//       <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-150 text-[11px] text-blue-650 dark:text-blue-400 space-y-1 leading-relaxed">
//         <span className="font-extrabold uppercase tracking-wide flex items-center gap-1">
//           <HelpCircle size={12} /> Live Evaluation Accounts:
//         </span>
//         <p>
//           • Admin: <span className="font-bold">admin@shopsphere.com</span> (pwd: <span className="font-bold">admin123</span>)
//         </p>
//         <p>
//           • Customer: <span className="font-bold">user@shopsphere.com</span> (pwd: <span className="font-bold">user123</span>)
//         </p>
//       </div>

//       <p className="text-xs text-gray-500 text-center">
//         New to premium store?{" "}
//         <Link to="/register" className="text-blue-600 hover:underline font-bold">
//           Create account
//         </Link>
//       </p>
//     </div>
//   );
// };

// export default Login;




import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, HelpCircle } from "lucide-react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { toast } from "react-hot-toast";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://localhost:7015/api";
  const fromPath = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email.trim() || !password.trim()) {
    toast.error("Both email and password are required.");
    return;
  }

  setLoading(true);

  try {
    // const response = await fetch(
    //   "https://localhost:7001/api/Auth/login",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       email: email.trim(),
    //       password: password,
    //     }),
    //   }
    // );
    const response = await fetch(
  `${API_URL}/Auth/login`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
        "Invalid email or password."
      );
    }

    localStorage.setItem("token", data.token);

    if (data.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );
    }

    toast.success("Login successful!");

    navigate("/", {
      replace: true,
    });
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
          Sign In to ShopSphere
        </h2>

        <p className="text-xs text-gray-400">
          Access your personalized cart, likes and historical order receipt
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address *"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="yourname@example.com"
          required
        />

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Password *
            </label>

            <Link
              to="/forgot-password"
              className="text-[10px] text-blue-600 dark:text-blue-500 font-bold hover:underline uppercase tracking-wide"
            >
              Forgot code?
            </Link>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="mt-1 block h-10 w-full px-3.5 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>

        {/* <Button
          type="submit"
          loading={loading}
          className="w-full h-11 text-xs"
       >
          <LogIn size={14} className="mr-2" />
          Continue to Store
        </Button> */}
          <Button type="submit" loading={loading} className="w-full h-11 text-xs">
           <LogIn size={14} className="mr-2" />
       Continue to Store
        </Button>
      </form>

      <div className="p-4 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-150 text-[11px] text-blue-650 dark:text-blue-400 space-y-1 leading-relaxed">
        <span className="font-extrabold uppercase tracking-wide flex items-center gap-1">
          <HelpCircle size={12} />
          Live Evaluation Accounts:
        </span>

        <p>
          • Admin:{" "}
          <span className="font-bold">
            admin@shopsphere.com
          </span>{" "}
          (pwd:{" "}
          <span className="font-bold">
            admin123
          </span>
          )
        </p>

        <p>
          • Customer:{" "}
          <span className="font-bold">
            user@shopsphere.com
          </span>{" "}
          (pwd:{" "}
          <span className="font-bold">
            user123
          </span>
          )
        </p>
      </div>

      <p className="text-xs text-gray-500 text-center">
        New to premium store?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:underline font-bold"
        >
          Create account
        </Link>
      </p>
    </div>
  );
};

export default Login;