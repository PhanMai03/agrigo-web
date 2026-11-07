import { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Boxes,
  Check,
  Edit3,
  Filter,
  ImagePlus,
  Loader2,
  PackagePlus,
  Power,
  Save,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import {
  useAdminCategories,
  useAdminProductImages,
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useDeleteProductImage,
  useSetProductQuantity,
  useSetProductStatus,
  useUpdateProduct,
  useUpdateProductImage,
  useUploadProductImage,
} from '@/features/admin/api/hooks';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useToastStore } from '@/stores/toastStore';
import type { Product, ProductImage } from '@/types/api';

type Form = {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  status: Product['status'];
};

const empty: Form = {
  categoryId: 0,
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  unit: 'kg',
  status: 'active',
};

const iconButton =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100';

export function AdminProductsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'' | Product['status']>('');
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [stock, setStock] = useState<{ id: number; quantity: number; notes: string } | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);

  const products = useAdminProducts({
    page: 1,
    perPage: 50,
    q: q || undefined,
    status: status || undefined,
  });
  const categories = useAdminCategories({ page: 1, perPage: 100 });
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const toggle = useSetProductStatus();
  const setQuantity = useSetProductQuantity();
  const remove = useDeleteProduct();

  const selected = products.data?.data.find((product) => product.id === editing);
  const imageQuery = useAdminProductImages(editing && editing > 0 ? editing : undefined);
  const upload = useUploadProductImage();
  const updateImage = useUpdateProductImage();
  const deleteImage = useDeleteProductImage();
  const fileInput = useRef<HTMLInputElement>(null);

  const images = imageQuery.data?.data ?? selected?.images ?? [];

  // Create preview URLs for pending files
  const pendingPreviews = useMemo(() => {
    return pendingFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [pendingFiles]);

  const removePendingFile = (indexToRemove: number) => {
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const save = async () => {
    if (!form.name.trim()) {
      useToastStore.getState().push({ type: 'error', message: 'Please enter product name.' });
      return;
    }
    if (!form.categoryId) {
      useToastStore.getState().push({ type: 'error', message: 'Please select a product category.' });
      return;
    }

    setIsSaving(true);
    setUploadStatusText(null);

    try {
      if (editing && editing > 0) {
        // Fastify PUT /products/:id only accepts categoryId, name, description, price, unit, status
        // and strictly rejects additional properties like quantity!
        const updatePayload = {
          categoryId: Number(form.categoryId),
          name: form.name.trim(),
          description: form.description ? form.description.trim() : null,
          price: Math.max(0, Math.round(Number(form.price) || 0)),
          unit: form.unit.trim() || 'kg',
          status: form.status,
        };

        await update.mutateAsync({ id: editing, ...updatePayload });

        // If the quantity was modified, update stock via dedicated PATCH /products/:id/quantity
        const targetQuantity = Math.max(0, Math.round(Number(form.quantity) || 0));
        if (selected && selected.quantity !== targetQuantity) {
          await setQuantity.mutateAsync({
            id: editing,
            quantity: targetQuantity,
            notes: 'Adjusted from product management',
          });
        }

        setEditing(null);
        setForm(empty);
      } else {
        setUploadStatusText('Creating product...');
        const createPayload = {
          categoryId: Number(form.categoryId),
          name: form.name.trim(),
          description: form.description ? form.description.trim() : null,
          price: Math.max(0, Math.round(Number(form.price) || 0)),
          quantity: Math.max(0, Math.round(Number(form.quantity) || 0)),
          unit: form.unit.trim() || 'kg',
          status: form.status,
        };

        const response = await create.mutateAsync(createPayload);
        const productId = response.data.data.id;

        if (pendingFiles.length > 0) {
          for (let i = 0; i < pendingFiles.length; i++) {
            setUploadStatusText(`Uploading image ${i + 1}/${pendingFiles.length}...`);
            await upload.mutateAsync({ productId, file: pendingFiles[i] });
          }
        }

        setPendingFiles([]);
        setEditing(null);
        setForm(empty);
      }
    } catch (err: any) {
      // Errors handled via mutation onError toast
    } finally {
      setIsSaving(false);
      setUploadStatusText(null);
    }
  };

  const startEdit = (product: Product) => {
    setEditing(product.id);
    setPendingFiles([]);
    setForm({
      categoryId: product.category.id,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      quantity: product.quantity,
      unit: product.unit,
      status: product.status,
    });
  };

  const onFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    if (editing && editing > 0) {
      setIsUploading(true);
      try {
        for (let i = 0; i < files.length; i++) {
          setUploadStatusText(`Uploading image ${i + 1}/${files.length}...`);
          await upload.mutateAsync({ productId: editing, file: files[i] });
        }
      } catch (err: any) {
        // toast handles error
      } finally {
        setIsUploading(false);
        setUploadStatusText(null);
      }
    } else {
      setPendingFiles((current) => [...current, ...files]);
    }
    event.target.value = '';
  };

  const updateOrder = (image: ProductImage, delta: number) =>
    updateImage.mutate({
      productId: editing as number,
      imageId: image.id,
      sortOrder: Math.max(0, image.sortOrder + delta),
    });

  return (
    <AdminLayout>
      <div className="max-w-full space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-emerald-100/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <PackagePlus size={13} /> Produce Catalog &amp; Warehouse
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
              Product Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Control produce information, price settings, inventory stock, and image galleries.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-800"
            onClick={() => {
              setEditing(0);
              setPendingFiles([]);
              setForm(empty);
            }}
            type="button"
          >
            <PackagePlus size={18} />
            Add Product
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              className="w-80 rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search products..."
              value={q}
            />
          </label>
          <label className="relative">
            <Filter className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400" size={15} />
            <select
              className="rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-9 pr-8 text-sm text-emerald-950 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
              onChange={(event) => setStatus(event.target.value as typeof status)}
              value={status}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {editing !== null && (
          <div className="rounded-3xl border border-emerald-900/15 bg-white p-6 sm:p-8 shadow-xl ring-1 ring-emerald-500/10">
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800">
                  {editing ? 'Edit' : 'Create New'}
                </div>
                <h2 className="mt-1 text-xl font-extrabold text-emerald-950 sm:text-2xl">
                  {editing ? `Update: ${form.name || 'Product'}` : 'Create New Product'}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in all required information: name, category, price, and units.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSaving && !isUploading) setEditing(null);
                }}
                disabled={isSaving || isUploading}
                className="rounded-2xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* BLOCK 1: NAME & CATEGORY */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    placeholder="e.g. Butter Avocado 034, Curly Kale, Sweet Orange..."
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Clear display name for customers
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Produce Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    value={form.categoryId}
                    onChange={(event) => setForm({ ...form, categoryId: Number(event.target.value) })}
                  >
                    <option value={0}>-- Select a category --</option>
                    {categories.data?.data.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Assign category for filtering on the storefront
                  </p>
                </div>
              </div>

              {/* BLOCK 2: PRICE, UNIT & INVENTORY */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                    Pricing &amp; Unit Settings
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    e.g. bakery sold by <strong>piece</strong> or <strong>box</strong>, vegetables by <strong>kg</strong> or <strong>bunch</strong>
                  </span>
                </div>

                <div className="mt-4 grid gap-5 sm:grid-cols-3">
                  {/* Col 1: Price */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Price (VND) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-14 text-sm font-bold text-emerald-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                        min={0}
                        placeholder="e.g. 35000"
                        type="number"
                        value={form.price || ''}
                        onChange={(event) => setForm({ ...form, price: Number(event.target.value) })}
                      />
                      <span className="pointer-events-none absolute right-3.5 top-2.5 text-xs font-extrabold text-slate-400">
                        VND
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                      {form.price ? `${form.price.toLocaleString('vi-VN')} ₫ / ${form.unit || 'unit'}` : 'No price set yet'}
                    </p>
                  </div>

                  {/* Col 2: Unit */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Unit (kg, item, box...) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                        placeholder="e.g. item, box, kg, bunch..."
                        value={form.unit}
                        onChange={(event) => setForm({ ...form, unit: event.target.value })}
                      />
                    </div>
                    {/* Quick Select Unit Pills */}
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400 mr-0.5">Quick pick:</span>
                      {['kg', 'item', 'box', 'bunch', 'piece', 'bag', 'g', 'pack'].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setForm({ ...form, unit: u })}
                          className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition-all ${
                            form.unit === u
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Col 3: Stock */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <input
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-3.5 pr-14 text-sm font-bold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                        min={0}
                        placeholder="e.g. 50"
                        type="number"
                        value={form.quantity ?? ''}
                        onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
                      />
                      <span className="pointer-events-none absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">
                        {form.unit || 'unit'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Available quantity in warehouse
                    </p>
                  </div>
                </div>
              </div>

              {/* BLOCK 3: STATUS & DESCRIPTION */}
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Business Status
                  </label>
                  <select
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value as Form['status'] })}
                  >
                    <option value="active">🟢 Active (Visible to customers)</option>
                    <option value="inactive">🔴 Inactive (Hidden from store)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Product Description
                  </label>
                  <textarea
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Origin, VietGAP/GlobalGAP certification, storage guidelines, packaging specifications..."
                    rows={3}
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Editing existing product: Image Gallery */}
            {editing > 0 && (
              <div className="mt-6 border-t border-emerald-200 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">Product Image Gallery</h3>
                    <p className="text-xs text-slate-500">
                      The primary image or first photo will be displayed on the storefront.
                    </p>
                  </div>
                  <input
                    ref={fileInput}
                    className="hidden"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    onChange={onFileSelected}
                  />
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={isUploading || upload.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
                    {isUploading ? (uploadStatusText ?? 'Uploading...') : 'Upload Images'}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {images.length === 0 ? (
                    <p className="col-span-full rounded-xl border border-dashed border-emerald-300 bg-white/60 p-8 text-center text-sm text-slate-500">
                      No images yet. Click &quot;Upload Images&quot; to add photos.
                    </p>
                  ) : (
                    images
                      .slice()
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((image) => (
                        <div
                          key={image.id}
                          className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                        >
                          <img src={image.url} alt={form.name} className="aspect-square w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/75 p-1.5 opacity-0 transition group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() =>
                                updateImage.mutate({
                                  productId: editing,
                                  imageId: image.id,
                                  isPrimary: true,
                                })
                              }
                              aria-label="Set as primary"
                              title="Set as primary"
                              className={`rounded p-1 ${
                                image.isPrimary ? 'text-amber-300' : 'text-white hover:bg-white/20'
                              }`}
                            >
                              <Star size={14} fill={image.isPrimary ? 'currentColor' : 'none'} />
                            </button>
                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => updateOrder(image, -1)}
                                aria-label="Move up"
                                title="Move up"
                                className="rounded p-1 text-white hover:bg-white/20"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => updateOrder(image, 1)}
                                aria-label="Move down"
                                title="Move down"
                                className="rounded p-1 text-white hover:bg-white/20"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  window.confirm('Delete this image?') &&
                                  deleteImage.mutate({ productId: editing, imageId: image.id })
                                }
                                aria-label="Delete image"
                                title="Delete image"
                                className="rounded p-1 text-red-300 hover:bg-red-500/20"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          {image.isPrimary && (
                            <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                              Primary
                            </span>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Creating new product: Image Selection & Preview */}
            {editing === 0 && (
              <div className="mt-6 border-t border-emerald-200 pt-5">
                <input
                  ref={fileInput}
                  className="hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  multiple
                  onChange={onFileSelected}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">Product Images</h3>
                    <p className="text-xs text-slate-500">
                      Select one or more photos. The first image will be set as primary.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    <ImagePlus size={16} />
                    Choose Photos
                  </button>
                </div>

                {pendingPreviews.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {pendingPreviews.map(({ file, url }, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <img src={url} alt={file.name} className="aspect-square w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/75 p-1.5 opacity-0 transition group-hover:opacity-100">
                          <span className="truncate text-[10px] text-white px-1">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removePendingFile(index)}
                            aria-label="Remove image"
                            title="Remove this image"
                            className="rounded p-1 text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {index === 0 && (
                          <span className="absolute left-2 top-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-emerald-300 bg-white/60 p-6 text-center text-xs text-slate-500">
                    No images selected. Click &quot;Choose Photos&quot; to attach images for the new product.
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
                onClick={save}
                disabled={isSaving || isUploading}
                type="button"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? (uploadStatusText ?? 'Saving...') : 'Save Product'}
              </button>
              <button
                className="rounded-xl border border-emerald-950/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => {
                  setEditing(null);
                  setPendingFiles([]);
                }}
                disabled={isSaving || isUploading}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {stock && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-bold text-emerald-950">Adjust Stock Quantity</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                className="rounded-xl border border-emerald-950/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:border-emerald-600"
                min={0}
                type="number"
                value={stock.quantity}
                onChange={(event) => setStock({ ...stock, quantity: Number(event.target.value) })}
              />
              <input
                className="min-w-64 rounded-xl border border-emerald-950/15 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:border-emerald-600"
                placeholder="Reason / notes"
                value={stock.notes}
                onChange={(event) => setStock({ ...stock, notes: event.target.value })}
              />
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-700"
                onClick={() => setQuantity.mutate(stock, { onSuccess: () => setStock(null) })}
                type="button"
              >
                <Boxes size={16} />
                Update Stock
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
              <thead className="border-b border-emerald-950/8 bg-emerald-50/50 text-xs font-bold uppercase tracking-wider text-emerald-900/70">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Inventory</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.isLoading ? (
                  <tr>
                    <td className="px-6 py-12 text-center" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                ) : products.data?.data.length === 0 ? (
                  <tr>
                    <td className="px-6 py-12 text-center text-slate-500" colSpan={6}>
                      No products found.
                    </td>
                  </tr>
                ) : (
                  (products.data?.data ?? []).map((product) => {
                    const primary =
                      product.images?.find((image) => image.isPrimary) ?? product.images?.[0];
                    return (
                      <tr
                        className="border-b border-emerald-950/5 transition last:border-none hover:bg-emerald-50/30"
                        key={product.id}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 overflow-hidden rounded-xl bg-emerald-50 border border-emerald-900/10">
                              {primary ? (
                                <img
                                  src={primary.url}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImagePlus className="m-3 text-emerald-600/50" size={20} />
                              )}
                            </div>
                            <span className="font-bold text-emerald-950">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">{product.category.name}</td>
                        <td className="px-6 py-4 font-black text-emerald-900">
                          {product.price.toLocaleString('vi-VN')} ₫
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {product.quantity} <span className="text-xs text-slate-400 font-normal">{product.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                              product.status === 'active'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                            }`}
                          >
                            {product.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              className={`${iconButton} text-emerald-700`}
                              aria-label={`Edit ${product.name}`}
                              title="Edit product"
                              onClick={() => startEdit(product)}
                              type="button"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              className={`${iconButton} text-amber-700`}
                              aria-label={`Adjust stock for ${product.name}`}
                              title="Adjust stock"
                              onClick={() =>
                                setStock({ id: product.id, quantity: product.quantity, notes: '' })
                              }
                              type="button"
                            >
                              <Boxes size={16} />
                            </button>
                            <button
                              className={`${iconButton} text-blue-700`}
                              aria-label={
                                product.status === 'active'
                                  ? `Deactivate ${product.name}`
                                  : `Activate ${product.name}`
                              }
                              title="Toggle status"
                              onClick={() =>
                                toggle.mutate({
                                  id: product.id,
                                  status: product.status === 'active' ? 'inactive' : 'active',
                                })
                              }
                              type="button"
                            >
                              {product.status === 'active' ? <Power size={16} /> : <Check size={16} />}
                            </button>
                            <button
                              className={`${iconButton} text-red-600 hover:bg-red-50`}
                              aria-label={`Delete ${product.name}`}
                              title="Delete product"
                              onClick={() =>
                                window.confirm('Delete this product?') && remove.mutate(product.id)
                              }
                              type="button"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
