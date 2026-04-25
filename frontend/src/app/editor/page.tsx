'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ResumeVersion {
  version_id: string;
  name: string;
  markdown: string;
  created_at: string;
  updated_at: string;
}

export default function EditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMarkdown = searchParams.get('markdown') || '';
  
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [versionName, setVersionName] = useState('初始优化版');
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // 从IndexedDB加载历史版本
  useEffect(() => {
    loadVersions();
  }, []);
  
  const loadVersions = async () => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction('resume_versions', 'readonly');
      const store = transaction.objectStore('resume_versions');
      const allVersions = await store.getAll();
      setVersions(allVersions);
    } catch (error) {
      console.error('加载版本失败:', error);
    }
  };
  
  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('resume_coach', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('resume_versions')) {
          db.createObjectStore('resume_versions', { keyPath: 'version_id' });
        }
      };
      
      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
      
      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  };
  
  const saveVersion = async () => {
    if (!markdown.trim()) {
      setSaveError('简历内容不能为空');
      return;
    }
    
    setIsSaving(true);
    setSaveError('');
    
    try {
      const newVersion: ResumeVersion = {
        version_id: Date.now().toString(),
        name: versionName || `版本 ${versions.length + 1}`,
        markdown,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const db = await openIndexedDB();
      const transaction = db.transaction('resume_versions', 'readwrite');
      const store = transaction.objectStore('resume_versions');
      await store.add(newVersion);
      
      setVersions([...versions, newVersion]);
      setVersionName('');
    } catch (error) {
      setSaveError('保存失败，请检查浏览器存储权限');
      console.error('保存版本失败:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      alert('Markdown已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  const copyPlainText = async () => {
    try {
      // 简单的Markdown转纯文本
      const plainText = markdown
        .replace(/^#+/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')
        .replace(/```[\s\S]*?```/g, '')
        .trim();
      await navigator.clipboard.writeText(plainText);
      alert('纯文本已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  };
  
  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleViewCompare = () => {
    router.push('/compare');
  };
  
  const handleGoBack = () => {
    router.back();
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
        <div className="max-w-7xl mx-auto fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-green-600">
              简历编辑器
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              编辑优化后的简历，支持Markdown格式，实时预览效果
            </p>
          </div>
          
          {/* 工具栏 */}
          <div className="glass p-6 rounded-xl mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">版本名称</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="输入版本名称"
                className="w-full p-3 border border-gray-300 rounded-lg input-focus bg-white/80 dark:bg-gray-800/80"
              />
            </div>
            <button
              onClick={saveVersion}
              disabled={isSaving}
              className="gradient-btn py-3 px-6 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full loading-spinner"></div>
                  <span>保存中...</span>
                </div>
              ) : (
                '保存本地版本'
              )}
            </button>
            <button
              onClick={copyMarkdown}
              className="glass py-3 px-6 rounded-lg font-semibold transition-colors hover:bg-white/20 dark:hover:bg-gray-700/40"
            >
              复制 Markdown
            </button>
            <button
              onClick={copyPlainText}
              className="glass py-3 px-6 rounded-lg font-semibold transition-colors hover:bg-white/20 dark:hover:bg-gray-700/40"
            >
              复制纯文本
            </button>
            <button
              onClick={downloadMarkdown}
              className="glass py-3 px-6 rounded-lg font-semibold transition-colors hover:bg-white/20 dark:hover:bg-gray-700/40"
            >
              下载 .md
            </button>
            <button
              onClick={handleViewCompare}
              className="glass py-3 px-6 rounded-lg font-semibold transition-colors hover:bg-white/20 dark:hover:bg-gray-700/40"
            >
              查看对比
            </button>
          </div>
          
          {saveError && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg shadow-md">
              {saveError}
            </div>
          )}
          
          {/* 编辑和预览区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：Markdown编辑器 */}
            <div className="glass rounded-xl overflow-hidden card-hover">
              <div className="p-4 bg-gray-100 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">Markdown 编辑器</h3>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-[600px] p-6 border-none focus:outline-none resize-none bg-white/80 dark:bg-gray-800/80"
                placeholder="请编辑你的简历..."
              />
            </div>
            
            {/* 右侧：实时预览 */}
            <div className="glass rounded-xl overflow-hidden card-hover">
              <div className="p-4 bg-gray-100 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium text-gray-800 dark:text-gray-200">实时预览</h3>
              </div>
              <div className="p-6 h-[600px] overflow-auto bg-white/80 dark:bg-gray-800/80">
                <MarkdownPreview markdown={markdown} />
              </div>
            </div>
          </div>
          
          {/* 版本历史 */}
          {versions.length > 0 && (
            <div className="mt-8 glass p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">版本历史</h3>
              <div className="space-y-3">
                {versions.map((version) => (
                  <div key={version.version_id} className="glass p-4 rounded-lg hover:bg-white/20 dark:hover:bg-gray-700/40 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{version.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(version.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
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

// 简单的Markdown预览组件
function MarkdownPreview({ markdown }: { markdown: string }) {
  const renderMarkdown = (text: string) => {
    // 简单的Markdown渲染
    return text
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<h[1-6]>)(?!<ul>)(.*$)/gm, '<p>$1</p>');
  };
  
  return (
    <div 
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}