
/**
 * =====================================================
 * Open Node Backend Platform (ONBP)
 * API Response Types
 * =====================================================
 *
 * Shared response interfaces used throughout the platform.
 */

/**
 * Base API response.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Pagination metadata.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated API response.
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}
