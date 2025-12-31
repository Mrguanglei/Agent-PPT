'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Image, FileText, Palette, BarChart3, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PPTModeGuideProps {
  onGetStarted?: () => void;
}

const FEATURES = [
  {
    icon: Zap,
    title: '智能大纲生成',
    description: '根据您的需求自动生成 PPT 大纲和结构',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Image,
    title: '自动配图',
    description: '智能搜索和匹配相关的高质量图片',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Palette,
    title: '专业设计',
    description: '应用精心设计的主题和配色方案',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: BarChart3,
    title: '数据可视化',
    description: '将数据自动转换为图表和图形',
    color: 'from-green-500 to-emerald-500',
  },
];

const QUICK_PROMPTS = [
  {
    emoji: '🚀',
    title: '产品发布会',
    prompt: '帮我制作一份关于新产品发布的 PPT，包含市场分析、核心功能和定价策略。',
  },
  {
    emoji: '📊',
    title: '数据分析报告',
    prompt: '创建一份数据分析 PPT，展示关键指标、趋势分析和业务洞察。',
  },
  {
    emoji: '🎓',
    title: '学术演讲',
    prompt: '制作一份学术演讲 PPT，需要包含研究背景、方法、结果和结论。',
  },
  {
    emoji: '💼',
    title: '商业计划书',
    prompt: '生成一份商业计划书 PPT，包含公司概况、市场机会和财务预测。',
  },
];

export function PPTModeGuide({ onGetStarted }: PPTModeGuideProps) {
  return (
    <div className="space-y-12 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-black text-foreground mb-2">PPT 模式</h2>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          让 AI 为您自动生成专业的 PPT 演示文稿
        </p>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
          >
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 bg-gradient-to-br shadow-lg group-hover:shadow-xl transition-all",
              feature.color
            )}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        <h3 className="text-lg font-bold text-foreground mb-6 text-center">工作流程</h3>
        <div className="space-y-3">
          {[
            { step: 1, title: '描述您的需求', desc: '告诉我您想要什么样的 PPT' },
            { step: 2, title: '确认细节', desc: '我会询问目标受众和设计风格' },
            { step: 3, title: '生成大纲', desc: '自动创建 PPT 结构和内容' },
            { step: 4, title: '完成设计', desc: '应用专业设计并添加图片' },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {item.step}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
              {index < 3 && (
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="max-w-3xl mx-auto"
      >
        <h3 className="text-lg font-bold text-foreground mb-6 text-center">快速开始</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {QUICK_PROMPTS.map((prompt, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => onGetStarted?.()}
              className="p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 text-left transition-all group"
            >
              <div className="text-2xl mb-2">{prompt.emoji}</div>
              <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {prompt.title}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {prompt.prompt}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center"
      >
        <Button
          onClick={onGetStarted}
          className="rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
        >
          开始创建 PPT
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="max-w-3xl mx-auto p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200"
      >
        <h4 className="font-bold text-amber-900 mb-3">💡 使用技巧</h4>
        <ul className="space-y-2 text-sm text-amber-800">
          <li>• 提供具体的主题和内容方向，AI 会生成更精准的 PPT</li>
          <li>• 可以指定目标受众（如企业高管、学生等）来优化内容</li>
          <li>• 选择合适的设计风格（科技感、商务风等）以符合您的品牌</li>
          <li>• 生成完成后可以预览、下载或进一步编辑</li>
        </ul>
      </motion.div>
    </div>
  );
}
