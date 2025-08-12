import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, User, Star, Heart, Gift, Home, Car, Plane, Book } from 'lucide-react';
import { WishItem, WishFormData } from '../types';

interface WishFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WishFormData) => Promise<void>;
  wish?: WishItem | null;
  isLoading?: boolean;
}

const WishForm: React.FC<WishFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  wish,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<WishFormData>({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    targetDate: '',
    estimatedCost: 0,
    currency: 'CNY',
    tags: [],
    isShared: true,
    assignedTo: 'both',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // 愿望分类选项
  const categoryOptions = [
    { value: 'travel', label: '旅行', icon: Plane, color: 'text-blue-500' },
    { value: 'gift', label: '礼物', icon: Gift, color: 'text-pink-500' },
    { value: 'experience', label: '体验', icon: Heart, color: 'text-red-500' },
    { value: 'home', label: '家居', icon: Home, color: 'text-green-500' },
    { value: 'car', label: '汽车', icon: Car, color: 'text-gray-500' },
    { value: 'education', label: '学习', icon: Book, color: 'text-purple-500' },
    { value: 'other', label: '其他', icon: Star, color: 'text-yellow-500' }
  ];

  // 优先级选项
  const priorityOptions = [
    { value: 'low', label: '低优先级', color: 'text-gray-500' },
    { value: 'medium', label: '中优先级', color: 'text-blue-500' },
    { value: 'high', label: '高优先级', color: 'text-orange-500' },
    { value: 'urgent', label: '紧急', color: 'text-red-500' }
  ];

  // 分配对象选项
  const assignedToOptions = [
    { value: 'me', label: '我的愿望' },
    { value: 'partner', label: 'TA的愿望' },
    { value: 'both', label: '我们的愿望' }
  ];

  // 货币选项
  const currencyOptions = [
    { value: 'CNY', label: '人民币 (¥)' },
    { value: 'USD', label: '美元 ($)' },
    { value: 'EUR', label: '欧元 (€)' },
    { value: 'JPY', label: '日元 (¥)' }
  ];

  // 当编辑模式时，填充表单数据
  useEffect(() => {
    if (wish) {
      setFormData({
        title: wish.title,
        description: wish.description || '',
        category: wish.category,
        priority: wish.priority,
        targetDate: wish.targetDate ? wish.targetDate.toDate().toISOString().split('T')[0] : '',
        estimatedCost: wish.estimatedCost || 0,
        currency: wish.currency || 'CNY',
        tags: wish.tags || [],
        isShared: wish.isShared,
        assignedTo: wish.assignedTo,
        notes: wish.notes || ''
      });
    } else {
      // 重置表单
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        targetDate: '',
        estimatedCost: 0,
        currency: 'CNY',
        tags: [],
        isShared: true,
        assignedTo: 'both',
        notes: ''
      });
    }
    setErrors({});
    setTagInput('');
  }, [wish, isOpen]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '请输入愿望标题';
    }

    if (!formData.category) {
      newErrors.category = '请选择愿望分类';
    }

    if (!formData.priority) {
      newErrors.priority = '请选择优先级';
    }

    if (formData.targetDate) {
      const selectedDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.targetDate = '目标日期不能是过去的日期';
      }
    }

    if (formData.estimatedCost < 0) {
      newErrors.estimatedCost = '预估费用不能为负数';
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
  const handleInputChange = (field: keyof WishFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      const newTags = [...formData.tags, tagInput.trim()];
      handleInputChange('tags', newTags);
      setTagInput('');
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    const newTags = formData.tags.filter(tag => tag !== tagToRemove);
    handleInputChange('tags', newTags);
  };

  // 处理标签输入键盘事件
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {wish ? '编辑愿望' : '添加愿望'}
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
          {/* 愿望标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              愿望标题 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例如：去马尔代夫度蜜月"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* 愿望描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              愿望描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors resize-none"
              placeholder="详细描述这个愿望..."
              disabled={isLoading}
            />
          </div>

          {/* 愿望分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              愿望分类 *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categoryOptions.map((category) => {
                const IconComponent = category.icon;
                return (
                  <label
                    key={category.value}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                      formData.category === category.value
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="sr-only"
                      disabled={isLoading}
                    />
                    <IconComponent className={`w-5 h-5 mr-2 ${category.color}`} />
                    <span className="text-sm text-gray-700">{category.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* 优先级 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              优先级 *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                errors.priority ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="text-red-500 text-sm mt-1">{errors.priority}</p>
            )}
          </div>

          {/* 目标日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标日期（可选）
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                  errors.targetDate ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.targetDate && (
              <p className="text-red-500 text-sm mt-1">{errors.targetDate}</p>
            )}
          </div>

          {/* 预估费用 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预估费用
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors ${
                    errors.estimatedCost ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  disabled={isLoading}
                />
                <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.estimatedCost && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedCost}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                货币
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                disabled={isLoading}
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-pink-600 hover:text-pink-800"
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                placeholder="输入标签后按回车添加"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                disabled={isLoading || !tagInput.trim()}
              >
                添加
              </button>
            </div>
          </div>

          {/* 分配对象 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分配对象
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => handleInputChange('assignedTo', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
              disabled={isLoading}
            >
              {assignedToOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 是否共享 */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isShared}
                onChange={(e) => handleInputChange('isShared', e.target.checked)}
                className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-gray-700">
                与伴侣分享此愿望
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              开启后，伴侣可以看到并帮助实现这个愿望
            </p>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors resize-none"
              placeholder="添加一些备注信息..."
              disabled={isLoading}
            />
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
              {isLoading ? '保存中...' : (wish ? '更新' : '添加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WishForm;