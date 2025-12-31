'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, Info, ListChecks, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { InteractionCard as InteractionCardType } from '@/types/message';

interface InteractionCardProps {
  card: InteractionCardType;
  onConfirm?: (data: any) => void;
}

export function InteractionCard({ card, onConfirm }: InteractionCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [countdown, setCountdown] = useState(card.countdown || 0);

  useEffect(() => {
    if (card.status === 'auto_confirming' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [card.status, countdown]);

  const isRequirement = card.type === 'requirement_confirm';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl my-4"
    >
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {isRequirement ? <Sparkles className="w-4.5 h-4.5" /> : <ListChecks className="w-4.5 h-4.5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">{card.title}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                {card.status === 'confirmed' ? (
                  <span className="text-[10px] font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 已确认
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {card.status === 'auto_confirming' ? `${countdown}s 后自动确认` : '待确认'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
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
              <div className="p-5 space-y-5">
                {isRequirement ? (
                  <RequirementContent data={card.data} confirmed={card.status === 'confirmed'} />
                ) : (
                  <PlanContent data={card.data} />
                )}

                {card.status !== 'confirmed' && (
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" size="sm" className="rounded-xl px-5">
                      添加补充
                    </Button>
                    <Button size="sm" className="rounded-xl px-6 shadow-md" onClick={() => onConfirm?.(card.data)}>
                      继续任务
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function RequirementContent({ data, confirmed }: { data: any; confirmed: boolean }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">为了保证生成质量，我需要向您确认更多需求细节：</p>
      
      <div className="space-y-3">
        <div>
          <h5 className="text-[11px] font-bold text-foreground/70 mb-2 uppercase tracking-wider">目标受众</h5>
          <div className="flex flex-wrap gap-2">
            {['企业高管', '技术开发者', '学术研究者', '普通公众', '投资者'].map((item) => (
              <Badge
                key={item}
                variant={data.audience === item ? 'default' : 'outline'}
                className={cn(
                  "px-3 py-1 rounded-lg cursor-pointer transition-all",
                  data.audience === item ? "shadow-sm" : "hover:bg-muted"
                )}
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-[11px] font-bold text-foreground/70 mb-2 uppercase tracking-wider">视觉风格</h5>
          <div className="flex flex-wrap gap-2">
            {['科技感', '专业商务', '简约清新', '创意活泼', '学术严谨'].map((item) => (
              <Badge
                key={item}
                variant={data.style === item ? 'default' : 'outline'}
                className={cn(
                  "px-3 py-1 rounded-lg cursor-pointer transition-all",
                  data.style === item ? "shadow-sm" : "hover:bg-muted"
                )}
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanContent({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">基于您的需求，我为您生成了一份任务规划，请查看并确认：</p>
      
      <div className="space-y-4 bg-muted/30 rounded-xl p-4 border border-border/50">
        <section>
          <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
            <div className="w-1 h-3 bg-primary rounded-full" /> 核心需求
          </h5>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.core_need}</p>
        </section>

        <section>
          <h5 className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
            <div className="w-1 h-3 bg-primary rounded-full" /> 细节规划
          </h5>
          <ul className="space-y-1.5">
            {data.details?.map((detail: string, i: number) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-primary font-bold">•</span>
                {detail}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
