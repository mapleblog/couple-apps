import React from 'react';
import { Calendar } from 'lucide-react';
import { TodayAnniversary as TodayAnniversaryType } from '../types';

interface TodayAnniversaryProps {
  anniversaries: TodayAnniversaryType[];
}

const TodayAnniversary: React.FC<TodayAnniversaryProps> = ({ anniversaries }) => {
  if (anniversaries.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 mb-8 border border-pink-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar className="w-5 h-5 text-pink-500 mr-2" />
        今日纪念
      </h3>
      <div className="space-y-3">
        {anniversaries.map((anniversary, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
            <span className="text-gray-800 font-medium">{anniversary.title}</span>
            <span className="text-pink-500 text-sm">🎉</span>
            {anniversary.description && (
              <span className="text-gray-600 text-sm">- {anniversary.description}</span>
            )}
          </div>
        ))}
      </div>
      
      {/* 特殊纪念日效果 */}
      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
          <span className="text-pink-500 text-sm font-medium">💕</span>
          <span className="text-gray-700 text-sm">
            {anniversaries.length === 1 ? '今天是特别的日子' : `今天有 ${anniversaries.length} 个特别的日子`}
          </span>
          <span className="text-pink-500 text-sm font-medium">💕</span>
        </div>
      </div>
    </div>
  );
};

export default TodayAnniversary;