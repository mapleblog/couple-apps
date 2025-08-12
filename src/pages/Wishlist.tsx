import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Star, Target, Calendar, Gift, Home, ArrowLeft } from 'lucide-react';
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
    if (!couple?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await wishlistService.getWishes(couple.id);
      setWishes(data);
    } catch (err) {
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
              <Gift className="h-8 w-8 text-pink-500 mr-2 animate-pulse" />
              <h1 className="text-3xl font-bold text-gray-800">愿望清单</h1>
              <Gift className="h-8 w-8 text-pink-500 ml-2 animate-pulse" />
            </div>
            <p className="text-gray-600">记录我们的美好愿望</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-pink-500">{stats.total}</div>
            <div className="text-sm text-gray-600">总愿望</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-sm text-gray-600">已完成</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
            <div className="text-sm text-gray-600">进行中</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.highPriority}</div>
            <div className="text-sm text-gray-600">高优先级</div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 操作栏 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* 添加按钮 */}
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5" />
              添加愿望
            </button>

            {/* 搜索框 */}
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="h-5 w-5 text-gray-500" />
              <input
                type="text"
                placeholder="搜索愿望..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* 过滤和排序 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filter.status?.[0] || 'all'}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    status: e.target.value === 'all' ? undefined : [e.target.value as WishItem['status']]
                  }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">全部状态</option>
                  <option value="pending">待处理</option>
                  <option value="in-progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-500" />
                <select
                  value={filter.priority?.[0] || 'all'}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    priority: e.target.value === 'all' ? undefined : [e.target.value as WishItem['priority']]
                  }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="all">全部优先级</option>
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={filter.category?.[0] || 'all'}
                  onChange={(e) => setFilter(prev => ({ 
                    ...prev, 
                    category: e.target.value === 'all' ? undefined : [e.target.value as WishItem['category']]
                  }))}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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

              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        {/* 空状态 */}
        {filteredWishes.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {wishes.length === 0 ? '还没有愿望' : '没有符合条件的愿望'}
            </h3>
            <p className="text-gray-400 mb-6">
              {wishes.length === 0 ? '开始记录你们的美好愿望吧！' : '尝试调整筛选条件'}
            </p>
            {wishes.length === 0 && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200"
              >
                添加第一个愿望
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