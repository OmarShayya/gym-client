import { useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
} from "react-icons/fa";
import { IoFitness } from "react-icons/io5";
import { useLogin } from "../../hooks/useAuth";
import { useCursorFollow } from "../../hooks/useCursorFollow";
import AnimatedBackground from "../../components/AnimatedBackground";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const AdminLoginPage = () => {
  const login = useLogin();

  const [showPassword, setShowPassword] = useState(false);
  const { mousePosition, isVisible, isMoving } = useCursorFollow();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />

      {/* Cursor Glow Effect */}
      {isVisible && (
        <>
          <div
            className={`cursor-glow ${isMoving ? "moving" : ""}`}
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              opacity: isMoving ? 0.8 : 0.6,
            }}
          />
          <div
            className={`cursor-glow-center ${isMoving ? "moving" : ""}`}
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              opacity: isMoving ? 1 : 0.8,
            }}
          />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo with Admin Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute inset-0 bg-primary-500 blur-xl opacity-50"></div>
              <div className="relative bg-primary-500 p-3 rounded-lg">
                <IoFitness className="w-8 h-8 text-black" />
              </div>
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display text-white">
                270° FITNESS
              </h1>
              <p className="text-xs text-primary-500/80 uppercase tracking-wider">
                Admin Portal
              </p>
            </div>
          </div>

          {/* Admin Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30"
          >
            <FaShieldAlt className="w-4 h-4" />
            <span className="text-sm font-semibold">STAFF ACCESS ONLY</span>
          </motion.div>
        </motion.div>

        {/* Login Card */}
        <motion.div
          className="relative p-[2px] rounded-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Animated gradient border */}
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-80"
            style={{
              background:
                "linear-gradient(135deg, #ffd700, transparent 30%, #ffd700 70%, transparent)",
              backgroundSize: "200% 200%",
            }}
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Glass morphism card content */}
          <div
            className="relative bg-gray-950/95 backdrop-blur-2xl backdrop-saturate-[1.8] 
                          border border-white/[0.05] rounded-2xl p-6 sm:p-8 shadow-2xl
                          before:absolute before:inset-0 before:rounded-2xl
                          before:bg-gradient-to-br before:from-white/[0.03] before:to-transparent
                          before:pointer-events-none"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary-500/[0.02] via-transparent to-primary-500/[0.02] pointer-events-none" />

            <h2 className="text-3xl sm:text-4xl font-display text-center mb-2 relative z-10">
              ADMIN LOGIN
            </h2>
            <p className="text-gray-400 text-center mb-8 relative z-10">
              Access the gym management system
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <input
                    {...register("email")}
                    type="email"
                    className="input-dark w-full pl-12"
                    placeholder="admin@270fitness.com"
                  />
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="input-dark w-full pl-12 pr-12"
                    placeholder="••••••••"
                  />
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-500 transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Remember Me */}
              <motion.div
                className="flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-primary-500 
                           focus:ring-primary-500/30 focus:ring-2 focus:ring-offset-0
                           checked:bg-primary-500 checked:border-primary-500
                           transition-all duration-200"
                  />
                  <span className="ml-2 text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                    Keep me signed in on this device
                  </span>
                </label>
              </motion.div>

              {/* Error Message */}
              {login.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm backdrop-blur-sm"
                >
                  Invalid credentials. Please contact the gym owner if you need
                  access.
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={login.isPending}
                className="btn-primary w-full flex items-center justify-center relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {login.isPending ? (
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                ) : (
                  <>
                    <FaShieldAlt className="mr-2" />
                    <span className="relative z-10">Access Dashboard</span>
                    <motion.div
                      className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.div>
                  </>
                )}
              </motion.button>
            </form>

            {/* Warning Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg"
            >
              <p className="text-amber-400 text-sm text-center">
                <FaShieldAlt className="inline mr-2" />
                This is a restricted area for authorized staff only. All access
                is logged and monitored.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Demo Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-6 relative"
        >
          <div
            className="relative p-4 bg-gray-900/90 backdrop-blur-xl backdrop-saturate-150
                          border border-primary-500/15 rounded-xl shadow-lg
                          before:absolute before:inset-0 before:rounded-xl
                          before:bg-gradient-to-br before:from-primary-500/[0.05] before:to-transparent
                          before:pointer-events-none"
          >
            <p className="text-sm text-primary-500 text-center font-bold mb-2 relative z-10">
              Demo Admin Access
            </p>
            <p className="text-xs text-gray-400 text-center relative z-10">
              Email: admin@gym.com | Password: admin123
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLoginPage;
