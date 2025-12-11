import React from 'react';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  expanded?: boolean;
  subItems?: SidebarItem[];
}

export interface Role {
  id: string;
  name: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface Indicator {
  id: string;
  name: string;
  scheme: string; // Application Scheme
  readPermission: boolean;
  fillPermission: boolean;
  displayEntry: boolean;
  children?: Indicator[];
  tag?: 'sub' | 'main';
}

export interface Plan {
  id: string;
  name: string;
  indicatorCount: number;
  remark: string;
  status: 'enabled' | 'disabled';
  application?: string;
}

export enum TabType {
  INDICATOR_PERMISSION = 'INDICATOR_PERMISSION',
  PERSONNEL = 'PERSONNEL',
}