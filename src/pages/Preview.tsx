import React from 'react';
import { Heart, Calendar, Camera, MessageCircle, Gift, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

// 模拟数据
const mockCoupleData = {
  partner1: {
    name: '小明',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20boy%20avatar%20with%20warm%20smile%20round%20face%20brown%20hair&image_size=square'
  },
  partner2: {
    name: '小红',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20girl%20avatar%20with%20sweet%20smile%20round%20face%20long%20hair&image_size=square'
  },
  startDate: '2023-02-14',
  relationshipStatus: '恋爱中'
};

const mockTodayMemory = {
  title: '第一次约会纪念日',
  description: '还记得我们第一次在咖啡厅相遇的美好时光',
  date: '2024-02-14',
  daysAgo: 365
};

/**
 * 预览页面组件 - 展示首页功能模块（无需登录）
 */
const Preview: React.FC = () => {
  // 计算在一起的天数
  const calculateDaysTogether = () => {
    const startDate = new Date(mockCoupleData.startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysTogether = calculateDaysTogether();

  // 快速导航数据
  const quickNavItems = [
    {
      title: '纪念日',
      description: '记录重要时刻',
      icon: Calendar,
      color: 'from-pink-400 to-rose-400',
      path: '/preview/anniversaries',
      isPreview: true
    },
    {
      title: '照片相册',
      description: '珍藏美好回忆',
      icon: Camera,
      color: 'from-purple-400 to-indigo-400',
      path: '/photos'
    },
    {
      title: '聊天互动',
      description: '甜蜜对话记录',
      icon: MessageCircle,
      color: 'from-blue-400 to-cyan-400',
      path: '/chat'
    },
    {
      title: '愿望清单',
      description: '共同的小目标',
      icon: Gift,
      color: 'from-green-400 to-emerald-400',
      path: '/wishlist'
    },
    {
      title: '设置',
      description: '个性化配置',
      icon: Settings,
      color: 'from-gray-400 to-slate-400',
      path: '/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      {/* 预览提示横幅 */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          🎉 这是功能预览页面 - 展示首页模块效果（使用模拟数据）
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 情侣档案展示区域 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="text-center">
            {/* 头像区域 */}
            <div className="flex justify-center items-center space-x-8 mb-6">
              <div className="relative">
                <img
                  src={mockCoupleData.partner1.avatar}
                  alt={mockCoupleData.partner1.name}
                  className="w-20 h-20 rounded-full border-4 border-pink-200 shadow-lg"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {mockCoupleData.partner1.name}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <Heart className="w-8 h-8 text-red-500 fill-current animate-pulse" />
                <span className="text-sm text-gray-600 mt-1">{mockCoupleData.relationshipStatus}</span>
              </div>
              
              <div className="relative">
                <img
                  src={mockCoupleData.partner2.avatar}
                  alt={mockCoupleData.partner2.name}
                  className="w-20 h-20 rounded-full border-4 border-purple-200 shadow-lg"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {mockCoupleData.partner2.name}
                  </span>
                </div>
              </div>
            </div>
            
            {/* 在一起天数 */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">我们在一起</h2>
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                {daysTogether}
              </div>
              <p className="text-gray-600">天了 ❤️</p>
              <p className="text-sm text-gray-500 mt-2">
                从 {new Date(mockCoupleData.startDate).toLocaleDateString('zh-CN')} 开始
              </p>
            </div>
          </div>
        </div>

        {/* 今日纪念 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-6 h-6 text-pink-500" />
            <h3 className="text-lg font-semibold text-gray-800">今日纪念</h3>
          </div>
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-800 mb-2">{mockTodayMemory.title}</h4>
            <p className="text-gray-600 text-sm mb-2">{mockTodayMemory.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{mockTodayMemory.date}</span>
              <span>{mockTodayMemory.daysAgo} 天前</span>
            </div>
          </div>
        </div>

        {/* 快速导航 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">功能导航</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {quickNavItems.map((item, index) => {
              const IconComponent = item.icon;
              const CardContent = (
                <div className={`bg-gradient-to-br ${item.color} rounded-2xl p-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                  <div className="text-center">
                    <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">{item.title}</h4>
                    <p className="text-white/80 text-xs leading-tight">{item.description}</p>
                    {item.isPreview && (
                      <span className="inline-block mt-1 text-xs bg-white/20 text-white px-2 py-1 rounded-full">
                        可预览
                      </span>
                    )}
                  </div>
                </div>
              );
              
              return (
                <div key={index} className="group transform transition-all duration-300 hover:scale-105">
                  {item.isPreview ? (
                    <Link to={item.path} className="block cursor-pointer">
                      {CardContent}
                    </Link>
                  ) : (
                    <div className="cursor-pointer opacity-60">
                      {CardContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-8 p-4 bg-white/60 rounded-xl">
          <p className="text-gray-600 text-sm">
            💡 这是首页功能模块的预览效果，实际使用时会显示真实的用户数据
          </p>
          <p className="text-gray-500 text-xs mt-2">
            访问 <span className="font-mono bg-gray-100 px-2 py-1 rounded">/login</span> 进行登录体验完整功能
          </p>
        </div>
      </div>
    </div>
  );
};

export default Preview;