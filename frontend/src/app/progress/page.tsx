'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AnalysisTask {
  task_id: string;
  status: string;
  stage: string;
  created_at: string;
  error_code: string | null;
  error_message: string | null;
}

type Stage = 'extracting' | 'jd_analysis' | 'diagnosis' | 'audit' | 'rewrite' | 'compare' | 'completed' | 'error';

const stageConfig = {
  extracting: { label: '解析简历', description: '正在解析上传的简历文件' },
  jd_analysis: { label: '理解岗位', description: '正在分析岗位描述' },
  diagnosis: { label: '生成诊断', description: '正在生成简历诊断报告' },
  audit: { label: '生成修改建议', description: '正在生成模块化修改建议' },
  rewrite: { label: '生成 Markdown 简历', description: '正在生成优化后的 Markdown 简历' },
  compare: { label: '版本对比', description: '正在生成版本对比分析' },
  completed: { label: '分析完成', description: '分析已完成，正在跳转到报告页面' },
  error: { label: '分析失败', description: '分析过程中出现错误' }
};

export default function ProgressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task_id');
  
  const [task, setTask] = useState<AnalysisTask | null>(null);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    if (!taskId) {
      router.push('/');
      return;
    }
    
    // 开始轮询任务状态
    const interval = setInterval(() => {
      fetchTaskStatus();
    }, 2000);
    
    // 开始计时
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // 初始获取
    fetchTaskStatus();
    
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [taskId, router]);
  
  const fetchTaskStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/analysis/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
        
        // 检查任务状态
        if (data.status === 'succeeded') {
          // 跳转到审计报告页
          setTimeout(() => {
            router.push(`/report?task_id=${taskId}`);
          }, 1000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '获取任务状态失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取任务状态失败:', err);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getStageIndex = (stage: Stage) => {
    const stages: Stage[] = ['extracting', 'jd_analysis', 'diagnosis', 'audit', 'rewrite', 'compare'];
    return stages.indexOf(stage);
  };
  
  if (!taskId) {
    return <div className="min-h-screen flex items-center justify-center">缺少任务ID</div>;
  }
  
  return (
    <div className="min-h-screen gradient-bg">
      {/* 头部 */}
      <header className="glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-green-600">大学生求职陪跑助手</h1>
          <button 
            className="text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
            onClick={() => router.push('/')}
          >
            返回上传页
          </button>
        </div>
      </header>
      
      {/* 主内容 */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto fade-in">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-green-600">
              分析进度
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              正在分析你的简历，请稍候...
            </p>
          </div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
              {error}
            </div>
          )}
          
          {task && (
            <div className="space-y-8">
              {/* 阶段进度条 */}
              <div className="glass p-6 rounded-xl">
                <div className="space-y-6">
                  {Object.entries(stageConfig).map(([key, config]) => {
                    const stage = key as Stage;
                    const isCurrent = task.stage === stage;
                    const isCompleted = getStageIndex(stage as any) < getStageIndex(task.stage as any);
                    const isError = task.status === 'failed';
                    
                    return (
                      <div key={key} className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-orange-500 text-white' : isError ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {isCompleted ? '✓' : isCurrent ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full loading-spinner"></div>
                          ) : isError ? '✗' : ''}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`font-medium ${isCompleted ? 'text-green-600' : isCurrent ? 'text-orange-600' : isError ? 'text-red-600' : 'text-gray-500'}`}>
                              {config.label}
                            </span>
                            {isCurrent && (
                              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">当前阶段</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{config.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* 状态信息 */}
              <div className="glass p-6 rounded-xl">
                <div className="text-xl font-semibold mb-4">
                  {task.status === 'pending' && '等待分析'}
                  {task.status === 'processing' && '分析中'}
                  {task.status === 'succeeded' && '分析完成'}
                  {task.status === 'failed' && '分析失败'}
                </div>
                <div className="text-gray-600 mb-6">
                  {task.error_message || stageConfig[task.stage as Stage]?.description}
                </div>
                <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <span>已等待时间:</span>
                  <span className="font-medium text-orange-600">{formatTime(elapsedTime)}</span>
                </div>
              </div>
              
              {/* 操作按钮 */}
              {task.status === 'failed' && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 gradient-btn py-4 px-8 rounded-lg font-semibold text-lg"
                  >
                    重新上传
                  </button>
                  <button
                    onClick={fetchTaskStatus}
                    className="flex-1 glass py-4 px-8 rounded-lg font-semibold text-lg transition-colors hover:bg-white/20 dark:hover:bg-gray-700/40"
                  >
                    重试
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* 页脚 */}
      <footer className="glass py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2026 大学生求职陪跑助手 | 让求职更简单</p>
        </div>
      </footer>
    </div>
  );
}