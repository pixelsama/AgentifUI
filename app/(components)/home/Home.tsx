'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@components/ui/Button';
import { useRouter } from 'next/navigation';

export function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  const handleLearnMoreClick = () => {
    router.push('/about');
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"
        >
          LLM-EduHub
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 text-xl md:text-2xl text-gray-600 max-w-2xl"
        >
          探索AI教育的无限可能，打造智能学习新体验
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button size="lg" onClick={handleLoginClick}>
            立即开始
          </Button>
          <Button size="lg" variant="outline" onClick={handleLearnMoreClick}>
            了解更多
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-16 flex justify-center items-center gap-8"
        >
          {/* 这里可以添加一些特性图标或者合作伙伴logo */}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 