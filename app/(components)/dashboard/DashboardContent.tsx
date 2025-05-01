'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@components/ui/Button';

export function DashboardContent() {
  const router = useRouter();

  const handleLogout = () => {
    // 这里添加登出逻辑
    router.push('/');
  };

  return (
    <div className="w-full">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">LLM-EduHub</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-b-2 border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 text-sm font-medium">
                  仪表板
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  课程
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  学习工具
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  我的进度
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">欢迎回来，用户</h1>
          <p className="mt-1 text-gray-600">这是您的个人学习中心，开始探索吧！</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">推荐课程</h3>
              <div className="mt-5">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">AI 基础入门</h4>
                    <p className="text-sm text-gray-500">掌握人工智能的基本概念</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">大语言模型应用</h4>
                    <p className="text-sm text-gray-500">学习 LLM 的教育应用场景</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                查看所有课程 &rarr;
              </a>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">学习进度</h3>
              <div className="mt-5">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">AI 基础入门</span>
                    <span className="text-sm font-medium text-gray-700">75%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">大语言模型应用</span>
                    <span className="text-sm font-medium text-gray-700">30%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                查看完整进度 &rarr;
              </a>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">AI 学习助手</h3>
              <div className="mt-5 text-sm text-gray-600">
                <p>使用我们的 AI 学习助手，获取个性化的学习建议和解答。</p>
                <div className="mt-4">
                  <Button>
                    开始对话
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                了解更多功能 &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 