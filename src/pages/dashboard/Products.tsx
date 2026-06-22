import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaImage,
  FaBox,
  FaTag,
  FaWarehouse,
  FaSearch,
  FaExclamationTriangle,
  FaEye,
  FaImages,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { productsApi, type ProductResponseDto } from "../../api/products.api";
import { getErrorMessage } from "../../api/client";
import ConfirmDialog from "../../components/ConfirmDialog";

const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  lowStockThreshold: z.coerce
    .number()
    .min(0, "Threshold cannot be negative")
    .optional()
    .or(z.literal("")),
  costPrice: z.coerce
    .number()
    .min(0, "Cost price cannot be negative")
    .optional()
    .or(z.literal("")),
  salePrice: z.coerce
    .number()
    .min(0, "Sale price cannot be negative")
    .optional()
    .or(z.literal("")),
  discountPercentage: z.coerce
    .number()
    .min(0)
    .max(100, "Discount cannot exceed 100%")
    .optional()
    .or(z.literal("")),
  weight: z.coerce
    .number()
    .min(0, "Weight cannot be negative")
    .optional()
    .or(z.literal("")),
  supplier: z.string().optional(),
  tags: z.string().optional(), // Will be split into array
});

type CreateProductForm = z.infer<typeof createProductSchema>;

const Products = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductResponseDto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "low-stock"
  >("all");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [productToDelete, setProductToDelete] =
    useState<ProductResponseDto | null>(null);
  const queryClient = useQueryClient();

  // Queries
  const { data: searchResult, isLoading } = useQuery({
    queryKey: [
      "products",
      "search",
      searchQuery,
      selectedCategory,
      statusFilter,
    ],
    queryFn: () =>
      productsApi.search({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        isActive:
          statusFilter === "active"
            ? true
            : statusFilter === "inactive"
            ? false
            : undefined,
        lowStockOnly: statusFilter === "low-stock" ? true : undefined,
        limit: 50,
      }),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["products", "categories"],
    queryFn: productsApi.getCategories,
  });

  // Helper function to clean form data
  const cleanFormData = (data: CreateProductForm) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned: any = { ...data };

    // Convert empty strings and NaN values to undefined for optional numeric fields
    const numericFields = [
      "lowStockThreshold",
      "costPrice",
      "salePrice",
      "discountPercentage",
      "weight",
    ];

    numericFields.forEach((field) => {
      const value = cleaned[field];
      if (value === "" || value === null || isNaN(Number(value))) {
        cleaned[field] = undefined;
      } else {
        cleaned[field] = Number(value);
      }
    });

    // Handle supplier field
    if (cleaned.supplier === "") {
      cleaned.supplier = undefined;
    }

    // Ensure required numeric fields are numbers
    cleaned.price = Number(cleaned.price);
    cleaned.stock = Number(cleaned.stock);

    return cleaned;
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: ({
      data,
      image,
    }: {
      data: CreateProductForm;
      image?: File;
    }) => {
      const cleanedData = cleanFormData(data);
      const createData = {
        ...cleanedData,
        tags: cleanedData.tags
          ? cleanedData.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter((tag: string) => tag.length > 0)
          : undefined,
      };
      return productsApi.create(createData, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowCreateModal(false);
      reset();
      setSelectedImage(null);
      setImagePreview("");
      toast.success("Product created");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
      image,
    }: {
      id: string;
      data: Partial<CreateProductForm>;
      image?: File;
    }) => {
      const cleanedData = cleanFormData(data as CreateProductForm);
      const updateData = {
        ...cleanedData,
        tags: cleanedData.tags
          ? cleanedData.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter((tag: string) => tag.length > 0)
          : undefined,
      };
      return productsApi.update(id, updateData, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowEditModal(false);
      setSelectedProduct(null);
      reset();
      setSelectedImage(null);
      setImagePreview("");
      toast.success("Product updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setProductToDelete(null);
      toast.success("Product deleted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      lowStockThreshold: "",
      costPrice: "",
      salePrice: "",
      discountPercentage: "",
      weight: "",
      supplier: "",
      tags: "",
    },
  });

  const products = searchResult?.products || [];

  // Stats
  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      inactive: products.filter((p) => !p.isActive).length,
      lowStock: products.filter((p) => p.isLowStock).length,
    };
  }, [products]);

  const handleCreateProduct = (data: CreateProductForm) => {
    createMutation.mutate({ data, image: selectedImage || undefined });
  };

  const handleUpdateProduct = (data: CreateProductForm) => {
    if (selectedProduct) {
      updateMutation.mutate({
        id: selectedProduct.id,
        data,
        image: selectedImage || undefined,
      });
    }
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete.id);
    }
  };

  const handleEditProduct = (product: ProductResponseDto) => {
    setSelectedProduct(product);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("category", product.category);
    setValue("stock", product.stock);
    setValue("sku", product.sku);
    setValue(
      "lowStockThreshold",
      product.lowStockThreshold !== undefined &&
        product.lowStockThreshold !== null
        ? product.lowStockThreshold
        : ""
    );
    setValue(
      "costPrice",
      product.costPrice !== undefined && product.costPrice !== null
        ? product.costPrice
        : ""
    );
    setValue(
      "salePrice",
      product.salePrice !== undefined && product.salePrice !== null
        ? product.salePrice
        : ""
    );
    setValue(
      "discountPercentage",
      product.discountPercentage !== undefined &&
        product.discountPercentage !== null
        ? product.discountPercentage
        : ""
    );
    setValue(
      "weight",
      product.weight !== undefined && product.weight !== null
        ? product.weight
        : ""
    );
    setValue("supplier", product.supplier || "");
    setValue("tags", product.tags?.join(", ") || "");
    setShowEditModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    reset({
      lowStockThreshold: "",
      costPrice: "",
      salePrice: "",
      discountPercentage: "",
      weight: "",
      supplier: "",
      tags: "",
    });
    setSelectedImage(null);
    setImagePreview("");
    setSelectedProduct(null);
  };

  const getStatusColor = (product: ProductResponseDto) => {
    if (!product.isActive) return "text-gray-500 bg-gray-500/20";
    if (product.isLowStock) return "text-yellow-500 bg-yellow-500/20";
    return "text-green-500 bg-green-500/20";
  };

  const getStatusText = (product: ProductResponseDto) => {
    if (!product.isActive) return "Inactive";
    if (product.isLowStock) return "Low Stock";
    return "Active";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-white">
            Products Management
          </h1>
          <p className="text-gray-400">
            Manage your gym products and inventory
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="relative z-10 w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 transition-all cursor-pointer select-none"
          style={{ userSelect: "none" }}
        >
          <FaPlus className="pointer-events-none" />
          <span className="pointer-events-none">Add Product</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Products",
            value: stats.total,
            icon: FaBox,
            color: "blue",
          },
          { label: "Active", value: stats.active, icon: FaTag, color: "green" },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: FaWarehouse,
            color: "gray",
          },
          {
            label: "Low Stock",
            value: stats.lowStock,
            icon: FaExclamationTriangle,
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
                <p className="text-2xl sm:text-3xl font-bold text-white">
                  {stat.value}
                </p>
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
              placeholder="Search products by name, SKU, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "inactive", label: "Inactive" },
            { key: "low-stock", label: "Low Stock" },
          ].map((filterOption) => (
            <motion.button
              key={filterOption.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={() => setStatusFilter(filterOption.key as any)}
              className={`relative z-10 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer select-none ${
                statusFilter === filterOption.key
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

      {/* Products Grid */}
      <div className="card-dark">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Products ({products.length})
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
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            No products found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800/70 transition-all border border-gray-700"
              >
                {/* Product Image */}
                <div className="relative h-48 mb-4 bg-gray-700 rounded-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.thumbnailUrl || product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaImage className="text-gray-500 text-3xl" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        product
                      )}`}
                    >
                      {getStatusText(product)}
                    </span>
                  </div>

                  {/* Additional Images Indicator */}
                  {product.additionalImages &&
                    product.additionalImages.length > 0 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-white text-xs flex items-center space-x-1">
                        <FaImages />
                        <span>{product.additionalImages.length + 1}</span>
                      </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <h3 className="text-white font-semibold truncate">
                    {product.name}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                      <p className="text-primary-500 font-bold">
                        ${product.finalPrice || product.price}
                      </p>
                      {product.salePrice &&
                        product.salePrice !== product.price && (
                          <p className="text-gray-500 text-sm line-through">
                            ${product.price}
                          </p>
                        )}
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-white text-sm">
                        Stock: {product.stock}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {product.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          +{product.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedProduct(product)}
                      aria-label={`View ${product.name}`}
                      className="relative z-10 flex-1 p-2 bg-blue-500/20 text-blue-500 rounded hover:bg-blue-500/30 transition-all cursor-pointer select-none"
                      style={{ userSelect: "none" }}
                    >
                      <FaEye className="pointer-events-none mx-auto" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditProduct(product)}
                      aria-label={`Edit ${product.name}`}
                      className="relative z-10 flex-1 p-2 bg-yellow-500/20 text-yellow-500 rounded hover:bg-yellow-500/30 transition-all cursor-pointer select-none"
                      style={{ userSelect: "none" }}
                    >
                      <FaEdit className="pointer-events-none mx-auto" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setProductToDelete(product)}
                      aria-label={`Delete ${product.name}`}
                      className="relative z-10 flex-1 p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30 transition-all cursor-pointer select-none"
                      style={{ userSelect: "none" }}
                    >
                      <FaTrash className="pointer-events-none mx-auto" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Product Modal */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
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
              className="bg-gray-900 rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {showCreateModal ? "Add New Product" : "Edit Product"}
                </h3>
                <motion.button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close"
                  className="relative z-10 text-gray-400 hover:text-white cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaTimes className="pointer-events-none" />
                </motion.button>
              </div>

              <form
                onSubmit={handleSubmit(
                  showCreateModal ? handleCreateProduct : handleUpdateProduct
                )}
                className="space-y-6"
              >
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Image
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-24 h-24 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : selectedProduct?.thumbnailUrl ? (
                        <img
                          src={selectedProduct.thumbnailUrl}
                          alt="Current"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaImage className="text-gray-500 text-2xl" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="product-image"
                      />
                      <label
                        htmlFor="product-image"
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-all"
                      >
                        Choose Image
                      </label>
                      <p className="text-gray-400 text-sm mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Product Name *
                    </label>
                    <input
                      {...register("name")}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      SKU *
                    </label>
                    <input
                      {...register("sku")}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Enter SKU"
                    />
                    {errors.sku && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.sku.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Enter product description"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price *
                    </label>
                    <input
                      {...register("price")}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cost Price
                    </label>
                    <input
                      {...register("costPrice")}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="0.00"
                    />
                    {errors.costPrice && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.costPrice.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sale Price
                    </label>
                    <input
                      {...register("salePrice")}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="0.00"
                    />
                    {errors.salePrice && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.salePrice.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <input
                      {...register("category")}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Enter category"
                    />
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stock *
                    </label>
                    <input
                      {...register("stock")}
                      type="number"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="0"
                    />
                    {errors.stock && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.stock.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      {...register("lowStockThreshold")}
                      type="number"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="0"
                    />
                    {errors.lowStockThreshold && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.lowStockThreshold.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Supplier
                    </label>
                    <input
                      {...register("supplier")}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="Enter supplier name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Weight (grams)
                    </label>
                    <input
                      {...register("weight")}
                      type="number"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="0"
                    />
                    {errors.weight && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.weight.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    {...register("tags")}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="fitness, supplement, protein"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 px-4 py-2 bg-transparent text-primary-500/80 font-bold border-2 border-primary-500/50 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/70 transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <span className="pointer-events-none">Cancel</span>
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 px-6 py-3 bg-primary-500 text-black font-bold rounded-lg hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <span className="pointer-events-none">
                      {createMutation.isPending || updateMutation.isPending
                        ? "Saving..."
                        : showCreateModal
                        ? "Create Product"
                        : "Update Product"}
                    </span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && !showEditModal && (
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
              className="bg-gray-900 rounded-2xl p-4 sm:p-6 w-full max-w-2xl mx-4 border border-gray-700 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Product Details
                </h3>
                <motion.button
                  onClick={() => setSelectedProduct(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close"
                  className="relative z-10 text-gray-400 hover:text-white cursor-pointer select-none"
                  style={{ userSelect: "none" }}
                >
                  <FaTimes className="pointer-events-none" />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Product Image */}
                {selectedProduct.imageUrl && (
                  <div className="w-full h-64 bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Product Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Name</p>
                    <p className="text-white font-medium">
                      {selectedProduct.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">SKU</p>
                    <p className="text-white font-mono">
                      {selectedProduct.sku}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Category</p>
                    <p className="text-white">{selectedProduct.category}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Stock</p>
                    <p
                      className={`font-medium ${
                        selectedProduct.isLowStock
                          ? "text-yellow-500"
                          : "text-white"
                      }`}
                    >
                      {selectedProduct.stock}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Price</p>
                    <p className="text-white">${selectedProduct.price}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Final Price</p>
                    <p className="text-primary-500 font-bold">
                      ${selectedProduct.finalPrice || selectedProduct.price}
                    </p>
                  </div>
                  {selectedProduct.supplier && (
                    <div>
                      <p className="text-gray-400">Supplier</p>
                      <p className="text-white">{selectedProduct.supplier}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedProduct
                      )}`}
                    >
                      {getStatusText(selectedProduct)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Description</p>
                  <p className="text-white">{selectedProduct.description}</p>
                </div>

                {/* Tags */}
                {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <motion.button
                    onClick={() => handleEditProduct(selectedProduct)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 flex-1 px-4 py-2 bg-transparent text-primary-500/80 font-bold border-2 border-primary-500/50 rounded-lg hover:bg-primary-500/10 hover:text-primary-500 hover:border-primary-500/70 transition-all cursor-pointer select-none"
                    style={{ userSelect: "none" }}
                  >
                    <span className="pointer-events-none">Edit Product</span>
                  </motion.button>
                  <motion.button
                    onClick={() => setSelectedProduct(null)}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!productToDelete}
        title="Delete Product"
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
};

export default Products;
