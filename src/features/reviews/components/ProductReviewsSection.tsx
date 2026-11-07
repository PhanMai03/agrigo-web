import { useState } from 'react';
import {
  Star,
  CheckCircle,
  Pencil,
  Trash2,
  Loader2,
  MessageSquarePlus,
  LogIn,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  useCreateReview,
  useDeleteReview,
  useProductReviewSummary,
  useProductReviews,
  useUpdateReview,
} from '../hooks/useReviews';
import type { Review } from '../types';

export interface ProductReviewsSectionProps {
  productId: number;
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const [page, setPage] = useState(1);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Editing state
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Queries
  const { data: summary, isLoading: isLoadingSummary } = useProductReviewSummary(productId);
  const { data: reviewsResponse, isLoading: isLoadingReviews } = useProductReviews(productId, {
    page,
    perPage: 6,
  });

  // Mutations
  const createMutation = useCreateReview();
  const updateMutation = useUpdateReview();
  const deleteMutation = useDeleteReview();

  const reviews = reviewsResponse?.data ?? [];
  const meta = reviewsResponse?.meta;

  const totalReviews = summary?.count ?? 0;
  const averageRating = summary?.average ? summary.average.toFixed(1) : null;
  const distribution = summary?.distribution ?? { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingInput || createMutation.isPending) return;

    try {
      await createMutation.mutateAsync({
        productId,
        data: {
          rating: ratingInput,
          comment: commentInput.trim() || null,
        },
      });
      setCommentInput('');
      setRatingInput(5);
    } catch {
      // Handled by mutation onError toast
    }
  };

  const startEdit = (review: Review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment ?? '');
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditRating(5);
    setEditComment('');
  };

  const handleSaveEdit = async (reviewId: number) => {
    if (updateMutation.isPending) return;
    try {
      await updateMutation.mutateAsync({
        reviewId,
        productId,
        data: {
          rating: editRating,
          comment: editComment.trim() || null,
        },
      });
      setEditingReviewId(null);
    } catch {
      // Handled by toast
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await deleteMutation.mutateAsync({ reviewId, productId });
    }
  };

  return (
    <div className="mt-16 border-t border-slate-200/80 pt-12">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#19342b]">
            Customer Reviews & Ratings
          </h2>
          <p className="text-sm text-slate-500">
            Real feedback from verified purchasers of this organic harvest.
          </p>
        </div>
        {totalReviews > 0 && (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
            {totalReviews} Verified Review{totalReviews > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Rating Summary & Breakdown Grid */}
      <div className="mt-8 grid gap-8 rounded-2xl border border-slate-200/80 bg-stone-50/50 p-6 sm:grid-cols-12 sm:p-8">
        {/* Left: Overall Score Card */}
        <div className="flex flex-col items-center justify-center text-center sm:col-span-5 sm:border-r sm:border-slate-200 sm:pr-8">
          {isLoadingSummary ? (
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          ) : averageRating ? (
            <>
              <div className="text-5xl font-extrabold tracking-tight text-[#19342b]">
                {averageRating}
                <span className="text-xl font-normal text-slate-400"> / 5</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className={
                      star <= Math.round(Number(averageRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-200 text-slate-200'
                    }
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-medium text-slate-500">
                Based on {totalReviews} customer rating{totalReviews > 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Star size={26} />
              </div>
              <p className="mt-3 text-base font-semibold text-slate-700">No ratings yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Be the first to order and review this farm product!
              </p>
            </>
          )}
        </div>

        {/* Right: Star Distribution Bar Chart */}
        <div className="flex flex-col justify-center space-y-2.5 sm:col-span-7 sm:pl-4">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[String(stars) as keyof typeof distribution] || 0;
            const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="flex w-10 items-center gap-1 font-semibold text-slate-600">
                  {stars} <Star size={12} className="fill-amber-400 text-amber-400" />
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right font-medium text-slate-500">
                  {count} <span className="text-[10px] text-slate-400">({percentage}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form */}
      <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 sm:p-7">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div>
              <h3 className="text-base font-bold text-gray-900">Have you purchased this item?</h3>
              <p className="mt-1 text-xs text-slate-600">
                Sign in with your AgriGo customer account to write a verified harvest review.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-800 shrink-0"
            >
              <LogIn size={15} />
              <span>Sign In to Review</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center space-x-2">
              <MessageSquarePlus className="h-5 w-5 text-emerald-700" />
              <h3 className="text-base font-bold text-gray-900">Write a Customer Review</h3>
            </div>

            {/* Interactive Rating Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Your Rating
              </label>
              <div className="mt-1.5 flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating ?? ratingInput);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform hover:scale-115 focus:outline-none"
                    >
                      <Star
                        size={24}
                        className={
                          isFilled
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-200 text-slate-300'
                        }
                      />
                    </button>
                  );
                })}
                <span className="ml-3 text-xs font-semibold text-slate-600">
                  {ratingInput === 5
                    ? '5 / 5 (Excellent)'
                    : ratingInput === 4
                    ? '4 / 5 (Very Good)'
                    : ratingInput === 3
                    ? '3 / 5 (Average)'
                    : ratingInput === 2
                    ? '2 / 5 (Poor)'
                    : '1 / 5 (Terrible)'}
                </span>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Your Experience / Comments (Optional)
              </label>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Describe produce freshness, aroma, sweetness, packaging quality..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:border-emerald-600 focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center text-emerald-800">
                  <AlertCircle size={13} className="mr-1 inline text-emerald-600" />
                  Only customers with a completed order for this item can submit.
                </span>
                <span>{commentInput.length}/2000</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center space-x-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-40"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Review List Feed */}
      <div className="mt-10 space-y-4">
        {isLoadingReviews ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-sm text-slate-400">
            No reviews yet for this product. Be the first to share your experience!
          </div>
        ) : (
          reviews.map((review) => {
            const isOwner = currentUser?.id === review.user.id;
            const isAdmin = currentUser?.role === 'admin';
            const canManage = isOwner || isAdmin;
            const isEditing = editingReviewId === review.id;

            return (
              <div
                key={review.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300"
              >
                {isEditing ? (
                  /* Inline Edit Mode */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Edit Your Review</span>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditRating(star)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            size={20}
                            className={
                              star <= editRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-300'
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      maxLength={2000}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-sm text-slate-800 focus:border-emerald-600 focus:outline-none"
                    />

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(review.id)}
                        disabled={updateMutation.isPending}
                        className="inline-flex items-center space-x-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-40"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Review View */
                  <div>
                    <div className="flex items-start justify-between">
                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                          {review.user.avatarUrl ? (
                            <img
                              src={review.user.avatarUrl}
                              alt=""
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            review.user.fullName.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-semibold text-slate-900">
                              {review.user.fullName}
                            </h4>
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              <CheckCircle size={10} className="text-emerald-600" />
                              Verified Buyer
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Edit / Delete Buttons */}
                      {canManage && (
                        <div className="flex items-center space-x-1.5">
                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => startEdit(review)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Edit Review"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDelete(review.id)}
                            disabled={deleteMutation.isPending}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Delete Review"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Stars */}
                    <div className="mt-3 flex items-center space-x-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={15}
                          className={
                            star <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            <span>Previous</span>
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
