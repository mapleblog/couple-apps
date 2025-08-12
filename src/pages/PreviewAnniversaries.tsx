import React, { useState } from 'react';
import { Calendar, Heart, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Anniversary {
  id: string;
  title: string;
  date: string;
  description?: string;
  type: 'first_meet' | 'together' | 'engagement' | 'marriage' | 'custom';
}

const mockAnniversaries: Anniversary[] = [
  {
    id: '1',
    title: '第一次见面',
    date: '2023-01-15',
    description: '在咖啡厅的美好相遇',
    type: 'first_meet'
  },
  {
    id: '2',
    title: '在一起纪念日',
    date: '2023-02-14',
    description: '情人节表白成功',
    type: 'together'
  },
  {
    id: '3',
    title: '第一次旅行',
    date: '2023-05-20',
    description: '去海边的浪漫之旅',
    type: 'custom'
  },
  {
    id: '4',
    title: '订婚纪念日',
    date: '2023-12-25',
    description: '圣诞节的求婚',
    type: 'engagement'
  }
];

const typeLabels = {
  first_meet: '初次相遇',
  together: '在一起',
  engagement: '订婚',
  marriage: '结婚',
  custom: '自定义'
};

const typeColors = {
  first_meet: 'bg-pink-100 text-pink-800',
  together: 'bg-red-100 text-red-800',
  engagement: 'bg-purple-100 text-purple-800',
  marriage: 'bg-rose-100 text-rose-800',
  custom: 'bg-indigo-100 text-indigo-800'
};

const PreviewAnniversaries: React.FC = () => {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>(mockAnniversaries);
  const [showForm, setShowForm] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState<Anniversary | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    type: 'custom' as Anniversary['type']
  });

  const calculateDaysFromNow = (date: string): number => {
    const anniversaryDate = new Date(date);
    const today = new Date();
    const diffTime = today.getTime() - anniversaryDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnniversary) {
      setAnniversaries(prev => prev.map(ann => 
        ann.id === editingAnniversary.id 
          ? { ...ann, ...formData }
          : ann
      ));
      setEditingAnniversary(null);
    } else {
      const newAnniversary: Anniversary = {
        id: Date.now().toString(),
        ...formData
      };
      setAnniversaries(prev => [...prev, newAnniversary]);
    }
    setFormData({ title: '', date: '', description: '', type: 'custom' });
    setShowForm(false);
  };

  const handleEdit = (anniversary: Anniversary) => {
    setEditingAnniversary(anniversary);
    setFormData({
      title: anniversary.title,
      date: anniversary.date,
      description: anniversary.description || '',
      type: anniversary.type
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAnniversaries(prev => prev.filter(ann => ann.id !== id));
  };

  const sortedAnniversaries = [...anniversaries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* 预览提示横幅 */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span className="font-medium">纪念日管理模块预览</span>
          </div>
          <Link 
            to="/preview" 
            className="flex items-center space-x-1 hover:bg-white/20 px-3 py-1 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页预览</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center">
            <Calendar className="w-8 h-8 mr-3 text-pink-500" />
            纪念日管理
          </h1>
          <p className="text-gray-600">记录我们的美好时光</p>
        </div>

        {/* 添加按钮 */}
        <div className="mb-6">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingAnniversary(null);
              setFormData({ title: '', date: '', description: '', type: 'custom' });
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            <span>添加纪念日</span>
          </button>
        </div>

        {/* 添加/编辑表单 */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-pink-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              {editingAnniversary ? '编辑纪念日' : '添加新纪念日'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="输入纪念日标题"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Anniversary['type'] }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                >
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述（可选）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="添加一些美好的回忆描述"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
                >
                  {editingAnniversary ? '更新' : '添加'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAnniversary(null);
                    setFormData({ title: '', date: '', description: '', type: 'custom' });
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-xl font-medium hover:bg-gray-600 transition-all duration-300"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 纪念日列表 */}
        <div className="grid gap-6">
          {sortedAnniversaries.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">还没有添加任何纪念日</p>
              <p className="text-gray-400">点击上方按钮添加你们的第一个纪念日吧！</p>
            </div>
          ) : (
            sortedAnniversaries.map((anniversary) => {
              const daysFromNow = calculateDaysFromNow(anniversary.date);
              const isUpcoming = daysFromNow < 0;
              
              return (
                <div
                  key={anniversary.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-pink-100 group hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {anniversary.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[anniversary.type]}`}>
                          {typeLabels[anniversary.type]}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(anniversary.date).toLocaleDateString('zh-CN')}</span>
                      </div>
                      
                      {anniversary.description && (
                        <p className="text-gray-600 mb-3">{anniversary.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-sm text-gray-500">
                          {isUpcoming 
                            ? `还有 ${Math.abs(daysFromNow)} 天`
                            : `已过去 ${daysFromNow} 天`
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(anniversary)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(anniversary.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewAnniversaries;