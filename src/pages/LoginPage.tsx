import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useLogin } from '@/features/auth/api/hooks';

const schema = z.object({ email: z.string().email('Invalid email address'), password: z.string().min(1, 'Please enter your password') });
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const submit = (values: FormValues) => login.mutate(values, { onSuccess: (session) => { const requestedPath = (location.state as { from?: string } | null)?.from; const destination = session.user.role === 'admin' ? '/admin/products' : (requestedPath ?? '/'); navigate(destination, { replace: true }); } });

  return <div className="w-full max-w-md rounded-2xl border border-earth-100 bg-white p-6 shadow-sm sm:p-8"><p className="font-semibold uppercase tracking-[0.2em] text-primary-700">Agri-Go</p><h1 className="mt-2 text-3xl font-extrabold text-primary-900">Sign In</h1><form className="mt-6 space-y-4" onSubmit={handleSubmit(submit)}><label className="block text-sm font-semibold">Email<input {...register('email')} className="mt-1 w-full rounded-xl border border-earth-200 px-4 py-3" type="email" />{errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}</label><label className="block text-sm font-semibold">Password<input {...register('password')} className="mt-1 w-full rounded-xl border border-earth-200 px-4 py-3" type="password" />{errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}</label>{login.isError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{login.error.message}</p>}<button className="w-full rounded-xl bg-primary-700 px-4 py-3 font-bold text-white disabled:opacity-60" disabled={login.isPending} type="submit">{login.isPending ? 'Signing in...' : 'Sign In'}</button></form><div className="mt-5 flex justify-between text-sm"><Link className="text-primary-700" to="/forgot-password">Forgot password?</Link><Link className="font-semibold text-primary-700" to="/register">Create an account</Link></div></div>;
}
