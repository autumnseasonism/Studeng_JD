import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface QuotaStatus {
  ip: string;
  analysis_remaining_today: number;
  chat_remaining_today: number;
  next_reset_at: string;
}

export default function UploadPage() {
  const router = useRouter();
  
  // 状态管理
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jobTarget, setJobTarget] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobType, setJobType] = useState('实习');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 求职类型选项
  const jobTypeOptions = ['实习', '校招', '转专业', '早期求职'];
  
  // 获取额度
  useEffect(() => {
    fetchQuota();
  }, []);
  
  const fetchQuota = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/quota');
      if (response.ok) {
        const data = await response.json();
        setQuota(data);
      } else {
        throw new Error('获取额度失败');
      }
    } catch (err) {
      console.error('获取额度失败:', err);
    }
  };
  
  // 处理文件拖拽
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  // 处理文件选择
  const handleFileChange = (selectedFile: File) => {
    // 检查文件大小
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('文件超过10MB，请压缩或改用文本粘贴');
      return;
    }
    
    // 检查文件类型
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.md'];
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      setError('当前仅支持 PDF、DOCX、TXT、MD');
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 校验
    if (!file && !resumeText.trim()) {
      setError('请上传简历文件或粘贴简历文本');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (resumeText) {
        formData.append('resume_text', resumeText);
      }
      if (jobTarget) {
        formData.append('job_target', jobTarget);
      }
      if (jobDescription) {
        formData.append('job_description', jobDescription);
      }
      formData.append('job_type', jobType);
      
      const response = await fetch('http://localhost:8000/api/analysis/start', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        router.push(`/progress?task_id=${data.task_id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || '分析失败，请重试');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('提交失败:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 清空表单
  const handleClear = () => {
    setFile(null);
    setResumeText('');
    setJobTarget('');
    setJobDescription('');
    setJobType('实习');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">大学生求职陪跑助手</h1>
          <div className="flex items-center gap-4">
            {quota && (
              <div className="text-sm text-gray-600">
                今日剩余分析次数: {quota.analysis_remaining_today}
              </div>
            )}
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => router.push('/history')}
            >
              本地历史
            </button>
          </div>
        </div>
      </header>
      
      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">上传简历，开始分析</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 左侧：文件上传 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">上传简历文件</h3>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
                    accept=".pdf,.docx,.txt,.md"
                  />
                  {file ? (
                    <div className="space-y-2">
                      <div className="text-green-600 font-medium">✓ 文件已选择</div>
                      <div className="text-sm text-gray-600">{file.name}</div>
                      <div className="text-sm text-gray-500">{Math.round(file.size / 1024)} KB</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-gray-500">拖拽文件到此处或点击选择文件</div>
                      <div className="text-xs text-gray-400">支持 PDF、DOCX、TXT、MD，最大 10MB</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 右侧：文本输入 */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-4">或粘贴简历文本</h3>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="请粘贴简历文本..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* 目标岗位和JD */}
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">目标岗位</label>
                <input
                  type="text"
                  value={jobTarget}
                  onChange={(e) => setJobTarget(e.target.value)}
                  placeholder="例如：产品运营实习生"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">岗位描述 (可选)</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="请粘贴岗位JD..."
                  className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">求职类型</label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {jobTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? '分析中...' : '开始分析'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                清空
              </button>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 self-center"
              >
                查看示例
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}