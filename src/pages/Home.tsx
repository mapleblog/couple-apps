import React, { useState } from 'react';
import { Heart, Calendar, Camera, MessageCircle, Gift, Settings, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCouple } from '../contexts/CoupleContext';
import { useAuth } from '../contexts/AuthContext';
import QuickNavCard from '../components/QuickNavCard';
import TodayAnniversary from '../components/TodayAnniversary';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { couple, partner, loading, daysTogetherCount, todayAnniversaries, createCouple } = useCouple();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [relationshipStart, setRelationshipStart] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // 处理创建情侣档案
  const handleCreateCouple = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!relationshipStart || !anniversaryDate) return;

    try {
      setIsCreating(true);
      await createCouple(new Date(relationshipStart), new Date(anniversaryDate));
      setShowCreateForm(false);
      setRelationshipStart('');
      setAnniversaryDate('');
    } catch (error) {
      console.error('创建情侣档案失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // 快速导航数据
  const quickNavItems = [
    { id: 'memories', title: '纪念日', description: '记录重要时刻', icon: Calendar, path: '/anniversaries', color: 'from-pink-400 to-rose-400' },
    { id: 'photos', title: '照片相册', description: '珍藏美好回忆', icon: Camera, path: '/photos', color: 'from-purple-400 to-indigo-400' },
    { id: 'chat', title: '聊天互动', description: '甜蜜对话', icon: MessageCircle, path: '/chat', color: 'from-blue-400 to-cyan-400' },
    { id: 'wishlist', title: '愿望清单', description: '共同的梦想', icon: Gift, path: '/wishlist', color: 'from-emerald-400 to-teal-400' },
    { id: 'settings', title: '设置', description: '个人资料管理', icon: Settings, path: '/settings', color: 'from-gray-400 to-slate-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果没有情侣档案，显示创建表单
  if (!couple) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-md mx-auto mt-20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-16 h-16 text-pink-500 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">创建情侣档案</h1>
            <p className="text-gray-600">开始记录你们的美好时光</p>
          </div>

          {!showCreateForm ? (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">欢迎来到情侣网页</h2>
                <p className="text-gray-600 text-sm">创建你们的专属空间，记录每一个美好瞬间</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-6 rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-200 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                创建情侣档案
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">设置重要日期</h2>
              <form onSubmit={handleCreateCouple} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    恋爱开始日期
                  </label>
                  <input
                    type="date"
                    value={relationshipStart}
                    onChange={(e) => setRelationshipStart(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    纪念日日期
                  </label>
                  <input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
                  >
                    {isCreating ? '创建中...' : '创建档案'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部欢迎区域 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-2 animate-pulse" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              欢迎回来
            </h1>
            <Heart className="w-8 h-8 text-pink-500 ml-2 animate-pulse" />
          </div>
          <p className="text-gray-600">记录你们的美好时光</p>
        </div>

        {/* 情侣档案卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {/* 用户头像 */}
              <div className="flex items-center space-x-2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="我" className="w-14 h-14 rounded-full" />
                  ) : (
                    <span className="text-white font-bold text-lg">{user?.displayName?.[0] || 'U'}</span>
                  )}
                </div>
                <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  {partner?.photoURL ? (
                    <img src={partner.photoURL} alt="TA" className="w-14 h-14 rounded-full" />
                  ) : (
                    <span className="text-white font-bold text-lg">{partner?.displayName?.[0] || '?'}</span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-800">
                  {user?.displayName} & {partner?.displayName || '等待伴侣加入'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {couple.status === 'active' ? '已连接' : '等待连接'}
                </p>
              </div>
            </div>
            
            {/* 在一起天数 */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4">
                <p className="text-2xl font-bold text-gray-800">{daysTogetherCount}</p>
                <p className="text-sm text-gray-600">在一起的天数</p>
              </div>
            </div>
          </div>
        </div>

        {/* 今日纪念 */}
         <TodayAnniversary anniversaries={todayAnniversaries} />

        {/* 快速导航 */}
         <div className="mb-8">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">快速导航</h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {quickNavItems.map((item) => (
               <QuickNavCard
                 key={item.id}
                 id={item.id}
                 title={item.title}
                 description={item.description}
                 icon={item.icon}
                 path={item.path}
                 color={item.color}
                 onClick={(path) => {
                   navigate(path);
                 }}
               />
             ))}
           </div>
         </div>
      </div>
    </div>
  );
};

export default Home;