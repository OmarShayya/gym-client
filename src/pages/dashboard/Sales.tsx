import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaEye,
  FaTimes,
  FaShoppingCart,
  FaUser,
  FaReceipt,
  FaDollarSign,
  FaCalendarDay,
  FaChartLine,
  FaCreditCard,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaTrash,
} from "react-icons/fa";

import {
  salesApi,
  type SaleResponseDto,
  type CreateSaleDto,
} from "../../api/sales.api";
import { productsApi } from "../../api/products.api";
import { membersApi } from "../../api/members.api";

const createSaleSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        // Client-side estimate only; the backend computes prices server-side.
        unitPrice: z.number().min(0),
      })
    )
    .min(1, "At least one item is required"),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  notes: z.string().optional(),
});

type CreateSaleForm = z.infer<typeof createSaleSchema>;

const Sales = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleResponseDto | null>(
    null
  );
  const [showReportModal, setShowReportModal] = useState(false);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const queryClient = useQueryClient();

  // Queries - Fixed to properly call the API functions
  const { data: sales = [], isLoading } = useQuery({
    queryKey: ["sales", "all"],
    queryFn: () => salesApi.findAll(),
  });

  const { data: todaySales = [] } = useQuery({
    queryKey: ["sales", "today"],
    queryFn: salesApi.getTodaysSales,
  });

  // Fixed: Use the search API instead of findAll, and provide proper fallback
  const { data: productsResult, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "search", "active"],
    queryFn: () => productsApi.search({ isActive: true, limit: 1000 }),
  });

  // Extract products array from the search result
  const products = productsResult?.products || [];

  const { data: members = [] } = useQuery({
    queryKey: ["members"],
    queryFn: membersApi.findAll,
  });

  const { data: salesReport } = useQuery({
    queryKey: ["sales", "report", dateFilter.startDate, dateFilter.endDate],
    queryFn: () =>
      salesApi.getSalesReport(dateFilter.startDate, dateFilter.endDate),
    enabled: showReportModal,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSaleDto) => salesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setShowCreateModal(false);
      reset();
    },
  });

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
    setValue,
  } = useForm<CreateSaleForm>({
    resolver: zodResolver(createSaleSchema),
    defaultValues: {
      memberId: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
      paymentMethod: "cash",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  // Client-side estimate only (the backend computes the authoritative total).
  const estimatedTotal = watchedItems.reduce((sum: number, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);

  // Stats - Fixed with proper type checking
  const stats = {
    todayTotal: todaySales.length,
    todayRevenue: todaySales.reduce((sum: number, sale) => sum + sale.total, 0),
    totalSales: sales.length,
    totalRevenue: sales.reduce((sum: number, sale) => sum + sale.total, 0),
    averageOrder:
      sales.length > 0
        ? sales.reduce((sum: number, sale) => sum + sale.total, 0) /
          sales.length
        : 0,
  };

  const handleCreateSale = (data: CreateSaleForm) => {
    // Send only what the backend accepts; prices are computed server-side.
    const saleData: CreateSaleDto = {
      memberId: data.memberId,
      items: data.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    };
    createMutation.mutate(saleData);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      // Update the unit price when a product is selected
      setValue(`items.${index}.unitPrice`, product.price);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <FaMoneyBillWave />;
      case "card":
        return <FaCreditCard />;
      case "transfer":
        return <FaExchangeAlt />;
      default:
        return <FaDollarSign />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case "cash":
        return "text-green-500 bg-green-500/20";
      case "card":
        return "text-blue-500 bg-blue-500/20";
      case "transfer":
        return "text-purple-500 bg-purple-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-white">Sales</h1>
          <p className="text-gray-400">
            Manage transactions and view sales reports
          </p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReportModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <FaChartLine />
            <span>Sales Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FaPlus />
            <span>New Sale</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          {
            label: "Today's Sales",
            value: stats.todayTotal,
            icon: FaCalendarDay,
            color: "blue",
          },
          {
            label: "Today's Revenue",
            value: `$${stats.todayRevenue?.toFixed(2)}`,
            icon: FaDollarSign,
            color: "green",
          },
          {
            label: "Total Sales",
            value: stats.totalSales,
            icon: FaReceipt,
            color: "purple",
          },
          {
            label: "Total Revenue",
            value: `$${stats.totalRevenue?.toFixed(2)}`,
            icon: FaChartLine,
            color: "yellow",
          },
          {
            label: "Average Order",
            value: `$${stats.averageOrder?.toFixed(2)}`,
            icon: FaShoppingCart,
            color: "indigo",
          },
        ]?.map((stat, index) => (
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

      {/* Recent Sales */}
      <div className="card-dark">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Sales</h2>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No sales recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-4 text-gray-400">Sale #</th>
                  <th className="text-left p-4 text-gray-400">Customer</th>
                  <th className="text-left p-4 text-gray-400">Items</th>
                  <th className="text-left p-4 text-gray-400">Total</th>
                  <th className="text-left p-4 text-gray-400">Payment</th>
                  <th className="text-left p-4 text-gray-400">Date</th>
                  <th className="text-left p-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales?.slice(0, 10).map((sale) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-700/50 hover:bg-gray-800/30"
                  >
                    <td className="p-4">
                      <span className="font-mono text-sm text-primary-500">
                        {sale.saleNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">
                          {sale.memberName}
                        </p>
                        {sale.memberId && (
                          <p className="text-gray-400 text-sm">Member</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300">
                        {sale.items.length} item(s)
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">
                          ${sale.total?.toFixed(2)}
                        </p>
                        {sale.discount && sale.discount.amount > 0 && (
                          <p className="text-green-500 text-sm">
                            -${sale.discount.amount.toFixed(2)} discount
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                          sale.paymentMethod
                        )}`}
                      >
                        {getPaymentMethodIcon(sale.paymentMethod)}
                        <span className="capitalize">{sale.paymentMethod}</span>
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedSale(sale)}
                        className="p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30"
                      >
                        <FaEye />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Sale Modal */}
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
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">New Sale</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(handleCreateSale)}
                className="space-y-6"
              >
                {/* Member */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Member
                  </label>
                  <div className="relative">
                    <select
                      {...register("memberId")}
                      className="input-dark w-full pl-10"
                    >
                      <option value="">Select Member</option>
                      {Array.isArray(members) &&
                        members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.firstName} {member.lastName} (
                            {member.memberId})
                          </option>
                        ))}
                    </select>
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  </div>
                  {errors.memberId && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.memberId.message}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-white">Items</h4>
                    <button
                      type="button"
                      onClick={() =>
                        append({ productId: "", quantity: 1, unitPrice: 0 })
                      }
                      className="btn-secondary text-sm flex items-center space-x-1"
                    >
                      <FaPlus />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Loading state for products */}
                  {productsLoading && (
                    <div className="p-4 text-center text-gray-400">
                      Loading products...
                    </div>
                  )}

                  <div className="space-y-3">
                    {fields?.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-5 gap-3 items-end"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Product
                          </label>
                          <select
                            {...register(`items.${index}.productId`)}
                            onChange={(e) =>
                              handleProductSelect(index, e.target.value)
                            }
                            className="input-dark w-full"
                            disabled={productsLoading}
                          >
                            <option value="">
                              {productsLoading
                                ? "Loading..."
                                : "Select Product"}
                            </option>
                            {Array.isArray(products) &&
                              products.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} (${product.price})
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Quantity
                          </label>
                          <input
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                            type="number"
                            min="1"
                            className="input-dark w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Unit Price
                          </label>
                          <input
                            {...register(`items.${index}.unitPrice`, {
                              valueAsNumber: true,
                            })}
                            type="number"
                            step="0.01"
                            className="input-dark w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Total
                          </label>
                          <div className="input-dark w-full bg-gray-800 text-gray-400">
                            $
                            {(
                              (watchedItems[index]?.quantity || 0) *
                              (watchedItems[index]?.unitPrice || 0)
                            )?.toFixed(2)}
                          </div>
                        </div>

                        <div>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <select
                      {...register("paymentMethod")}
                      className="input-dark w-full"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="transfer">Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estimated Total
                    </label>
                    <div className="input-dark w-full bg-primary-500/20 text-primary-500 font-bold text-lg">
                      ${estimatedTotal?.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    className="input-dark w-full"
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-bold text-lg">
                        Estimated Total: ${estimatedTotal?.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Final pricing is calculated by the server.
                      </p>
                    </div>
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
                    {createMutation.isPending
                      ? "Processing..."
                      : "Complete Sale"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Sale Modal */}
      <AnimatePresence>
        {selectedSale && (
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
                  Sale Details
                </h3>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-6">
                {/* Sale Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Sale Number</p>
                    <p className="text-white font-mono">
                      {selectedSale.saleNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Date</p>
                    <p className="text-white">
                      {new Date(selectedSale.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Customer</p>
                    <p className="text-white">{selectedSale.memberName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Payment Method</p>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                        selectedSale.paymentMethod
                      )}`}
                    >
                      {getPaymentMethodIcon(selectedSale.paymentMethod)}
                      <span className="capitalize">
                        {selectedSale.paymentMethod}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Items</h4>
                  <div className="space-y-2">
                    {selectedSale?.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {item.productName}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {item.quantity} × ${item.unitPrice?.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-white font-medium">
                          ${item.subtotal?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal:</span>
                      <span>${selectedSale.subtotal?.toFixed(2)}</span>
                    </div>
                    {selectedSale.discount &&
                      selectedSale.discount.amount > 0 && (
                        <div className="flex justify-between text-green-500">
                          <span>Discount:</span>
                          <span>
                            -${selectedSale.discount.amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between text-white font-bold text-lg border-t border-gray-700 pt-2">
                      <span>Total:</span>
                      <span>${selectedSale.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {selectedSale.notes && (
                  <div>
                    <p className="text-gray-400 text-sm">Notes</p>
                    <p className="text-white">{selectedSale.notes}</p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedSale(null)}
                  className="btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sales Report Modal */}
      <AnimatePresence>
        {showReportModal && (
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
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Sales Report
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="input-dark w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) =>
                      setDateFilter((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="input-dark w-full"
                  />
                </div>
              </div>

              {salesReport && (
                <div className="space-y-6">
                  {/* Report Stats */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="card-dark p-4">
                      <p className="text-gray-400 text-sm">Total Sales</p>
                      <p className="text-2xl font-bold text-white">
                        {salesReport.totalSales}
                      </p>
                    </div>
                    <div className="card-dark p-4">
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        ${salesReport.totalRevenue?.toFixed(2)}
                      </p>
                    </div>
                    <div className="card-dark p-4">
                      <p className="text-gray-400 text-sm">Average Order</p>
                      <p className="text-2xl font-bold text-white">
                        ${salesReport.averageOrderValue?.toFixed(2)}
                      </p>
                    </div>
                    <div className="card-dark p-4">
                      <p className="text-gray-400 text-sm">Total Discount</p>
                      <p className="text-2xl font-bold text-white">
                        ${salesReport.totalDiscount?.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Top Products */}
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">
                      Top Products
                    </h4>
                    <div className="space-y-2">
                      {salesReport?.topProducts
                        ?.slice(0, 5)
                        .map((product, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg"
                          >
                            <div>
                              <p className="text-white font-medium">
                                {product.productName}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {product.totalQuantity} units sold
                              </p>
                            </div>
                            <p className="text-white font-medium">
                              ${product.totalRevenue?.toFixed(2)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowReportModal(false)}
                className="btn-primary w-full mt-6"
              >
                Close Report
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
