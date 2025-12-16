import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, Settings, Eye, Search, 
  ChevronRight, ChevronDown, Type, List, AlignLeft, AlignCenter, AlignRight,
  Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Table as TableIcon, 
  Trash2, Info, X, Minus, Plus, BarChart as BarChartIcon,
  Wand2, Undo, Redo,
  LayoutGrid, ArrowDownToLine, ArrowRightToLine, Columns, Rows, Merge, Split
} from 'lucide-react';
import { PLANS } from '../constants';

// TipTap Imports
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Node, mergeAttributes } from '@tiptap/core';

// Individual Extensions
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';

// Table Extensions
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

interface ReportEditorProps {
  onBack: () => void;
}

interface ChartSettings {
  title: string;
  periods: number;
}

// ----------------------------------------------------------------------
// 0. DATA TAG EXTENSION (Custom Node for [Value])
// ----------------------------------------------------------------------

const DataTagComponent = ({ node }: any) => {
  return (
    <NodeViewWrapper as="span" className="inline-block align-middle">
      <span className="inline-block rounded px-1.5 py-0.5 text-sm font-medium text-blue-600 border border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-default select-none">
        {node.attrs.label}
      </span>
    </NodeViewWrapper>
  );
};

const DataTag = Node.create({
  name: 'dataTag',
  group: 'inline',
  inline: true,
  atom: true, // Treated as a single unit, cursor cannot go inside

  addAttributes() {
    return {
      label: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="data-tag"]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          return { label: (dom as HTMLElement).textContent };
        }
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 
        'data-type': 'data-tag',
        class: 'inline-block rounded px-1.5 py-0.5 text-sm font-medium text-blue-600 border border-transparent hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-default select-none align-middle' 
      }),
      node.attrs.label
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(DataTagComponent);
  },
});

// ----------------------------------------------------------------------
// 1. CHART COMPONENT (Node View) - Kept custom for Charts
// ----------------------------------------------------------------------

const ChartComponent = (props: any) => {
  const settings: ChartSettings = props.node.attrs.settings;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mock Data Logic
  const generateData = (periods: number) => {
    const fullData = [
       { label: ['2023年', '三季度'], value: 45 },
       { label: ['2023年', '四季度'], value: 50 },
       { label: ['2024年', '一季度'], value: 55 },
       { label: ['2024年', '二季度'], value: 40 },
       { label: ['2024年', '三季度'], value: 62 },
       { label: ['2024年', '四季度'], value: 5 },
       { label: ['2025年', '一季度'], value: 38 },
       { label: ['2025年', '二季度'], value: 90 },
       { label: ['2025年', '三季度'], value: 61 },
    ];
    return fullData.slice(Math.max(0, fullData.length - periods));
  };

  const data = generateData(settings.periods);
  const maxValue = 100;
  const height = 350;
  const width = 600;
  const padding = { top: 40, right: 20, bottom: 60, left: 40 };
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;
  const barWidth = Math.min(40, chartWidth / data.length * 0.6); 
  const step = data.length > 0 ? chartWidth / data.length : 0;

  const updateSettings = (newSettings: ChartSettings) => {
    props.updateAttributes({ settings: newSettings });
  };

  return (
    <NodeViewWrapper className="my-6 flex flex-col items-center select-none relative group/chartWrapper p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
      {/* Chart Visualization */}
      <svg width={width} height={height} className="overflow-visible font-sans">
        {[0, 20, 40, 60, 80, 100].map((tick) => {
           const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
           return (
             <g key={tick}>
               <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E5E7EB" strokeWidth="1" />
               <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#9CA3AF">{tick}</text>
             </g>
           )
        })}
        {data.map((item, index) => {
           const barHeight = (item.value / maxValue) * chartHeight;
           const x = padding.left + index * step + (step - barWidth) / 2;
           const y = padding.top + chartHeight - barHeight;
           return (
             <g key={index}>
               <rect x={x} y={y} width={barWidth} height={barHeight} fill="#0052D9" className="hover:opacity-90 transition-opacity" />
               <text x={x + barWidth/2} y={y - 10} textAnchor="middle" fontSize="14" fill="#374151">{item.value}</text>
               <text x={x + barWidth/2} y={height - padding.bottom + 20} textAnchor="middle" fontSize="14" fill="#6B7280">
                 {item.label[0]}
               </text>
               <text x={x + barWidth/2} y={height - padding.bottom + 40} textAnchor="middle" fontSize="14" fill="#6B7280">
                 {item.label[1]}
               </text>
             </g>
           );
        })}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#4B5563" strokeWidth="1" />
      </svg>
      <div className="mt-2 text-xl font-medium text-gray-700">{settings.title}</div>

      {/* Toolbar */}
      <div className="absolute top-2 left-2 flex items-center gap-2 opacity-0 group-hover/chartWrapper:opacity-100 transition-opacity duration-200 z-20">
         <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-600 rounded-md shadow-sm border border-gray-200 hover:bg-blue-50 font-medium text-xs transition-colors">
            <Info size={14} />
            指标信息
         </button>
         <button 
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 rounded-md shadow-sm border border-gray-200 hover:bg-gray-50 font-medium text-xs transition-colors"
         >
            <Settings size={14} />
            设置
         </button>
      </div>
      
      {/* Delete */}
      <button 
        className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-red-50 opacity-0 group-hover/chartWrapper:opacity-100 transition-opacity duration-200 z-20"
        onClick={props.deleteNode}
        title="删除图表"
      >
        <Trash2 size={14} />
      </button>

      {/* Settings Modal (Portal would be better, but inline works for this demo) */}
      <ChartSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSettings={settings}
        onSave={updateSettings}
      />
    </NodeViewWrapper>
  );
};

const ChartExtension = Node.create({
  name: 'chartBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      settings: {
        default: { title: '时间维度分析', periods: 5 },
      },
    };
  },
  parseHTML() { return [{ tag: 'chart-block' }]; },
  renderHTML({ HTMLAttributes }) { return ['chart-block', HTMLAttributes]; },
  addNodeView() { return ReactNodeViewRenderer(ChartComponent); },
});

// ----------------------------------------------------------------------
// 2. TABLE SETTINGS (Native TipTap Table)
// ----------------------------------------------------------------------
// No custom NodeView needed for native table, just config

// ----------------------------------------------------------------------
// 3. CHART SETTINGS MODAL
// ----------------------------------------------------------------------
const ChartSettingsModal: React.FC<ChartSettingsModalProps> = ({ isOpen, onClose, initialSettings, onSave }) => {
  const [title, setTitle] = useState(initialSettings.title);
  const [periods, setPeriods] = useState(initialSettings.periods);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialSettings.title);
      setPeriods(initialSettings.periods);
    }
  }, [isOpen, initialSettings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-[500px] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800">图表设置</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 p-1">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图表标题</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图表时间范围</label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">截至报告周期的近</span>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <button onClick={() => setPeriods(Math.max(1, periods - 1))} className="px-3 py-1.5 hover:bg-gray-100 border-r border-gray-300 text-gray-600"><Minus size={14} /></button>
                <div className="w-12 text-center text-sm font-medium text-gray-800 py-1.5 bg-white">{periods}</div>
                <button onClick={() => setPeriods(Math.min(20, periods + 1))} className="px-3 py-1.5 hover:bg-gray-100 border-l border-gray-300 text-gray-600"><Plus size={14} /></button>
              </div>
              <span className="text-sm text-gray-600">个周期</span>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium">取消</button>
          <button onClick={() => { onSave({ title, periods }); onClose(); }} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 font-medium shadow-sm">确定</button>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 4. MAIN EDITOR COMPONENT
// ----------------------------------------------------------------------

const ReportEditor: React.FC<ReportEditorProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'dataset' | 'indicator'>('dataset');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['p4']));
  const [timeParam, setTimeParam] = useState<string | null>(null);
  const [isTimeParamOpen, setIsTimeParamOpen] = useState(false);
  const [indicatorExpanded, setIndicatorExpanded] = useState(true); // Default expand the sample indicator

  const editor = useEditor({
    extensions: [
      // Basics
      Document,
      Paragraph,
      Text,
      History,
      // Formatting
      Heading,
      Bold,
      Italic,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: '输入文本，或输入 "/" 唤起命令...' }),
      // Lists
      BulletList,
      ListItem, 
      // Table (Official Extensions)
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // Custom
      ChartExtension,
      DataTag, // Register our new node
    ],
    content: `
      <h2>医疗质量简报</h2>
      <p>这是一段正文文本，您可以直接点击这里进行编辑。</p>
      <p>尝试按下回车键创建新段落，或者使用上方的工具栏修改文字样式。</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px]',
      },
    },
  });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedItems(newExpanded);
  };

  const handleInsertChart = () => {
    editor?.chain().focus().insertContent({ type: 'chartBlock' }).run();
  };

  const handleInsertTable = () => {
    // Cast to any to avoid TypeScript error about 'insertTable' not existing on ChainedCommands
    (editor?.chain().focus() as any)?.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };
  
  const handleInsertText = (text: string) => {
    editor?.chain().focus().insertContent({
      type: 'dataTag',
      attrs: { label: `[${text}]` },
    }).run();
  }

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center">
          <button onClick={onBack} className="flex items-center gap-1 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors text-sm">
            <ChevronLeft size={16} /> 返回
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded px-3 py-1.5 bg-white w-40 justify-between">
            <span className="text-sm text-gray-700">2025年第三季度</span>
            <Calendar size={14} className="text-gray-400" />
          </div>

          {/* Time Param Dropdown */}
          <div className="relative">
             <button
                onClick={() => setIsTimeParamOpen(!isTimeParamOpen)}
                className="flex items-center justify-between border border-gray-200 rounded px-3 py-1.5 bg-white min-w-[160px] gap-2 text-sm hover:bg-gray-50 transition-colors"
             >
                <span className={timeParam ? 'text-gray-700' : 'text-gray-400'}>{timeParam || '全局时间参数'}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isTimeParamOpen ? 'rotate-180' : ''}`} />
             </button>
             {isTimeParamOpen && (
                 <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsTimeParamOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-1 w-[200px] bg-white border border-gray-100 rounded-lg shadow-lg z-30 py-1 animate-in fade-in zoom-in-95 duration-100">
                        {['报告周期', '本年度累计至报告周期'].map((opt) => (
                            <div key={opt} className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors ${timeParam === opt ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`} onClick={() => { setTimeParam(opt); setIsTimeParamOpen(false); }}>{opt}</div>
                        ))}
                    </div>
                 </>
             )}
          </div>

          <button className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded bg-white hover:bg-gray-50 text-gray-700 text-sm">
             <Eye size={14} /> 预览
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
          <div className="flex border-b border-gray-100">
             <button className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'dataset' ? 'text-blue-600' : 'text-gray-600'}`} onClick={() => setActiveTab('dataset')}>
               数据集
               {activeTab === 'dataset' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
             </button>
             <button className="flex-1 py-3 text-sm font-medium text-gray-600">指标</button>
          </div>
          <div className="p-3 border-b border-gray-50">
             <div className="relative">
                <input type="text" placeholder="请输入内容" className="w-full bg-gray-50 border border-gray-100 rounded pl-3 pr-8 py-2 text-sm outline-none focus:border-blue-400"/>
                <Search size={14} className="absolute right-3 top-2.5 text-gray-400" />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
             {PLANS.map((plan) => (
                <div key={plan.id}>
                   <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700" onClick={() => toggleExpand(plan.id)}>
                      {expandedItems.has(plan.id) ? <ChevronDown size={14} className="text-gray-400"/> : <ChevronRight size={14} className="text-gray-400"/>}
                      <span className="truncate">{plan.name}</span>
                   </div>
                   {expandedItems.has(plan.id) && (
                      <div className="pl-4 mt-1">
                          {/* Indicator Node (Parent) */}
                          <div className="relative group/indicator">
                             <div 
                               className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer select-none"
                               onClick={() => setIndicatorExpanded(!indicatorExpanded)}
                             >
                                 <ChevronDown size={14} className={`text-gray-400 transition-transform ${indicatorExpanded ? '' : '-rotate-90'}`} />
                                 <span className="truncate font-medium">住院患者身体约束率</span>
                             </div>
                             
                             {/* Children Container */}
                             {indicatorExpanded && (
                               <div className="relative ml-2 pl-4 border-l border-gray-200 my-1 space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                   {/* Item 1: Indicator Value */}
                                   <div 
                                     className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-blue-50 cursor-pointer group/item text-xs select-none border border-transparent hover:border-blue-100 hover:shadow-sm transition-all"
                                     onDoubleClick={() => handleInsertText('12.5%')}
                                     title="双击插入数值"
                                   >
                                      <div className="flex items-center gap-2">
                                         <div className="w-3 flex justify-center items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-blue-500 transition-colors"></div>
                                         </div>
                                         <span className="text-gray-600 font-medium group-hover/item:text-blue-700">指标值</span>
                                      </div>
                                   </div>

                                   {/* Item 2: YoY */}
                                   <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-blue-50 cursor-pointer group/item text-xs select-none border border-transparent hover:border-blue-100 hover:shadow-sm transition-all"
                                     onDoubleClick={() => handleInsertText('增长2.1%')}
                                     title="双击插入数值"
                                   >
                                      <div className="flex items-center gap-2">
                                         <div className="w-3 flex justify-center items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-blue-500 transition-colors"></div>
                                         </div>
                                         <span className="text-gray-600 font-medium group-hover/item:text-blue-700">同比</span>
                                      </div>
                                   </div>

                                   {/* Item 3: QoQ */}
                                   <div className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-blue-50 cursor-pointer group/item text-xs select-none border border-transparent hover:border-blue-100 hover:shadow-sm transition-all"
                                     onDoubleClick={() => handleInsertText('下降0.5%')}
                                     title="双击插入数值"
                                   >
                                      <div className="flex items-center gap-2">
                                         <div className="w-3 flex justify-center items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover/item:bg-blue-500 transition-colors"></div>
                                         </div>
                                         <span className="text-gray-600 font-medium group-hover/item:text-blue-700">环比</span>
                                      </div>
                                   </div>

                                   {/* Item 4: Time Chart */}
                                   <div 
                                     className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-blue-50 cursor-pointer group/item text-xs mt-1.5 border border-transparent hover:border-blue-100 hover:shadow-sm transition-all select-none"
                                     onDoubleClick={handleInsertChart}
                                     title="双击插入图表"
                                   >
                                      <div className="flex items-center gap-2">
                                         <BarChartIcon size={14} className="text-purple-500" />
                                         <span className="text-gray-700 font-medium group-hover/item:text-blue-700">时间分析趋势图</span>
                                      </div>
                                   </div>

                                   {/* Item 5: Dept Chart */}
                                   <div 
                                     className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-blue-50 cursor-pointer group/item text-xs border border-transparent hover:border-blue-100 hover:shadow-sm transition-all select-none"
                                     onDoubleClick={handleInsertChart}
                                     title="双击插入图表"
                                   >
                                      <div className="flex items-center gap-2">
                                         <BarChartIcon size={14} className="text-purple-500" />
                                         <span className="text-gray-700 font-medium group-hover/item:text-blue-700">科室分析趋势图</span>
                                      </div>
                                   </div>

                               </div>
                             )}
                          </div>
                      </div>
                   )}
                </div>
             ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
           {/* Editor Toolbar */}
           <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-2">
                 <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded px-2 py-1 hover:border-blue-400 text-gray-700 mr-2">
                    <Wand2 size={14} className="text-purple-500" />
                    AI 工具箱
                 </button>
                 
                 <div className="flex items-center bg-gray-50 rounded-lg p-1 gap-0.5">
                    <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-1.5 hover:bg-white rounded text-gray-600 disabled:opacity-30"><Undo size={16}/></button>
                    <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-1.5 hover:bg-white rounded text-gray-600 disabled:opacity-30"><Redo size={16}/></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="标题 1"><Type size={16} /></button>
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive('bold') ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="加粗"><BoldIcon size={16} /></button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive('italic') ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="斜体"><ItalicIcon size={16} /></button>
                    <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive('underline') ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="下划线"><UnderlineIcon size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="左对齐"><AlignLeft size={16} /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="居中"><AlignCenter size={16} /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="右对齐"><AlignRight size={16} /></button>
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1.5 hover:bg-white rounded ${editor.isActive('bulletList') ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`} title="列表"><List size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={handleInsertChart} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600" title="插入图表"><BarChartIcon size={16} /></button>
                    <button onClick={handleInsertTable} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600" title="插入表格"><TableIcon size={16} /></button>
                    
                    {/* Table Controls (Replaces BubbleMenu) */}
                    {editor.isActive('table') && (
                      <>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={() => (editor.chain().focus() as any).addColumnBefore().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="左侧插入列"><ArrowDownToLine size={16} className="rotate-90" /></button>
                        <button onClick={() => (editor.chain().focus() as any).addColumnAfter().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="右侧插入列"><ArrowRightToLine size={16} className="rotate-90" /></button>
                        <button onClick={() => (editor.chain().focus() as any).deleteColumn().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="删除列"><Columns size={16} strokeWidth={1.5} /><span className="text-[10px] absolute top-0 right-0 text-red-500 font-bold">x</span></button>
                        
                        <button onClick={() => (editor.chain().focus() as any).addRowBefore().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="上方插入行"><ArrowDownToLine size={16} className="rotate-180" /></button>
                        <button onClick={() => (editor.chain().focus() as any).addRowAfter().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="下方插入行"><ArrowDownToLine size={16} /></button>
                        <button onClick={() => (editor.chain().focus() as any).deleteRow().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="删除行"><Rows size={16} strokeWidth={1.5} /><span className="text-[10px] absolute top-0 right-0 text-red-500 font-bold">x</span></button>
                        
                        <button onClick={() => (editor.chain().focus() as any).mergeCells().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="合并单元格"><Merge size={16} /></button>
                        <button onClick={() => (editor.chain().focus() as any).splitCell().run()} className="p-1.5 hover:bg-white rounded text-gray-600" title="拆分单元格"><Split size={16} /></button>
                        
                        <button onClick={() => (editor.chain().focus() as any).deleteTable().run()} className="p-1.5 hover:bg-white rounded text-red-500" title="删除表格"><Trash2 size={16} /></button>
                      </>
                    )}
                 </div>
              </div>
              <div className="text-xs text-gray-400">
                  {editor.storage.characterCount?.characters()} 字符
              </div>
           </div>

           {/* Canvas */}
           <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100 cursor-text" onClick={() => editor.chain().focus().run()}>
              <div className="w-[800px] min-h-[1100px] bg-white shadow-sm border border-gray-200 p-16 relative cursor-auto" onClick={(e) => e.stopPropagation()}>
                 <EditorContent editor={editor} />
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

interface ChartSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: ChartSettings;
  onSave: (settings: ChartSettings) => void;
}

export default ReportEditor;