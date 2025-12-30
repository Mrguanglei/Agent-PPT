import React from 'react';
import { Sparkles, Zap, Image, BarChart } from 'lucide-react';

interface WelcomePromptProps {
  onSend: (message: string) => void;
}

export const WelcomePrompt: React.FC<WelcomePromptProps> = ({ onSend }) => {
  const suggestions = [
    {
      icon: Sparkles,
      title: '商务演讲',
      description: '创建一个关于AI技术的商务演讲PPT',
      prompt: '帮我创建一个关于人工智能发展趋势的商务演讲PPT，需要8页，使用现代科技风格'
    },
    {
      icon: Zap,
      title: '产品介绍',
      description: '制作产品发布会的演示文稿',
      prompt: '创建一个产品发布会PPT，介绍我们的新款智能手表，包含功能特点和市场定位'
    },
    {
      icon: Image,
      title: '教育培训',
      description: '设计一套培训课程的幻灯片',
      prompt: '制作一个关于Python编程入门的培训PPT，面向初学者，需要10页'
    },
    {
      icon: BarChart,
      title: '数据报告',
      description: '生成数据分析报告演示',
      prompt: '创建一个季度数据分析报告PPT，包含销售数据、用户增长和市场分析'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Logo和标题 */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PPT Agent
        </h1>
        <p className="text-gray-500">
          告诉我你的想法，我将为你生成专业的演示文稿
        </p>
      </div>

      {/* 建议卡片网格 */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <button
              key={index}
              onClick={() => onSend(suggestion.prompt)}
              className="group p-5 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
