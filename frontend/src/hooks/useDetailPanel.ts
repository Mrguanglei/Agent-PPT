import { useState, useCallback } from 'react';

interface ToolDetail {
  tool: string;
  params?: any;
  result?: any;
  duration?: number;
}

interface DetailPanelState {
  isOpen: boolean;
  toolDetail: ToolDetail | null;
}

export const useDetailPanel = () => {
  const [state, setState] = useState<DetailPanelState>({
    isOpen: false,
    toolDetail: null
  });

  const openPanel = useCallback((toolDetail: ToolDetail) => {
    setState({
      isOpen: true,
      toolDetail
    });
  }, []);

  const closePanel = useCallback(() => {
    setState({
      isOpen: false,
      toolDetail: null
    });
  }, []);

  return {
    ...state,
    openPanel,
    closePanel
  };
};
