import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaCalendar,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";
import { IoFitness } from "react-icons/io5";
import { useRegister } from "../../hooks/useAuth";
import { useCursorFollow } from "../../hooks/useCursorFollow";
import AnimatedBackground from "../../components/AnimatedBackground";

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number must be at least 8 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    membershipPlan: z.enum(["monthly", "quarterly", "yearly"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const registerMutation = useRegister();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mousePosition, isVisible, isMoving } = useCursorFollow();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      membershipPlan: "monthly",
    },
  });

  const selectedPlan = watch("membershipPlan");

  const onSubmit = async (data: RegisterFormData) => {
    const startDate = new Date();
    const endDate = new Date();

    switch (data.membershipPlan) {
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "quarterly":
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case "yearly":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    try {
      await registerMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        membershipStartDate: startDate.toISOString(),
        membershipEndDate: endDate.toISOString(),
      });
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <AnimatedBackground />

      {/* Cursor Glow Effect - Same as Landing */}
      {isVisible && (
        <>
          {/* Ambient glow */}
          <div
            className={`cursor-glow ${isMoving ? "moving" : ""}`}
            style={{
              left: `${mousePosition.x}px`,
              top: `${mousePosition.y}px`,
              opacity: isMoving ? 0.8 : 0.6,
            }}
          />

          {/* Bright center glow */}
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

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 flex items-center space-x-2 text-gray-400 hover:text-primary-500 transition-colors group"
      >
        <FaArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Home</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <Link
            to="/"
            className="flex items-center justify-center space-x-3 mb-8 group"
          >
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
              <h1 className="text-3xl font-display text-white">270° FITNESS</h1>
              <p className="text-xs text-primary-500/80 uppercase tracking-wider">
                Center
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Register Card with Animated Border */}
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
                          border border-white/[0.05] rounded-2xl p-8 shadow-2xl
                          before:absolute before:inset-0 before:rounded-2xl
                          before:bg-gradient-to-br before:from-white/[0.03] before:to-transparent
                          before:pointer-events-none"
          >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary-500/[0.02] via-transparent to-primary-500/[0.02] pointer-events-none" />

            <h2 className="text-3xl font-display text-center mb-2 relative z-10">
              JOIN THE REVOLUTION
            </h2>
            <p className="text-gray-400 text-center mb-8 relative z-10">
              Start your fitness transformation today
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 relative z-10"
            >
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      {...register("firstName")}
                      type="text"
                      className="input-dark w-full pl-12"
                      placeholder="John"
                    />
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.firstName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.firstName.message}
                    </motion.p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      {...register("lastName")}
                      type="text"
                      className="input-dark w-full pl-12"
                      placeholder="Doe"
                    />
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.lastName && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.lastName.message}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Contact Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      {...register("email")}
                      type="email"
                      className="input-dark w-full pl-12"
                      placeholder="john@example.com"
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

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      {...register("phone")}
                      type="tel"
                      className="input-dark w-full pl-12"
                      placeholder="+961 XX XXX XXX"
                    />
                    <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.phone.message}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
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

                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      className="input-dark w-full pl-12 pr-12"
                      placeholder="••••••••"
                    />
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-500 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                      ) : (
                        <FaEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-sm text-red-500"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </motion.div>
              </div>

              {/* Membership Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  <FaCalendar className="inline mr-2 text-primary-500" />
                  Membership Plan
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      value: "monthly",
                      label: "1 Month",
                      price: "$49",
                      save: null,
                    },
                    {
                      value: "quarterly",
                      label: "3 Months",
                      price: "$129",
                      save: "Save $18",
                    },
                    {
                      value: "yearly",
                      label: "12 Months",
                      price: "$449",
                      save: "Save $139",
                    },
                  ].map((plan) => (
                    <motion.label
                      key={plan.value}
                      className="relative cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <input
                        {...register("membershipPlan")}
                        type="radio"
                        value={plan.value}
                        className="sr-only peer"
                      />
                      <div
                        className={`p-4 text-center transition-all duration-300 rounded-xl
                        ${
                          selectedPlan === plan.value
                            ? "bg-gray-900/90 backdrop-blur-xl border border-primary-500/30 shadow-lg"
                            : "bg-gray-900/70 backdrop-blur-lg border border-white/[0.05] hover:border-primary-500/20"
                        }`}
                      >
                        {plan.save && (
                          <span className="absolute -top-2 -right-2 bg-primary-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                            {plan.save}
                          </span>
                        )}
                        <p className="font-semibold text-white">{plan.label}</p>
                        <p className="text-3xl font-bold text-primary-500 mt-2">
                          {plan.price}
                        </p>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              {/* Terms */}
              <motion.div
                className="flex items-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 bg-gray-900 border-gray-700 rounded text-primary-500 
                         focus:ring-primary-500/30 focus:ring-2 focus:ring-offset-0
                         checked:bg-primary-500 checked:border-primary-500
                         transition-all duration-200 mt-1"
                />
                <label className="ml-2 text-sm text-gray-400">
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-primary-500 hover:text-primary-400 underline"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-primary-500 hover:text-primary-400 underline"
                  >
                    Privacy Policy
                  </a>
                </label>
              </motion.div>

              {/* Error Message */}
              {registerMutation.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm backdrop-blur-sm"
                >
                  Registration failed. Please try again.
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={registerMutation.isPending}
                className="btn-primary w-full flex items-center justify-center relative group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {registerMutation.isPending ? (
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10 font-bold">
                      Create Account
                    </span>
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

            {/* Sign In Link */}
            <motion.p
              className="text-center text-gray-400 mt-8 relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-400 font-bold transition-colors"
              >
                Sign in here
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
