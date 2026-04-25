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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">本地历史</h2>
            {history.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                清空全部
              </button>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>加载历史记录中...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">暂无历史分析，完成一次分析后会自动保存在本地</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                开始分析
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((record) => (
                <div key={record.local_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openRecord(record)}>
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{record.title || '未命名分析'}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecord(record.local_id);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
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
                    <div className="mt-2 text-sm text-gray-500">
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