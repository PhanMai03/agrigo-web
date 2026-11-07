import { useState } from 'react';
import {
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  RotateCcw,
  Scissors,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import {
  useHeroShowcaseStore,
  type HeroShowcaseItem,
} from '@/stores/heroShowcaseStore';

interface FormState {
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

const emptyForm: FormState = {
  name: '',
  shortName: '',
  region: '',
  badge: 'VietGAP Certified',
  price: '$2.50/kg',
  brix: '16° Brix',
  tagline: 'Naturally sweet & juicy',
  wholeDesc: 'Whole produce: Fresh natural peel, plump and succulent.',
  splitDesc: 'Sliced open: Juicy fruit flesh, refreshing natural aroma.',
  wholeImg: '',
  slicedImg: '',
  isActive: true,
};

export function AdminHeroShowcasePage() {
  const { items, addItem, updateItem, deleteItem, toggleItemActive, resetDefaults } =
    useHeroShowcaseStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: HeroShowcaseItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      shortName: item.shortName,
      region: item.region,
      badge: item.badge,
      price: item.price,
      brix: item.brix,
      tagline: item.tagline,
      wholeDesc: item.wholeDesc,
      splitDesc: item.splitDesc,
      wholeImg: item.wholeImg,
      slicedImg: item.slicedImg,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter the produce name');
      return;
    }
    if (!formData.wholeImg || !formData.slicedImg) {
      alert('Please provide both Whole Produce and Sliced Produce images');
      return;
    }

    if (editingId) {
      updateItem(editingId, formData);
      showToast('Showcase item updated successfully!');
    } else {
      addItem({
        ...formData,
        shortName: formData.shortName.trim() || formData.name.split(' ')[0] || 'Produce',
      });
      showToast('New showcase item added successfully!');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: HeroShowcaseItem) => {
    if (items.length <= 1) {
      alert('Showcase requires at least 1 active product!');
      return;
    }
    if (confirm(`Are you sure you want to remove "${item.name}" from the Hero Showcase?`)) {
      deleteItem(item.id);
      showToast(`Removed "${item.name}" from showcase!`);
    }
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        'Are you sure you want to restore the Showcase list to the 4 default products?'
      )
    ) {
      resetDefaults();
      showToast('Showcase restored to initial default items!');
    }
  };

  // Handle uploading images from local device
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'wholeImg' | 'slicedImg'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Maximum image file size is 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-900 px-5 py-3.5 text-sm font-bold text-white shadow-2xl ring-1 ring-white/20 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-900/10 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 sm:p-8 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-800/50 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
                <Sparkles size={13} className="text-amber-400" />
                Storefront Showcase Settings
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Hero Showcase Manager (Interactive 3D Slice)
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-100/80">
                Customize produce featured in the hero interactive slice banner on the homepage.
                Adjust names, prices, Brix sweetness, whole produce imagery, and real cross-section sliced views anytime.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                <RotateCcw size={15} />
                <span>Reset to Default</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-xs font-black text-emerald-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 hover:scale-105 active:scale-95"
              >
                <Plus size={16} className="stroke-[3]" />
                <span>Add New Showcase Item</span>
              </button>
            </div>
          </div>
        </div>

        {/* Showcase Items Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl ${
                item.isActive
                  ? 'border-emerald-600/30 ring-1 ring-emerald-500/20'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              {/* Item Top Status Bar */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-xs font-extrabold text-emerald-800">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{item.name}</h3>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Tab: <strong className="text-emerald-700">{item.shortName}</strong> &bull;{' '}
                      {item.region}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleItemActive(item.id)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                      item.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>

              {/* Dual Visual Preview Box */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {/* Whole Fruit Column */}
                <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-3 text-center">
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-emerald-300 backdrop-blur-sm">
                    Whole Produce
                  </span>
                  <div className="flex h-36 items-center justify-center overflow-hidden">
                    <img
                      src={item.wholeImg}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-slate-400 line-clamp-1">
                    {item.wholeDesc}
                  </p>
                </div>

                {/* Sliced Fruit Column */}
                <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-3 text-center">
                  <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-bold text-amber-300 backdrop-blur-sm">
                    Sliced Cross-Section
                  </span>
                  <div className="flex h-36 items-center justify-center overflow-hidden">
                    <img
                      src={item.slicedImg}
                      alt={`Sliced ${item.name}`}
                      className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-semibold text-slate-400 line-clamp-1">
                    {item.splitDesc}
                  </p>
                </div>
              </div>

              {/* Key Specs Tags */}
              <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-xl bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800">
                  {item.price}
                </span>
                <span className="rounded-xl bg-amber-50 px-2.5 py-1 font-bold text-amber-800">
                  Brix: {item.brix}
                </span>
                <span className="rounded-xl bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                  {item.badge}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:border-emerald-600 hover:bg-emerald-50 hover:text-emerald-900"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="rounded-xl border border-red-200 bg-red-50/50 p-2 text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
                  title="Remove from Showcase"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add or Edit Showcase Item */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {editingId ? 'Edit Showcase Produce' : 'Add New Showcase Produce'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enter details and upload corresponding imagery for Whole and Sliced cross-section views.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-6 space-y-5">
                {/* Row 1: Name & Short Name */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Full Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Red Flesh Dragon Fruit"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Short Tab Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dragon Fruit"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Row 2: Region, Badge, Price, Brix */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Farm Region / Origin
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Binh Thuan Farm"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Display Price
                    </label>
                    <input
                      type="text"
                      placeholder="$2.50/kg"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sweetness Brix / Taste
                    </label>
                    <input
                      type="text"
                      placeholder="16° Brix"
                      value={formData.brix}
                      onChange={(e) => setFormData({ ...formData, brix: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                    />
                  </div>
                </div>

                {/* Row 3: Tagline */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Naturally sweet and refreshing taste"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                  />
                </div>

                {/* Row 4: Dual Imagery Upload / URL */}
                <div className="grid gap-5 sm:grid-cols-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {/* Whole Fruit Image Config */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-slate-900">
                        1. Whole Produce Image <span className="text-red-500">*</span>
                      </span>
                    </div>

                    {formData.wholeImg ? (
                      <div className="relative flex h-36 items-center justify-center rounded-xl bg-slate-900 p-2">
                        <img
                          src={formData.wholeImg}
                          alt="Whole Produce"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, wholeImg: '' })}
                          className="absolute top-2 right-2 rounded-lg bg-black/70 p-1 text-white hover:bg-black"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 text-center">
                        <ImageIcon size={28} className="text-slate-400" />
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800">
                          <Upload size={13} />
                          <span>Upload from device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'wholeImg')}
                          />
                        </label>
                        <span className="my-1 text-[10px] text-slate-400">or paste direct URL</span>
                      </div>
                    )}

                    <input
                      type="url"
                      placeholder="Paste whole produce image URL..."
                      value={formData.wholeImg}
                      onChange={(e) => setFormData({ ...formData, wholeImg: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Sliced Fruit Image Config */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase text-slate-900">
                        2. Sliced Cross-Section Image <span className="text-red-500">*</span>
                      </span>
                    </div>

                    {formData.slicedImg ? (
                      <div className="relative flex h-36 items-center justify-center rounded-xl bg-slate-900 p-2">
                        <img
                          src={formData.slicedImg}
                          alt="Sliced Produce"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, slicedImg: '' })}
                          className="absolute top-2 right-2 rounded-lg bg-black/70 p-1 text-white hover:bg-black"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 text-center">
                        <Scissors size={28} className="text-slate-400" />
                        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-emerald-950 hover:bg-amber-400">
                          <Upload size={13} />
                          <span>Upload from device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, 'slicedImg')}
                          />
                        </label>
                        <span className="my-1 text-[10px] text-slate-400">or paste direct URL</span>
                      </div>
                    )}

                    <input
                      type="url"
                      placeholder="Paste sliced fruit image URL..."
                      value={formData.slicedImg}
                      onChange={(e) => setFormData({ ...formData, slicedImg: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-800"
                  >
                    {editingId ? 'Save Changes' : 'Add to Showcase'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

