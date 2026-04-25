'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Change {
  section: string;
  original: string;
  optimized: string;
  reason: string;
}

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task_id');
  
  const [changes, setChanges] = useState<Change[]>([]);
  
  // 模拟数据
  const mockChanges: Change[] = [
    {
      section: '实习经历',
      original: '2023.07-2023.09 某互联网公司 运营实习生\n负责内容运营和用户运营',
      optimized: '2023.07-2023.09 某互联网公司 运营实习生\n- 负责公众号内容策划和编辑，月均产出12篇文章，阅读量提升30%\n- 运营用户社群，通过活动策划，活跃用户增长25%\n- 分析用户行为数据，提出3条优化建议，被采纳2条',
      reason: '添加具体工作内容和量化成果，更能体现实际工作能力'
    },
    {
      section: '教育背景',
      original: '2020.09-2024.06 北京大学 市场营销 本科',
      optimized: '2020.09-2024.06 北京大学 市场营销 本科\nGPA：3.8/4.0\n核心课程：市场营销原理、消费者行为学、市场调研',
      reason: '添加GPA和核心课程，体现学习能力和专业基础'
    },
    {
      section: '技能证书',
      original: '技能：Office、Photoshop',
      optimized: '**专业技能**：Excel（精通，掌握VLOOKUP、数据透视表）、Photoshop（熟练）\n**软技能**：沟通能力、团队协作、项目管理\n**其他**：英语（CET-6）',
      reason: '按类别分类技能，标注熟练程度，突出与岗位相关的技能'
    }
  ];
  
  useEffect(() => {
    // 模拟获取对比数据
    // 实际项目中应该调用API获取真实数据
    setTimeout(() => {
      setChanges(mockChanges);
    }, 500);
  }, []);
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleGoToEditor = () => {
    router.push('/editor');
  };
  
  return (
    <div className="min-h-screen gradient-bg">
      {/* 头部 */}
      <header className="glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-green-600">大学生求职陪跑助手</h1>
          <div className="flex items-center gap-6">
            <button 
              className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
              onClick={handleGoBack}
            >
              返回报告
            </button>
            <button 
              className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
              onClick={() => router.push('/history')}
            >
              本地历史
            </button>
          </div>
        </div>
      </header>
      
      {/* 主内容 */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-green-600">
              版本对比
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              查看原始简历和优化后简历的对比
            </p>
          </div>
          
          {changes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-2 border-white border-t-orange-500 rounded-full mx-auto mb-4 loading-spinner"></div>
              <p>加载对比数据中...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {changes.map((change, index) => (
                <div key={index} className="glass rounded-xl overflow-hidden card-hover">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{change.section}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {/* 左侧：原始内容 */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">原始内容</h4>
                      <div className="glass p-4 rounded-lg text-sm whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/60">
                        {change.original}
                      </div>
                    </div>
                    
                    {/* 右侧：优化后内容 */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">优化后内容</h4>
                      <div className="glass p-4 rounded-lg text-sm whitespace-pre-wrap bg-orange-50 dark:bg-orange-900/30">
                        {change.optimized}
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-100 dark:border-orange-800/50">
                    <h4 className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">修改原因</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400">{change.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleGoBack}
              className="glass py-3 px-6 rounded-lg font-semibold text-lg transition-colors hover:bg-white/20 dark:hover:bg-gray-800/60"
            >
              返回报告
            </button>
            <button
              onClick={handleGoToEditor}
              className="gradient-btn py-3 px-6 rounded-lg font-semibold text-lg"
            >
              进入编辑器
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}