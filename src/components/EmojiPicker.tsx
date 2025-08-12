import React, { useState } from 'react';
import { Smile, Heart, Hand, Gift, Star, Search } from 'lucide-react';
import { EmojiData } from '../types';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onEmojiSelect,
  onClose,
  className = ''
}) => {
  const [activeCategory, setActiveCategory] = useState<EmojiData['category']>('smileys');
  const [searchTerm, setSearchTerm] = useState('');

  // 表情符号数据
  const emojiData: EmojiData[] = [
    // 笑脸类
    { emoji: '😀', name: '开心', category: 'smileys' },
    { emoji: '😃', name: '大笑', category: 'smileys' },
    { emoji: '😄', name: '哈哈', category: 'smileys' },
    { emoji: '😁', name: '咧嘴笑', category: 'smileys' },
    { emoji: '😆', name: '笑眯眯', category: 'smileys' },
    { emoji: '😅', name: '苦笑', category: 'smileys' },
    { emoji: '😂', name: '笑哭', category: 'smileys' },
    { emoji: '🤣', name: '大笑', category: 'smileys' },
    { emoji: '😊', name: '微笑', category: 'smileys' },
    { emoji: '😇', name: '天使', category: 'smileys' },
    { emoji: '🙂', name: '轻笑', category: 'smileys' },
    { emoji: '🙃', name: '倒脸', category: 'smileys' },
    { emoji: '😉', name: '眨眼', category: 'smileys' },
    { emoji: '😌', name: '满足', category: 'smileys' },
    { emoji: '😍', name: '花痴', category: 'smileys' },
    { emoji: '🥰', name: '爱心眼', category: 'smileys' },
    { emoji: '😘', name: '飞吻', category: 'smileys' },
    { emoji: '😗', name: '亲吻', category: 'smileys' },
    { emoji: '😙', name: '微笑亲吻', category: 'smileys' },
    { emoji: '😚', name: '闭眼亲吻', category: 'smileys' },
    { emoji: '😋', name: '美味', category: 'smileys' },
    { emoji: '😛', name: '吐舌', category: 'smileys' },
    { emoji: '😜', name: '眨眼吐舌', category: 'smileys' },
    { emoji: '🤪', name: '疯狂', category: 'smileys' },
    { emoji: '😝', name: '闭眼吐舌', category: 'smileys' },
    { emoji: '🤑', name: '财迷', category: 'smileys' },
    { emoji: '🤗', name: '拥抱', category: 'smileys' },
    { emoji: '🤭', name: '捂嘴笑', category: 'smileys' },
    { emoji: '🤫', name: '嘘', category: 'smileys' },
    { emoji: '🤔', name: '思考', category: 'smileys' },
    { emoji: '😐', name: '面无表情', category: 'smileys' },
    { emoji: '😑', name: '无语', category: 'smileys' },
    { emoji: '😶', name: '无言', category: 'smileys' },
    { emoji: '😏', name: '得意', category: 'smileys' },
    { emoji: '😒', name: '无聊', category: 'smileys' },
    { emoji: '🙄', name: '翻白眼', category: 'smileys' },
    { emoji: '😬', name: '尴尬', category: 'smileys' },
    { emoji: '🤥', name: '说谎', category: 'smileys' },
    { emoji: '😔', name: '沮丧', category: 'smileys' },
    { emoji: '😕', name: '困惑', category: 'smileys' },
    { emoji: '🙁', name: '皱眉', category: 'smileys' },
    { emoji: '☹️', name: '不开心', category: 'smileys' },
    { emoji: '😣', name: '坚持', category: 'smileys' },
    { emoji: '😖', name: '困扰', category: 'smileys' },
    { emoji: '😫', name: '疲惫', category: 'smileys' },
    { emoji: '😩', name: '疲倦', category: 'smileys' },
    { emoji: '🥺', name: '恳求', category: 'smileys' },
    { emoji: '😢', name: '哭泣', category: 'smileys' },
    { emoji: '😭', name: '大哭', category: 'smileys' },
    { emoji: '😤', name: '生气', category: 'smileys' },
    { emoji: '😠', name: '愤怒', category: 'smileys' },
    { emoji: '😡', name: '暴怒', category: 'smileys' },
    { emoji: '🤬', name: '骂人', category: 'smileys' },
    { emoji: '🤯', name: '爆炸', category: 'smileys' },
    { emoji: '😳', name: '脸红', category: 'smileys' },
    { emoji: '🥵', name: '热', category: 'smileys' },
    { emoji: '🥶', name: '冷', category: 'smileys' },
    { emoji: '😱', name: '尖叫', category: 'smileys' },
    { emoji: '😨', name: '恐惧', category: 'smileys' },
    { emoji: '😰', name: '焦虑', category: 'smileys' },
    { emoji: '😥', name: '失望', category: 'smileys' },
    { emoji: '😓', name: '冷汗', category: 'smileys' },
    { emoji: '🤤', name: '流口水', category: 'smileys' },
    { emoji: '😴', name: '睡觉', category: 'smileys' },
    { emoji: '😪', name: '困倦', category: 'smileys' },
    { emoji: '😵', name: '晕', category: 'smileys' },
    { emoji: '🤐', name: '闭嘴', category: 'smileys' },
    { emoji: '🥴', name: '醉', category: 'smileys' },
    { emoji: '🤢', name: '恶心', category: 'smileys' },
    { emoji: '🤮', name: '呕吐', category: 'smileys' },
    { emoji: '🤧', name: '打喷嚏', category: 'smileys' },
    { emoji: '😷', name: '口罩', category: 'smileys' },
    { emoji: '🤒', name: '发烧', category: 'smileys' },
    { emoji: '🤕', name: '受伤', category: 'smileys' },

    // 爱心类
    { emoji: '❤️', name: '红心', category: 'hearts' },
    { emoji: '🧡', name: '橙心', category: 'hearts' },
    { emoji: '💛', name: '黄心', category: 'hearts' },
    { emoji: '💚', name: '绿心', category: 'hearts' },
    { emoji: '💙', name: '蓝心', category: 'hearts' },
    { emoji: '💜', name: '紫心', category: 'hearts' },
    { emoji: '🖤', name: '黑心', category: 'hearts' },
    { emoji: '🤍', name: '白心', category: 'hearts' },
    { emoji: '🤎', name: '棕心', category: 'hearts' },
    { emoji: '💔', name: '心碎', category: 'hearts' },
    { emoji: '❣️', name: '心叹号', category: 'hearts' },
    { emoji: '💕', name: '两颗心', category: 'hearts' },
    { emoji: '💞', name: '旋转心', category: 'hearts' },
    { emoji: '💓', name: '心跳', category: 'hearts' },
    { emoji: '💗', name: '成长心', category: 'hearts' },
    { emoji: '💖', name: '闪亮心', category: 'hearts' },
    { emoji: '💘', name: '丘比特', category: 'hearts' },
    { emoji: '💝', name: '心礼物', category: 'hearts' },
    { emoji: '💟', name: '心装饰', category: 'hearts' },
    { emoji: '♥️', name: '红桃', category: 'hearts' },
    { emoji: '💋', name: '唇印', category: 'hearts' },
    { emoji: '💌', name: '情书', category: 'hearts' },
    { emoji: '💐', name: '花束', category: 'hearts' },
    { emoji: '🌹', name: '玫瑰', category: 'hearts' },
    { emoji: '🌺', name: '花朵', category: 'hearts' },
    { emoji: '🌸', name: '樱花', category: 'hearts' },
    { emoji: '🌼', name: '雏菊', category: 'hearts' },
    { emoji: '🌻', name: '向日葵', category: 'hearts' },
    { emoji: '🌷', name: '郁金香', category: 'hearts' },

    // 手势类
    { emoji: '👍', name: '点赞', category: 'gestures' },
    { emoji: '👎', name: '点踩', category: 'gestures' },
    { emoji: '👌', name: 'OK', category: 'gestures' },
    { emoji: '✌️', name: '胜利', category: 'gestures' },
    { emoji: '🤞', name: '祈祷', category: 'gestures' },
    { emoji: '🤟', name: '爱你', category: 'gestures' },
    { emoji: '🤘', name: '摇滚', category: 'gestures' },
    { emoji: '🤙', name: '打电话', category: 'gestures' },
    { emoji: '👈', name: '左指', category: 'gestures' },
    { emoji: '👉', name: '右指', category: 'gestures' },
    { emoji: '👆', name: '上指', category: 'gestures' },
    { emoji: '👇', name: '下指', category: 'gestures' },
    { emoji: '☝️', name: '食指', category: 'gestures' },
    { emoji: '✋', name: '举手', category: 'gestures' },
    { emoji: '🤚', name: '手背', category: 'gestures' },
    { emoji: '🖐️', name: '五指', category: 'gestures' },
    { emoji: '🖖', name: '瓦肯', category: 'gestures' },
    { emoji: '👋', name: '挥手', category: 'gestures' },
    { emoji: '🤝', name: '握手', category: 'gestures' },
    { emoji: '🙏', name: '合掌', category: 'gestures' },
    { emoji: '✍️', name: '写字', category: 'gestures' },
    { emoji: '👏', name: '鼓掌', category: 'gestures' },
    { emoji: '🙌', name: '举双手', category: 'gestures' },
    { emoji: '👐', name: '张开手', category: 'gestures' },
    { emoji: '🤲', name: '捧手', category: 'gestures' },
    { emoji: '🤜', name: '右拳', category: 'gestures' },
    { emoji: '🤛', name: '左拳', category: 'gestures' },
    { emoji: '✊', name: '拳头', category: 'gestures' },
    { emoji: '👊', name: '碰拳', category: 'gestures' },
    { emoji: '🤏', name: '捏', category: 'gestures' },

    // 物品类
    { emoji: '🎁', name: '礼物', category: 'objects' },
    { emoji: '🎂', name: '蛋糕', category: 'objects' },
    { emoji: '🍰', name: '蛋糕片', category: 'objects' },
    { emoji: '🧁', name: '纸杯蛋糕', category: 'objects' },
    { emoji: '🍭', name: '棒棒糖', category: 'objects' },
    { emoji: '🍬', name: '糖果', category: 'objects' },
    { emoji: '🍫', name: '巧克力', category: 'objects' },
    { emoji: '🍪', name: '饼干', category: 'objects' },
    { emoji: '🍩', name: '甜甜圈', category: 'objects' },
    { emoji: '🍯', name: '蜂蜜', category: 'objects' },
    { emoji: '🥛', name: '牛奶', category: 'objects' },
    { emoji: '☕', name: '咖啡', category: 'objects' },
    { emoji: '🍵', name: '茶', category: 'objects' },
    { emoji: '🥤', name: '饮料', category: 'objects' },
    { emoji: '🍷', name: '红酒', category: 'objects' },
    { emoji: '🥂', name: '干杯', category: 'objects' },
    { emoji: '🍾', name: '香槟', category: 'objects' },
    { emoji: '🎈', name: '气球', category: 'objects' },
    { emoji: '🎉', name: '庆祝', category: 'objects' },
    { emoji: '🎊', name: '彩带', category: 'objects' },
    { emoji: '🎀', name: '蝴蝶结', category: 'objects' },
    { emoji: '🎗️', name: '丝带', category: 'objects' },
    { emoji: '🏆', name: '奖杯', category: 'objects' },
    { emoji: '🥇', name: '金牌', category: 'objects' },
    { emoji: '🥈', name: '银牌', category: 'objects' },
    { emoji: '🥉', name: '铜牌', category: 'objects' },
    { emoji: '⚽', name: '足球', category: 'objects' },
    { emoji: '🏀', name: '篮球', category: 'objects' },
    { emoji: '🏈', name: '橄榄球', category: 'objects' },
    { emoji: '⚾', name: '棒球', category: 'objects' },
    { emoji: '🥎', name: '垒球', category: 'objects' },
    { emoji: '🎾', name: '网球', category: 'objects' },
    { emoji: '🏐', name: '排球', category: 'objects' },
    { emoji: '🏉', name: '橄榄球', category: 'objects' },
    { emoji: '🥏', name: '飞盘', category: 'objects' },
    { emoji: '🎱', name: '台球', category: 'objects' },
    { emoji: '🪀', name: '悠悠球', category: 'objects' },
    { emoji: '🏓', name: '乒乓球', category: 'objects' },
    { emoji: '🏸', name: '羽毛球', category: 'objects' },
    { emoji: '🥅', name: '球门', category: 'objects' },
    { emoji: '⛳', name: '高尔夫', category: 'objects' },
    { emoji: '🪁', name: '风筝', category: 'objects' },
    { emoji: '🏹', name: '弓箭', category: 'objects' },
    { emoji: '🎣', name: '钓鱼', category: 'objects' },
    { emoji: '🤿', name: '潜水', category: 'objects' },
    { emoji: '🥊', name: '拳击', category: 'objects' },
    { emoji: '🥋', name: '武术', category: 'objects' },
    { emoji: '🎽', name: '跑步', category: 'objects' },
    { emoji: '🛹', name: '滑板', category: 'objects' },
    { emoji: '🛷', name: '雪橇', category: 'objects' },
    { emoji: '⛸️', name: '滑冰', category: 'objects' },
    { emoji: '🥌', name: '冰壶', category: 'objects' },
    { emoji: '🎿', name: '滑雪', category: 'objects' },
    { emoji: '⛷️', name: '滑雪者', category: 'objects' },
    { emoji: '🏂', name: '滑雪板', category: 'objects' },
    { emoji: '🪂', name: '降落伞', category: 'objects' },
    { emoji: '🏋️', name: '举重', category: 'objects' },
    { emoji: '🤸', name: '体操', category: 'objects' },
    { emoji: '🤼', name: '摔跤', category: 'objects' },
    { emoji: '🤽', name: '水球', category: 'objects' },
    { emoji: '🤾', name: '手球', category: 'objects' },
    { emoji: '🤹', name: '杂技', category: 'objects' },
    { emoji: '🧘', name: '冥想', category: 'objects' },
    { emoji: '🛀', name: '洗澡', category: 'objects' },
    { emoji: '🛌', name: '睡觉', category: 'objects' },

    // 符号类
    { emoji: '⭐', name: '星星', category: 'symbols' },
    { emoji: '🌟', name: '闪亮星', category: 'symbols' },
    { emoji: '✨', name: '闪光', category: 'symbols' },
    { emoji: '⚡', name: '闪电', category: 'symbols' },
    { emoji: '💫', name: '眩晕', category: 'symbols' },
    { emoji: '💥', name: '爆炸', category: 'symbols' },
    { emoji: '💢', name: '愤怒', category: 'symbols' },
    { emoji: '💦', name: '汗滴', category: 'symbols' },
    { emoji: '💨', name: '冲刺', category: 'symbols' },
    { emoji: '🕳️', name: '洞', category: 'symbols' },
    { emoji: '💣', name: '炸弹', category: 'symbols' },
    { emoji: '💬', name: '对话', category: 'symbols' },
    { emoji: '👁️‍🗨️', name: '眼睛对话', category: 'symbols' },
    { emoji: '🗨️', name: '左对话', category: 'symbols' },
    { emoji: '🗯️', name: '右对话', category: 'symbols' },
    { emoji: '💭', name: '思考泡', category: 'symbols' },
    { emoji: '💤', name: 'ZZZ', category: 'symbols' },
    { emoji: '👋🏻', name: '挥手浅', category: 'symbols' },
    { emoji: '👋🏼', name: '挥手中浅', category: 'symbols' },
    { emoji: '👋🏽', name: '挥手中', category: 'symbols' },
    { emoji: '👋🏾', name: '挥手中深', category: 'symbols' },
    { emoji: '👋🏿', name: '挥手深', category: 'symbols' },
    { emoji: '🔥', name: '火', category: 'symbols' },
    { emoji: '💯', name: '100', category: 'symbols' },
    { emoji: '✅', name: '对勾', category: 'symbols' },
    { emoji: '❌', name: '叉', category: 'symbols' },
    { emoji: '❎', name: '叉按钮', category: 'symbols' },
    { emoji: '➕', name: '加号', category: 'symbols' },
    { emoji: '➖', name: '减号', category: 'symbols' },
    { emoji: '➗', name: '除号', category: 'symbols' },
    { emoji: '✖️', name: '乘号', category: 'symbols' },
    { emoji: '♾️', name: '无穷', category: 'symbols' },
    { emoji: '💲', name: '美元', category: 'symbols' },
    { emoji: '💱', name: '汇率', category: 'symbols' },
    { emoji: '™️', name: '商标', category: 'symbols' },
    { emoji: '©️', name: '版权', category: 'symbols' },
    { emoji: '®️', name: '注册', category: 'symbols' },
    { emoji: '〰️', name: '波浪', category: 'symbols' },
    { emoji: '➰', name: '卷曲环', category: 'symbols' },
    { emoji: '➿', name: '双卷曲环', category: 'symbols' },
    { emoji: '🔚', name: '结束', category: 'symbols' },
    { emoji: '🔙', name: '返回', category: 'symbols' },
    { emoji: '🔛', name: '开启', category: 'symbols' },
    { emoji: '🔝', name: '顶部', category: 'symbols' },
    { emoji: '🔜', name: '即将', category: 'symbols' }
  ];

  // 分类配置
  const categories = [
    { id: 'smileys', name: '笑脸', icon: Smile },
    { id: 'hearts', name: '爱心', icon: Heart },
    { id: 'gestures', name: '手势', icon: Hand },
    { id: 'objects', name: '物品', icon: Gift },
    { id: 'symbols', name: '符号', icon: Star }
  ] as const;

  // 过滤表情符号
  const filteredEmojis = emojiData.filter(emoji => {
    const matchesCategory = emoji.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emoji.emoji.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose?.();
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80 ${className}`}>
      {/* 搜索框 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="搜索表情..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* 分类标签 */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-pink-100 text-pink-700 border border-pink-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="w-3 h-3" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* 表情符号网格 */}
      <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
        {filteredEmojis.map((emoji, index) => (
          <button
            key={`${emoji.emoji}-${index}`}
            onClick={() => handleEmojiClick(emoji.emoji)}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
            title={emoji.name}
          >
            {emoji.emoji}
          </button>
        ))}
      </div>

      {/* 空状态 */}
      {filteredEmojis.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-2xl mb-2">🔍</div>
          <p className="text-sm">没有找到相关表情</p>
        </div>
      )}

      {/* 常用表情快捷栏 */}
      {searchTerm === '' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">常用表情</div>
          <div className="flex gap-2">
            {['❤️', '😍', '😘', '🥰', '😊', '😂', '🤗', '👍'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;