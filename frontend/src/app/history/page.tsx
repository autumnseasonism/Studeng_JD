'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LocalHistoryRecord {
  local_id: string;
  title: string;
  created_at: string;
  resume_text: string;
  job_target: string;
  job_description: string;
  job_type: string;
  analysis_result: any;
  resume_versions: any[];
  followup_messages: any[];
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<LocalHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 从IndexedDB加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = async () => {
    try {
      const db = await openIndexedDB();
      const transaction = db.transaction('history_records', 'readonly');
      const store = transaction.objectStore('history_records');
      const allRecords = await store.getAll();
      setHistory(allRecords);
    } catch (error) {
      console.error('加载历史失败:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const openIndexedDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('resume_coach', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('history_records')) {
          db.createObjectStore('history_records', { keyPath: 'local_id' });
        }
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
  
  const deleteRecord = async (localId: string) => {
    if (confirm('确定要删除这条历史记录吗？')) {
      try {
        const db = await openIndexedDB();
        const transaction = db.transaction('history_records', 'readwrite');
        const store = transaction.objectStore('history_records');
        await store.delete(localId);
        setHistory(history.filter(record => record.local_id !== localId));
      } catch (error) {
        console.error('删除记录失败:', error);
      }
    }
  };
  
  const clearAll = async () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      try {
        const db = await openIndexedDB();
        const transaction = db.transaction('history_records', 'readwrite');
        const store = transaction.objectStore('history_records');
        await store.clear();
        setHistory([]);
      } catch (error) {
        console.error('清空历史失败:', error);
      }
    }
  };
  
  const openRecord = (record: LocalHistoryRecord) => {
    // 打开报告页面，传入分析结果
    // 实际项目中应该将分析结果存储在URL或本地存储中
    router.push('/report?task_id=history_' + record.local_id);
  };
  
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
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto fade-in">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-green-600">本地历史</h2>
            {history.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
              >
                清空全部
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-2 border-white border-t-orange-500 rounded-full mx-auto mb-4 loading-spinner"></div>
              <p>加载历史记录中...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="glass p-8 rounded-xl text-center card-hover">
              <p className="text-gray-600 dark:text-gray-300">暂无历史分析，完成一次分析后会自动保存在本地</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 gradient-btn py-2 px-4 rounded-lg font-semibold"
              >
                开始分析
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.local_id} className="glass rounded-xl overflow-hidden card-hover">
                  <div className="p-4 hover:bg-white/20 dark:hover:bg-gray-800/60 transition-colors cursor-pointer" onClick={() => openRecord(record)}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{record.title || '未命名分析'}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecord(record.local_id);
                        }}
                        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="font-medium">创建时间：</span>
                        {new Date(record.created_at).toLocaleString()}
                      </div>
                      {record.job_target && (
                        <div>
                          <span className="font-medium">目标岗位：</span>
                          {record.job_target}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">求职类型：</span>
                        {record.job_type}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {record.job_description ? '包含岗位描述' : '未包含岗位描述'}
                      {' · '}
                      {record.resume_versions?.length || 0} 个版本
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}