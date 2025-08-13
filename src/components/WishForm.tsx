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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-white/20">
        {/* 头部 */}
        <div className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-6">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-t-2xl sm:rounded-t-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {wish ? '编辑愿望' : '添加愿望'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 hover:bg-white/30 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
              disabled={isLoading}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* 愿望标题 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>愿望标题 *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50/80 border-2 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all duration-200 placeholder-gray-400 text-sm lg:text-base ${
                  errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="✨ 例如：去马尔代夫度蜜月"
                disabled={isLoading}
              />
              {errors.title && (
                <div className="absolute -bottom-6 left-0 flex items-center space-x-1 text-red-500">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  <p className="text-xs font-medium">{errors.title}</p>
                </div>
              )}
            </div>
          </div>

          {/* 愿望描述 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>愿望描述</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50/80 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none placeholder-gray-400 hover:border-gray-300 text-sm lg:text-base"
              placeholder="📝 详细描述这个愿望..."
              disabled={isLoading}
            />
          </div>

          {/* 愿望分类 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>愿望分类 *</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
              {categoryOptions.map((category) => {
                const IconComponent = category.icon;
                return (
                  <label
                    key={category.value}
                    className={`flex items-center p-3 lg:p-4 border-2 rounded-xl lg:rounded-2xl cursor-pointer transition-all duration-200 ${
                      formData.category === category.value
                        ? 'border-green-500 bg-green-50/80 shadow-lg shadow-green-500/10'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
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
                    <IconComponent className={`w-4 h-4 lg:w-5 lg:h-5 mr-2 lg:mr-3 ${category.color}`} />
                    <span className="text-xs lg:text-sm font-medium text-gray-700">{category.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.category && (
              <div className="flex items-center space-x-1 text-red-500 mt-2">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                <p className="text-xs font-medium">{errors.category}</p>
              </div>
            )}
          </div>

          {/* 优先级 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>优先级 *</span>
            </label>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {priorityOptions.map((priority) => (
                <label
                  key={priority.value}
                  className={`flex items-center justify-center p-3 lg:p-4 border-2 rounded-xl lg:rounded-2xl cursor-pointer transition-all duration-200 ${
                    formData.priority === priority.value
                      ? 'border-orange-500 bg-orange-50/80 shadow-lg shadow-orange-500/10'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <span className={`text-xs lg:text-sm font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.priority && (
              <div className="flex items-center space-x-1 text-red-500 mt-2">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                <p className="text-xs font-medium">{errors.priority}</p>
              </div>
            )}
          </div>

          {/* 目标日期 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>目标日期（可选）</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => handleInputChange('targetDate', e.target.value)}
                className={`w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50/80 border-2 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 hover:border-gray-300 text-sm lg:text-base ${
                  errors.targetDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                }`}
                disabled={isLoading}
              />
              <Calendar className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.targetDate && (
              <div className="flex items-center space-x-1 text-red-500 mt-2">
                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                <p className="text-xs font-medium">{errors.targetDate}</p>
              </div>
            )}
          </div>

          {/* 预估费用 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>预估费用</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
              <div className="sm:col-span-2">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => handleInputChange('estimatedCost', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50/80 border-2 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 placeholder-gray-400 hover:border-gray-300 text-sm lg:text-base ${
                      errors.estimatedCost ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'
                    }`}
                    placeholder="💰 0.00"
                    disabled={isLoading}
                  />
                  <DollarSign className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.estimatedCost && (
                  <div className="flex items-center space-x-1 text-red-500 mt-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    <p className="text-xs font-medium">{errors.estimatedCost}</p>
                  </div>
                )}
              </div>
              <div>
                <div className="relative">
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 lg:px-4 py-3 lg:py-4 bg-gray-50/80 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-sm lg:text-base"
                    disabled={isLoading}
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400 transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>标签</span>
            </label>
            <div className="bg-gray-50/80 rounded-xl lg:rounded-2xl p-3 lg:p-4 border-2 border-gray-200">
              <div className="flex flex-wrap gap-2 mb-3 lg:mb-4">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg lg:rounded-xl text-xs lg:text-sm font-medium shadow-sm"
                  >
                    <Tag className="w-3 h-3 mr-1.5 lg:mr-2" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 lg:ml-2 w-4 h-4 lg:w-5 lg:h-5 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                      disabled={isLoading}
                    >
                      <X className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 px-3 lg:px-4 py-2.5 lg:py-3 bg-white border-2 border-gray-200 rounded-lg lg:rounded-xl focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 transition-all duration-200 placeholder-gray-400 text-sm lg:text-base"
                  placeholder="🏷️ 输入标签后按回车添加"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 lg:px-5 py-2.5 lg:py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg lg:rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center font-medium text-sm lg:text-base"
                  disabled={isLoading || !tagInput.trim()}
                >
                  添加
                </button>
              </div>
            </div>
          </div>

          {/* 分配对象 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              <span>分配对象</span>
            </label>
            <div className="relative">
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50/80 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 text-sm lg:text-base"
                disabled={isLoading}
              >
                {assignedToOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <User className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* 是否共享 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
              <span>共享设置</span>
            </label>
            <div className="bg-gradient-to-r from-rose-50/80 to-pink-50/80 rounded-xl lg:rounded-2xl p-4 lg:p-5 border-2 border-rose-100">
              <label className="flex items-center space-x-3 lg:space-x-4 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => handleInputChange('isShared', e.target.checked)}
                    className="sr-only"
                    disabled={isLoading}
                  />
                  <div className={`w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-all duration-200 ${
                    formData.isShared ? 'bg-rose-500' : 'bg-gray-300'
                  }`}>
                    <div className={`w-4 h-4 lg:w-5 lg:h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      formData.isShared ? 'translate-x-5 lg:translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`}></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className={`w-4 h-4 lg:w-5 lg:h-5 ${
                    formData.isShared ? 'text-rose-500' : 'text-gray-400'
                  }`} />
                  <span className="text-xs lg:text-sm font-medium text-gray-700">
                    与伴侣分享此愿望
                  </span>
                </div>
              </label>
              <p className="text-xs text-gray-500 mt-2 lg:mt-3 ml-13 lg:ml-16">
                开启后，伴侣可以看到并帮助实现这个愿望
              </p>
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2 lg:space-y-3">
            <label className="flex items-center space-x-2 text-sm font-semibold text-gray-800">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>备注</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 lg:px-5 py-3 lg:py-4 bg-gray-50/80 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all duration-200 resize-none placeholder-gray-400 hover:border-gray-300 text-sm lg:text-base"
                placeholder="📝 添加一些备注信息..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 按钮组 */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 sm:py-4 px-4 sm:px-6 border-2 border-gray-300 text-gray-700 rounded-xl sm:rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md text-sm sm:text-base"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold hover:from-purple-600 hover:via-pink-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  <span>{wish ? '更新愿望' : '添加愿望'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WishForm;