'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Globe, FileText, Image as ImageIcon, 
  Layout, CheckCircle2, Loader2, ChevronRight, 
  ChevronDown, Terminal, MessageSquare, Zap
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface LogStep {
  id: string;
  type: 'thought' | 'tool_call' | 'tool_result' | 'system';
  title: string;
  content: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  subSteps?: { title: string; status: 'completed' | 'running' | 'pending' }[];
}

interface ExecutionLogProps {
  logs: LogStep[];
}

export function ExecutionLog({ logs }: ExecutionLogProps) {
  return (
    <div className="flex flex-col gap-6 py-4">
      {logs.map((log, index) => (
        <LogItem key={log.id} log={log} isLast={index === logs.length - 1} />
      ))}
    </div>
  );
}

function LogItem({ log, isLast }: { log: LogStep; isLast: boolean }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getIcon = () => {
    switch (log.type) {
      case 'thought': return <MessageSquare className="w-4 h-4" />;
      case 'tool_call': return <Zap className="w-4 h-4" />;
      case 'system': return <Terminal className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = () => {
    if (log.status === 'running') return <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />;
    if (log.status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    return null;
  };

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-[-24px] w-px bg-border/50" />
      )}

      {/* Icon Node */}
      <div className={cn(
        "z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-all",
        log.status === 'running' ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_10px_rgba(var(--primary),0.2)]" :
        log.status === 'completed' ? "bg-success/10 border-success/30 text-success" :
        "bg-muted border-border text-muted-foreground"
      )}>
        {getIcon()}
      </div>

      {/* Content Card */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground opacity-60">
              {log.timestamp}
            </span>
            <h4 className={cn(
              "text-sm font-bold truncate",
              log.status === 'running' ? "text-primary" : "text-foreground"
            )}>
              {log.title}
            </h4>
            {getStatusIcon()}
          </div>
          {log.subSteps && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        <div className={cn(
          "text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap",
          log.type === 'thought' ? "italic font-serif pl-2 border-l-2 border-primary/20" : ""
        )}>
          {log.content}
        </div>

        {/* Sub Steps - ChatGLM 风格的分步展示 */}
        <AnimatePresence>
          {isExpanded && log.subSteps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              {log.subSteps.map((sub, i) => (
                <div key={i} className="flex items-center gap-3 pl-2 py-1.5 rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    sub.status === 'completed' ? "bg-success" :
                    sub.status === 'running' ? "bg-primary animate-pulse" :
                    "bg-muted-foreground/30"
                  )} />
                  <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                    {sub.title}
                  </span>
                  {sub.status === 'running' && (
                    <span className="text-[9px] font-bold text-primary uppercase tracking-tighter">
                      Running
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
