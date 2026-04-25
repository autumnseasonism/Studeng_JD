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
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">大学生求职陪跑助手</h1>
          <div className="flex items-center gap-4">
            <button 
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={handleGoBack}
            >
              返回报告
            </button>
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
        <div className="max-w-7xl mx-auto">
          {/* 工具栏 */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">版本名称</label>
              <input
                type="text"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="输入版本名称"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={saveVersion}
              disabled={isSaving}
              className="bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? '保存中...' : '保存本地版本'}
            </button>
            <button
              onClick={copyMarkdown}
              className="bg-white text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              复制 Markdown
            </button>
            <button
              onClick={copyPlainText}
              className="bg-white text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              复制纯文本
            </button>
            <button
              onClick={downloadMarkdown}
              className="bg-white text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              下载 .md
            </button>
            <button
              onClick={handleViewCompare}
              className="bg-white text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors border border-gray-200"
            >
              查看对比
            </button>
          </div>
          
          {saveError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {saveError}
            </div>
          )}
          
          {/* 编辑和预览区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 左侧：Markdown编辑器 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-2 bg-gray-100 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">Markdown 编辑器</h3>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-[600px] p-4 border-none focus:outline-none resize-none"
                placeholder="请编辑你的简历..."
              />
            </div>
            
            {/* 右侧：实时预览 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-2 bg-gray-100 border-b border-gray-200">
                <h3 className="font-medium text-gray-700">实时预览</h3>
              </div>
              <div className="p-4 h-[600px] overflow-auto">
                <MarkdownPreview markdown={markdown} />
              </div>
            </div>
          </div>
          
          {/* 版本历史 */}
          {versions.length > 0 && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-700 mb-3">版本历史</h3>
              <div className="space-y-2">
                {versions.map((version) => (
                  <div key={version.version_id} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{version.name}</span>
                      <span className="text-xs text-gray-500">{new Date(version.updated_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
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