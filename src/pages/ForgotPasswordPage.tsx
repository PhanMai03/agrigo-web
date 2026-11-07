import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useForgotPassword } from '@/features/auth/api/hooks';

const schema = z.object({ email: z.string().email('Invalid email address') });
export function ForgotPasswordPage() { const mutation = useForgotPassword(); const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) }); return <div className="w-full max-w-md rounded-2xl border border-earth-100 bg-white p-6 shadow-sm sm:p-8"><h1 className="text-3xl font-extrabold text-primary-900">Forgot Password</h1><p className="mt-2 text-sm text-earth-600">Enter your email to receive a password reset token.</p><form className="mt-6 space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}><label className="block text-sm font-semibold">Email<input {...register('email')} className="mt-1 w-full rounded-xl border border-earth-200 px-4 py-3" type="email" />{errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}</label><button className="w-full rounded-xl bg-primary-700 px-4 py-3 font-bold text-white" type="submit">Send Reset Token</button></form>{mutation.isSuccess && <p className="mt-4 text-sm text-primary-700">If the email exists, a reset token has been sent.</p>}<Link className="mt-5 block text-center text-sm text-primary-700" to="/login">Back to Sign In</Link></div>; }
