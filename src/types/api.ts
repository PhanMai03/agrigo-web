export type ApiResponse<T> = { success: boolean; message: string; data: T; meta?: PaginationMeta };
export type PaginationMeta = { page: number; perPage: number; total: number; totalPages: number };
export type PaginatedResponse<T> = ApiResponse<T[]> & { meta: PaginationMeta };
export interface ApiError { success?: false; message: string; code?: string; errors?: Record<string, string[]> }

export type UserRole = 'admin' | 'customer';
export type UserStatus = 'active' | 'locked';
export interface User { id: number; fullName: string; email: string; emailVerifiedAt: string | null; phone: string | null; address: string | null; avatarUrl: string | null; role: UserRole; status: UserStatus; createdAt: string; updatedAt: string }
export interface AuthTokens { accessToken: string; refreshToken: string; tokenType: 'Bearer'; expiresIn: number }
export interface AuthSession { user: User; tokens: AuthTokens }
export interface LoginInput { email: string; password: string }
export interface RegisterInput { fullName: string; email: string; password: string; phone?: string }
export interface VerifyEmailInput { email: string; code: string }
export interface ForgotPasswordInput { email: string }
export interface ResetPasswordInput { email: string; code: string; newPassword: string }
export interface ChangePasswordInput { currentPassword: string; newPassword: string }

export interface Category { id: number; name: string; slug: string; description: string | null; imageUrl: string | null; createdAt: string; updatedAt: string }
export interface CategoryInput { name: string; description?: string | null }
export interface CategoryQuery { page?: number; perPage?: number; q?: string }
export type ProductStatus = 'active' | 'inactive';
export interface ProductImage { id: number; url: string; publicId: string; isPrimary: boolean; sortOrder: number }
export interface UpdateProductImageInput { isPrimary?: boolean; sortOrder?: number }
export interface Product { id: number; name: string; slug: string; description: string | null; price: number; quantity: number; unit: string; status: ProductStatus; category: { id: number; name: string; slug: string }; images: ProductImage[]; createdAt: string; updatedAt: string }
export interface ProductQuery { page?: number; perPage?: number; q?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sort?: 'newest' | 'price_asc' | 'price_desc' | 'name'; status?: ProductStatus }
export interface ProductInput { categoryId: number; name: string; description?: string | null; price: number; quantity?: number; unit?: string; status?: ProductStatus }
export interface InventoryHistory { id: number; productId: number; delta: number; quantityAfter: number; reason: 'import' | 'adjustment' | 'order_placed' | 'order_cancelled'; orderId: number | null; createdBy: number | null; notes: string | null; createdAt: string }

export interface CartItem { productId: number; name: string; unit: string; price: number; quantity: number; subtotal: number; stock: number; available: boolean }
export interface Cart { id: number; items: CartItem[]; totalItems: number; subtotal: number }
export interface CartItemInput { productId: number; quantity: number }

export interface OrderItem { productId: number; productName: string; unit: string; quantity: number; price: number; subtotal: number }
export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'vnpay';
export type PaymentStatus = 'unpaid' | 'paid' | 'refund_pending' | 'refunded';
export interface OrderReceiver { name: string; phone: string; address: string }
export interface Order { id: number; orderCode: string; orderStatus: OrderStatus; paymentMethod: PaymentMethod; paymentStatus: PaymentStatus; subtotal: number; shippingFee: number; totalPrice: number; receiver: OrderReceiver; note: string | null; paidAt: string | null; cancelledAt: string | null; cancelReason: string | null; createdAt: string; items: OrderItem[] }
export interface ShippingInput { receiverName?: string; phone?: string; address?: string }
export interface PaymentLink { paymentUrl: string; txnRef: string; expiresAt: string }
export interface CheckoutResult { order: Order; payment: PaymentLink | null }
export interface CheckoutInput { paymentMethod: PaymentMethod; shipping?: ShippingInput; note?: string }
export interface BuyNowInput extends CheckoutInput { productId: number; quantity: number }
export interface OrderQuery { page?: number; perPage?: number; orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
export interface CancelOrderInput { reason?: string }
export interface UpdateQuantityInput { quantity: number; notes?: string }
