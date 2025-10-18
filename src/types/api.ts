export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiError = {
  success: false;
  error: string;
  message?: string;
  details?: unknown;
};

export type PaginatedResponse<T> = {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// ページネーションのクエリパラメータ
export type PaginationQuery = {
  page?: number;
  limit?: number;
};
