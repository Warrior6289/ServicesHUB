import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm your password'),
  accountType: z.enum(['buyer', 'seller'], { required_error: 'Please select an account type' }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

type SignupFormValues = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const { loginAs, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', accountType: 'buyer' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: SignupFormValues) => {
    await new Promise((r) => setTimeout(r, 800));
    
    // Store user data in localStorage
    const userData = {
      name: values.name,
      email: values.email,
      accountType: values.accountType,
      signupDate: new Date().toISOString(),
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Simulate successful signup
    loginAs(values.accountType);
    
    // Redirect based on account type
    if (values.accountType === 'buyer') {
      navigate('/user-dashboard');
    } else {
      navigate('/seller-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="mt-2 text-white/90">Join our community of professionals</p>
          </div>

          {/* Form */}
          <div className="px-6 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  {...register('name')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p id="email-error" className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                  {...register('confirmPassword')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p id="confirm-error" className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Account Type
                  </legend>
                  <div className="space-y-3">
                    <label className="flex items-start p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        value="buyer"
                        {...register('accountType')}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Buyer</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Find and hire service providers</div>
                      </div>
                    </label>
                    <label className="flex items-start p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        value="seller"
                        {...register('accountType')}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Seller</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Offer your services to customers</div>
                      </div>
                    </label>
                  </div>
                  {errors.accountType && (
                    <p className="mt-2 text-sm text-red-600">{errors.accountType.message}</p>
                  )}
                </fieldset>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            {/* Sign in link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};