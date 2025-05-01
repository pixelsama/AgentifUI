'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/button';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const router = useRouter();
  
  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-medium">聊天界面</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleBackToHome}>
            返回首页
          </Button>
        </div>
      </header>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-primary mb-4">聊天功能</h2>
          <p className="text-muted-foreground">
            这里是聊天功能页面占位符。侧边栏功能已集成，支持展开/折叠和暗色/亮色模式切换。
          </p>
        </div>
      </div>
    </div>
  );
} 