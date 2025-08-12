import React, { useState } from 'react';
import {
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Lock,
  Smartphone,
  Mail,
  Eye,
  EyeOff,
  Info,
  Check
} from 'lucide-react';
import { SettingCard as SettingCardType } from '../types';

interface SettingCardProps {
  setting: SettingCardType;
  onUpdate: (value: any) => void;
  disabled?: boolean;
}

const SettingCard: React.FC<SettingCardProps> = ({
  setting,
  onUpdate,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(setting.value || '');

  const getIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      user: <User className="w-5 h-5" />,
      bell: <Bell className="w-5 h-5" />,
      shield: <Shield className="w-5 h-5" />,
      palette: <Palette className="w-5 h-5" />,
      globe: <Globe className="w-5 h-5" />,
      lock: <Lock className="w-5 h-5" />,
      smartphone: <Smartphone className="w-5 h-5" />,
      mail: <Mail className="w-5 h-5" />,
      eye: <Eye className="w-5 h-5" />,
      eyeOff: <EyeOff className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
      settings: <Settings className="w-5 h-5" />
    };
    return iconMap[iconName] || <Settings className="w-5 h-5" />;
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      profile: 'text-pink-600',
      preferences: 'text-purple-600',
      notifications: 'text-blue-600',
      privacy: 'text-green-600',
      security: 'text-red-600',
      account: 'text-gray-600'
    };
    return colorMap[category] || 'text-gray-600';
  };

  const handleToggle = () => {
    if (setting.type === 'toggle') {
      onUpdate(!setting.value);
    }
  };

  const handleSelectChange = (value: string) => {
    onUpdate(value);
  };

  const handleInputSubmit = () => {
    if (inputValue !== setting.value) {
      onUpdate(inputValue);
    }
    setIsExpanded(false);
  };

  const handleInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    } else if (e.key === 'Escape') {
      setInputValue(setting.value || '');
      setIsExpanded(false);
    }
  };

  const renderSettingControl = () => {
    switch (setting.type) {
      case 'toggle':
        return (
          <button
            onClick={handleToggle}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
              setting.value
                ? 'bg-gradient-to-r from-pink-500 to-purple-600'
                : 'bg-gray-200'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                setting.value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );

      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => handleSelectChange(e.target.value)}
            disabled={disabled}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {setting.options?.map((option) => (
              <option key={option.value.toString()} value={option.value.toString()}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'input':
        return (
          <div className="flex items-center space-x-2">
            {!isExpanded ? (
              <>
                <span className="text-sm text-gray-600 max-w-32 truncate">
                  {setting.value || '未设置'}
                </span>
                <button
                  onClick={() => setIsExpanded(true)}
                  disabled={disabled}
                  className="text-pink-600 hover:text-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={typeof inputValue === 'boolean' ? '' : inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleInputKeyPress}
                  onBlur={handleInputSubmit}
                  autoFocus
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder={setting.description}
                />
              </div>
            )}
          </div>
        );

      case 'button':
        return (
          <button
            onClick={setting.action}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {setting.value || '执行'}
          </button>
        );

      case 'info':
        return (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {setting.value}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-2 rounded-lg bg-gray-50 ${getCategoryColor(setting.category)}`}>
            {getIcon(setting.icon)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {setting.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {setting.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {renderSettingControl()}
        </div>
      </div>

      {/* 扩展信息区域 */}
      {setting.type === 'info' && setting.action && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={setting.action}
            disabled={disabled}
            className="w-full text-left text-sm text-pink-600 hover:text-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            查看详情
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingCard;