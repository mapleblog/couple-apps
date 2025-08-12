import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCouple } from '../contexts/CoupleContext';
import { anniversaryService } from '../services/anniversaryService';
import { Anniversary, AnniversaryFormData } from '../types';
import AnniversaryForm from '../components/AnniversaryForm';
import AnniversaryCard from '../components/AnniversaryCard';

const AnniversaryPage: React.FC = () => {
  const { user } = useAuth();
  const { couple } = useCouple();
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'created' | 'type'>('date');

  // 表单状态
  const [formData, setFormData] = useState<AnniversaryFormData>({
    title: '',
    date: '',
    description: '',
    type: 'custom',
    isRecurring: false,
    reminderDays: 7
  });

  // 加载纪念日数据
  const loadAnniversaries = async () => {
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
  }, [couple?.id]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-pink-500 mr-2 animate-pulse" />
            <h1 className="text-3xl font-bold text-gray-800">纪念日管理</h1>
            <Heart className="h-8 w-8 text-pink-500 ml-2 animate-pulse" />
          </div>
          <p className="text-gray-600">记录我们的美好时光</p>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
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
      </div>
    </div>
  );
};

export default AnniversaryPage;