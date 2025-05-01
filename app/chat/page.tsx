'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';

export default function ChatPage() {
  const router = useRouter();
  
  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-blue-600">LLM-EduHub</span>
            </div>
            <div className="flex items-center">
              <Button variant="outline" size="sm" onClick={handleBackToHome}>
                返回首页
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">聊天页面</h1>
          <p className="text-gray-600">
            这里是聊天功能页面占位符。后续将添加聊天相关组件和功能。
          </p>
        </div>
      </div>
    </main>
  );
} 