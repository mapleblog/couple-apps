import React from 'react';
import { Edit, Trash2, Check, Star, Calendar, DollarSign, Tag, User, Gift, Heart, Target, Zap } from 'lucide-react';
import { WishItem } from '../types';
import { wishlistService } from '../services/wishlistService';

interface WishCardProps {
  wish: WishItem;
  onEdit: (wish: WishItem) => void;
  onDelete: (wishId: string) => void;
  onToggleComplete: (wishId: string) => void;
  isDeleting?: boolean;
}

const WishCard: React.FC<WishCardProps> = ({
  wish,
  onEdit,
  onDelete,
  onToggleComplete,
  isDeleting = false
}) => {
  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gift':
        return Gift;
      case 'travel':
        return Target;
      case 'experience':
        return Heart;
      case 'item':
        return Star;
      case 'goal':
        return Zap;
      default:
        return Gift;
    }
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gift':
        return 'from-pink-400 to-rose-400';
      case 'travel':
        return 'from-blue-400 to-cyan-400';
      case 'experience':
        return 'from-purple-400 to-indigo-400';
      case 'item':
        return 'from-green-400 to-emerald-400';
      case 'goal':
        return 'from-yellow-400 to-orange-400';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  // 获取文本颜色
  const getTextColor = (category: string) => {
    switch (category) {
      case 'gift':
        return 'text-pink-600';
      case 'travel':
        return 'text-blue-600';
      case 'experience':
        return 'text-purple-600';
      case 'item':
        return 'text-green-600';
      case 'goal':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-50';
      case 'medium':
        return 'text-orange-500 bg-orange-50';
      case 'low':
        return 'text-green-500 bg-green-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  // 获取状态显示
  const getStatusDisplay = () => {
    if (wish.status === 'completed') {
      return {
        text: '已完成',
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      };
    }
    
    if (wish.targetDate) {
      const targetDate = wish.targetDate.toDate();
      const now = new Date();
      const diffTime = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return {
          text: '已过期',
          color: 'text-red-500',
          bgColor: 'bg-red-50'
        };
      } else if (diffDays === 0) {
        return {
          text: '今天到期',
          color: 'text-orange-500',
          bgColor: 'bg-orange-50'
        };
      } else if (diffDays <= 7) {
        return {
          text: `${diffDays}天后到期`,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50'
        };
      } else {
        return {
          text: `还有${diffDays}天`,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50'
        };
      }
    }
    
    return {
      text: '进行中',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    };
  };

  const IconComponent = getCategoryIcon(wish.category);
  const gradientColor = getCategoryColor(wish.category);
  const textColor = getTextColor(wish.category);
  const priorityColor = getPriorityColor(wish.priority);
  const status = getStatusDisplay();

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group border border-white/20 hover:scale-[1.02] hover:-translate-y-1 ${
      wish.status === 'completed' ? 'opacity-75' : ''
    }`}>
      {/* 头部渐变条 */}
      <div className={`h-2 lg:h-3 bg-gradient-to-r ${gradientColor} relative`}>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-4 lg:p-6">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-4 lg:mb-6">
          <div className="flex items-center space-x-3 lg:space-x-4 flex-1 min-w-0">
            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-r ${gradientColor} flex items-center justify-center relative shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
              <IconComponent className="w-6 h-6 lg:w-7 lg:h-7 text-white drop-shadow-sm" />
              {wish.status === 'completed' && (
                <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 w-5 h-5 lg:w-6 lg:h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-white/20 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg lg:text-xl font-bold text-gray-800 mb-1 lg:mb-2 group-hover:text-gray-900 transition-colors truncate ${
                wish.status === 'completed' ? 'line-through' : ''
              }`}>
                {wish.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                <span className={`text-xs lg:text-sm font-semibold ${textColor} px-2 lg:px-3 py-1 rounded-full bg-gradient-to-r ${gradientColor.replace('from-', 'from-').replace('to-', 'to-')}/10 border border-current/20`}>
                  {wishlistService.getCategoryDisplay(wish.category)}
                </span>
                <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-bold ${priorityColor} shadow-sm`}>
                  {wishlistService.getPriorityDisplay(wish.priority)}
                </span>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex space-x-1 lg:space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
            <button
              onClick={() => onToggleComplete(wish.id)}
              className={`p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 ${
                wish.status === 'completed'
                  ? 'text-green-600 bg-green-50 hover:bg-green-100 border border-green-200'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50 border border-gray-200 hover:border-green-200'
              }`}
              title={wish.status === 'completed' ? '标记为未完成' : '标记为完成'}
            >
              <Check className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={() => onEdit(wish)}
              className="p-2 lg:p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg lg:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 border border-gray-200 hover:border-blue-200"
              title="编辑"
            >
              <Edit className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={() => onDelete(wish.id)}
              disabled={isDeleting}
              className="p-2 lg:p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg lg:rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 disabled:opacity-50 border border-gray-200 hover:border-red-200"
              title="删除"
            >
              <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>

        {/* 描述 */}
        {wish.description && (
          <div className="bg-gray-50/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 mb-4 lg:mb-6 border border-gray-100">
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
              {wish.description}
            </p>
          </div>
        )}

        {/* 详细信息 */}
        <div className="space-y-3 lg:space-y-4">
          {/* 目标日期 */}
          {wish.targetDate && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-blue-100/50 gap-2 sm:gap-0">
              <div className="flex items-center space-x-2 lg:space-x-3 text-sm text-gray-700">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-500 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                </div>
                <span className="font-medium">目标日期：{wishlistService.formatDate(wish.targetDate.toDate())}</span>
              </div>
              <div className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-xs font-bold ${status.color} ${status.bgColor} shadow-sm border border-current/20 self-start sm:self-auto`}>
                {status.text}
              </div>
            </div>
          )}

          {/* 预估费用 */}
          {wish.estimatedCost && wish.estimatedCost > 0 && (
            <div className="flex items-center space-x-2 lg:space-x-3 text-sm text-gray-700 bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-green-100/50">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-green-500 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="font-medium">预估费用：{wish.currency === 'CNY' ? '¥' : '$'}{wish.estimatedCost}</span>
            </div>
          )}

          {/* 分配给 */}
          {wish.assignedTo && (
            <div className="flex items-center space-x-2 lg:space-x-3 text-sm text-gray-700 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-purple-100/50">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-purple-500 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="font-medium">分配给：{wish.assignedTo}</span>
            </div>
          )}

          {/* 标签 */}
          {wish.tags && wish.tags.length > 0 && (
            <div className="bg-gradient-to-r from-orange-50/80 to-yellow-50/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-orange-100/50">
              <div className="flex items-start space-x-2 lg:space-x-3 text-sm text-gray-700">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-orange-500 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
                </div>
                <div className="flex flex-wrap gap-1.5 lg:gap-2">
                  {wish.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 lg:px-3 py-1 bg-white/80 text-gray-700 rounded-full text-xs font-medium shadow-sm border border-gray-200/50 hover:shadow-md transition-shadow"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 备注 */}
        {wish.notes && (
          <div className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-gray-100/50 mt-3 lg:mt-4">
            <div className="flex items-start space-x-2 lg:space-x-3 text-sm text-gray-700">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-500 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                <Tag className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
              </div>
              <div>
                <span className="font-medium text-gray-800">备注：</span>
                <p className="text-gray-600 mt-1 lg:mt-2 leading-relaxed">{wish.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* 完成信息 */}
        {wish.status === 'completed' && wish.completedAt && (
          <div className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-green-200/50 shadow-sm mt-3 lg:mt-4">
            <div className="flex items-center space-x-2 lg:space-x-3 text-sm text-green-700">
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-green-500 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0">
                <Check className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
              </div>
              <span className="font-medium">
                完成于 {wishlistService.formatDate(wish.completedAt.toDate())}
                {wish.completedBy && ` by ${wish.completedBy}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishCard;