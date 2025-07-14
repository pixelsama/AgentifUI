'use client';

import { RegisterForm } from '@components/auth/register-form';
import { useTheme } from '@lib/hooks/use-theme';
import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ensure client-side rendering consistency
  useEffect(() => {
    setMounted(true);
  }, []);

  // get colors based on theme
  const getColors = () => {
    if (isDark) {
      return {
        bgColor: 'bg-stone-800',
      };
    } else {
      return {
        bgColor: 'bg-stone-100',
      };
    }
  };

  const colors = mounted
    ? getColors()
    : {
        bgColor: '',
      };

  return (
    <main
      className={`flex min-h-screen w-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 ${colors.bgColor} font-serif`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <RegisterForm />
      </motion.div>
    </main>
  );
}
