import React from 'react';
import { LayoutDashboard, FileText, Database, Settings, BarChart, Users, ClipboardList } from 'lucide-react';
import { Indicator, Role, SidebarItem, Plan } from './types';

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    id: 'plan_mgmt',
    label: '方案管理',
    icon: <ClipboardList size={20} />,
  },
  {
    id: 'rule_mgmt',
    label: '规则管理',
    icon: <Settings size={20} />,
    expanded: false,
    subItems: [
      { id: 'rule_1', label: '基础规则', icon: null },
      { id: 'rule_2', label: '高级规则', icon: null }
    ]
  },
  {
    id: 'base_data',
    label: '基础数据',
    icon: <Database size={20} />,
    expanded: false,
    subItems: [
      { id: 'data_1', label: '科室数据', icon: null },
      { id: 'data_2', label: '人员数据', icon: null }
    ]
  },
  {
    id: 'base_config',
    label: '基础配置',
    icon: <FileText size={20} />,
  },
  {
    id: 'indicator_auth',
    label: '指标权限',
    icon: <BarChart size={20} />,
  },
];

export const ROLES: Role[] = [
  { id: 'r1', name: '医院管理平台2' },
  { id: 'r2', name: '医院管理平台' },
  { id: 'r3', name: '超级管理员(勿删)' },
  { id: 'r4', name: '消息推送角色', active: true },
];

export const INDICATORS: Indicator[] = [
  {
    id: 'g1',
    name: '资源配置与运行效率',
    scheme: '三级医院等级评审',
    readPermission: false,
    fillPermission: false,
    displayEntry: false,
    children: [
      { id: '1', name: '自定义统计方式指标 (基础指标二)', scheme: '三级医院等级评审', readPermission: false, fillPermission: false, displayEntry: false, tag: 'main' },
      { id: '2', name: '自定义统计方式指标 (手动转自动)', scheme: '三级医院等级评审', readPermission: false, fillPermission: false, displayEntry: false },
      { id: '3', name: '自定义统计方式指标 (手动转自动)', scheme: '三级医院等级评审', readPermission: true, fillPermission: false, displayEntry: true },
      { id: '4', name: '自定义统计方式指标 (复合指标一)', scheme: '三级医院等级评审', readPermission: false, fillPermission: false, displayEntry: false },
    ]
  },
  {
    id: 'g2',
    name: '医疗服务能力与医院质量安全',
    scheme: '三级医院等级评审',
    readPermission: false,
    fillPermission: false,
    displayEntry: false,
    children: [
      { id: '5', name: '自定义统计方式指标 (基础指标一)', scheme: '三级医院等级评审', readPermission: false, fillPermission: false, displayEntry: false },
      { id: '6', name: '自定义统计方式指标 (基础指标二)', scheme: '', readPermission: false, fillPermission: false, displayEntry: false, tag: 'sub' },
      { id: '7', name: '自定义统计方式指标 (基础指标三)', scheme: '', readPermission: false, fillPermission: false, displayEntry: false, tag: 'sub' },
    ]
  },
  {
    id: 'g3',
    name: '重点专业质量控制',
    scheme: '三级医院等级评审',
    readPermission: false,
    fillPermission: false,
    displayEntry: false,
    children: [
      { id: '8', name: '填报配置测试十一', scheme: '三级医院等级评审', readPermission: false, fillPermission: false, displayEntry: false },
      {
        id: '9',
        name: '填报配置测试六',
        scheme: '三级医院等级评审',
        readPermission: true,
        fillPermission: false,
        displayEntry: true,
        children: [
          { id: '10', name: '填报配置测试四', scheme: '三级医院等级评审', readPermission: true, fillPermission: false, displayEntry: true }, 
        ]
      },
    ]
  },
];

export const PLANS: Plan[] = [
  { id: 'p4', name: '三级医院等级评审', indicatorCount: 237, remark: '无', status: 'enabled', application: '三级医院等级评审' },
  { id: 'p5', name: '三级公立医院绩效考核（2022）', indicatorCount: 64, remark: '无', status: 'enabled', application: '公立医院绩效考核' },
  { id: 'p6', name: '公立医院高质量发展', indicatorCount: 2, remark: '无', status: 'enabled', application: '医疗质量管理' },
  { id: 'p8', name: '市级医院综合质量考核', indicatorCount: 1, remark: '无', status: 'enabled', application: '三级医院等级评审' },
  { id: 'p13', name: '三级医院等级评审（福建）', indicatorCount: 7, remark: '测试备注长度1234测试备注长度1234测试备注长度1234测试备注长度1234测试备注长度1234测试备注长度1234测试备注长度...', status: 'enabled', application: '三级医院等级评审' },
];