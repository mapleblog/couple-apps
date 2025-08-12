import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Heart, MoreVertical, Reply, Edit2, Trash2, Check, CheckCheck } from 'lucide-react';
import { Message, MessageReaction } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  currentUserId: string;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, emoji: string) => void;
  showAvatar?: boolean;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReaction,
  showAvatar = true,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'HH:mm', { locale: zhCN });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MM月dd日', { locale: zhCN });
  };

  const handleEditSubmit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleReaction = (emoji: string) => {
    onReaction?.(message.id, emoji);
  };

  const getReactionCount = (emoji: string) => {
    return message.reactions?.filter(r => r.emoji === emoji).length || 0;
  };

  const hasUserReacted = (emoji: string) => {
    return message.reactions?.some(r => r.emoji === emoji && r.userId === currentUserId) || false;
  };

  const uniqueReactions = Array.from(
    new Set(message.reactions?.map(r => r.emoji) || [])
  );

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group ${className}`}>
      {/* 头像 - 只在非自己的消息左侧显示 */}
      {!isOwn && showAvatar && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {message.senderName.charAt(0)}
              </span>
            )}
          </div>
        </div>
      )}

      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* 发送者名称 - 只在非自己的消息显示 */}
        {!isOwn && (
          <div className="text-xs text-gray-500 mb-1 px-1">
            {message.senderName}
          </div>
        )}

        {/* 消息气泡 */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm ${
            isOwn
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* 回复引用 */}
          {message.replyTo && (
            <div className={`text-xs mb-2 p-2 rounded-lg ${
              isOwn ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              <div className="flex items-center gap-1 mb-1">
                <Reply className="w-3 h-3" />
                <span className="font-medium">回复</span>
              </div>
              <div className="truncate opacity-75">
                {/* 这里应该显示被回复消息的内容，简化处理 */}
                原消息内容...
              </div>
            </div>
          )}

          {/* 消息内容 */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg resize-none text-gray-800"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEditSubmit}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  保存
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div>
              {message.type === 'emoji' ? (
                <span className="text-2xl">{message.content}</span>
              ) : message.type === 'image' ? (
                <img
                  src={message.content}
                  alt="聊天图片"
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
              
              {/* 编辑标识 */}
              {message.isEdited && (
                <span className={`text-xs opacity-60 ml-2 ${
                  isOwn ? 'text-white' : 'text-gray-500'
                }`}>
                  (已编辑)
                </span>
              )}
            </div>
          )}

          {/* 消息状态 - 只在自己的消息显示 */}
          {isOwn && (
            <div className="flex items-center justify-end mt-1">
              {message.isRead ? (
                <CheckCheck className="w-3 h-3 text-white/80" />
              ) : (
                <Check className="w-3 h-3 text-white/60" />
              )}
            </div>
          )}

          {/* 操作按钮 */}
          {showActions && !isEditing && (
            <div className={`absolute top-0 ${
              isOwn ? '-left-10' : '-right-10'
            } flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
              <button
                onClick={() => handleReaction('❤️')}
                className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                title="添加爱心"
              >
                <Heart className="w-3 h-3 text-red-500" />
              </button>
              
              {onReply && (
                <button
                  onClick={() => onReply(message.id)}
                  className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                  title="回复"
                >
                  <Reply className="w-3 h-3 text-gray-600" />
                </button>
              )}
              
              {isOwn && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-3 h-3 text-gray-600" />
                </button>
              )}
              
              {isOwn && onDelete && (
                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 消息反应 */}
        {uniqueReactions.length > 0 && (
          <div className="flex gap-1 mt-1 px-1">
            {uniqueReactions.map((emoji) => {
              const count = getReactionCount(emoji);
              const userReacted = hasUserReacted(emoji);
              
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    userReacted
                      ? 'bg-pink-100 border border-pink-300 text-pink-700'
                      : 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{emoji}</span>
                  {count > 1 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* 时间戳 */}
        <div className={`text-xs text-gray-400 mt-1 px-1 ${
          isOwn ? 'text-right' : 'text-left'
        }`}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {/* 头像 - 只在自己的消息右侧显示 */}
      {isOwn && showAvatar && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-sm font-medium">
                {message.senderName.charAt(0)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;