'use client';

import React from 'react';

export const WidePanelLeft = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 28 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* 拉宽的PanelLeft路径 - 右侧区域更宽 */}
    <rect width="22" height="18" x="3" y="3" rx="2" ry="2" />
    <line x1="9" x2="9" y1="5" y2="19" />
  </svg>
);
