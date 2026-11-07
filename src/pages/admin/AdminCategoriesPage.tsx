import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Edit3,
  Folder,
  FolderPlus,
  ImagePlus,
  Loader2,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useDeleteCategoryImage,
  useUpdateCategory,
  useUploadCategoryImage,
} from '@/features/admin/api/hooks';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useToastStore } from '@/stores/toastStore';
import type { Category } from '@/types/api';

const iconButton =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-slate-100';

export function AdminCategoriesPage() {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useAdminCategories({ page: 1, perPage: 100, q: q || undefined });
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();
  const uploadImage = useUploadCategoryImage();
  const deleteImage = useDeleteCategoryImage();

  // Safely extract categories list supporting various response structures
  const categoryItems: Category[] = useMemo(() => {
    if (Array.isArray(categories.data?.data)) return categories.data.data;
    if (Array.isArray(categories.data)) return categories.data as any;
    if (Array.isArray((categories.data as any)?.items)) return (categories.data as any).items;
    return [];
  }, [categories.data]);

  // Cleanly handle preview object URLs without memory leaks
  useEffect(() => {
    if (!pendingFile) {
      setPendingPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [pendingFile]);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setPendingFile(null);
    setExistingImageUrl(null);
    setIsSaving(false);
    setIsUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startCreate = () => {
    setEditing(0);
    setName('');
    setDescription('');
    setPendingFile(null);
    setExistingImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startEdit = (category: Category) => {
    setEditing(category.id);
    setName(category.name);
    setDescription(category.description ?? '');
    setPendingFile(null);
    setExistingImageUrl(category.imageUrl ?? null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (editing !== null && editing > 0) {
      // Direct upload when editing existing category
      setIsUploadingImage(true);
      try {
        const res = await uploadImage.mutateAsync({ categoryId: editing, file });
        const uploadedUrl = res.data?.data?.imageUrl ?? (res.data as any)?.imageUrl ?? null;
        setExistingImageUrl(uploadedUrl);
      } catch (err: any) {
        // error toasted by hook
      } finally {
        setIsUploadingImage(false);
      }
    } else {
      // Queue for upload after creation
      setPendingFile(file);
    }
    e.target.value = '';
  };

  const handleRemoveExistingImage = async () => {
    if (!editing || editing <= 0) return;
    if (!window.confirm('Are you sure you want to remove the cover image of this category?')) return;

    setIsUploadingImage(true);
    try {
      await deleteImage.mutateAsync(editing);
      setExistingImageUrl(null);
    } catch (err: any) {
      // error toasted by hook
    } finally {
      setIsUploadingImage(false);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      useToastStore.getState().push({ type: 'error', message: 'Please enter category name.' });
      return;
    }

    setIsSaving(true);
    try {
      if (editing !== null && editing > 0) {
        await update.mutateAsync({ id: editing, name: name.trim(), description: description.trim() || null });
        resetForm();
      } else {
        const res = await create.mutateAsync({ name: name.trim(), description: description.trim() || null });
        const newCategoryId = res.data?.data?.id ?? (res.data as any)?.id;

        if (pendingFile && newCategoryId) {
          try {
            await uploadImage.mutateAsync({ categoryId: newCategoryId, file: pendingFile });
          } catch (uploadErr) {
            // Category was created; upload error handled via hook
          }
        }
        resetForm();
      }
    } catch (err: any) {
      // error toasted by hook
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-full space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-emerald-100/60 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
              <Folder size={13} /> Produce Classification
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
              Categories Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage produce categories, display icons, and cover photos for the storefront.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-all hover:-translate-y-0.5 hover:bg-emerald-800"
            onClick={startCreate}
            type="button"
          >
            <FolderPlus size={18} />
            Add Category
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              className="w-80 rounded-xl border border-emerald-950/15 bg-white py-2.5 pl-10 pr-4 text-sm text-emerald-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search categories..."
              value={q}
            />
          </label>
        </div>

        {editing !== null && (
          <div className="rounded-2xl border border-emerald-900/15 bg-white p-6 shadow-sm ring-1 ring-emerald-500/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-emerald-950">
                {editing !== null && editing > 0 ? 'Update Category' : 'Create New Category'}
              </h2>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving || isUploadingImage}
                className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
                placeholder="Category Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="rounded-xl border border-emerald-950/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/60"
                placeholder="Category Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Image upload section */}
            <div className="mt-5 border-t border-emerald-200/80 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Category Cover Photo</h3>
                  <p className="text-xs text-slate-500">
                    Image shown on homepage and categories carousel (JPG, PNG, WebP).
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={onFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving || isUploadingImage}
                  className="inline-flex items-center gap-2 rounded-xl bg-white border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm hover:bg-emerald-50 disabled:opacity-50"
                >
                  {isUploadingImage ? <Loader2 className="animate-spin" size={16} /> : <ImagePlus size={16} />}
                  {isUploadingImage
                    ? 'Uploading image...'
                    : editing !== null && editing > 0 && existingImageUrl
                    ? 'Change Image'
                    : 'Choose Image'}
                </button>
              </div>

              {/* Preview when creating */}
              {editing === 0 && (
                <div className="mt-3">
                  {pendingPreviewUrl ? (
                    <div className="relative inline-block overflow-hidden rounded-xl border border-emerald-300 bg-white shadow-sm">
                      <img
                        src={pendingPreviewUrl}
                        alt="Preview"
                        className="h-28 w-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPendingFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700"
                        title="Remove preview"
                        aria-label="Remove preview"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-emerald-300 bg-white/60 p-4 text-center text-xs text-slate-500">
                      No image selected. Click &quot;Choose Image&quot; to attach a cover photo.
                    </p>
                  )}
                </div>
              )}

              {/* Preview when editing */}
              {editing !== null && editing > 0 && (
                <div className="mt-3">
                  {existingImageUrl ? (
                    <div className="relative inline-block overflow-hidden rounded-xl border border-emerald-300 bg-white shadow-sm">
                      <img
                        src={existingImageUrl}
                        alt={name}
                        className="h-28 w-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveExistingImage}
                        disabled={isUploadingImage}
                        className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700 disabled:opacity-50"
                        title="Delete image"
                        aria-label="Delete image"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-emerald-300 bg-white/60 p-4 text-center text-xs text-slate-500">
                      No cover photo for this category. Click &quot;Choose Image&quot; to upload one.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
                onClick={save}
                disabled={isSaving || isUploadingImage}
                type="button"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {isSaving ? 'Saving...' : 'Save Category'}
              </button>
              <button
                className="rounded-xl border border-emerald-950/15 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={resetForm}
                disabled={isSaving || isUploadingImage}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-emerald-950/8 bg-emerald-50/50 text-xs font-bold uppercase tracking-wider text-emerald-900/70">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.isLoading ? (
                  <tr>
                    <td className="p-8 text-center" colSpan={5}>
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="animate-spin text-emerald-700" size={18} />
                        <span>Loading categories...</span>
                      </div>
                    </td>
                  </tr>
                ) : categories.isError ? (
                  <tr>
                    <td className="p-8 text-center text-rose-600 font-semibold" colSpan={5}>
                      {(categories.error as any)?.response?.data?.message ||
                        categories.error?.message ||
                        'Failed to load categories.'}
                    </td>
                  </tr>
                ) : categoryItems.length === 0 ? (
                  <tr>
                    <td className="p-8 text-center text-slate-500" colSpan={5}>
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categoryItems.map((c) => (
                    <tr
                      className="border-b border-emerald-950/5 transition last:border-none hover:bg-emerald-50/30"
                      key={c.id}
                    >
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-900/10">
                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Folder className="text-emerald-700" size={20} />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-950">{c.name}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {c.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{c.description ?? '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button
                            className={`${iconButton} text-slate-600 hover:bg-emerald-50 hover:text-emerald-900`}
                            aria-label={`Edit ${c.name}`}
                            title="Edit category"
                            onClick={() => startEdit(c)}
                            type="button"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className={`${iconButton} text-rose-600 hover:bg-rose-50`}
                            aria-label={`Delete ${c.name}`}
                            title="Delete category"
                            onClick={() =>
                              window.confirm(`Delete category "${c.name}"?`) && remove.mutate(c.id)
                            }
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
