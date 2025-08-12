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
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
      wish.status === 'completed' ? 'opacity-75' : ''
    }`}>
      {/* 头部渐变条 */}
      <div className={`h-2 bg-gradient-to-r ${gradientColor}`} />
      
      <div className="p-6">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradientColor} flex items-center justify-center relative`}>
              <IconComponent className="w-6 h-6 text-white" />
              {wish.status === 'completed' && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold text-gray-800 mb-1 ${
                wish.status === 'completed' ? 'line-through' : ''
              }`}>
                {wish.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${textColor}`}>
                  {wishlistService.getCategoryDisplay(wish.category)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}>
                  {wishlistService.getPriorityDisplay(wish.priority)}
                </span>
              </div>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleComplete(wish.id)}
              className={`p-2 rounded-lg transition-colors ${
                wish.status === 'completed'
                  ? 'text-green-500 hover:text-green-600 hover:bg-green-50'
                  : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
              }`}
              title={wish.status === 'completed' ? '标记为未完成' : '标记为完成'}
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(wish)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(wish.id)}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 描述 */}
        {wish.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {wish.description}
          </p>
        )}

        {/* 详细信息 */}
        <div className="space-y-3">
          {/* 目标日期 */}
          {wish.targetDate && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>目标日期：{wishlistService.formatDate(wish.targetDate.toDate())}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}>
                {status.text}
              </div>
            </div>
          )}

          {/* 预估费用 */}
          {wish.estimatedCost && wish.estimatedCost > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>预估费用：{wish.currency === 'CNY' ? '¥' : '$'}{wish.estimatedCost}</span>
            </div>
          )}

          {/* 分配给 */}
          {wish.assignedTo && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>分配给：{wish.assignedTo}</span>
            </div>
          )}

          {/* 标签 */}
          {wish.tags && wish.tags.length > 0 && (
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <Tag className="w-4 h-4 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {wish.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 备注 */}
        {wish.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 line-clamp-2">
              备注：{wish.notes}
            </p>
          </div>
        )}

        {/* 完成信息 */}
        {wish.status === 'completed' && wish.completedAt && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-green-600">
              <Check className="w-3 h-3" />
              <span>
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