import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Star, Target, Calendar, Gift, Home, ArrowLeft, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCouple } from '../contexts/CoupleContext';
import { wishlistService } from '../services/wishlistService';
import { WishItem, WishFormData, WishlistFilter, WishlistSort } from '../types';
import WishForm from '../components/WishForm';
import WishCard from '../components/WishCard';

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { couple } = useCouple();
  const navigate = useNavigate();
  const [wishes, setWishes] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWish, setEditingWish] = useState<WishItem | null>(null);
  const [filter, setFilter] = useState<WishlistFilter>({});
  const [sortBy, setSortBy] = useState<string>('priority');
  const [searchTerm, setSearchTerm] = useState('');

  // 表单状态
  const [formData, setFormData] = useState<WishFormData>({
    title: '',
    description: '',
    category: 'gift',
    priority: 'medium',
    targetDate: '',
    estimatedCost: 0,
    currency: 'CNY',
    tags: [],
    isShared: true,
    assignedTo: '',
    notes: ''
  });

  // 加载愿望清单数据
  const loadWishes = async () => {
    console.log('🔍 开始加载愿望清单数据');
    console.log('👫 Couple状态:', couple);
    console.log('👤 用户状态:', user);
    
    if (!couple?.id) {
      console.error('❌ Couple ID不存在:', couple);
      setError('未找到情侣信息，请先完成配对');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('📡 正在调用wishlistService.getWishes，coupleId:', couple.id);
      const data = await wishlistService.getWishes(couple.id);
      console.log('✅ 成功获取愿望清单数据:', data);
      setWishes(data);
    } catch (err) {
      console.error('❌ 获取愿望清单失败:', err);
      console.error('错误详情:', {
        message: err instanceof Error ? err.message : '未知错误',
        stack: err instanceof Error ? err.stack : undefined,
        coupleId: couple?.id,
        userUid: user?.uid
      });
      setError(err instanceof Error ? err.message : '加载愿望清单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();
  }, [couple?.id]);

  // 处理表单提交
  const handleSubmit = async (data: WishFormData) => {
    if (!couple?.id || !user?.uid) return;

    try {
      setError(null);
      
      if (editingWish) {
        await wishlistService.updateWish(editingWish.id, data);
      } else {
        await wishlistService.addWish(couple.id, user.uid, data);
      }
      
      await loadWishes();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  // 切换愿望完成状态
  const handleToggleComplete = async (wishId: string) => {
    if (!user?.uid) return;
    
    try {
      setError(null);
      await wishlistService.toggleWishComplete(wishId, user.uid);
      await loadWishes();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  // 删除愿望
  const handleDelete = async (wishId: string) => {
    if (!confirm('确定要删除这个愿望吗？')) return;
    
    try {
      setError(null);
      await wishlistService.deleteWish(wishId);
      await loadWishes();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  // 编辑愿望
  const handleEdit = (wish: WishItem) => {
    setEditingWish(wish);
    setFormData({
      title: wish.title,
      description: wish.description || '',
      category: wish.category,
      priority: wish.priority,
      targetDate: wish.targetDate ? wishlistService.formatDate(wish.targetDate.toDate()) : '',
      estimatedCost: wish.estimatedCost || 0,
      currency: wish.currency || 'CNY',
      tags: wish.tags || [],
      isShared: wish.isShared,
      assignedTo: wish.assignedTo || '',
      notes: wish.notes || ''
    });
    setShowAddForm(true);
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'gift',
      priority: 'medium',
      targetDate: '',
      estimatedCost: 0,
      currency: 'CNY',
      tags: [],
      isShared: true,
      assignedTo: '',
      notes: ''
    });
    setEditingWish(null);
    setShowAddForm(false);
  };

  // 过滤和排序愿望
  const getFilteredAndSortedWishes = () => {
    let filtered = wishlistService.filterWishes(wishes, filter);
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(wish => 
        wish.title.toLowerCase().includes(term) ||
        wish.description?.toLowerCase().includes(term) ||
        wish.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    // 创建排序对象
    const sortConfig: WishlistSort = {
      field: sortBy as WishlistSort['field'],
      direction: 'desc'
    };
    
    return wishlistService.sortWishes(filtered, sortConfig);
  };

  // 获取统计信息
  const getStats = () => {
    return wishlistService.getWishlistStats(wishes);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载愿望清单中...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredWishes = getFilteredAndSortedWishes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-200 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-300/30 to-blue-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          {/* 返回按钮 */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 bg-white/70 hover:bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-white/20"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">返回主页</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-6 py-3 bg-white/80 hover:bg-white backdrop-blur-sm text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
            >
              <Home className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">主页</span>
            </button>
          </div>
          
          {/* 标题区域 */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Gift className="h-10 w-10 text-pink-500 mr-3 animate-bounce" />
                <div className="absolute inset-0 h-10 w-10 bg-pink-500/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">愿望清单</h1>
              <div className="relative">
                <Gift className="h-10 w-10 text-pink-500 ml-3 animate-bounce" style={{animationDelay: '0.5s'}} />
                <div className="absolute inset-0 h-10 w-10 bg-pink-500/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>
            </div>
            <p className="text-gray-700 text-lg font-medium">记录我们的美好愿望 ✨</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-4 lg:p-6 text-center transition-all duration-300 hover:scale-105 border border-white/20 group">
            <div className="relative">
              <div className="text-2xl lg:text-3xl font-bold text-pink-500 mb-2 group-hover:scale-110 transition-transform">{stats.total}</div>
              <div className="absolute inset-0 bg-pink-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="text-xs lg:text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
              <Gift className="h-3 w-3 lg:h-4 lg:w-4" />
              总愿望
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-4 lg:p-6 text-center transition-all duration-300 hover:scale-105 border border-white/20 group">
            <div className="relative">
              <div className="text-2xl lg:text-3xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform">{stats.completed}</div>
              <div className="absolute inset-0 bg-green-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="text-xs lg:text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
              <Check className="h-3 w-3 lg:h-4 lg:w-4" />
              已完成
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-4 lg:p-6 text-center transition-all duration-300 hover:scale-105 border border-white/20 group">
            <div className="relative">
              <div className="text-2xl lg:text-3xl font-bold text-orange-500 mb-2 group-hover:scale-110 transition-transform">{stats.pending}</div>
              <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="text-xs lg:text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3 lg:h-4 lg:w-4" />
              进行中
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl p-4 lg:p-6 text-center transition-all duration-300 hover:scale-105 border border-white/20 group">
            <div className="relative">
              <div className="text-2xl lg:text-3xl font-bold text-red-500 mb-2 group-hover:scale-110 transition-transform">{stats.highPriority}</div>
              <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div className="text-xs lg:text-sm text-gray-600 font-medium flex items-center justify-center gap-1">
              <Star className="h-3 w-3 lg:h-4 lg:w-4" />
              高优先级
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-lg border-l-4 border-l-red-500">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* 操作栏 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-6 mb-6 lg:mb-8 border border-white/20">
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0 lg:gap-6">
            {/* 添加按钮 */}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-6 py-3 lg:px-8 lg:py-3 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 shadow-lg hover:shadow-xl hover:scale-105 font-medium group"
            >
              <Plus className="h-4 w-4 lg:h-5 lg:w-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm lg:text-base">添加愿望</span>
              <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* 搜索框 */}
            <div className="relative flex items-center gap-3 flex-1 lg:max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索愿望..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 lg:pl-12 pr-3 lg:pr-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md text-sm lg:text-base"
                />
              </div>
            </div>

            {/* 过滤和排序 */}
            <div className="grid grid-cols-2 lg:flex gap-2 lg:gap-3">
              <div className="relative">
                <Filter className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                <select
                  value={filter.status?.[0] || 'all'}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    status: e.target.value === 'all' ? undefined : [e.target.value as WishItem['status']]
                  }))}
                  className="pl-8 lg:pl-10 pr-3 lg:pr-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer text-xs lg:text-sm w-full"
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待处理</option>
                  <option value="in-progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>

              <div className="relative">
                <Target className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                <select
                  value={filter.priority?.[0] || 'all'}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    priority: e.target.value === 'all' ? undefined : [e.target.value as WishItem['priority']]
                  }))}
                  className="pl-8 lg:pl-10 pr-3 lg:pr-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer text-xs lg:text-sm w-full"
                >
                  <option value="all">全部优先级</option>
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                <select
                  value={filter.category?.[0] || 'all'}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    category: e.target.value === 'all' ? undefined : [e.target.value as WishItem['category']]
                  }))}
                  className="pl-8 lg:pl-10 pr-3 lg:pr-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer text-xs lg:text-sm w-full"
                >
                  <option value="all">全部分类</option>
                  <option value="travel">旅行</option>
                  <option value="experience">体验</option>
                  <option value="gift">礼物</option>
                  <option value="achievement">成就</option>
                  <option value="date">约会</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div className="relative">
                <Star className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 lg:h-4 lg:w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-8 lg:pl-10 pr-3 lg:pr-4 py-2.5 lg:py-3 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md appearance-none cursor-pointer text-xs lg:text-sm w-full"
                >
                  <option value="priority">按优先级</option>
                  <option value="createdAt">按创建时间</option>
                  <option value="targetDate">按目标日期</option>
                  <option value="estimatedCost">按预估费用</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 愿望列表 */}
        {filteredWishes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredWishes.map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 lg:py-16 px-4">
            <div className="relative mb-6 lg:mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-pink-200/50 to-purple-200/50 rounded-full blur-2xl"></div>
              </div>
              <Gift className="relative h-16 w-16 lg:h-20 lg:w-20 text-gray-300 mx-auto animate-bounce" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-gray-600 mb-3">
              {wishes.length === 0 ? '✨ 还没有愿望' : '🔍 没有符合条件的愿望'}
            </h3>
            <p className="text-gray-500 mb-6 lg:mb-8 text-base lg:text-lg px-4">
              {wishes.length === 0 ? '开始记录你们的美好愿望吧！' : '尝试调整筛选条件'}
            </p>
            {wishes.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-6 py-3 lg:px-8 lg:py-4 rounded-2xl hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 font-medium text-base lg:text-lg group"
              >
                <span className="flex items-center gap-2 lg:gap-3">
                  <Plus className="h-5 w-5 lg:h-6 lg:w-6 group-hover:rotate-90 transition-transform duration-300" />
                  添加第一个愿望
                </span>
              </button>
            )}
          </div>
        )}

        {/* 添加/编辑表单模态框 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <WishForm
                isOpen={showAddForm}
                onClose={resetForm}
                onSubmit={handleSubmit}
                wish={editingWish}
                isLoading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;