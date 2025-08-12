import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
  Timestamp,
  arrayUnion,
  arrayRemove,
  getDocs,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { Message, MessageReaction } from '../types';

const MESSAGES_COLLECTION = 'messages';

export class ChatService {
  /**
   * 发送消息
   */
  static async sendMessage(
    coupleId: string,
    senderId: string,
    senderName: string,
    content: string,
    type: Message['type'] = 'text',
    senderAvatar?: string,
    replyTo?: string
  ): Promise<string> {
    try {
      const messageData = {
        coupleId,
        senderId,
        senderName,
        senderAvatar: senderAvatar || '',
        content,
        type,
        timestamp: serverTimestamp(),
        isRead: false,
        replyTo: replyTo || null,
        reactions: [],
        isEdited: false
      };

      const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('发送消息失败');
    }
  }

  /**
   * 获取聊天消息（分页）
   */
  static async getMessages(
    coupleId: string,
    limitCount: number = 50
  ): Promise<Message[]> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('coupleId', '==', coupleId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp as Timestamp
        } as Message);
      });

      return messages.reverse(); // 按时间正序返回
    } catch (error) {
      console.error('Error getting messages:', error);
      throw new Error('获取消息失败');
    }
  }

  /**
   * 实时监听消息
   */
  static subscribeToMessages(
    coupleId: string,
    callback: (messages: Message[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('coupleId', '==', coupleId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const messages: Message[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
              id: doc.id,
              ...data,
              timestamp: data.timestamp as Timestamp
            } as Message);
          });
          callback(messages);
        },
        (error) => {
          console.error('Error listening to messages:', error);
          if (onError) {
            onError(new Error('实时消息监听失败'));
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up message listener:', error);
      if (onError) {
        onError(new Error('设置消息监听失败'));
      }
      return () => {};
    }
  }

  /**
   * 标记消息为已读
   */
  static async markAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, {
        isRead: true
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('标记消息已读失败');
    }
  }

  /**
   * 批量标记消息为已读
   */
  static async markMultipleAsRead(messageIds: string[]): Promise<void> {
    try {
      const promises = messageIds.map(id => 
        updateDoc(doc(db, MESSAGES_COLLECTION, id), { isRead: true })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking multiple messages as read:', error);
      throw new Error('批量标记消息已读失败');
    }
  }

  /**
   * 添加消息反应
   */
  static async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      const reaction: MessageReaction = {
        emoji,
        userId,
        timestamp: serverTimestamp() as Timestamp
      };

      await updateDoc(messageRef, {
        reactions: arrayUnion(reaction)
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw new Error('添加表情反应失败');
    }
  }

  /**
   * 移除消息反应
   */
  static async removeReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      
      // 需要先获取当前的 reactions 数组，找到要删除的反应
      const messageDoc = await getDocs(
        query(collection(db, MESSAGES_COLLECTION), where('__name__', '==', messageId))
      );
      
      if (!messageDoc.empty) {
        const messageData = messageDoc.docs[0].data();
        const reactions = messageData.reactions || [];
        const updatedReactions = reactions.filter(
          (reaction: MessageReaction) => 
            !(reaction.userId === userId && reaction.emoji === emoji)
        );

        await updateDoc(messageRef, {
          reactions: updatedReactions
        });
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw new Error('移除表情反应失败');
    }
  }

  /**
   * 编辑消息
   */
  static async editMessage(
    messageId: string,
    newContent: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await updateDoc(messageRef, {
        content: newContent,
        isEdited: true,
        editedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error editing message:', error);
      throw new Error('编辑消息失败');
    }
  }

  /**
   * 删除消息
   */
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('删除消息失败');
    }
  }

  /**
   * 获取未读消息数量
   */
  static async getUnreadCount(
    coupleId: string,
    userId: string
  ): Promise<number> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('coupleId', '==', coupleId),
        where('senderId', '!=', userId),
        where('isRead', '==', false)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * 搜索消息
   */
  static async searchMessages(
    coupleId: string,
    searchTerm: string,
    limitCount: number = 20
  ): Promise<Message[]> {
    try {
      // 注意：Firestore 不支持全文搜索，这里只是简单的前缀匹配
      // 在实际应用中，可能需要使用 Algolia 或其他搜索服务
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('coupleId', '==', coupleId),
        where('content', '>=', searchTerm),
        where('content', '<=', searchTerm + '\uf8ff'),
        orderBy('content'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp as Timestamp
        } as Message);
      });

      return messages;
    } catch (error) {
      console.error('Error searching messages:', error);
      throw new Error('搜索消息失败');
    }
  }
}

export default ChatService;