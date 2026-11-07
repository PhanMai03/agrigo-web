import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../api/reviewsApi';
import type { CreateReviewInput, ReviewsQueryParams, UpdateReviewInput } from '../types';
import { useToastStore } from '@/stores/toastStore';

export const REVIEWS_KEYS = {
  list: (productId?: number, params?: ReviewsQueryParams) =>
    ['product-reviews', productId, params] as const,
  summary: (productId?: number) => ['product-review-summary', productId] as const,
};

export function useProductReviews(
  productId: number | undefined,
  params: ReviewsQueryParams = {}
) {
  return useQuery({
    queryKey: REVIEWS_KEYS.list(productId, params),
    queryFn: () => reviewsApi.getProductReviews(productId!, params),
    enabled: Boolean(productId),
  });
}

export function useProductReviewSummary(productId: number | undefined) {
  return useQuery({
    queryKey: REVIEWS_KEYS.summary(productId),
    queryFn: () => reviewsApi.getProductReviewSummary(productId!),
    enabled: Boolean(productId),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: number;
      data: CreateReviewInput;
    }) => reviewsApi.createProductReview(productId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: REVIEWS_KEYS.summary(variables.productId),
      });
      useToastStore.getState().push({
        type: 'success',
        message: 'Thank you! Your review has been submitted successfully.',
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Unable to submit review. You can only review products from completed orders.';
      useToastStore.getState().push({
        type: 'error',
        message,
      });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      productId: number;
      data: UpdateReviewInput;
    }) => reviewsApi.updateReview(reviewId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: REVIEWS_KEYS.summary(variables.productId),
      });
      useToastStore.getState().push({
        type: 'success',
        message: 'Your review has been updated.',
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update review.';
      useToastStore.getState().push({
        type: 'error',
        message,
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
    }: {
      reviewId: number;
      productId: number;
    }) => reviewsApi.deleteReview(reviewId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['product-reviews', variables.productId],
      });
      queryClient.invalidateQueries({
        queryKey: REVIEWS_KEYS.summary(variables.productId),
      });
      useToastStore.getState().push({
        type: 'success',
        message: 'Review deleted successfully.',
      });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete review.';
      useToastStore.getState().push({
        type: 'error',
        message,
      });
    },
  });
}

