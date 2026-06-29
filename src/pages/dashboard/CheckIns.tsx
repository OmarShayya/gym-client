import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FaQrcode,
  FaUser,
  FaSignOutAlt,
  FaSignInAlt,
  FaUsers,
  FaCalendarDay,
  FaTimes,
  FaFingerprint,
  FaEdit,
} from "react-icons/fa";
import { IoTicket } from "react-icons/io5";
import { checkInsApi } from "../../api/checkins.api";
import { getErrorMessage } from "../../api/client";

const checkInSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  method: z.enum(["qr", "manual", "fingerprint"]),
});

const dayPassCheckInSchema = z.object({
  passId: z.string().min(1, "Pass ID is required"),
  method: z.enum(["qr", "manual", "fingerprint"]),
});

const qrCheckInSchema = z.object({
  qrCode: z.string().min(1, "QR Code is required"),
});

type CheckInForm = z.infer<typeof checkInSchema>;
type DayPassCheckInForm = z.infer<typeof dayPassCheckInSchema>;
type QRCheckInForm = z.infer<typeof qrCheckInSchema>;

const CheckIns = () => {
  const [activeTab, setActiveTab] = useState<"qr" | "member" | "daypass">("qr");
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedCheckIn, setSelectedCheckIn] = useState<any>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: activeCheckIns = [], isLoading: loadingActive } = useQuery({
    queryKey: ["checkIns", "active"],
    queryFn: checkInsApi.getActiveCheckIns,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: todayCheckIns = [], isLoading: loadingToday } = useQuery({
    queryKey: ["checkIns", "today"],
    queryFn: checkInsApi.getTodaysCheckIns,
    refetchInterval: 60000, // Refresh every minute
  });

  // Mutations
  const memberCheckInMutation = useMutation({
    mutationFn: checkInsApi.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      reset();
      toast.success("Member checked in");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const dayPassCheckInMutation = useMutation({
    mutationFn: checkInsApi.checkInDayPass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      resetDayPass();
      toast.success("Day pass checked in");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const qrCheckInMutation = useMutation({
    mutationFn: checkInsApi.checkInByQr,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      resetQR();
      toast.success("Check-in successful");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const checkOutMutation = useMutation({
    mutationFn: checkInsApi.checkOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkIns"] });
      setShowCheckOutModal(false);
      setSelectedCheckIn(null);
      toast.success("Check-out successful");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  // Forms
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CheckInForm>({
    resolver: zodResolver(checkInSchema),
    defaultValues: { method: "manual" },
  });

  const {
    register: registerDayPass,
    handleSubmit: handleSubmitDayPass,
    formState: { errors: errorsDayPass },
    reset: resetDayPass,
  } = useForm<DayPassCheckInForm>({
    resolver: zodResolver(dayPassCheckInSchema),
    defaultValues: { method: "manual" },
  });

  const {
    register: registerQR,
    handleSubmit: handleSubmitQR,
    formState: { errors: errorsQR },
    reset: resetQR,
  } = useForm<QRCheckInForm>({
    resolver: zodResolver(qrCheckInSchema),
  });

  // Stats
  const stats = {
    currentlyInGym: activeCheckIns.length,
    todayTotal: todayCheckIns.length,
    memberCheckIns: todayCheckIns.filter((c) => c.type === "member").length,
    dayPassCheckIns: todayCheckIns.filter((c) => c.type === "day-pass").length,
  };

  const handleMemberCheckIn = (data: CheckInForm) => {
    memberCheckInMutation.mutate(data);
  };

  const handleDayPassCheckIn = (data: DayPassCheckInForm) => {
    dayPassCheckInMutation.mutate(data);
  };

  const handleQRCheckIn = (data: QRCheckInForm) => {
    qrCheckInMutation.mutate(data.qrCode);
  };

  const handleCheckOut = () => {
    if (selectedCheckIn) {
      const memberId =
        selectedCheckIn.type === "member"
          ? selectedCheckIn.memberId
          : selectedCheckIn.dayPassInfo?.passId;

      if (memberId) {
        checkOutMutation.mutate({ identifier: memberId });
      }
    }
  };

  const getCheckInIcon = (method: string) => {
    switch (method) {
      case "qr":
        return <FaQrcode />;
      case "fingerprint":
        return <FaFingerprint />;
      default:
        return <FaEdit />;
    }
  };

  const getTypeColor = (type: string) => {
    return type === "member"
      ? "text-blue-500 bg-blue-500/20"
      : "text-green-500 bg-green-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display text-white mb-2">
          Check-ins
        </h1>
        <p className="text-gray-400">
          Manage gym member and day pass check-ins
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-dark p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Currently in Gym</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {stats.currentlyInGym}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-500/20">
              <FaUsers className="text-green-500 text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-dark p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today's Check-ins</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {stats.todayTotal}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/20">
              <FaCalendarDay className="text-blue-500 text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-dark p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Member Check-ins</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {stats.memberCheckIns}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/20">
              <FaUser className="text-purple-500 text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-dark p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Day Pass Check-ins</p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {stats.dayPassCheckIns}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-500/20">
              <IoTicket className="text-yellow-500 text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Check-in Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check-in Forms */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-dark"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Quick Check-in</h2>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap border-b border-gray-700">
            {[
              { key: "qr", label: "QR Code", icon: FaQrcode },
              { key: "member", label: "Member", icon: FaUser },
              { key: "daypass", label: "Day Pass", icon: IoTicket },
            ].map((tab) => (
              <button
                key={tab.key}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative z-10 flex-1 min-w-[33%] flex items-center justify-center space-x-2 p-3 sm:p-4 text-sm font-medium transition-all cursor-pointer select-none ${
                  activeTab === tab.key
                    ? "text-primary-500 border-b-2 border-primary-500 bg-primary-500/10"
                    : "text-gray-400 hover:text-white"
                }`}
                style={{ userSelect: "none" }}
              >
                <tab.icon className="pointer-events-none" />
                <span className="pointer-events-none">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* QR Code Check-in */}
            {activeTab === "qr" && (
              <form
                onSubmit={handleSubmitQR(handleQRCheckIn)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    QR Code
                  </label>
                  <div className="relative">
                    <input
                      {...registerQR("qrCode")}
                      className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Scan or enter QR code"
                      autoFocus
                    />
                    <FaQrcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errorsQR.qrCode && (
                    <p className="mt-1 text-sm text-red-500">
                      {errorsQR.qrCode.message}
                    </p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={qrCheckInMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaSignInAlt className="pointer-events-none" />
                  <span className="pointer-events-none">
                    {qrCheckInMutation.isPending
                      ? "Checking in..."
                      : "Check In"}
                  </span>
                </motion.button>

                {qrCheckInMutation.isError && (
                  <p className="text-red-500 text-sm">
                    Failed to check in. Please verify the QR code.
                  </p>
                )}
              </form>
            )}

            {/* Member Check-in */}
            {activeTab === "member" && (
              <form
                onSubmit={handleSubmit(handleMemberCheckIn)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Member ID
                  </label>
                  <div className="relative">
                    <input
                      {...register("memberId")}
                      className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Enter member ID"
                    />
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.memberId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.memberId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-in Method
                  </label>
                  <select
                    {...register("method")}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
                  >
                    <option value="manual">Manual</option>
                    <option value="qr">QR Code</option>
                    <option value="fingerprint">Fingerprint</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  disabled={memberCheckInMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaSignInAlt className="pointer-events-none" />
                  <span className="pointer-events-none">
                    {memberCheckInMutation.isPending
                      ? "Checking in..."
                      : "Check In Member"}
                  </span>
                </motion.button>

                {memberCheckInMutation.isError && (
                  <p className="text-red-500 text-sm">
                    Failed to check in member. Please verify the member ID.
                  </p>
                )}
              </form>
            )}

            {/* Day Pass Check-in */}
            {activeTab === "daypass" && (
              <form
                onSubmit={handleSubmitDayPass(handleDayPassCheckIn)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Day Pass ID
                  </label>
                  <div className="relative">
                    <input
                      {...registerDayPass("passId")}
                      className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Enter day pass ID"
                    />
                    <IoTicket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errorsDayPass.passId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errorsDayPass.passId.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Check-in Method
                  </label>
                  <select
                    {...registerDayPass("method")}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
                  >
                    <option value="manual">Manual</option>
                    <option value="qr">QR Code</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  disabled={dayPassCheckInMutation.isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-10 w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaSignInAlt className="pointer-events-none" />
                  <span className="pointer-events-none">
                    {dayPassCheckInMutation.isPending
                      ? "Checking in..."
                      : "Check In Day Pass"}
                  </span>
                </motion.button>

                {dayPassCheckInMutation.isError && (
                  <p className="text-red-500 text-sm">
                    Failed to check in day pass. Please verify the pass ID.
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>

        {/* Currently in Gym */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card-dark"
        >
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">
              Currently in Gym
            </h2>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {loadingActive ? (
              <div className="text-center py-8">
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            ) : activeCheckIns.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No one currently in the gym
              </p>
            ) : (
              <div className="space-y-3">
                {activeCheckIns.map((checkIn) => (
                  <motion.div
                    key={checkIn.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded ${getTypeColor(checkIn.type)}`}
                      >
                        {checkIn.type === "member" ? <FaUser /> : <IoTicket />}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {checkIn.memberName}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {checkIn.type === "member" ? "Member" : "Day Pass"} •
                          {new Date(checkIn.checkInTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        setSelectedCheckIn(checkIn);
                        setShowCheckOutModal(true);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Check out ${checkIn.memberName}`}
                      className="relative z-10 p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-all cursor-pointer select-none"
                      style={{ userSelect: "none" }}
                    >
                      <FaSignOutAlt className="pointer-events-none" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Today's Check-ins */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-dark"
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Today's Check-ins
          </h2>
        </div>

        {loadingToday ? (
          <div className="p-6 text-center">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : todayCheckIns.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No check-ins today yet.
          </div>
        ) : (
          <>
            {/* Mobile stacked card list */}
            <div className="md:hidden divide-y divide-gray-700/50">
              {todayCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white font-medium truncate">
                      {checkIn.memberName}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                        checkIn.status === "active"
                          ? "bg-green-500/20 text-green-500"
                          : "bg-gray-500/20 text-gray-500"
                      }`}
                    >
                      {checkIn.status === "active" ? "In Gym" : "Completed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                        checkIn.type
                      )}`}
                    >
                      {checkIn.type === "member" ? <FaUser /> : <IoTicket />}
                      <span className="capitalize">{checkIn.type}</span>
                    </span>
                    <span className="text-gray-300">
                      {new Date(checkIn.checkInTime).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      {getCheckInIcon(checkIn.checkInMethod)}
                      <span className="capitalize">
                        {checkIn.checkInMethod}
                      </span>
                    </div>
                    <span>
                      {checkIn.duration ? `${checkIn.duration} min` : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-400">Name</th>
                  <th className="text-left p-4 text-gray-400">Type</th>
                  <th className="text-left p-4 text-gray-400">Check-in Time</th>
                  <th className="text-left p-4 text-gray-400">
                    Check-out Time
                  </th>
                  <th className="text-left p-4 text-gray-400">Duration</th>
                  <th className="text-left p-4 text-gray-400">Method</th>
                  <th className="text-left p-4 text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {todayCheckIns.map((checkIn) => (
                  <tr
                    key={checkIn.id}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30"
                  >
                    <td className="p-4 text-white">{checkIn.memberName}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          checkIn.type
                        )}`}
                      >
                        {checkIn.type === "member" ? <FaUser /> : <IoTicket />}
                        <span className="capitalize">{checkIn.type}</span>
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(checkIn.checkInTime).toLocaleTimeString()}
                    </td>
                    <td className="p-4 text-gray-300">
                      {checkIn.checkOutTime
                        ? new Date(checkIn.checkOutTime).toLocaleTimeString()
                        : "-"}
                    </td>
                    <td className="p-4 text-gray-300">
                      {checkIn.duration ? `${checkIn.duration} min` : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-gray-400">
                        {getCheckInIcon(checkIn.checkInMethod)}
                        <span className="capitalize text-sm">
                          {checkIn.checkInMethod}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          checkIn.status === "active"
                            ? "bg-green-500/20 text-green-500"
                            : "bg-gray-500/20 text-gray-500"
                        }`}
                      >
                        {checkIn.status === "active" ? "In Gym" : "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </motion.div>

      {/* Check-out Modal */}
      <AnimatePresence>
        {showCheckOutModal && selectedCheckIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Check Out</h3>
                <motion.button
                  onClick={() => setShowCheckOutModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close check-out dialog"
                  className="relative z-10 text-gray-400 hover:text-white cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaTimes className="pointer-events-none" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${getTypeColor(
                      selectedCheckIn.type
                    )}`}
                  >
                    {selectedCheckIn.type === "member" ? (
                      <FaUser className="text-2xl" />
                    ) : (
                      <IoTicket className="text-2xl" />
                    )}
                  </div>
                  <h4 className="text-lg font-semibold text-white">
                    {selectedCheckIn.memberName}
                  </h4>
                  <p className="text-gray-400 capitalize">
                    {selectedCheckIn.type}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Check-in Time</p>
                    <p className="text-white">
                      {new Date(
                        selectedCheckIn.checkInTime
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Duration</p>
                    <p className="text-white">
                      {Math.floor(
                        (new Date().getTime() -
                          new Date(selectedCheckIn.checkInTime).getTime()) /
                          60000
                      )}{" "}
                      min
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Method</p>
                    <p className="text-white capitalize">
                      {selectedCheckIn.checkInMethod}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                      In Gym
                    </span>
                  </div>
                </div>

                {selectedCheckIn.dayPassInfo && (
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-sm mb-2">Day Pass Info</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Pass ID</p>
                        <p className="text-white font-mono">
                          {selectedCheckIn.dayPassInfo.passId}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Amount</p>
                        <p className="text-white">
                          ${selectedCheckIn.dayPassInfo.amount}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <motion.button
                    onClick={() => setShowCheckOutModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 px-4 py-2 bg-transparent text-primary-500/80 font-bold border-2 border-primary-500/50 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/70 transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <span className="pointer-events-none">Cancel</span>
                  </motion.button>
                  <motion.button
                    onClick={handleCheckOut}
                    disabled={checkOutMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <FaSignOutAlt className="pointer-events-none" />
                    <span className="pointer-events-none">
                      {checkOutMutation.isPending
                        ? "Checking out..."
                        : "Check Out"}
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CheckIns;
