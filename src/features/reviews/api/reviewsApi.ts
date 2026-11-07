import { apiClient } from '@/services/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  CreateReviewInput,
  Review,
  ReviewSummary,
  ReviewsQueryParams,
  UpdateReviewInput,
} from '../types';

export const reviewsApi = {
  /**
   * List reviews of a product, newest first
   * GET /api/products/{id}/reviews
   */
  async getProductReviews(
    productId: number,
    params: ReviewsQueryParams = {}
  ): Promise<PaginatedResponse<Review>> {
    const query = { page: 1, perPage: 15, ...params };
    const res = await apiClient.get<PaginatedResponse<Review>>(
      `/products/${productId}/reviews`,
      { params: query }
    );
    return res.data;
  },

  /**
   * Get average rating and 1-5 star distribution
   * GET /api/products/{id}/reviews/summary
   */
  async getProductReviewSummary(productId: number): Promise<ReviewSummary> {
    const res = await apiClient.get<ApiResponse<ReviewSummary>>(
      `/products/${productId}/reviews/summary`
    );
    return res.data.data;
  },

  /**
   * Submit a review for a product (needs COMPLETED order with this product)
   * POST /api/products/{id}/reviews
   */
  async createProductReview(
    productId: number,
    data: CreateReviewInput
  ): Promise<Review> {
    const res = await apiClient.post<ApiResponse<Review>>(
      `/products/${productId}/reviews`,
      data
    );
    return res.data.data;
  },

  /**
   * Update my review
   * PUT /api/reviews/{id}
   */
  async updateReview(
    reviewId: number,
    data: UpdateReviewInput
  ): Promise<Review> {
    const res = await apiClient.put<ApiResponse<Review>>(
      `/reviews/${reviewId}`,
      data
    );
    return res.data.data;
  },

  /**
   * Delete my review (or any review if admin)
   * DELETE /api/reviews/{id}
   */
  async deleteReview(reviewId: number): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/reviews/${reviewId}`);
  },
};

