import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaDollarSign,
  FaChartLine,
  FaUserCheck,
  FaClock,
  FaCalendarDay,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
} from "react-icons/fa";
import { IoTicket } from "react-icons/io5";
import { membersApi } from "../../api/members.api";
import { dayPassesApi } from "../../api/dayPasses.api";
import { checkInsApi } from "../../api/checkins.api";
import { salesApi } from "../../api/sales.api";
import { getErrorMessage } from "../../api/client";
import ExpiringSoon from "../../components/ExpiringSoon";

const Overview = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  // Fetch data from all APIs
  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: membersApi.findAll,
  });

  const { data: dayPasses = [] } = useQuery({
    queryKey: ["dayPasses", "all"],
    queryFn: dayPassesApi.findAll,
  });

  const { data: todayPasses = [] } = useQuery({
    queryKey: ["dayPasses", "today"],
    queryFn: dayPassesApi.getTodaysPasses,
  });

  const { data: activeCheckIns = [] } = useQuery({
    queryKey: ["checkIns", "active"],
    queryFn: checkInsApi.getActiveCheckIns,
  });

  const { data: todayCheckIns = [] } = useQuery({
    queryKey: ["checkIns", "today"],
    queryFn: checkInsApi.getTodaysCheckIns,
  });

  const { data: todaySales = [] } = useQuery({
    queryKey: ["sales", "today"],
    queryFn: salesApi.getTodaysSales,
  });

  // Calculate stats
  const stats = {
    totalMembers: members.length,
    activeMembers: members.filter((m) => m.status === "active").length,
    totalDayPasses: dayPasses.length,
    todayDayPasses: todayPasses.length,
    activeDayPasses: dayPasses.filter((p) => p.status === "active").length,
    currentlyInGym: activeCheckIns.length,
    todayCheckIns: todayCheckIns.length,
    todayRevenue:
      todaySales.reduce((sum, sale) => sum + sale.total, 0) +
      todayPasses.reduce((sum, pass) => sum + pass.amount, 0),
    dayPassRevenue: dayPasses.reduce((sum, pass) => sum + pass.amount, 0),
  };

  // Recent activity (last 5 check-ins)
  const recentActivity = todayCheckIns.slice(0, 5);

  // Handle QR code check-in
  const handleQRCheckIn = async () => {
    if (!qrCode.trim()) return;

    setQrLoading(true);
    try {
      await checkInsApi.checkInByQr(qrCode);
      setShowQRModal(false);
      setQrCode("");
      queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      toast.success("Check-in successful");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setQrLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
    trendValue,
  }: {
    title: string;
    value: string | number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    color: string;
    trend?: "up" | "down";
    trendValue?: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-dark p-4 sm:p-6 relative overflow-hidden"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {value}
          </p>
          {trend && trendValue && (
            <div
              className={`flex items-center mt-2 text-sm ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend === "up" ? (
                <FaArrowUp className="mr-1" />
              ) : (
                <FaArrowDown className="mr-1" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-${color}-500/20`}>
          <Icon className={`text-${color}-500 text-2xl`} />
        </div>
      </div>

      {/* Background decoration */}
      <div
        className={`absolute -top-4 -right-4 w-24 h-24 bg-${color}-500/5 rounded-full`}
      />
      <div
        className={`absolute -bottom-2 -right-2 w-16 h-16 bg-${color}-500/10 rounded-full`}
      />
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display text-white mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-400">
          Welcome back! Here's what's happening at your gym today.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={FaUsers}
          color="blue"
          trend="up"
          trendValue={`${stats.activeMembers} active`}
        />

        <StatCard
          title="Currently in Gym"
          value={stats.currentlyInGym}
          icon={FaUserCheck}
          color="green"
        />

        <StatCard
          title="Today's Check-ins"
          value={stats.todayCheckIns}
          icon={FaClock}
          color="purple"
        />

        <StatCard
          title="Today's Revenue"
          value={`$${stats.todayRevenue.toFixed(2)}`}
          icon={FaDollarSign}
          color="yellow"
          trend="up"
          trendValue="vs yesterday"
        />
      </div>

      {/* Day Pass Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total Day Passes"
          value={stats.totalDayPasses}
          icon={IoTicket}
          color="indigo"
        />

        <StatCard
          title="Today's Day Passes"
          value={stats.todayDayPasses}
          icon={FaCalendarDay}
          color="pink"
        />

        <StatCard
          title="Day Pass Revenue"
          value={`$${stats.dayPassRevenue.toFixed(2)}`}
          icon={FaChartLine}
          color="orange"
        />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-dark"
        >
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">
              Recent Check-ins
            </h3>
          </div>
          <div className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No check-ins today yet
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        checkIn.type === "member"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {checkIn.memberName}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {checkIn.type === "member" ? "Member" : "Day Pass"} •{" "}
                        {new Date(checkIn.checkInTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        checkIn.status === "active"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-500"
                      }`}
                    >
                      {checkIn.status === "active" ? "In Gym" : "Checked Out"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-dark"
        >
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/dashboard/members")}
                className="relative z-10 p-4 bg-blue-500/20 text-blue-500 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-all cursor-pointer select-none"
                style={{ userSelect: "none" }}
              >
                <FaUsers className="text-2xl mb-2 mx-auto pointer-events-none" />
                <p className="text-sm font-medium pointer-events-none">
                  Add Member
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/dashboard/day-passes")}
                className="relative z-10 p-4 bg-green-500/20 text-green-500 rounded-lg border border-green-500/30 hover:bg-green-500/30 transition-all cursor-pointer select-none"
                style={{ userSelect: "none" }}
              >
                <IoTicket className="text-2xl mb-2 mx-auto pointer-events-none" />
                <p className="text-sm font-medium pointer-events-none">
                  Day Pass
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQRModal(true)}
                className="relative z-10 p-4 bg-purple-500/20 text-purple-500 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-all cursor-pointer select-none"
                style={{ userSelect: "none" }}
              >
                <FaUserCheck className="text-2xl mb-2 mx-auto pointer-events-none" />
                <p className="text-sm font-medium pointer-events-none">
                  Check-in
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/admin/dashboard/sales")}
                className="relative z-10 p-4 bg-yellow-500/20 text-yellow-500 rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition-all cursor-pointer select-none"
                style={{ userSelect: "none" }}
              >
                <FaDollarSign className="text-2xl mb-2 mx-auto pointer-events-none" />
                <p className="text-sm font-medium pointer-events-none">
                  New Sale
                </p>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expiring Memberships */}
      <ExpiringSoon days={7} />

      {/* QR Code Check-in Modal */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowQRModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 p-4 sm:p-6 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                QR Code Check-in
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                aria-label="Close QR check-in dialog"
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter QR Code
                </label>
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Scan or enter QR code"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQRCheckIn}
                  disabled={!qrCode.trim() || qrLoading}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {qrLoading ? "Checking in..." : "Check In"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-dark p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full animate-pulse" />
            </div>
            <p className="text-sm text-gray-400">System Online</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <FaUsers className="text-blue-500" />
            </div>
            <p className="text-sm text-gray-400">
              {stats.activeMembers} Active Members
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <FaClock className="text-purple-500" />
            </div>
            <p className="text-sm text-gray-400">
              {stats.currentlyInGym} Currently In
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <IoTicket className="text-yellow-500" />
            </div>
            <p className="text-sm text-gray-400">
              {stats.activeDayPasses} Active Passes
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Overview;
