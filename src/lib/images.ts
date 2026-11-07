import type { ProductImage } from '@/types/api';

const images = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=85',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85',
];

export const heroImage = 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=88';
export const productImage = (id: string | number) => images[Math.abs(Number(id) || 0) % images.length];
export const productImageFromImages = (productImages: ProductImage[] | undefined, id: string | number) => productImages?.find((image) => image.isPrimary)?.url ?? productImages?.[0]?.url ?? productImage(id);
