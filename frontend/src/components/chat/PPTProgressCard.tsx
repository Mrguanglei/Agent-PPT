'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface ExecutionStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details?: string;
}

interface PPTProgressCardProps {
  steps: ExecutionStep[];
  title?: string;
  isExpanded?: boolean;
}

export function PPTProgressCard({ 
  steps, 
  title = '任务执行规划',
  isExpanded: defaultExpanded = true 
}: PPTProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalCount = steps.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-4"
    >
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{title}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                已完成 {completedCount} / {totalCount} 步骤
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted/30">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-5 space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-3"
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0 pt-1">
                      {step.status === 'completed' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        </motion.div>
                      )}
                      {step.status === 'running' && (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-4 h-4 text-primary" />
                          </motion.div>
                        </div>
                      )}
                      {step.status === 'failed' && (
                        <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        </div>
                      )}
                      {step.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                          <Circle className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className={cn(
                          "text-sm font-bold",
                          step.status === 'completed' ? 'text-success' :
                          step.status === 'running' ? 'text-primary' :
                          step.status === 'failed' ? 'text-destructive' :
                          'text-muted-foreground'
                        )}>
                          {step.title}
                        </h5>
                        {step.status === 'running' && (
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            执行中...
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {step.description}
                      </p>
                      {step.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2 p-2.5 bg-muted/20 rounded-lg border border-border/50"
                        >
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {step.details}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
