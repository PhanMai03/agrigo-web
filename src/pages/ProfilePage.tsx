import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  User,
  KeyRound,
  ShieldAlert,
  LogOut,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useChangePassword,
  useCurrentUser,
  useLogoutAll,
  useUpdateProfile,
} from '@/features/auth/api/hooks';
import { MainLayout } from '@/layouts/MainLayout';
import { useToastStore } from '@/stores/toastStore';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Please enter your full name'),
  phone: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Please enter current password'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const update = useUpdateProfile();
  const changePassword = useChangePassword();
  const logoutAll = useLogoutAll();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user.data
      ? {
          fullName: user.data.fullName,
          phone: user.data.phone ?? '',
          address: user.data.address ?? '',
          avatarUrl: user.data.avatarUrl ?? '',
        }
      : undefined,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const handleUpdateProfile = (data: ProfileFormValues) => {
    update.mutate(
      {
        fullName: data.fullName,
        phone: data.phone || null,
        address: data.address || null,
        avatarUrl: data.avatarUrl || null,
      },
      {
        onSuccess: () => {
          useToastStore.getState().push({
            type: 'success',
            message: 'Profile information updated successfully.',
          });
        },
        onError: (err: any) => {
          useToastStore.getState().push({
            type: 'error',
            message: err?.response?.data?.message || 'Failed to update profile.',
          });
        },
      }
    );
  };

  const handleChangePassword = (data: PasswordFormValues) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        useToastStore.getState().push({
          type: 'success',
          message: 'Password changed successfully. Please log in with your new password.',
        });
        navigate('/login');
      },
      onError: (err: any) => {
        useToastStore.getState().push({
          type: 'error',
          message: err?.response?.data?.message || 'Incorrect current password.',
        });
      },
    });
  };

  const handleLogoutAllDevices = async () => {
    if (
      window.confirm(
        'Are you sure you want to sign out of all active sessions across all devices? You will be logged out of this device as well.'
      )
    ) {
      try {
        await logoutAll.mutateAsync();
        useToastStore.getState().push({
          type: 'success',
          message: 'All active sessions have been revoked. Please sign in again.',
        });
        navigate('/login');
      } catch {
        useToastStore.getState().push({
          type: 'error',
          message: 'Failed to sign out of all devices. Please try again.',
        });
      }
    }
  };

  if (user.isLoading) {
    return (
      <MainLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-700" />
        </div>
      </MainLayout>
    );
  }

  const userData = user.data;

  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-xl font-bold text-emerald-900 shadow-xs">
            {userData?.avatarUrl ? (
              <img
                src={userData.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-2xl object-cover"
              />
            ) : (
              userData?.fullName.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#19342b]">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your personal farm delivery address, security credentials, and active sessions.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Form 1: Personal Details */}
          <form
            onSubmit={profileForm.handleSubmit(handleUpdateProfile)}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs"
          >
            <div>
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <User className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-bold text-[#19342b]">Personal Information</h2>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Full Name
                  </label>
                  <input
                    {...profileForm.register('fullName')}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  {profileForm.formState.errors.fullName && (
                    <span className="mt-1 block text-xs text-rose-600">
                      {profileForm.formState.errors.fullName.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Email Address
                  </label>
                  <input
                    disabled
                    value={userData?.email ?? ''}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Email address is tied to your account credentials.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Phone Number
                  </label>
                  <input
                    {...profileForm.register('phone')}
                    placeholder="+84 901 234 567"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Default Delivery Address
                  </label>
                  <textarea
                    {...profileForm.register('address')}
                    rows={3}
                    placeholder="Enter street name, ward, district, city..."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={update.isPending}
                className="inline-flex items-center space-x-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-800 disabled:opacity-50"
              >
                {update.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Save Information</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Column 2: Password + Sessions */}
          <div className="space-y-6">
            {/* Form 2: Change Password */}
            <form
              onSubmit={passwordForm.handleSubmit(handleChangePassword)}
              className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs"
            >
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <KeyRound className="h-5 w-5 text-emerald-700" />
                <h2 className="text-lg font-bold text-[#19342b]">Change Password</h2>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register('currentPassword')}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <span className="mt-1 block text-xs text-rose-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                    New Password (min 8 chars)
                  </label>
                  <input
                    type="password"
                    {...passwordForm.register('newPassword')}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <span className="mt-1 block text-xs text-rose-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changePassword.isPending}
                    className="inline-flex items-center space-x-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-50"
                  >
                    {changePassword.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <KeyRound size={16} />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Section 3: Active Sessions & Global Signout (POST /api/auth/logout-all) */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-6 shadow-xs">
              <div className="flex items-center space-x-2 text-rose-900">
                <ShieldAlert className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold">Active Device Sessions</h3>
              </div>
              <p className="mt-2 text-xs text-rose-800/80 leading-relaxed">
                Lost a phone or signed in on a public computer? Revoking all sessions immediately signs you out of every active browser, phone, and tablet.
              </p>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleLogoutAllDevices}
                  disabled={logoutAll.isPending}
                  className="inline-flex items-center space-x-2 rounded-xl bg-rose-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-rose-800 disabled:opacity-50"
                >
                  {logoutAll.isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Signing out everywhere...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={14} />
                      <span>Sign Out of All Devices</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
