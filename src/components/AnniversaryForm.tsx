import React, { useState, useEffect } from 'react';
import { X, Calendar, Heart, Gift, Users, Star } from 'lucide-react';
import { Anniversary, AnniversaryFormData } from '../types';

interface AnniversaryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnniversaryFormData) => Promise<void>;
  anniversary?: Anniversary | null;
  isLoading?: boolean;
}

const AnniversaryForm: React.FC<AnniversaryFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  anniversary,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<AnniversaryFormData>({
    title: '',
    date: '',
    type: 'first_date',
    description: '',
    isRecurring: true,
    reminderDays: 7
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 纪念日类型选项
  const anniversaryTypes = [
    { value: 'first_date', label: '初次相遇', icon: Heart, color: 'text-pink-500' },
    { value: 'first_kiss', label: '初吻', icon: Heart, color: 'text-red-500' },
    { value: 'engagement', label: '订婚', icon: Gift, color: 'text-purple-500' },
    { value: 'wedding', label: '结婚', icon: Users, color: 'text-blue-500' },
    { value: 'other', label: '其他特殊日子', icon: Star, color: 'text-yellow-500' }
  ];

  // 提醒天数选项
  const reminderOptions = [
    { value: 0, label: '当天提醒' },
    { value: 1, label: '提前1天' },
    { value: 3, label: '提前3天' },
    { value: 7, label: '提前1周' },
    { value: 14, label: '提前2周' },
    { value: 30, label: '提前1个月' }
  ];

  // 当编辑模式时，填充表单数据
  useEffect(() => {
    if (anniversary) {
      setFormData({
        title: anniversary.title,
        date: anniversary.date.toDate().toISOString().split('T')[0],
        type: anniversary.type,
        description: anniversary.description || '',
        isRecurring: anniversary.isRecurring,
        reminderDays: anniversary.reminderDays || 7
      });
    } else {
      // 重置表单
      setFormData({
        title: '',
        date: '',
        type: 'first_date',
        description: '',
        isRecurring: true,
        reminderDays: 7
      });
    }
    setErrors({});
  }, [anniversary, isOpen]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入纪念日标题';
    }

    if (!formData.date) {
      newErrors.date = '请选择纪念日日期';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = '纪念日日期不能是未来的日期';
      }
    }

    if (!formData.type) {
      newErrors.type = '请选择纪念日类型';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof AnniversaryFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {anniversary ? '编辑纪念日' : '添加纪念日'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 纪念日标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              纪念日标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例如：我们的第一次约会"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* 纪念日日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              纪念日日期 *
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* 纪念日类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              纪念日类型 *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {anniversaryTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <label
                    key={type.value}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <IconComponent className={`w-5 h-5 mr-3 ${type.color}`} />
                    <span className="text-gray-700">{type.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-red-500 text-sm mt-1">{errors.type}</p>
            )}
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述（可选）
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors resize-none"
              placeholder="记录这个特殊日子的美好回忆..."
              disabled={isLoading}
            />
          </div>

          {/* 重复设置 */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">
                每年重复提醒
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              开启后，每年的这一天都会收到提醒
            </p>
          </div>

          {/* 提醒设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提醒设置
            </label>
            <select
              value={formData.reminderDays}
              onChange={(e) => handleInputChange('reminderDays', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 按钮组 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 px-4 rounded-xl font-medium hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : (anniversary ? '更新' : '添加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnniversaryForm;