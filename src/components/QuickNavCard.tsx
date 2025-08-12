import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface QuickNavCardProps {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  onClick?: (path: string) => void;
}

const QuickNavCard: React.FC<QuickNavCardProps> = ({
  id,
  title,
  description,
  icon: IconComponent,
  path,
  color,
  onClick
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick(path);
    } else {
      // 使用React Router进行路由跳转
      navigate(path);
    }
  };

  return (
    <button
      className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 group w-full"
      onClick={handleClick}
    >
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      <h4 className="font-medium text-gray-800 text-sm mb-1">{title}</h4>
      <p className="text-gray-600 text-xs">{description}</p>
    </button>
  );
};

export default QuickNavCard;