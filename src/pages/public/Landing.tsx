import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FaDumbbell,
  FaUsers,
  FaClock,
  FaChartLine,
  FaMobile,
  FaQrcode,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { IoFitness, IoLocation } from "react-icons/io5";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { useCursorFollow } from "../../hooks/useCursorFollow";
import AnimatedBackground from "../../components/AnimatedBackground";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mousePosition, isVisible, isMoving } = useCursorFollow();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const smoothScrollTo = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const features = [
    {
      icon: <FaQrcode className="w-8 h-8" />,
      title: "QR Code Check-in",
      description: "Quick and contactless gym entry with personalized QR codes",
    },
    {
      icon: <FaMobile className="w-8 h-8" />,
      title: "Day Pass Available",
      description:
        "No membership? No problem! Get a day pass at the front desk",
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Monitor your fitness journey with our guidance",
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: "Expert Trainers",
      description: "Professional guidance from certified fitness experts",
    },
    {
      icon: <FaDumbbell className="w-8 h-8" />,
      title: "Premium Equipment",
      description: "State-of-the-art fitness equipment for all workout styles",
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: "Flexible Hours",
      description: "Extended hours to fit your busy schedule",
    },
  ];

  const membershipPlans = [
    {
      name: "Day Pass",
      price: "$15",
      period: "per visit",
      features: [
        "Full gym access for the day",
        "All equipment included",
        "Locker room access",
        "No commitment required",
      ],
      popular: false,
    },
    {
      name: "Monthly",
      price: "$49",
      period: "per month",
      features: [
        "Unlimited gym access",
        "All equipment included",
        "Locker room access",
        "Guest pass included",
        "Fitness consultation",
      ],
      popular: true,
    },
    {
      name: "Annual",
      price: "$449",
      period: "per year",
      features: [
        "Unlimited gym access",
        "All equipment included",
        "Locker room access",
        "2 guest passes monthly",
        "Personal training session",
        "Nutrition consultation",
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
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

      {/* Navigation */}
      <motion.nav
        className="relative z-50 bg-gray-950/60 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-primary-500 blur-xl opacity-50"></div>
                <div className="relative bg-primary-500 p-2 rounded-lg">
                  <IoFitness className="w-8 h-8 text-black" />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-display text-white">
                  270° FITNESS
                </h1>
                <p className="text-xs text-primary-500/80 uppercase tracking-wider">
                  Center
                </p>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => smoothScrollTo("features")}
                className="text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => smoothScrollTo("pricing")}
                className="text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => smoothScrollTo("location")}
                className="text-gray-400 hover:text-primary-500 transition-colors cursor-pointer"
              >
                Location
              </button>
              <button
                onClick={() => smoothScrollTo("contact")}
                className="btn-primary"
              >
                Visit Us
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              className="md:hidden text-primary-500 p-2"
            >
              {mobileMenuOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenuAlt3 className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-4"
            >
              <div className="flex flex-col space-y-4">
                <button
                  onClick={() => smoothScrollTo("features")}
                  className="text-gray-400 hover:text-primary-500 transition-colors text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => smoothScrollTo("pricing")}
                  className="text-gray-400 hover:text-primary-500 transition-colors text-left"
                >
                  Pricing
                </button>
                <button
                  onClick={() => smoothScrollTo("location")}
                  className="text-gray-400 hover:text-primary-500 transition-colors text-left"
                >
                  Location
                </button>
                <button
                  onClick={() => smoothScrollTo("contact")}
                  className="btn-primary text-center"
                >
                  Visit Us
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative min-h-[90vh] flex items-center justify-center"
        style={{ opacity }}
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-block mb-6"
            >
              <span className="bg-gray-900/80 backdrop-blur-xl text-primary-500 px-6 py-2 rounded-full text-sm font-semibold border border-primary-500/30">
                Welcome to 270° Fitness Center
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display mb-6 leading-tight">
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                TRANSFORM YOUR
              </motion.span>
              <br />
              <motion.span
                className="gradient-text"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                FITNESS JOURNEY
              </motion.span>
            </h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-gray-500 mb-10 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Premium fitness experience in Soufar, Mount Lebanon. Drop in for a
              day pass or join our fitness community.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => smoothScrollTo("contact")}
                className="btn-primary w-full sm:w-auto text-lg px-8 py-4 flex items-center justify-center space-x-2 group"
              >
                <span>Visit Us Today</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </button>
              <button
                onClick={() => smoothScrollTo("pricing")}
                className="btn-secondary w-full sm:w-auto text-lg px-8 py-4"
              >
                View Pricing
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-20 max-w-2xl mx-auto"
            >
              {[
                { number: "500+", label: "Happy Members" },
                { number: "50+", label: "Equipment Types" },
                { number: "6AM-11PM", label: "Daily Hours" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center p-4 sm:p-6 bg-gray-900/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl
                            relative overflow-hidden
                            before:absolute before:inset-0 before:rounded-2xl
                            before:bg-gradient-to-br before:from-white/[0.03] before:to-transparent
                            before:pointer-events-none"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <h3 className="text-3xl sm:text-4xl font-bold text-primary-500 relative z-10">
                    {stat.number}
                  </h3>
                  <p className="text-gray-500 relative z-10">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display mb-4">
              WHY CHOOSE <span className="gradient-text">270°</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
              Experience fitness excellence with modern convenience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{
                  y: -10,
                  transition: { type: "spring", stiffness: 300 },
                }}
                className="bg-gray-900/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl p-8 text-center group relative shadow-2xl
                          before:absolute before:inset-0 before:rounded-2xl
                          before:bg-gradient-to-br before:from-white/[0.03] before:to-transparent
                          before:pointer-events-none hover:border-primary-500/20 transition-all duration-300"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 bg-primary-500/20 text-primary-500 rounded-lg mb-6"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display mb-4">
              CHOOSE YOUR <span className="gradient-text">PLAN</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
              Flexible options for every fitness journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {membershipPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl text-center ${
                  plan.popular
                    ? "bg-primary-500/10 border-2 border-primary-500/30 scale-105"
                    : "bg-gray-900/80 border border-white/[0.08]"
                } backdrop-blur-2xl shadow-2xl`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-black px-4 py-2 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-primary-500">
                    {plan.price}
                  </span>
                  <span className="text-gray-500 ml-2">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center text-gray-300"
                    >
                      <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => smoothScrollTo("contact")}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.popular ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-12 sm:py-20 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-900/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-12 text-center max-w-2xl mx-auto shadow-2xl
                      before:absolute before:inset-0 before:rounded-3xl
                      before:bg-gradient-to-br before:from-white/[0.03] before:to-transparent
                      before:pointer-events-none relative overflow-hidden
                      hover:border-primary-500/20 transition-all duration-300"
          >
            <IoLocation className="w-12 h-12 text-primary-500 mx-auto mb-6 relative z-10" />
            <h3 className="text-2xl font-display mb-4 relative z-10">
              FIND US IN SOUFAR
            </h3>
            <p className="text-gray-500 mb-2 relative z-10">
              Mount Lebanon, Lebanon
            </p>
            <p className="text-gray-600 relative z-10 mb-4">
              Open Daily: 6:00 AM - 11:00 PM
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-primary-500" />
                Easy Parking
              </span>
              <span className="flex items-center">
                <FaQrcode className="mr-2 text-primary-500" />
                QR Check-in
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 transform -skew-y-3 rounded-3xl blur-xl"></div>

            <div
              className="relative bg-gray-900/80 backdrop-blur-2xl border border-white/[0.08] shadow-2xl
                          overflow-hidden rounded-[2rem] md:rounded-[3rem]
                          before:absolute before:inset-0
                          before:bg-gradient-to-br before:from-primary-500/[0.05] before:to-transparent
                          before:pointer-events-none"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>

              <div className="relative z-10 p-6 sm:p-12 md:p-16 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-display mb-6">
                    READY TO <span className="gradient-text">START</span>?
                  </h2>
                </motion.div>

                <motion.p
                  className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Visit us today to get your day pass or learn about
                  memberships. No appointment needed!
                </motion.p>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <motion.div
                    className="flex items-center justify-center space-x-3 text-gray-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <FaPhone className="text-primary-500" />
                    <span>+961 XX XXX XXX</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-center space-x-3 text-gray-300"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                  >
                    <FaEnvelope className="text-primary-500" />
                    <span>info@270fitness.com</span>
                  </motion.div>
                </div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  viewport={{ once: true }}
                >
                  <button className="btn-primary w-full sm:w-auto text-lg px-10 py-4 inline-flex items-center justify-center space-x-3">
                    <span>Get Day Pass ($15)</span>
                    <FaDumbbell />
                  </button>
                  <button className="btn-secondary w-full sm:w-auto text-lg px-10 py-4">
                    Learn About Memberships
                  </button>
                </motion.div>
              </div>

              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950/80 backdrop-blur-xl border-t border-white/[0.08] py-12 relative z-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <IoFitness className="w-8 h-8 text-primary-500" />
              <div>
                <h3 className="text-xl font-display">270° FITNESS CENTER</h3>
                <p className="text-sm text-gray-600">
                  Transform Your Lifestyle
                </p>
              </div>
            </div>
            <div className="text-gray-600 text-sm">
              © 2024 270° Fitness Center. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
