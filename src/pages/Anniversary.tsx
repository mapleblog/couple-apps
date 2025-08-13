import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Heart, AlertTriangle, Home, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCouple } from '../contexts/CoupleContext';
import { anniversaryService } from '../services/anniversaryService';
import { Anniversary, AnniversaryFormData } from '../types';
import AnniversaryForm from '../components/AnniversaryForm';
import AnniversaryCard from '../components/AnniversaryCard';
import FirebaseDiagnostic from '../components/FirebaseDiagnostic';

const AnniversaryPage: React.FC = () => {
  const { user } = useAuth();
  const { couple } = useCouple();
  const navigate = useNavigate();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'created' | 'type'>('date');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [setupStatus, setSetupStatus] = useState<{
    hasUser: boolean;
    hasCouple: boolean;
    isReady: boolean;
  }>({ hasUser: false, hasCouple: false, isReady: false });

  // 表单状态
  const [formData, setFormData] = useState<AnniversaryFormData>({
    title: '',
    date: '',
    description: '',
    type: 'custom',
    isRecurring: false,
    reminderDays: 7
  });

  // 检查设置状态
  const checkSetupStatus = () => {
    const hasUser = !!user;
    const hasCouple = !!couple?.id;
    const isReady = hasUser && hasCouple;
    
    setSetupStatus({ hasUser, hasCouple, isReady });
    return isReady;
  };

  // 加载纪念日数据
  const loadAnniversaries = async () => {
    if (!checkSetupStatus()) {
      setLoading(false);
      return;
    }
    
    if (!couple?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await anniversaryService.getAnniversaries(couple.id);
      setAnniversaries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载纪念日失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnniversaries();
  }, [couple?.id, user]);

  useEffect(() => {
    checkSetupStatus();
  }, [user, couple]);

  // 处理表单提交
  const handleSubmit = async (data: AnniversaryFormData) => {
    if (!couple?.id || !user?.uid) return;

    try {
      setError(null);
      
      if (editingAnniversary) {
        await anniversaryService.updateAnniversary(editingAnniversary.id, data);
      } else {
        await anniversaryService.addAnniversary(couple.id, user.uid, data);
      }
      
      await loadAnniversaries();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  // 删除纪念日
  const handleDelete = async (anniversaryId: string) => {
    if (!confirm('确定要删除这个纪念日吗？')) return;
    
    try {
      setError(null);
      await anniversaryService.deleteAnniversary(anniversaryId);
      await loadAnniversaries();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 编辑纪念日
  const handleEdit = (anniversary: Anniversary) => {
    setEditingAnniversary(anniversary);
    setFormData({
      title: anniversary.title,
      date: anniversaryService.formatAnniversaryDate(anniversary),
      description: anniversary.description || '',
      type: anniversary.type,
      isRecurring: anniversary.isRecurring,
      reminderDays: anniversary.reminderDays || 7
    });
    setShowAddForm(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      description: '',
      type: 'custom',
      isRecurring: false,
      reminderDays: 7
    });
    setEditingAnniversary(null);
    setShowAddForm(false);
  };

  // 过滤和排序纪念日
  const getFilteredAndSortedAnniversaries = () => {
    let filtered = [...anniversaries];
    const now = new Date();

    // 过滤
    if (filterType === 'upcoming') {
      filtered = anniversaryService.getUpcomingAnniversaries(anniversaries, 365);
    } else if (filterType === 'past') {
      filtered = anniversaries.filter(anniversary => {
        if (anniversary.isRecurring) return false;
        return anniversary.date.toDate() < now;
      });
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          const dateA = a.isRecurring ? anniversaryService.getNextOccurrence(a) : a.date.toDate();
          const dateB = b.isRecurring ? anniversaryService.getNextOccurrence(b) : b.date.toDate();
          return dateA.getTime() - dateB.getTime();
        case 'created':
          return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  };

  // 设置步骤引导组件
  const SetupGuide = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Heart className="h-16 w-16 text-pink-500 mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">欢迎使用纪念日功能</h1>
            <p className="text-gray-600">在开始记录美好时光之前，让我们先完成一些必要的设置</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">设置步骤</h2>
            
            <div className="space-y-4">
              {/* 用户登录状态 */}
              <div className="flex items-center p-4 rounded-lg border-2 border-gray-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  setupStatus.hasUser ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {setupStatus.hasUser ? '✓' : '1'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">用户登录</h3>
                  <p className="text-sm text-gray-600">
                    {setupStatus.hasUser ? '已登录' : '请先登录您的账户'}
                  </p>
                </div>
                {setupStatus.hasUser && (
                  <div className="text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                )}
              </div>

              {/* 情侣档案创建 */}
              <div className="flex items-center p-4 rounded-lg border-2 border-gray-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                  setupStatus.hasCouple ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {setupStatus.hasCouple ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">创建情侣档案</h3>
                  <p className="text-sm text-gray-600">
                    {setupStatus.hasCouple ? '情侣档案已创建' : '需要创建或加入一个情侣档案'}
                  </p>
                </div>
                {setupStatus.hasCouple ? (
                  <div className="text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                ) : (
                  <button
                    onClick={() => window.location.href = '/profile'}
                    className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
                  >
                    前往设置
                  </button>
                )}
              </div>
            </div>

            {/* 诊断工具 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">遇到问题？</h3>
                  <p className="text-sm text-blue-700">使用诊断工具检查配置和权限</p>
                </div>
                <button
                  onClick={() => setShowDiagnostic(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  诊断问题
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载纪念日中...</p>
        </div>
      </div>
    );
  }

  // 如果设置未完成，显示设置引导
  if (!setupStatus.isReady) {
    return (
      <>
        <SetupGuide />
        {showDiagnostic && (
          <FirebaseDiagnostic onClose={() => setShowDiagnostic(false)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          {/* 返回按钮 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-all duration-200 group"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">返回主页</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">主页</span>
            </button>
          </div>
          
          {/* 标题区域 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-pink-500 mr-2 animate-pulse" />
              <h1 className="text-3xl font-bold text-gray-800">纪念日管理</h1>
              <Heart className="h-8 w-8 text-pink-500 ml-2 animate-pulse" />
            </div>
            <p className="text-gray-600">记录我们的美好时光</p>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span className="font-medium">纪念日功能遇到问题</span>
                </div>
                <button
                  onClick={() => setShowDiagnostic(true)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <AlertTriangle className="h-4 w-4" />
                  诊断问题
                </button>
              </div>
              
              <div className="text-sm">
                <p className="mb-2"><strong>错误详情：</strong>{error}</p>
                
                {/* 根据错误类型提供具体建议 */}
                {error.includes('权限不足') && (
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p className="font-medium mb-1">可能的解决方案：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>检查 Firebase 项目的 Firestore 安全规则配置</li>
                      <li>确保您已正确登录并属于一个情侣关系</li>
                      <li>联系管理员检查数据库权限设置</li>
                    </ul>
                  </div>
                )}
                
                {error.includes('索引缺失') && (
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p className="font-medium mb-1">需要创建数据库索引：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>为 anniversaries 集合创建复合索引 (coupleId, date)</li>
                      <li>索引创建可能需要几分钟时间</li>
                      <li>请参考项目根目录的 FIREBASE_SETUP.md 文件</li>
                    </ul>
                  </div>
                )}
                
                {error.includes('网络连接') && (
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p className="font-medium mb-1">网络连接问题：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>检查您的网络连接是否正常</li>
                      <li>确认 Firebase 服务状态</li>
                      <li>尝试刷新页面重新连接</li>
                    </ul>
                  </div>
                )}
                
                {error.includes('未认证') && (
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p className="font-medium mb-1">用户认证问题：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>请重新登录您的账户</li>
                      <li>检查登录状态是否过期</li>
                      <li>清除浏览器缓存后重试</li>
                    </ul>
                  </div>
                )}
                
                {!error.includes('权限不足') && !error.includes('索引缺失') && !error.includes('网络连接') && !error.includes('未认证') && (
                  <div className="bg-red-50 p-3 rounded border-l-4 border-red-400">
                    <p className="font-medium mb-1">通用解决方案：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>点击"诊断问题"按钮获取详细分析</li>
                      <li>检查浏览器控制台的详细错误信息</li>
                      <li>尝试刷新页面重新加载</li>
                      <li>如问题持续，请联系技术支持</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 操作栏 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* 添加按钮 */}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              添加纪念日
            </button>

            {/* 过滤和排序 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">全部</option>
                  <option value="upcoming">即将到来</option>
                  <option value="past">已过去</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="date">按日期排序</option>
                  <option value="created">按创建时间</option>
                  <option value="type">按类型排序</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 纪念日列表 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {getFilteredAndSortedAnniversaries().map((anniversary) => (
            <AnniversaryCard
              key={anniversary.id}
              anniversary={anniversary}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* 空状态 */}
        {getFilteredAndSortedAnniversaries().length === 0 && (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {filterType === 'all' ? '还没有纪念日' : '没有符合条件的纪念日'}
            </h3>
            <p className="text-gray-400 mb-6">
              {filterType === 'all' ? '开始记录你们的美好时光吧！' : '尝试调整筛选条件'}
            </p>
            {filterType === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
              >
                添加第一个纪念日
              </button>
            )}
          </div>
        )}

        {/* 添加/编辑表单模态框 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <AnniversaryForm
                isOpen={showAddForm}
                onClose={resetForm}
                onSubmit={handleSubmit}
                anniversary={editingAnniversary}
                isLoading={loading}
              />
            </div>
          </div>
        )}

        {/* Firebase诊断工具 */}
        {showDiagnostic && (
          <FirebaseDiagnostic onClose={() => setShowDiagnostic(false)} />
        )}
      </div>
    </div>
  );
};

export default AnniversaryPage;