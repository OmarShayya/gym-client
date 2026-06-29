import { apiClient } from "./client";

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  isActive?: boolean;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  lowStockThreshold?: number;
  supplier?: string;
  costPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  isActive?: boolean;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  lowStockThreshold?: number;
  supplier?: string;
  costPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
}

export interface UpdateStockDto {
  quantity: number;
  operation: "add" | "subtract" | "set";
}

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  sku: string;
  isActive: boolean;
  imageUrl?: string;
  imageFilename?: string;
  thumbnailUrl?: string;
  additionalImages?: string[];
  additionalImageFilenames?: string[];
  slug?: string;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  lowStockThreshold?: number;
  supplier?: string;
  costPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  finalPrice?: number;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchProductsParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: "name" | "price" | "stock" | "createdAt";
  sortOrder?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  lowStockOnly?: boolean;
}

export interface SearchProductsResponse {
  products: ProductResponseDto[];
  total: number;
  hasMore: boolean;
}

// Helper function to safely append form data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const appendFormData = (formData: FormData, key: string, value: any) => {
  if (value !== undefined && value !== null) {
    if (typeof value === "object" && !Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (Array.isArray(value)) {
      // For arrays, convert to comma-separated string for tags
      formData.append(key, value.join(","));
    } else {
      // Convert numbers and other primitives to string explicitly
      formData.append(key, String(value));
    }
  }
};

export const productsApi = {
  // Create product with image
  create: async (
    data: CreateProductDto,
    image?: File
  ): Promise<ProductResponseDto> => {
    const formData = new FormData();

    // Process each field individually to ensure proper formatting
    appendFormData(formData, "name", data.name);
    appendFormData(formData, "description", data.description);
    appendFormData(formData, "price", data.price);
    appendFormData(formData, "category", data.category);
    appendFormData(formData, "stock", data.stock);
    appendFormData(formData, "sku", data.sku);

    if (data.isActive !== undefined) {
      appendFormData(formData, "isActive", data.isActive);
    }

    if (data.tags && data.tags.length > 0) {
      appendFormData(formData, "tags", data.tags);
    }

    if (
      data.weight !== undefined &&
      data.weight !== null &&
      !isNaN(data.weight)
    ) {
      appendFormData(formData, "weight", data.weight);
    }

    if (data.dimensions) {
      appendFormData(formData, "dimensions", data.dimensions);
    }

    if (
      data.lowStockThreshold !== undefined &&
      data.lowStockThreshold !== null &&
      !isNaN(data.lowStockThreshold)
    ) {
      appendFormData(formData, "lowStockThreshold", data.lowStockThreshold);
    }

    if (data.supplier) {
      appendFormData(formData, "supplier", data.supplier);
    }

    if (
      data.costPrice !== undefined &&
      data.costPrice !== null &&
      !isNaN(data.costPrice)
    ) {
      appendFormData(formData, "costPrice", data.costPrice);
    }

    if (
      data.salePrice !== undefined &&
      data.salePrice !== null &&
      !isNaN(data.salePrice)
    ) {
      appendFormData(formData, "salePrice", data.salePrice);
    }

    if (
      data.discountPercentage !== undefined &&
      data.discountPercentage !== null &&
      !isNaN(data.discountPercentage)
    ) {
      appendFormData(formData, "discountPercentage", data.discountPercentage);
    }

    // Append image if provided
    if (image) {
      formData.append("image", image);
    }

    const response = await apiClient.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Search products with advanced filters
  search: async (
    params: SearchProductsParams = {}
  ): Promise<SearchProductsResponse> => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const url = queryString
      ? `/products/search?${queryString}`
      : "/products/search";

    const response = await apiClient.get(url);
    return response.data;
  },

  // Get all products (legacy support)
  findAll: async (
    category?: string,
    isActive?: boolean
  ): Promise<ProductResponseDto[]> => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (isActive !== undefined) params.append("isActive", isActive.toString());

    const queryString = params.toString();
    const url = queryString ? `/products?${queryString}` : "/products";

    const response = await apiClient.get(url);
    return response.data;
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get("/products/categories");
    return response.data;
  },

  // Get low stock products
  getLowStockProducts: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get("/products/low-stock");
    return response.data;
  },

  // Get product by ID
  findOne: async (id: string): Promise<ProductResponseDto> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Get product by SKU
  findBySku: async (sku: string): Promise<ProductResponseDto> => {
    const response = await apiClient.get(`/products/sku/${sku}`);
    return response.data;
  },

  // Get product by slug
  findBySlug: async (slug: string): Promise<ProductResponseDto> => {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Update product with optional image
  update: async (
    id: string,
    data: UpdateProductDto,
    image?: File
  ): Promise<ProductResponseDto> => {
    const formData = new FormData();

    // Process each field individually to ensure proper formatting
    if (data.name !== undefined) appendFormData(formData, "name", data.name);
    if (data.description !== undefined)
      appendFormData(formData, "description", data.description);
    if (data.price !== undefined) appendFormData(formData, "price", data.price);
    if (data.category !== undefined)
      appendFormData(formData, "category", data.category);
    if (data.stock !== undefined) appendFormData(formData, "stock", data.stock);
    if (data.isActive !== undefined)
      appendFormData(formData, "isActive", data.isActive);

    if (data.tags && data.tags.length > 0) {
      appendFormData(formData, "tags", data.tags);
    }

    if (
      data.weight !== undefined &&
      data.weight !== null &&
      !isNaN(data.weight)
    ) {
      appendFormData(formData, "weight", data.weight);
    }

    if (data.dimensions) {
      appendFormData(formData, "dimensions", data.dimensions);
    }

    if (
      data.lowStockThreshold !== undefined &&
      data.lowStockThreshold !== null &&
      !isNaN(data.lowStockThreshold)
    ) {
      appendFormData(formData, "lowStockThreshold", data.lowStockThreshold);
    }

    if (data.supplier !== undefined) {
      appendFormData(formData, "supplier", data.supplier);
    }

    if (
      data.costPrice !== undefined &&
      data.costPrice !== null &&
      !isNaN(data.costPrice)
    ) {
      appendFormData(formData, "costPrice", data.costPrice);
    }

    if (
      data.salePrice !== undefined &&
      data.salePrice !== null &&
      !isNaN(data.salePrice)
    ) {
      appendFormData(formData, "salePrice", data.salePrice);
    }

    if (
      data.discountPercentage !== undefined &&
      data.discountPercentage !== null &&
      !isNaN(data.discountPercentage)
    ) {
      appendFormData(formData, "discountPercentage", data.discountPercentage);
    }

    // Append image if provided
    if (image) {
      formData.append("image", image);
    }

    const response = await apiClient.patch(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Add additional images
  addImages: async (
    id: string,
    images: File[]
  ): Promise<ProductResponseDto> => {
    const formData = new FormData();

    images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await apiClient.post(`/products/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Remove image by index
  removeImage: async (
    id: string,
    imageIndex: number
  ): Promise<ProductResponseDto> => {
    const response = await apiClient.delete(
      `/products/${id}/images/${imageIndex}`
    );
    return response.data;
  },

  // Update stock
  updateStock: async (
    id: string,
    data: UpdateStockDto
  ): Promise<ProductResponseDto> => {
    const response = await apiClient.patch(`/products/${id}/stock`, data);
    return response.data;
  },

  // Bulk operations
  bulkUpdateStock: async (
    updates: { productId: string; quantity: number; operation: string }[]
  ): Promise<
    Array<{
      productId: string;
      success: boolean;
      result?: ProductResponseDto;
      error?: string;
    }>
  > => {
    const response = await apiClient.post(
      "/products/bulk/update-stock",
      updates
    );
    return response.data;
  },

  // Delete product
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
