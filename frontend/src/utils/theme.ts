/**
 * Theme configuration for PPT Agent
 */

// Color schemes matching the backend
export const COLOR_SCHEMES = {
  warm_modern_1: {
    background: '#F4F1E9',
    primary: '#15857A',
    accent: '#FF6A3B',
    name: '暖色现代',
  },
  warm_modern_2: {
    background: '#111111',
    primary: '#15857A',
    accent: '#FF6A3B',
    name: '深色暖调',
  },
  warm_modern_3: {
    background: '#111111',
    primary: '#7C3D5E',
    accent: '#FF7E5E',
    name: '紫色暖调',
  },
  cool_modern_1: {
    background: '#FEFEFE',
    primary: '#44B54B',
    accent: '#1399FF',
    name: '冷色现代',
  },
  cool_modern_2: {
    background: '#09325E',
    primary: '#FFFFFF',
    accent: '#7DE545',
    name: '深蓝冷调',
  },
  cool_modern_3: {
    background: '#FEFEFE',
    primary: '#1284BA',
    accent: '#FF862F',
    name: '蓝色冷调',
  },
  cool_modern_4: {
    background: '#FEFEFE',
    primary: '#133EFF',
    accent: '#00CD82',
    name: '科技蓝调',
  },
  dark_mineral_1: {
    background: '#162235',
    primary: '#FFFFFF',
    accent: '#37DCF2',
    name: '深色矿物',
  },
  dark_mineral_2: {
    background: '#193328',
    primary: '#FFFFFF',
    accent: '#E7E950',
    name: '绿色矿物',
  },
  soft_neutral_1: {
    background: '#F7F3E6',
    primary: '#E7F177',
    accent: '#106188',
    name: '柔和中性',
  },
  soft_neutral_2: {
    background: '#EBDCEF',
    primary: '#73593C',
    accent: '#B13DC6',
    name: '粉色中性',
  },
  soft_neutral_3: {
    background: '#8B9558',
    primary: '#262626',
    accent: '#E1DE2D',
    name: '橄榄中性',
  },
  minimalist_1: {
    background: '#F3F1ED',
    primary: '#000000',
    accent: '#D6C096',
    name: '极简主义',
  },
  minimalist_2: {
    background: '#FFFFFF',
    primary: '#000000',
    accent: '#A6C40D',
    name: '纯白极简',
  },
  minimalist_3: {
    background: '#F3F1ED',
    primary: '#393939',
    accent: '#FFFFFF',
    name: '灰色极简',
  },
  warm_retro_1: {
    background: '#F4EEEA',
    primary: '#882F1C',
    accent: '#FEE79B',
    name: '暖色复古',
  },
  warm_retro_2: {
    background: '#F4F1E9',
    primary: '#2A4A3A',
    accent: '#C89F62',
    name: '绿色复古',
  },
  warm_retro_3: {
    background: '#554737',
    primary: '#FFFFFF',
    accent: '#66D4FF',
    name: '棕色复古',
  },
};

// Font schemes
export const FONT_SCHEMES = {
  business: {
    name: '商务风格',
    chinese: 'font-family: "MiSans", sans-serif;',
    english: 'font-family: "Source Code Pro", monospace;',
    description: 'MiSans / Source Code Pro + Roboto Flex',
  },
  retro: {
    name: '复古精致',
    chinese: 'font-family: "Source Han Serif SC", serif;',
    english: 'font-family: "Spectral", serif;',
    description: 'Source Han Serif SC / Spectral + Quattrocento Sans',
  },
  vibrant: {
    name: '活力未来',
    chinese: 'font-family: "DouyinSansBold", sans-serif;',
    english: 'font-family: "BioRhyme", serif;',
    description: '抖音黑体 / BioRhyme + Archivo',
  },
};

// Layout types
export const LAYOUT_TYPES = {
  cover: [
    { id: 'minimalist-center', name: '简约居中', description: '标题和副标题垂直居中对齐' },
    { id: 'cinematic-overlay', name: '电影式叠加', description: '背景图片叠加文字' },
    { id: 'typography-accent', name: '文字主导', description: '文字为主，视觉元素为辅' },
  ],
  content: [
    { id: 'vertical-flow', name: '垂直流动', description: '文字在上，图片在下' },
    { id: 'image-left-text-right', name: '图左文右', description: '图片左侧，文字右侧' },
    { id: 'center-hero', name: '中心英雄', description: '主要内容居中突出显示' },
    { id: 'twin-columns', name: '双栏编辑', description: '左右两栏并排显示' },
    { id: 'right-rail', name: '右侧导轨', description: '主要内容，右侧辅助信息' },
    { id: 'multi-charts', name: '多图表画布', description: '集成多个图表的可视化布局' },
  ],
  chapter: [
    { id: 'zen-space', name: '禅意留白', description: '大量留白，突出主题' },
    { id: 'typography-accent', name: '文字主导', description: '文字为主，视觉元素为辅' },
    { id: 'minimalist-center', name: '简约居中', description: '标题和副标题垂直居中对齐' },
  ],
  chart: [
    { id: 'multi-charts-canvas', name: '多图表画布', description: '集成多个图表的可视化布局' },
    { id: 'floating-figures', name: '浮动数据', description: '关键数据浮动显示' },
    { id: 'hero-chart-focus', name: '图表聚焦', description: '单个图表作为焦点' },
  ],
};

// Animation configurations
export const ANIMATIONS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },
  slideIn: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.3 },
  },
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.3 },
  },
  bounceIn: {
    initial: { scale: 0.3, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
};

// Spacing and sizing utilities
export const SPACING = {
  slide: {
    width: 1280,
    height: 720,
    padding: 70, // 70px padding on all sides
    headerHeight: 85, // Title area height
  },
  grid: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
    },
    gap: {
      small: 'gap-2',
      medium: 'gap-4',
      large: 'gap-6',
    },
  },
};

// Typography scale
export const TYPOGRAPHY = {
  scale: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 30px
    '4xl': 'text-4xl',  // 36px
    '5xl': 'text-5xl',  // 48px
    '6xl': 'text-6xl',  // 60px
  },
  weight: {
    light: 'font-light',     // 300
    normal: 'font-normal',   // 400
    medium: 'font-medium',   // 500
    semibold: 'font-semibold', // 600
    bold: 'font-bold',       // 700
  },
  lineHeight: {
    tight: 'leading-tight',   // 1.25
    snug: 'leading-snug',     // 1.375
    normal: 'leading-normal', // 1.5
    relaxed: 'leading-relaxed', // 1.625
    loose: 'leading-loose',   // 2
  },
};

// Shadow utilities
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};

// Border radius utilities
export const BORDERS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

// Utility functions
export const getColorScheme = (schemeName: string) => {
  return COLOR_SCHEMES[schemeName as keyof typeof COLOR_SCHEMES] || COLOR_SCHEMES.cool_modern_1;
};

export const getFontScheme = (schemeName: string) => {
  return FONT_SCHEMES[schemeName as keyof typeof FONT_SCHEMES] || FONT_SCHEMES.business;
};

export const getLayoutOptions = (pageType: 'cover' | 'content' | 'chapter' | 'chart') => {
  return LAYOUT_TYPES[pageType] || [];
};

// Theme provider type (for future use)
export type Theme = {
  colors: typeof COLOR_SCHEMES.cool_modern_1;
  fonts: typeof FONT_SCHEMES.business;
  spacing: typeof SPACING;
  typography: typeof TYPOGRAPHY;
  animations: typeof ANIMATIONS;
};
