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
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">大学生求职陪跑助手</h1>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => router.push('/')}
          >
            返回上传页
          </button>
        </div>
      </header>
      
      {/* 主内容 */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-8">分析进度</h2>
          
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {task && (
            <div className="space-y-8">
              {/* 阶段进度条 */}
              <div className="space-y-4">
                {Object.entries(stageConfig).map(([key, config]) => {
                  const stage = key as Stage;
                  const isCurrent = task.stage === stage;
                  const isCompleted = getStageIndex(stage as any) < getStageIndex(task.stage as any);
                  const isError = task.status === 'failed';
                  
                  return (
                    <div key={key} className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : isCurrent ? 'bg-blue-500 text-white' : isError ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {isCompleted ? '✓' : isCurrent ? '⟳' : isError ? '✗' : ''}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-medium ${isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : isError ? 'text-red-600' : 'text-gray-500'}`}>
                            {config.label}
                          </span>
                          {isCurrent && (
                            <span className="text-xs text-blue-600">当前阶段</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{config.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* 状态信息 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-lg font-medium mb-2">
                  {task.status === 'pending' && '等待分析'}
                  {task.status === 'processing' && '分析中'}
                  {task.status === 'succeeded' && '分析完成'}
                  {task.status === 'failed' && '分析失败'}
                </div>
                <div className="text-gray-600 mb-4">
                  {task.error_message || stageConfig[task.stage as Stage]?.description}
                </div>
                <div className="text-sm text-gray-500">
                  已等待时间: {formatTime(elapsedTime)}
                </div>
              </div>
              
              {/* 操作按钮 */}
              {task.status === 'failed' && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => router.push('/')}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    重新上传
                  </button>
                  <button
                    onClick={fetchTaskStatus}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    重试
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}