import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Image, MoreVertical, Phone, Video, ArrowLeft, Home } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
// import { useCoupleContext } from '../contexts/CoupleContext';
import { Message, ChatStatus } from '../types';
import { ChatService } from '../services/chatService';
import MessageBubble from '../components/MessageBubble';
import EmojiPicker from '../components/EmojiPicker';
import { useNavigate } from 'react-router-dom';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // const { couple, partner: partnerInfo } = useCoupleContext();
  const chatService = new ChatService();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatStatus, setChatStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // 模拟情侣信息
  const partner = {
    id: 'partner-id',
    name: '伴侣',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20anime%20girl%20avatar&image_size=square'
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 加载消息
  const loadMessages = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const chatMessages = await ChatService.getMessages(user.coupleId || '', 20);
      setMessages(chatMessages);
      
      // 标记消息为已读
      const unreadMessages = chatMessages.filter(msg => 
        msg.senderId !== user.uid && !msg.readBy?.includes(user.uid)
      );
      
      if (unreadMessages.length > 0) {
        await ChatService.markMultipleAsRead(
            unreadMessages.map(msg => msg.id)
          );
      }
      
      scrollToBottom();
    } catch (error) {
      console.error('加载消息失败:', error);
      console.error('加载消息失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return;
    
    try {
      setIsSending(true);
      
      const messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
        coupleId: user.coupleId || '',
        senderId: user.uid,
        senderName: user.displayName || '我',
        senderAvatar: user.photoURL,
        content: newMessage.trim(),
        type: 'text',
        timestamp: Timestamp.now(),
        isRead: false,
        status: 'sent',
        readBy: [user.uid],
        reactions: [],
        isEdited: false
      };
      
      const messageId = await ChatService.sendMessage(
        messageData.coupleId,
        messageData.senderId,
        messageData.senderName,
        messageData.content,
        messageData.type,
        messageData.senderAvatar
      );
      const sentMessage: Message = {
        ...messageData,
        id: messageId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      setLastMessageId(messageId);
      
      // 重置文本框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      scrollToBottom();
      console.log('消息发送成功');
    } catch (error) {
      console.error('发送消息失败:', error);
      console.error('发送消息失败:', error.message);
    } finally {
      setIsSending(false);
    }
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 自动调整文本框高度
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 120; // 最大高度
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  // 选择表情
  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      console.error('请选择图片文件');
      return;
    }
    
    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('图片大小不能超过5MB');
      return;
    }
    
    try {
      setIsSending(true);
      
      // 这里应该上传到云存储，暂时使用本地URL
      const imageUrl = URL.createObjectURL(file);
      
      const messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
        coupleId: user.coupleId || '',
        senderId: user.uid,
        senderName: user.displayName || '我',
        senderAvatar: user.photoURL,
        content: imageUrl,
        type: 'image',
        timestamp: Timestamp.now(),
        isRead: false,
        status: 'sent',
        readBy: [user.uid],
        reactions: [],
        isEdited: false
      };
      
      const messageId = await ChatService.sendMessage(
        messageData.coupleId,
        messageData.senderId,
        messageData.senderName,
        messageData.content,
        messageData.type,
        messageData.senderAvatar
      );
      const sentMessage: Message = {
        ...messageData,
        id: messageId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      setMessages(prev => [...prev, sentMessage]);
      setLastMessageId(messageId);
      
      scrollToBottom();
      console.log('图片发送成功');
    } catch (error) {
      console.error('发送图片失败:', error);
      console.error('发送图片失败');
    } finally {
      setIsSending(false);
      // 清空文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理消息反应
  const handleMessageReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      await ChatService.addReaction(messageId, user.uid, emoji);
      
      // 更新本地消息状态
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find(r => r.userId === user.uid);
          if (existingReaction) {
            // 如果已经有反应，更新表情
            return {
              ...msg,
              reactions: msg.reactions?.map(r => 
                r.userId === user.uid ? { ...r, emoji } : r
              ) || []
            };
          } else {
            // 添加新反应
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { userId: user.uid, emoji, timestamp: Timestamp.now() }]
            };
          }
        }
        return msg;
      }));
    } catch (error) {
      console.error('添加反应失败:', error);
      console.error('添加反应失败:', error.message);
    }
  };

  // 处理消息编辑
  const handleMessageEdit = async (messageId: string, newContent: string) => {
    if (!user) return;
    
    try {
      await ChatService.editMessage(messageId, newContent);
      
      // 更新本地消息状态
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, content: newContent, isEdited: true, editedAt: Timestamp.now() }
          : msg
      ));
      
      console.log('消息编辑成功');
    } catch (error) {
      console.error('编辑消息失败:', error);
      console.error('编辑消息失败:', error.message);
    }
  };

  // 处理消息删除
  const handleMessageDelete = async (messageId: string) => {
    if (!user) return;
    
    try {
      await ChatService.deleteMessage(messageId);
      
      // 从本地移除消息
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      console.log('消息删除成功');
    } catch (error) {
      console.error('删除消息失败:', error);
      console.error('删除消息失败:', error.message);
    }
  };

  // 点击外部关闭表情选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // 组件挂载时加载消息
  useEffect(() => {
    loadMessages();
  }, [user]);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">登录后即可开始甜蜜聊天</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            去登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* 聊天头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">返回主页</span>
            </button>
            <img
              src={partner.avatar}
              alt={partner.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className="font-semibold text-gray-800">{partner.name}</h1>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  chatStatus === 'online' ? 'bg-green-500' : 
                  chatStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <span className="text-xs text-gray-500">
                  {chatStatus === 'online' ? '在线' : 
                   chatStatus === 'away' ? '离开' : '离线'}
                </span>
                {isTyping && (
                  <span className="text-xs text-pink-500 ml-2">正在输入...</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">主页</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-3 text-gray-600">加载消息中...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">开始聊天吧</h3>
            <p className="text-gray-600">发送第一条消息，开启甜蜜对话</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={user.uid}
                isOwn={message.senderId === user.uid}
                onReaction={(messageId, emoji) => handleMessageReaction(messageId, emoji)}
                onEdit={(messageId, content) => handleMessageEdit(messageId, content)}
                onDelete={(messageId) => handleMessageDelete(messageId)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 消息输入区域 */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            {/* 图片上传按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <Image className="w-5 h-5" />
            </button>
            
            {/* 表情按钮 */}
            <div className="relative" ref={emojiPickerRef}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isSending}
                className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              {/* 表情选择器 */}
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>
            
            {/* 消息输入框 */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                onKeyPress={handleKeyPress}
                placeholder="输入消息..."
                disabled={isSending}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            
            {/* 发送按钮 */}
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              className="p-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

export default Chat;