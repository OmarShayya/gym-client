import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaQrcode,
  FaCalendarDay,
  FaUsers,
  FaDollarSign,
  FaEye,
  FaTrash,
  FaDownload,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaStickyNote,
  FaCheck,
  FaClock,
  FaBan,
} from "react-icons/fa";
import { IoTicket } from "react-icons/io5";
import { dayPassesApi, type DayPassResponseDto } from "../../api/dayPasses.api";

const createDayPassSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  validDate: z.string().min(1, "Valid date is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  notes: z.string().optional(),
});

type CreateDayPassForm = z.infer<typeof createDayPassSchema>;

const DayPasses = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<DayPassResponseDto | null>(
    null
  );
  const [filter, setFilter] = useState<
    "all" | "today" | "active" | "used" | "expired"
  >("all");
  const queryClient = useQueryClient();

  // Queries
  const { data: allPasses = [], isLoading } = useQuery({
    queryKey: ["dayPasses", "all"],
    queryFn: dayPassesApi.findAll,
  });

  const { data: todayPasses = [] } = useQuery({
    queryKey: ["dayPasses", "today"],
    queryFn: dayPassesApi.getTodaysPasses,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: dayPassesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dayPasses"] });
      setShowCreateModal(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: dayPassesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dayPasses"] });
    },
  });

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDayPassForm>({
    resolver: zodResolver(createDayPassSchema),
    defaultValues: {
      validDate: new Date().toISOString().split("T")[0],
      amount: 15,
    },
  });

  // Filter passes based on selected filter
  const filteredPasses = allPasses.filter((pass) => {
    const today = new Date().toDateString();
    const passDate = new Date(pass.validDate).toDateString();

    switch (filter) {
      case "today":
        return passDate === today;
      case "active":
        return pass.status === "active";
      case "used":
        return pass.status === "used";
      case "expired":
        return pass.status === "expired";
      default:
        return true;
    }
  });

  // Stats
  const stats = {
    total: allPasses.length,
    today: todayPasses.length,
    active: allPasses.filter((p) => p.status === "active").length,
    revenue: allPasses.reduce((sum, p) => sum + p.amount, 0),
  };

  const handleCreatePass = (data: CreateDayPassForm) => {
    createMutation.mutate({
      ...data,
      validDate: data.validDate,
    });
  };

  const handleDeletePass = (id: string) => {
    if (confirm("Are you sure you want to delete this day pass?")) {
      deleteMutation.mutate(id);
    }
  };

  const downloadQR = (qrCode: string, passId: string) => {
    const link = document.createElement("a");
    link.download = `day-pass-${passId}.png`;
    link.href = qrCode;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/20";
      case "used":
        return "text-blue-500 bg-blue-500/20";
      case "expired":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <FaClock />;
      case "used":
        return <FaCheck />;
      case "expired":
        return <FaBan />;
      default:
        return <FaClock />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white">Day Passes</h1>
          <p className="text-gray-400">Manage single-day gym access passes</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create Day Pass</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Passes",
            value: stats.total,
            icon: IoTicket,
            color: "blue",
          },
          {
            label: "Today's Passes",
            value: stats.today,
            icon: FaCalendarDay,
            color: "green",
          },
          {
            label: "Active Passes",
            value: stats.active,
            icon: FaUsers,
            color: "yellow",
          },
          {
            label: "Total Revenue",
            value: `$${stats.revenue}`,
            icon: FaDollarSign,
            color: "purple",
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-dark p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-500/20`}>
                <stat.icon className={`text-${stat.color}-500 text-xl`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: "all", label: "All" },
          { key: "today", label: "Today" },
          { key: "active", label: "Active" },
          { key: "used", label: "Used" },
          { key: "expired", label: "Expired" },
        ].map((filterOption) => (
          <motion.button
            key={filterOption.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(filterOption.key as never)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === filterOption.key
                ? "bg-primary-500 text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {filterOption.label}
          </motion.button>
        ))}
      </div>

      {/* Day Passes List */}
      <div className="card-dark">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Day Passes</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : filteredPasses.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No day passes found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-400">Pass ID</th>
                  <th className="text-left p-4 text-gray-400">Customer</th>
                  <th className="text-left p-4 text-gray-400">Valid Date</th>
                  <th className="text-left p-4 text-gray-400">Amount</th>
                  <th className="text-left p-4 text-gray-400">Status</th>
                  <th className="text-left p-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasses.map((pass) => (
                  <motion.tr
                    key={pass.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-primary-500">
                        {pass.passId}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">
                          {pass.firstName} {pass.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">{pass.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(pass.validDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-300">${pass.amount}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          pass.status
                        )}`}
                      >
                        {getStatusIcon(pass.status)}
                        <span className="capitalize">{pass.status}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedPass(pass)}
                          className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30"
                        >
                          <FaEye />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => downloadQR(pass.qrCode, pass.passId)}
                          className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30"
                        >
                          <FaQrcode />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeletePass(pass.id)}
                          className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Day Pass Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Create Day Pass
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(handleCreatePass)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <input
                        {...register("firstName")}
                        className="input-dark w-full pl-10"
                        placeholder="John"
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <input
                        {...register("lastName")}
                        className="input-dark w-full pl-10"
                        placeholder="Doe"
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      {...register("email")}
                      type="email"
                      className="input-dark w-full pl-10"
                      placeholder="john@example.com"
                    />
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <input
                      {...register("phone")}
                      className="input-dark w-full pl-10"
                      placeholder="+961 XX XXX XXX"
                    />
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valid Date
                    </label>
                    <input
                      {...register("validDate")}
                      type="date"
                      className="input-dark w-full"
                    />
                    {errors.validDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.validDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Amount ($)
                    </label>
                    <div className="relative">
                      <input
                        {...register("amount", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        className="input-dark w-full pl-10"
                        placeholder="15.00"
                      />
                      <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      {...register("notes")}
                      className="input-dark w-full pl-10"
                      placeholder="Additional notes..."
                      rows={3}
                    />
                    <FaStickyNote className="absolute left-3 top-3 text-gray-500" />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Pass"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Day Pass Modal */}
      <AnimatePresence>
        {selectedPass && (
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
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Day Pass Details
                </h3>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={selectedPass.qrCode}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto bg-white p-2 rounded-lg"
                  />
                  <p className="mt-2 font-mono text-sm text-primary-500">
                    {selectedPass.passId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">
                      {selectedPass.firstName} {selectedPass.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedPass.status
                      )}`}
                    >
                      {getStatusIcon(selectedPass.status)}
                      <span className="capitalize">{selectedPass.status}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedPass.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{selectedPass.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Valid Date</p>
                    <p className="text-white">
                      {new Date(selectedPass.validDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Amount</p>
                    <p className="text-white">${selectedPass.amount}</p>
                  </div>
                </div>

                {selectedPass.notes && (
                  <div>
                    <p className="text-gray-400 text-sm">Notes</p>
                    <p className="text-white">{selectedPass.notes}</p>
                  </div>
                )}

                {selectedPass.usedAt && (
                  <div>
                    <p className="text-gray-400 text-sm">Used At</p>
                    <p className="text-white">
                      {new Date(selectedPass.usedAt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() =>
                      downloadQR(selectedPass.qrCode, selectedPass.passId)
                    }
                    className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                  >
                    <FaDownload />
                    <span>Download QR</span>
                  </button>
                  <button
                    onClick={() => setSelectedPass(null)}
                    className="btn-primary flex-1"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DayPasses;
