import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Database, Shield, Settings } from 'lucide-react';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'pending';
  message: string;
  solution?: string;
}

interface FirebaseDiagnosticProps {
  onClose?: () => void;
}

const FirebaseDiagnostic: React.FC<FirebaseDiagnosticProps> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [coupleId, setCoupleId] = useState<string | null>(null);

  useEffect(() => {
    // 监听认证状态变化
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // 获取用户的coupleId
    const fetchCoupleId = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCoupleId(userDoc.data().coupleId || null);
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      }
    };
    fetchCoupleId();
  }, [user]);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    const newResults: DiagnosticResult[] = [];

    // 1. 检查 Firebase 连接
    try {
      // 尝试读取一个简单的集合来测试连接
      await getDoc(doc(db, 'test', 'connection'));
      newResults.push({
        test: 'Firebase 连接',
        status: 'success',
        message: 'Firebase 连接正常'
      });
    } catch (error: any) {
      newResults.push({
        test: 'Firebase 连接',
        status: 'error',
        message: `Firebase 连接失败: ${error.message}`,
        solution: '请检查 Firebase 配置和网络连接。确保 .env 文件中的 Firebase 配置正确。'
      });
    }

    // 2. 检查用户认证
    if (user) {
      newResults.push({
        test: '用户认证',
        status: 'success',
        message: `用户已登录: ${user.email}`
      });
      
      // 3. 检查用户文档访问
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          newResults.push({
            test: '用户文档访问',
            status: 'success',
            message: '用户文档访问正常'
          });
        } else {
          newResults.push({
            test: '用户文档访问',
            status: 'warning',
            message: '用户文档不存在',
            solution: '用户文档将在首次使用时自动创建'
          });
        }
      } catch (error: any) {
        newResults.push({
          test: '用户文档访问',
          status: 'error',
          message: `用户文档访问失败: ${error.message}`,
          solution: '检查 Firestore 规则中的用户文档权限设置'
        });
      }
    } else {
      newResults.push({
        test: '用户认证',
        status: 'error',
        message: '用户未登录',
        solution: '请先登录后再使用纪念日功能'
      });
    }

    // 4. CoupleId检查
    if (coupleId) {
      newResults.push({
        test: 'CoupleId配置',
        status: 'success',
        message: `CoupleId: ${coupleId}`
      });
      
      // 5. 情侣档案访问权限检查
      try {
        const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
        if (coupleDoc.exists()) {
          const coupleData = coupleDoc.data();
          const isUserInCouple = user && (
            coupleData.user1Id === user.uid || 
            coupleData.user2Id === user.uid
          );
          
          if (isUserInCouple) {
            newResults.push({
              test: '情侣档案权限',
              status: 'success',
              message: '用户有权限访问情侣档案'
            });
          } else {
            newResults.push({
              test: '情侣档案权限',
              status: 'error',
              message: '用户不在情侣档案的成员列表中',
              solution: '检查情侣档案的user1Id和user2Id字段是否包含当前用户ID'
            });
          }
        } else {
          newResults.push({
            test: '情侣档案权限',
            status: 'error',
            message: '情侣档案不存在',
            solution: '需要先创建情侣档案或检查coupleId是否正确'
          });
        }
      } catch (error: any) {
        newResults.push({
          test: '情侣档案权限',
          status: 'error',
          message: `情侣档案访问失败: ${error.message}`,
          solution: '检查Firestore安全规则中couples集合的读取权限'
        });
      }
    } else {
      newResults.push({
        test: 'CoupleId配置',
        status: 'error',
        message: 'CoupleId未配置',
        solution: '需要先创建情侣档案，系统会自动在用户文档中设置coupleId字段'
      });
    }

    // 6. 纪念日集合访问（基本读取）
    if (coupleId) {
      try {
        const testQuery = query(
          collection(db, 'anniversaries'),
          where('coupleId', '==', coupleId)
        );
        await getDocs(testQuery);
        newResults.push({
          test: '纪念日集合基本访问',
          status: 'success',
          message: '纪念日集合基本访问正常'
        });
      } catch (error: any) {
        let solution = '检查Firestore安全规则中anniversaries集合的读取权限';
        if (error.code === 'permission-denied') {
          solution = '权限被拒绝：确保Firestore安全规则允许已认证用户访问anniversaries集合，并且规则中的字段名称与代码中使用的字段名称一致（user1Id/user2Id）';
        }
        newResults.push({
          test: '纪念日集合基本访问',
          status: 'error',
          message: `纪念日集合访问失败: ${error.message}`,
          solution
        });
      }
    }

    // 7. 纪念日复合查询（where + orderBy）
    if (coupleId) {
      try {
        const complexQuery = query(
          collection(db, 'anniversaries'),
          where('coupleId', '==', coupleId),
          orderBy('date', 'asc')
        );
        await getDocs(complexQuery);
        newResults.push({
          test: '纪念日复合查询',
          status: 'success',
          message: '纪念日复合查询正常（索引已配置）'
        });
      } catch (error: any) {
        const errorMessage = error.toString();
        let solution = '检查Firestore安全规则和索引配置';
        
        if (errorMessage.includes('index') || error.code === 'failed-precondition') {
          solution = '缺少复合索引：在Firebase控制台 > Firestore > 索引中创建复合索引：集合ID=anniversaries，字段=coupleId(升序)+date(升序)。或运行命令：firebase deploy --only firestore:indexes';
        } else if (error.code === 'permission-denied') {
          solution = '权限被拒绝：确保Firestore安全规则已正确部署，并且规则允许当前用户访问anniversaries集合';
        }
        
        newResults.push({
          test: '纪念日复合查询',
          status: 'error',
          message: `复合查询失败: ${error.message}`,
          solution
        });
      }
    }

    // 8. 安全规则部署状态检查
    try {
      // 通过尝试访问不同集合来推断安全规则状态
      const testResults = await Promise.allSettled([
        getDoc(doc(db, 'users', user?.uid || 'test')),
        coupleId ? getDoc(doc(db, 'couples', coupleId)) : Promise.resolve(null),
        coupleId ? getDocs(query(collection(db, 'anniversaries'), where('coupleId', '==', coupleId))) : Promise.resolve(null)
      ]);
      
      const hasPermissionErrors = testResults.some(result => 
        result.status === 'rejected' && 
        (result.reason?.code === 'permission-denied')
      );
      
      if (hasPermissionErrors) {
        newResults.push({
          test: '安全规则部署状态',
          status: 'error',
          message: '检测到权限错误，可能是安全规则未正确部署',
          solution: '运行命令部署安全规则：firebase deploy --only firestore:rules。确保firestore.rules文件中的字段名称使用user1Id和user2Id而不是memberIds'
        });
      } else {
        newResults.push({
          test: '安全规则部署状态',
          status: 'success',
          message: '安全规则部署正常'
        });
      }
    } catch (error: any) {
      newResults.push({
        test: '安全规则部署状态',
        status: 'warning',
        message: '无法确定安全规则状态',
        solution: '如果遇到权限问题，请确保已部署最新的安全规则'
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'pending':
        return <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">Firebase 诊断工具</h2>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
          <p className="text-gray-600 mt-2">
            检测Firebase配置、权限和索引问题
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {results.length > 0 && (
                <span>
                  完成 {results.filter(r => r.status !== 'pending').length} / {results.length} 项检查
                </span>
              )}
            </div>
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? '检查中...' : '开始诊断'}</span>
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{result.test}</h3>
                      <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      {result.solution && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                          <div className="flex items-start space-x-2">
                            <Settings className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">解决方案:</p>
                              <p className="text-sm text-blue-700">{result.solution}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && !isRunning && (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">点击"开始诊断"来检查Firebase配置</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <h4 className="font-medium mb-2">常见问题解决方案:</h4>
            <ul className="space-y-1 text-xs">
              <li>• <strong>复合索引:</strong> 在Firebase控制台 &gt; Firestore &gt; 索引中创建</li>
              <li>• <strong>安全规则:</strong> 确保anniversaries集合允许已认证用户读写</li>
              <li>• <strong>CoupleId:</strong> 确保用户文档包含coupleId字段</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDiagnostic;