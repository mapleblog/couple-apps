import React, { useState, useEffect } from 'react';
import { auth, storage, db } from '../services/firebase';
import { ref, getDownloadURL, listAll } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

interface DiagnosticResult {
  category: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const FirebaseDebugTool: React.FC = () => {
  const [user] = useAuthState(auth);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // 1. 检查环境变量
    addResult({
      category: '环境变量',
      status: import.meta.env.VITE_FIREBASE_API_KEY ? 'success' : 'error',
      message: `API Key: ${import.meta.env.VITE_FIREBASE_API_KEY ? '已配置' : '未配置'}`,
      details: import.meta.env.VITE_FIREBASE_API_KEY ? '✓' : '请检查.env文件中的VITE_FIREBASE_API_KEY'
    });

    addResult({
      category: '环境变量',
      status: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'success' : 'error',
      message: `Project ID: ${import.meta.env.VITE_FIREBASE_PROJECT_ID || '未配置'}`,
      details: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓' : '请检查.env文件中的VITE_FIREBASE_PROJECT_ID'
    });

    addResult({
      category: '环境变量',
      status: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'success' : 'error',
      message: `Storage Bucket: ${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '未配置'}`,
      details: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✓' : '请检查.env文件中的VITE_FIREBASE_STORAGE_BUCKET'
    });

    // 2. 检查用户认证状态
    addResult({
      category: '用户认证',
      status: user ? 'success' : 'error',
      message: user ? `已登录: ${user.email}` : '用户未登录',
      details: user ? `UID: ${user.uid}` : '请先登录后再访问照片'
    });

    if (user) {
      // 3. 检查用户token
      try {
        const token = await user.getIdToken();
        addResult({
          category: '认证Token',
          status: 'success',
          message: 'Token获取成功',
          details: `Token长度: ${token.length}`
        });
      } catch (error) {
        addResult({
          category: '认证Token',
          status: 'error',
          message: 'Token获取失败',
          details: error instanceof Error ? error.message : '未知错误'
        });
      }

      // 4. 检查用户的couple信息
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const coupleId = userData.coupleId;
          addResult({
            category: 'Couple信息',
            status: coupleId ? 'success' : 'warning',
            message: coupleId ? `Couple ID: ${coupleId}` : '用户未加入couple',
            details: coupleId ? '✓' : '需要先创建或加入couple才能访问照片'
          });

          // 5. 测试Storage访问
          if (coupleId) {
            try {
              const photosRef = ref(storage, `photos/${coupleId}`);
              const photosList = await listAll(photosRef);
              addResult({
                category: 'Storage访问',
                status: 'success',
                message: `成功访问Storage，找到${photosList.items.length}个文件`,
                details: `路径: photos/${coupleId}`
              });

              // 6. 测试具体照片URL
              if (photosList.items.length > 0) {
                try {
                  const firstPhoto = photosList.items[0];
                  const downloadURL = await getDownloadURL(firstPhoto);
                  addResult({
                    category: 'URL生成',
                    status: 'success',
                    message: '照片URL生成成功',
                    details: downloadURL
                  });

                  // 测试图片是否可访问
                  const img = new Image();
                  img.onload = () => {
                    addResult({
                      category: '图片加载',
                      status: 'success',
                      message: '图片加载成功',
                      details: `尺寸: ${img.width}x${img.height}`
                    });
                  };
                  img.onerror = () => {
                    addResult({
                      category: '图片加载',
                      status: 'error',
                      message: '图片加载失败',
                      details: '可能是CORS问题或权限问题'
                    });
                  };
                  img.src = downloadURL;
                } catch (error) {
                  addResult({
                    category: 'URL生成',
                    status: 'error',
                    message: 'URL生成失败',
                    details: error instanceof Error ? error.message : '未知错误'
                  });
                }
              }
            } catch (error) {
              addResult({
                category: 'Storage访问',
                status: 'error',
                message: 'Storage访问失败',
                details: error instanceof Error ? error.message : '未知错误'
              });
            }
          }
        } else {
          addResult({
            category: 'Couple信息',
            status: 'error',
            message: '用户文档不存在',
            details: '请检查用户是否正确创建'
          });
        }
      } catch (error) {
        addResult({
          category: 'Couple信息',
          status: 'error',
          message: 'Firestore访问失败',
          details: error instanceof Error ? error.message : '未知错误'
        });
      }
    }

    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return '?';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Firebase 诊断工具</h2>
        
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mb-6"
        >
          {isRunning ? '诊断中...' : '开始诊断'}
        </button>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">诊断结果:</h3>
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)}
                  </span>
                  <span className="font-medium">{result.category}</span>
                  <span className={getStatusColor(result.status)}>
                    {result.message}
                  </span>
                </div>
                {result.details && (
                  <div className="text-sm text-gray-600 ml-6">
                    {result.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">常见问题解决方案:</h4>
          <ul className="text-sm space-y-1">
            <li>• 如果环境变量未配置，请创建.env文件并添加Firebase配置</li>
            <li>• 如果用户未登录，请先登录后再访问照片</li>
            <li>• 如果Storage访问失败，请检查Firebase Storage规则</li>
            <li>• 如果图片加载失败，可能是CORS或权限问题</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebugTool;