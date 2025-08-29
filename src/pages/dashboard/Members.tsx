import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaQrcode,
  FaTrash,
  FaTimes,
  FaEye,
  FaUserCheck,
  FaUserTimes,
  FaUserClock,
  FaDownload,
  FaLock,
  FaSearch,
} from "react-icons/fa";
import { membersApi, type MemberResponseDto } from "../../api/members.api";

const createMemberSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(8, "Phone number must be at least 8 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  membershipStartDate: z.string().min(1, "Start date is required"),
  membershipEndDate: z.string().min(1, "End date is required"),
});

type CreateMemberForm = z.infer<typeof createMemberSchema>;

const Members = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMember, setSelectedMember] =
    useState<MemberResponseDto | null>(null);
  const [filter, setFilter] = useState<
    "all" | "active" | "inactive" | "suspended" | "expiring"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Helper function to get the correct ID from member object
  const getMemberId = (member: MemberResponseDto) => {
    return member.id || member._id || "";
  };

  // Query
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: membersApi.findAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: membersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      setShowCreateModal(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: membersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "inactive" | "suspended";
    }) => membersApi.update(id, { status }),
    onSuccess: (updatedMember) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      // Update selectedMember if it's the one being updated
      if (
        selectedMember &&
        getMemberId(selectedMember) === getMemberId(updatedMember)
      ) {
        setSelectedMember(updatedMember);
      }
    },
  });

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateMemberForm>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      membershipStartDate: new Date().toISOString().split("T")[0],
      membershipEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });

  // Filter and search members
  const filteredMembers = useMemo(() => {
    let filtered = members.filter((member) => {
      const now = new Date();
      const endDate = new Date(member.membershipEndDate);
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (filter) {
        case "active":
          return member.status === "active";
        case "inactive":
          return member.status === "inactive";
        case "suspended":
          return member.status === "suspended";
        case "expiring":
          return (
            member.status === "active" &&
            daysUntilExpiry <= 30 &&
            daysUntilExpiry > 0
          );
        default:
          return true;
      }
    });

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((member) => {
        return (
          member.firstName.toLowerCase().includes(query) ||
          member.lastName.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.phone.includes(query) ||
          member.memberId.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [members, filter, searchQuery]);

  // Stats
  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    inactive: members.filter((m) => m.status === "inactive").length,
    suspended: members.filter((m) => m.status === "suspended").length,
    expiring: members.filter((m) => {
      const now = new Date();
      const endDate = new Date(m.membershipEndDate);
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return (
        m.status === "active" && daysUntilExpiry <= 30 && daysUntilExpiry > 0
      );
    }).length,
  };

  const handleCreateMember = (data: CreateMemberForm) => {
    createMutation.mutate(data);
  };

  const handleDeleteMember = (member: MemberResponseDto) => {
    const memberId = getMemberId(member);
    if (confirm("Are you sure you want to delete this member?")) {
      deleteMutation.mutate(memberId);
    }
  };

  const handleStatusChange = (
    id: string,
    status: "active" | "inactive" | "suspended"
  ) => {
    console.log("Updating status for member ID:", id, "to status:", status);
    updateStatusMutation.mutate({ id, status });
  };

  const downloadQR = (qrCode: string, memberId: string) => {
    const link = document.createElement("a");
    link.download = `member-${memberId}.png`;
    link.href = qrCode;
    link.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 bg-green-500/20";
      case "inactive":
        return "text-gray-500 bg-gray-500/20";
      case "suspended":
        return "text-red-500 bg-red-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <FaUserCheck />;
      case "inactive":
        return <FaUserTimes />;
      case "suspended":
        return <FaUserClock />;
      default:
        return <FaUser />;
    }
  };

  const getMembershipStatus = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) return { text: "Expired", color: "text-red-500" };
    if (daysUntilExpiry <= 7)
      return { text: `${daysUntilExpiry} days left`, color: "text-red-500" };
    if (daysUntilExpiry <= 30)
      return { text: `${daysUntilExpiry} days left`, color: "text-yellow-500" };
    return { text: `${daysUntilExpiry} days left`, color: "text-green-500" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white">
            Members Management
          </h1>
          <p className="text-gray-400">Manage gym members and memberships</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="relative z-10 flex items-center space-x-2 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 transition-all cursor-pointer select-none"
          style={{ userSelect: "none" }}
        >
          <FaPlus className="pointer-events-none" />
          <span className="pointer-events-none">Add Member</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          {
            label: "Total Members",
            value: stats.total,
            icon: FaUser,
            color: "blue",
          },
          {
            label: "Active",
            value: stats.active,
            icon: FaUserCheck,
            color: "green",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: FaUserTimes,
            color: "gray",
          },
          {
            label: "Suspended",
            value: stats.suspended,
            icon: FaUserClock,
            color: "red",
          },
          {
            label: "Expiring Soon",
            value: stats.expiring,
            icon: FaCalendar,
            color: "yellow",
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

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members by name, email, phone, or member ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 flex-shrink-0">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
            { key: "suspended", label: "Suspended" },
            { key: "expiring", label: "Expiring Soon" },
          ].map((filterOption) => (
            <motion.button
              key={filterOption.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setFilter(filterOption.key as any)}
              className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none ${
                filter === filterOption.key
                  ? "bg-primary-500 text-black"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
              style={{ userSelect: "none" }}
            >
              <span className="pointer-events-none">{filterOption.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      {searchQuery && (
        <div className="text-sm text-gray-400">
          Showing {filteredMembers.length} of {members.length} members
          {searchQuery && ` for "${searchQuery}"`}
        </div>
      )}

      {/* Members List */}
      <div className="card-dark">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Members ({filteredMembers.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            {searchQuery
              ? `No members found matching "${searchQuery}"`
              : "No members found for the selected filter."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-400">Member</th>
                  <th className="text-left p-4 text-gray-400">Member ID</th>
                  <th className="text-left p-4 text-gray-400">Contact</th>
                  <th className="text-left p-4 text-gray-400">Membership</th>
                  <th className="text-left p-4 text-gray-400">Status</th>
                  <th className="text-left p-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const membershipStatus = getMembershipStatus(
                    member.membershipEndDate
                  );
                  return (
                    <motion.tr
                      key={getMemberId(member)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-700/50 hover:bg-gray-800/30"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                            <FaUser className="text-primary-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {member.role}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-sm text-primary-500">
                          {member.memberId}
                        </span>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-gray-300 text-sm">
                            {member.email}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {member.phone}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-gray-300 text-sm">
                            {new Date(
                              member.membershipStartDate
                            ).toLocaleDateString()}{" "}
                            -
                            {new Date(
                              member.membershipEndDate
                            ).toLocaleDateString()}
                          </p>
                          <p className={`text-sm ${membershipStatus.color}`}>
                            {membershipStatus.text}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              member.status
                            )}`}
                          >
                            {getStatusIcon(member.status)}
                            <span className="capitalize">{member.status}</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedMember(member)}
                            className="relative z-10 p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-all cursor-pointer select-none"
                            style={{ userSelect: "none" }}
                          >
                            <FaEye className="pointer-events-none" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              downloadQR(member.qrCode, member.memberId)
                            }
                            className="relative z-10 p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30 transition-all cursor-pointer select-none"
                            style={{ userSelect: "none" }}
                          >
                            <FaQrcode className="pointer-events-none" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteMember(member)}
                            className="relative z-10 p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-all cursor-pointer select-none"
                            style={{ userSelect: "none" }}
                          >
                            <FaTrash className="pointer-events-none" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Member Modal */}
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
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Add New Member
                </h3>
                <motion.button
                  onClick={() => setShowCreateModal(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 text-gray-400 hover:text-white cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaTimes className="pointer-events-none" />
                </motion.button>
              </div>

              <form
                onSubmit={handleSubmit(handleCreateMember)}
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
                        className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="John"
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
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
                        className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="Doe"
                      />
                      <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        {...register("email")}
                        type="email"
                        className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="john@example.com"
                      />
                      <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
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
                        className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                        placeholder="+961 XX XXX XXX"
                      />
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="••••••••"
                    />
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Membership Start Date
                    </label>
                    <div className="relative">
                      <input
                        {...register("membershipStartDate")}
                        type="date"
                        className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                      <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    {errors.membershipStartDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.membershipStartDate.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Membership End Date
                    </label>
                    <div className="relative">
                      <input
                        {...register("membershipEndDate")}
                        type="date"
                        className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      />
                      <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                    {errors.membershipEndDate && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.membershipEndDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 px-4 py-2 bg-transparent text-primary-500/80 font-bold border-2 border-primary-500/50 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/70 transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <span className="pointer-events-none">Cancel</span>
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={createMutation.isPending}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <span className="pointer-events-none">
                      {createMutation.isPending
                        ? "Creating..."
                        : "Create Member"}
                    </span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Member Modal */}
      <AnimatePresence>
        {selectedMember && (
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
                  Member Details
                </h3>
                <motion.button
                  onClick={() => setSelectedMember(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative z-10 text-gray-400 hover:text-white cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaTimes className="pointer-events-none" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <img
                    src={selectedMember.qrCode}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto bg-white p-2 rounded-lg"
                  />
                  <p className="mt-2 font-mono text-sm text-primary-500">
                    {selectedMember.memberId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white">
                      {selectedMember.firstName} {selectedMember.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedMember.status
                      )}`}
                    >
                      {getStatusIcon(selectedMember.status)}
                      <span className="capitalize">
                        {selectedMember.status}
                      </span>
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400">Email</p>
                    <p className="text-white">{selectedMember.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Phone</p>
                    <p className="text-white">{selectedMember.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Start Date</p>
                    <p className="text-white">
                      {new Date(
                        selectedMember.membershipStartDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">End Date</p>
                    <p className="text-white">
                      {new Date(
                        selectedMember.membershipEndDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <select
                    value={selectedMember.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as
                        | "active"
                        | "inactive"
                        | "suspended";
                      const memberId = getMemberId(selectedMember);
                      if (memberId) {
                        handleStatusChange(memberId, newStatus);
                      } else {
                        console.error("Member ID is missing:", selectedMember);
                      }
                    }}
                    disabled={updateStatusMutation.isPending}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-sm cursor-pointer disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  {updateStatusMutation.isPending && (
                    <div className="px-2 py-1 text-xs text-primary-500">
                      Updating...
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <motion.button
                    onClick={() =>
                      downloadQR(selectedMember.qrCode, selectedMember.memberId)
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-transparent text-primary-500/80 font-bold border-2 border-primary-500/50 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/70 transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <FaDownload className="pointer-events-none" />
                    <span className="pointer-events-none">Download QR</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedMember(null)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <span className="pointer-events-none">Close</span>
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

export default Members;
