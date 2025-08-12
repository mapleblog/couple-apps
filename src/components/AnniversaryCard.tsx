import React from 'react';
import { Calendar, Edit, Trash2, Heart, Gift, Users, Star, Clock } from 'lucide-react';
import { Anniversary } from '../types';
import { getAnniversaryTypeDisplay, getNextAnniversaryDate, getDaysUntilAnniversary, formatDate } from '../services/anniversaryService';

interface AnniversaryCardProps {
  anniversary: Anniversary;
  onEdit: (anniversary: Anniversary) => void;
  onDelete: (anniversaryId: string) => void;
  isDeleting?: boolean;
}

const AnniversaryCard: React.FC<AnniversaryCardProps> = ({
  anniversary,
  onEdit,
  onDelete,
  isDeleting = false
}) => {
  // 获取纪念日类型图标
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'first_date':
      case 'first_kiss':
        return Heart;
      case 'engagement':
        return Gift;
      case 'wedding':
        return Users;
      default:
        return Star;
    }
  };

  // 获取纪念日类型颜色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'first_date':
        return 'from-pink-400 to-rose-400';
      case 'first_kiss':
        return 'from-red-400 to-pink-400';
      case 'engagement':
        return 'from-purple-400 to-indigo-400';
      case 'wedding':
        return 'from-blue-400 to-cyan-400';
      default:
        return 'from-yellow-400 to-orange-400';
    }
  };

  // 获取文本颜色
  const getTextColor = (type: string) => {
    switch (type) {
      case 'first_date':
        return 'text-pink-600';
      case 'first_kiss':
        return 'text-red-600';
      case 'engagement':
        return 'text-purple-600';
      case 'wedding':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  const IconComponent = getTypeIcon(anniversary.type);
  const gradientColor = getTypeColor(anniversary.type);
  const textColor = getTextColor(anniversary.type);
  
  // 计算下次纪念日日期和剩余天数
  const nextDate = getNextAnniversaryDate(anniversary);
  const daysUntil = getDaysUntilAnniversary(anniversary);
  
  // 计算已经过去的年数
  const anniversaryDate = anniversary.date.toDate();
  const currentYear = new Date().getFullYear();
  const anniversaryYear = anniversaryDate.getFullYear();
  const yearsPassed = currentYear - anniversaryYear;

  // 格式化日期显示
  const formatLocalDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 获取状态显示
  const getStatusDisplay = () => {
    if (daysUntil === 0) {
      return {
        text: '今天就是纪念日！',
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      };
    } else if (daysUntil <= 7) {
      return {
        text: `还有 ${daysUntil} 天`,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50'
      };
    } else if (daysUntil <= 30) {
      return {
        text: `还有 ${daysUntil} 天`,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      };
    } else {
      return {
        text: `还有 ${daysUntil} 天`,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50'
      };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* 头部渐变条 */}
      <div className={`h-2 bg-gradient-to-r ${gradientColor}`} />
      
      <div className="p-6">
        {/* 头部信息 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradientColor} flex items-center justify-center`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {anniversary.title}
              </h3>
              <span className={`text-sm font-medium ${textColor}`}>
                {getAnniversaryTypeDisplay(anniversary.type).label}
              </span>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(anniversary)}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="编辑"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(anniversary.id)}
              disabled={isDeleting}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 描述 */}
        {anniversary.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {anniversary.description}
          </p>
        )}

        {/* 日期信息 */}
        <div className="space-y-3">
          {/* 原始日期 */}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>纪念日期：{formatDate(anniversary.date)}</span>
          </div>

          {/* 年数显示 */}
          {yearsPassed > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>已经 {yearsPassed} 年了</span>
            </div>
          )}

          {/* 下次纪念日 */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              下次：{nextDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.bgColor}`}>
              {status.text}
            </div>
          </div>
        </div>

        {/* 提醒设置 */}
        {anniversary.reminderDays !== undefined && anniversary.reminderDays > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>提前 {anniversary.reminderDays} 天提醒</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnniversaryCard;