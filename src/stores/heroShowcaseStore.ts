import { create } from 'zustand';
import wholeDragonFruitImg from '@/assets/produce/dragonfruit-whole.jpg';
import slicedDragonFruitImg from '@/assets/produce/dragonfruit-sliced.png';

export interface HeroShowcaseItem {
  id: string;
  name: string;
  shortName: string;
  region: string;
  badge: string;
  price: string;
  brix: string;
  tagline: string;
  wholeDesc: string;
  splitDesc: string;
  wholeImg: string;
  slicedImg: string;
  isActive: boolean;
}

export const DEFAULT_SHOWCASE_ITEMS: HeroShowcaseItem[] = [
  {
    id: 'dragonfruit',
    name: 'Binh Thuan Dragon Fruit',
    shortName: 'Dragon Fruit',
    region: 'Ham Thuan Nam, Binh Thuan',
    badge: 'GlobalGAP Certified',
    price: '38,000₫/kg',
    brix: '16° Brix',
    tagline: 'Pink skin with green crown, refreshing sweetness',
    wholeDesc: 'Whole Fruit: Vibrant pink skin with crisp green crown, naturally plump and fresh.',
    splitDesc: 'Sliced in Half: Pure pearl-white flesh speckled with crunchy sesame-like seeds, sweet and juicy.',
    wholeImg: wholeDragonFruitImg,
    slicedImg: slicedDragonFruitImg,
    isActive: true,
  },
  {
    id: 'avocado',
    name: 'Dak Lak Butter Avocado 034',
    shortName: 'Avocado 034',
    region: 'Krong Nang, Dak Lak',
    badge: 'VietGAP Certified',
    price: '65,000₫/kg',
    brix: 'Rich & Creamy 0% fiber',
    tagline: 'Golden creamy avocado with tiny seed',
    wholeDesc: 'Whole Fruit: Glossy natural dark green skin with thick, dense creamy flesh.',
    splitDesc: 'Sliced in Half: Golden velvet texture, small brown seed, velvety smooth without fibers.',
    wholeImg: 'https://images.unsplash.com/photo-1579254646899-04ad03b05cdc?auto=format&fit=crop&w=800&q=85',
    slicedImg: 'https://images.unsplash.com/photo-1531880567437-5bfef553f822?auto=format&fit=crop&w=800&q=85',
    isActive: true,
  },
  {
    id: 'orange',
    name: 'Tien Giang King Orange',
    shortName: 'King Orange',
    region: 'Cai Be, Tien Giang',
    badge: 'Picked at 05:00 AM',
    price: '45,000₫/kg',
    brix: 'Rich in Vitamin C',
    tagline: 'Glistening citrus segments bursting with juice',
    wholeDesc: 'Whole Fruit: Aromatic pebbled rind loaded with essential oils, morning dew on leaves.',
    splitDesc: 'Sliced in Half: Golden succulent segments brimming with all-natural vitamin C.',
    wholeImg: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=800&q=85',
    slicedImg: 'https://images.unsplash.com/photo-1608921718343-dfb3b7cdcad3?auto=format&fit=crop&w=800&q=85',
    isActive: true,
  },
  {
    id: 'tomato',
    name: 'Da Lat Cherry Tomatoes',
    shortName: 'Cherry Tomato',
    region: 'Don Duong, Lam Dong',
    badge: '100% Pure Organic',
    price: '52,000₫/kg',
    brix: 'Crisp & Naturally Sweet',
    tagline: 'Ripe ruby red, crisp sweet crunch',
    wholeDesc: 'Whole Fruit: Thin taut skin glistening with morning mist, fresh green calyx.',
    splitDesc: 'Sliced in Half: Ruby juicy core with naturally sweet and crisp seed cavities.',
    wholeImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=85',
    slicedImg: 'https://images.unsplash.com/flagged/photo-1579410137879-fb3835b4f2eb?auto=format&fit=crop&w=800&q=85',
    isActive: true,
  },
];

const SHOWCASE_STORAGE_KEY = 'agrigo_hero_showcase_items_v3';

function loadStoredItems(): HeroShowcaseItem[] {
  try {
    const raw = localStorage.getItem(SHOWCASE_STORAGE_KEY);
    if (!raw) return DEFAULT_SHOWCASE_ITEMS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse hero showcase items from localStorage', err);
  }
  return DEFAULT_SHOWCASE_ITEMS;
}

function persistItems(items: HeroShowcaseItem[]) {
  try {
    localStorage.setItem(SHOWCASE_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save hero showcase items to localStorage', err);
  }
}

interface HeroShowcaseState {
  items: HeroShowcaseItem[];
  addItem: (item: Omit<HeroShowcaseItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<HeroShowcaseItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemActive: (id: string) => void;
  resetDefaults: () => void;
}

export const useHeroShowcaseStore = create<HeroShowcaseState>((set) => ({
  items: loadStoredItems(),

  addItem: (newItemData) =>
    set((state) => {
      const newItem: HeroShowcaseItem = {
        ...newItemData,
        id: `showcase_${Date.now()}`,
      };
      const updated = [...state.items, newItem];
      persistItems(updated);
      return { items: updated };
    }),

  updateItem: (id, updates) =>
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      persistItems(updated);
      return { items: updated };
    }),

  deleteItem: (id) =>
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      persistItems(updated);
      return { items: updated };
    }),

  toggleItemActive: (id) =>
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      );
      persistItems(updated);
      return { items: updated };
    }),

  resetDefaults: () =>
    set(() => {
      persistItems(DEFAULT_SHOWCASE_ITEMS);
      return { items: DEFAULT_SHOWCASE_ITEMS };
    }),
}));

