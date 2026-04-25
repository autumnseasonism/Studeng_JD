'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AnalysisResult {
  has_jd: boolean;
  jd_analysis: any;
  diagnosis_report: any;
  module_audit: any;
  optimized_resume: {
    markdown: string;
  };
  version_compare: any;
}

interface Suggestion {
  module: string;
  original: string;
  problem: string;
  impact: string;
  direction: string;
  example: string;
  missing: string;
  priority: string;
}

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task_id');
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  
  // 模拟数据
  const mockResult: AnalysisResult = {
    has_jd: true,
    jd_analysis: {
      job_title: '产品运营实习生',
      key_skills: ['用户运营', '内容运营', '数据分析', 'Excel'],
      requirements: ['本科及以上学历', '熟悉互联网产品', '具备良好的沟通能力']
    },
    diagnosis_report: {
      score: 75,
      level: '良好',
      priority_items: [
        '实习经历描述不够具体，缺乏量化成果',
        '技能部分过于简单，未突出核心技能',
        '个人总结缺乏针对性，未体现与岗位的匹配度'
      ],
      match_score: 80
    },
    module_audit: {
      education: {
        suggestions: [
          {
            module: '教育背景',
            original: '2020.09-2024.06 北京大学 市场营销 本科',
            problem: '缺少GPA和相关课程',
            impact: '无法体现学习能力和专业基础',
            direction: '添加GPA（如果较高）和相关核心课程',
            example: '2020.09-2024.06 北京大学 市场营销 本科\nGPA：3.8/4.0\n核心课程：市场营销原理、消费者行为学、市场调研',
            missing: 'GPA和核心课程',
            priority: '中'
          }
        ]
      },
      internship: {
        suggestions: [
          {
            module: '实习经历',
            original: '2023.07-2023.09 某互联网公司 运营实习生\n负责内容运营和用户运营',
            problem: '描述过于笼统，缺乏具体工作内容和成果',
            impact: '无法体现实际工作能力和贡献',
            direction: '使用STAR法则，添加具体任务、行动和成果，量化数据',
            example: '2023.07-2023.09 某互联网公司 运营实习生\n- 负责公众号内容策划和编辑，月均产出12篇文章，阅读量提升30%\n- 运营用户社群，通过活动策划，活跃用户增长25%\n- 分析用户行为数据，提出3条优化建议，被采纳2条',
            missing: '具体工作内容和量化成果',
            priority: '高'
          }
        ]
      },
      project: {
        suggestions: [
          {
            module: '项目经历',
            original: '2022.09-2022.12 校园营销项目 负责人',
            problem: '缺乏项目目标、实施过程和成果',
            impact: '无法体现项目管理能力和创新思维',
            direction: '详细描述项目背景、目标、团队角色、实施过程和最终成果',
            example: '2022.09-2022.12 校园营销项目 负责人\n- 项目背景：为某品牌策划校园推广活动\n- 团队角色：带领5人团队，负责整体策划和执行\n- 实施过程：策划线上线下活动，协调资源，执行推广计划\n- 成果：活动覆盖3000+学生，品牌知名度提升40%，销售额增长20%',
            missing: '项目详情和成果',
            priority: '高'
          }
        ]
      },
      skills: {
        suggestions: [
          {
            module: '技能证书',
            original: '技能：Office、Photoshop',
            problem: '技能描述过于简单，未分级和突出核心技能',
            impact: '无法体现技能熟练程度和与岗位的相关性',
            direction: '按类别分类技能，标注熟练程度，突出与岗位相关的技能',
            example: '**专业技能**：Excel（精通，掌握VLOOKUP、数据透视表）、Photoshop（熟练）\n**软技能**：沟通能力、团队协作、项目管理\n**其他**：英语（CET-6）',
            missing: '技能分级和相关性',
            priority: '中'
          }
        ]
      }
    },
    optimized_resume: {
      markdown: `# 优化后的简历\n\n## 基本信息\n姓名：张三\n电话：138****1234\n邮箱：zhangsan@example.com\n\n## 教育背景\n2020.09-2024.06 北京大学 市场营销 本科\nGPA：3.8/4.0\n核心课程：市场营销原理、消费者行为学、市场调研\n\n## 实习经历\n2023.07-2023.09 某互联网公司 运营实习生\n- 负责公众号内容策划和编辑，月均产出12篇文章，阅读量提升30%\n- 运营用户社群，通过活动策划，活跃用户增长25%\n- 分析用户行为数据，提出3条优化建议，被采纳2条\n\n## 项目经历\n2022.09-2022.12 校园营销项目 负责人\n- 项目背景：为某品牌策划校园推广活动\n- 团队角色：带领5人团队，负责整体策划和执行\n- 实施过程：策划线上线下活动，协调资源，执行推广计划\n- 成果：活动覆盖3000+学生，品牌知名度提升40%，销售额增长20%\n\n## 技能证书\n**专业技能**：Excel（精通，掌握VLOOKUP、数据透视表）、Photoshop（熟练）\n**软技能**：沟通能力、团队协作、项目管理\n**其他**：英语（CET-6）\n\n## 个人总结\n具备扎实的市场营销专业知识和实习经验，擅长内容运营和用户运营。具有良好的沟通能力和团队协作精神，能够快速适应新环境并学习新技能。希望通过实习机会，将理论知识与实践相结合，为公司创造价值。`
    },
    version_compare: {
      changes: [
        {
          section: '实习经历',
          original: '负责内容运营和用户运营',
          optimized: '负责公众号内容策划和编辑，月均产出12篇文章，阅读量提升30%',
          reason: '添加具体工作内容和量化成果，更能体现实际工作能力'
        }
      ]
    }
  };
  
  useEffect(() => {
    if (!taskId) {
      router.push('/');
      return;
    }
    
    // 模拟获取分析结果
    // 实际项目中应该调用API获取真实数据
    setTimeout(() => {
      setResult(mockResult);
    }, 500);
  }, [taskId, router]);
  
  const handleViewOptimized = () => {
    if (result) {
      router.push('/editor?markdown=' + encodeURIComponent(result.optimized_resume.markdown));
    }
  };
  
  const handleViewCompare = () => {
    router.push('/compare?task_id=' + taskId);
  };
  
  const handleFollowup = () => {
    // 打开追问面板
    console.log('打开追问面板');
  };
  
  if (!taskId) {
    return <div className="min-h-screen flex items-center justify-center">缺少任务ID</div>;
  }
  
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>加载分析结果中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen gradient-bg">
      {/* 头部 */}
      <header className="glass sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">大学生求职陪跑助手</h1>
          <div className="flex items-center gap-6">
            <button 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              onClick={() => router.push('/')}
            >
              返回上传页
            </button>
            <button 
              className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
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
          {/* 报告头部 */}
          <div className="glass p-6 rounded-xl mb-8 card-hover">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">简历分析报告</h2>
                <p className="text-gray-600 dark:text-gray-300">创建时间：{new Date().toLocaleString()}</p>
              </div>
              {result.has_jd && (
                <div className="mt-4 md:mt-0 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
                  基于岗位描述分析
                </div>
              )}
            </div>
            
            {/* 顶部摘要区 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="glass p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">整体竞争力评分</h3>
                <div className="text-4xl font-bold text-blue-600 mb-1">{result.diagnosis_report.score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{result.diagnosis_report.level}</div>
              </div>
              {result.has_jd && (
                <div className="glass p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">岗位匹配度</h3>
                  <div className="text-4xl font-bold text-green-600 mb-1">{result.diagnosis_report.match_score}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">与目标岗位的匹配程度</div>
                </div>
              )}
              <div className="glass p-5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">优先修改项</h3>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {result.diagnosis_report.priority_items.map((item: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-amber-500">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* 模块审计区 */}
          <div className="space-y-8">
            {Object.entries(result.module_audit).map(([module, data]) => {
              const moduleNameMap: Record<string, string> = {
                education: '教育背景',
                internship: '实习经历',
                project: '项目经历',
                skills: '技能证书'
              };
              
              const moduleName = moduleNameMap[module] || module;
              const suggestions = (data as any).suggestions || [];
              
              if (suggestions.length === 0) return null;
              
              return (
                <div key={module} className="glass p-6 rounded-xl card-hover">
                  <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-200">{moduleName}</h3>
                  <div className="space-y-6">
                    {suggestions.map((suggestion: Suggestion, index: number) => (
                      <div 
                        key={index} 
                        className="glass rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                      >
                        <div 
                          className="p-4 cursor-pointer flex justify-between items-center transition-colors hover:bg-white/20 dark:hover:bg-gray-800/40"
                          onClick={() => setExpandedSuggestion(expandedSuggestion === `${module}-${index}` ? null : `${module}-${index}`)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${suggestion.priority === '高' ? 'bg-red-100 text-red-800' : suggestion.priority === '中' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                              {suggestion.priority}
                            </span>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{suggestion.problem}</span>
                          </div>
                          <span className={`transition-transform duration-300 ${expandedSuggestion === `${module}-${index}` ? 'transform rotate-180' : ''}`}>
                            ▼
                          </span>
                        </div>
                        {expandedSuggestion === `${module}-${index}` && (
                          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">原始片段</h4>
                                <div className="glass p-4 rounded-lg text-sm bg-gray-50 dark:bg-gray-800/60">{suggestion.original}</div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">问题影响</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.impact}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">修改方向</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.direction}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">示例改写</h4>
                                <div className="glass p-4 rounded-lg text-sm bg-blue-50 dark:bg-blue-900/30">{suggestion.example}</div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">待补充信息</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion.missing}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 右侧操作区 */}
          <div className="fixed right-6 bottom-6 flex flex-col gap-3 z-40">
            <button
              onClick={handleViewOptimized}
              className="gradient-btn py-4 px-8 rounded-lg font-semibold text-lg shadow-lg flex items-center justify-center gap-2"
            >
              <span>查看优化简历</span>
            </button>
            <button
              onClick={handleViewCompare}
              className="glass py-4 px-8 rounded-lg font-semibold text-lg shadow-lg transition-colors hover:bg-white/20 dark:hover:bg-gray-700/40 flex items-center justify-center gap-2"
            >
              <span>查看版本对比</span>
            </button>
            <button
              onClick={handleFollowup}
              className="glass py-4 px-8 rounded-lg font-semibold text-lg shadow-lg transition-colors hover:bg-white/20 dark:hover:bg-gray-700/40 flex items-center justify-center gap-2"
            >
              <span>继续追问</span>
            </button>
          </div>
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