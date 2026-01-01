'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Image, FileText, Presentation, Rocket, Target, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  {
    icon: Rocket,
    title: '产品发布会 PPT',
    prompt: '帮我制作一份关于“智能家居新产品发布”的PPT，包含市场分析、核心功能和定价策略。',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: Target,
    title: '年度工作总结',
    prompt: '创建一份 2024 年度工作总结 PPT，重点展示项目成就、团队贡献以及 2025 年的规划。',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: Lightbulb,
    title: 'AI 技术科普',
    prompt: '制作一份关于“生成式 AI 发展史”的科普 PPT，需要包含关键里程碑和未来趋势。',
    color: 'bg-amber-500/10 text-amber-500',
  },
];

const MODES = [
  { id: 'research', label: '研究模式', active: false },
  { id: 'ppt', label: 'PPT模式', active: true },
  { id: 'creative', label: '创意海报', active: false },
  { id: 'app', label: '网页应用', active: false },
];

export const WelcomeScreen = React.memo(function WelcomeScreen({ onSend }: { onSend: (content: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
      {/* Logo & Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-12"
      >
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl mb-6 mx-auto">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </div>
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-3">
          😊 想和我聊聊你的 PPT 计划吗？
        </h1>
        <p className="text-muted-foreground text-lg font-medium max-w-lg mx-auto">
          我是您的 AI 演示文稿专家，告诉我想做什么，剩下的交给我。
        </p>
      </motion.div>

      {/* Mode Switcher - ChatGLM Style */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {MODES.map((mode) => (
          <Button
            key={mode.id}
            variant={mode.active ? 'default' : 'outline'}
            className={cn(
              "rounded-full px-6 h-10 font-bold transition-all",
              mode.active ? "shadow-lg shadow-primary/20" : "bg-card/50 hover:bg-muted"
            )}
          >
            {mode.label}
            {mode.active && <ChevronRight className="w-3.5 h-3.5 ml-1" />}
          </Button>
        ))}
      </motion.div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mb-12">
        {SUGGESTIONS.map((item, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -5, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
            onClick={() => onSend(item.prompt)}
            className="group p-6 rounded-[24px] text-left bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", item.color)}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
              {item.prompt}
            </p>
            <div className="flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              立即尝试 <ChevronRight className="w-3 h-3 ml-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
});
