import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import {
  IoFitness,
  IoHome,
  IoPeople,
  IoQrCode,
  IoCart,
  IoReceipt,
  IoLogOut,
  IoMenu,
  IoClose,
  IoTicket,
} from "react-icons/io5";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: IoHome,
      label: "Overview",
      adminOnly: false,
    },
    {
      path: "/admin/dashboard/check-ins",
      icon: IoQrCode,
      label: "Check-ins",
      adminOnly: false,
    },
    {
      path: "/admin/dashboard/members",
      icon: IoPeople,
      label: "Members",
      adminOnly: true,
    },
    {
      path: "/admin/dashboard/day-passes",
      icon: IoTicket,
      label: "Day Passes",
      adminOnly: false,
    },
    {
      path: "/admin/dashboard/products",
      icon: IoCart,
      label: "Products",
      adminOnly: false,
    },
    {
      path: "/admin/dashboard/sales",
      icon: IoReceipt,
      label: "Sales",
      adminOnly: false,
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin()
  );

  const getCurrentPageTitle = () => {
    const currentItem = filteredMenuItems.find(
      (item) => item.path === location.pathname
    );
    return currentItem?.label || "Dashboard";
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-700 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-500 p-2 rounded-lg">
                <IoFitness className="w-8 h-8 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-display text-white">
                  270° FITNESS
                </h1>
                <p className="text-xs text-primary-500">Management System</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-700">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <p className="font-semibold text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-primary-500 mt-1">
                {user?.role?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-primary-500 text-black font-semibold"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="ml-auto w-2 h-2 bg-black rounded-full"
                          />
                        )}
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* System Status */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-green-500 bg-green-500/10 rounded-lg p-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Online</span>
            </div>
          </div>

          {/* Logout */}
          <div className="p-4 border-t border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-all duration-200 w-full"
            >
              <IoLogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-primary-500 p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <IoClose className="w-6 h-6" />
              ) : (
                <IoMenu className="w-6 h-6" />
              )}
            </button>

            {/* Page Title */}
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-display text-white">
                {getCurrentPageTitle()}
              </h2>
              {/* Breadcrumb indicator */}
              <div className="hidden md:flex items-center space-x-2 text-gray-400">
                <span className="text-sm">•</span>
                <span className="text-sm">270° Fitness Management</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Current Date */}
              <div className="hidden md:block text-sm text-gray-400">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>

              {/* User Avatar */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-black font-semibold text-sm">
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
