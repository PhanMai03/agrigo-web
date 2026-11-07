export interface ReviewUser {
  id: number;
  fullName: string;
  avatarUrl: string | null;
}

export interface Review {
  id: number;
  rating: number; // 1 to 5
  comment: string | null;
  user: ReviewUser;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  count: number;
  average: number | null;
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface CreateReviewInput {
  rating: number;
  comment?: string | null;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string | null;
}

export interface ReviewsQueryParams {
  page?: number;
  perPage?: number;
}
