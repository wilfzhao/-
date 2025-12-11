import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, Settings, Eye, Search, 
  ChevronRight, ChevronDown, Type, List, AlignLeft, 
  Bold, Italic, Underline, Strikethrough, Image, Table, 
  MoreHorizontal, Wand2, Trash2, Info, X, Minus, Plus
} from 'lucide-react';
import { PLANS } from '../constants';

interface ReportEditorProps {
  onBack: () => void;
}

// Block Data Structure
interface EditorBlock {
  id: string;
  type: 'text' | 'chart';
  // For text: HTML content
  // For chart: JSON string of settings
  content: string; 
}

interface ChartSettings {
  title: string;
  periods: number;
}

// --- Chart Settings Modal ---
interface ChartSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSettings: ChartSettings;
  onSave: (settings: ChartSettings) => void;
}

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

  // Mock date calculation for the tip
  const endYear = 2025;
  const endQuarter = 3; // 3rd Quarter
  
  // Calculate start based on periods count backwards from 2025 Q3
  const calculateStart = (p: number) => {
    let q = endQuarter;
    let y = endYear;
    // We go back p-1 steps because the end period is included
    for (let i = 0; i < p - 1; i++) {
        q--;
        if (q < 1) {
            q = 4;
            y--;
        }
    }
    const qStr = ['一', '二', '三', '四'][q - 1];
    return `${y}年${qStr}季度`;
  };

  const startDateStr = calculateStart(periods);
  const endDateStr = `${endYear}年${['一', '二', '三', '四'][endQuarter - 1]}季度`;

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
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图表标题</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Time Range Stepper */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">图表时间范围</label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">截至报告周期的近</span>
              <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                <button 
                  onClick={() => setPeriods(Math.max(1, periods - 1))}
                  className="px-3 py-1.5 hover:bg-gray-100 border-r border-gray-300 text-gray-600 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <div className="w-12 text-center text-sm font-medium text-gray-800 py-1.5 bg-white">
                  {periods}
                </div>
                <button 
                  onClick={() => setPeriods(Math.min(20, periods + 1))}
                  className="px-3 py-1.5 hover:bg-gray-100 border-l border-gray-300 text-gray-600 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-sm text-gray-600">个周期</span>
            </div>
          </div>

          {/* Tip */}
          <div className="bg-blue-50 text-blue-700 text-xs px-4 py-3 rounded leading-relaxed border border-blue-100 flex items-start gap-2">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <span>
              图表将展示从 <span className="font-bold">{startDateStr}</span> 到 <span className="font-bold">{endDateStr}</span> 期间的共计 {periods} 个季度的数据点。
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => {
              onSave({ title, periods });
              onClose();
            }}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 font-medium shadow-sm transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Custom SVG Chart Component ---
interface SimpleBarChartProps {
  settings: ChartSettings;
  onOpenSettings: () => void;
  onDelete: () => void;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ settings, onOpenSettings, onDelete }) => {
  // Dynamically generate data based on settings.periods
  // This mocks fetching real data
  const generateData = (periods: number) => {
    const fullData = [
       // Historical mock data
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
    // Return the last N items
    return fullData.slice(Math.max(0, fullData.length - periods));
  };

  const data = generateData(settings.periods);
  const maxValue = 100;
  const height = 350;
  const width = 600;
  const padding = { top: 40, right: 20, bottom: 60, left: 40 };
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;
  // Dynamic bar width logic to prevent overlap
  const barWidth = Math.min(40, chartWidth / data.length * 0.6); 
  const step = data.length > 0 ? chartWidth / data.length : 0;

  return (
    <div className="my-6 flex flex-col items-center select-none relative group/chartWrapper" contentEditable={false}>
      {/* Chart Visualization */}
      <svg width={width} height={height} className="overflow-visible font-sans bg-white">
        {/* Grid lines */}
        {[0, 20, 40, 60, 80, 100].map((tick) => {
           const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
           return (
             <g key={tick}>
               <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E5E7EB" strokeWidth="1" />
               <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#9CA3AF">{tick}</text>
             </g>
           )
        })}
        
        {/* Bars */}
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

      {/* Hover Overlay Buttons */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover/chartWrapper:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 border-2 border-blue-400 rounded-lg shadow-sm">
         <button className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg shadow-sm border border-blue-100 hover:bg-blue-50 font-medium text-sm transition-transform hover:scale-105">
            <Info size={16} />
            指标信息
         </button>
         <button 
            onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-medium text-sm transition-transform hover:scale-105"
         >
            <Settings size={16} />
            设置
         </button>
         
         <button 
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm hover:bg-red-50 border border-gray-100"
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}
            title="删除图表"
         >
            <Trash2 size={16} />
         </button>
      </div>
    </div>
  );
};

// --- Text Block Component ---
interface TextBlockProps {
  block: EditorBlock;
  autoFocus: boolean;
  onUpdate: (id: string, content: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onFocus: (id: string) => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ block, autoFocus, onUpdate, onKeyDown, onFocus }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && contentRef.current) {
      if (document.activeElement !== contentRef.current) {
        contentRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [autoFocus]);

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== block.content) {
      contentRef.current.innerHTML = block.content;
    }
  }, [block.content]);

  return (
    <div
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      className="outline-none min-h-[24px] text-gray-800 leading-relaxed py-1 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300"
      data-placeholder="输入文本，输入 '/' 唤起命令"
      onInput={(e) => onUpdate(block.id, e.currentTarget.innerHTML)}
      onKeyDown={(e) => onKeyDown(e, block.id)}
      onFocus={() => onFocus(block.id)}
      style={{ whiteSpace: 'pre-wrap' }}
    />
  );
};

// --- Main Editor Component ---
const ReportEditor: React.FC<ReportEditorProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'dataset' | 'indicator'>('dataset');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['p4']));
  
  // Blocks State
  const [blocks, setBlocks] = useState<EditorBlock[]>([
    { id: '1', type: 'text', content: '<h1 class="text-3xl font-bold mb-4">医疗质量简报</h1>' },
    { id: '2', type: 'text', content: '这是一段正文文本，您可以直接点击这里进行编辑。' },
    { id: '3', type: 'text', content: '尝试按下回车键创建新段落，或者使用上方的工具栏修改文字样式。' },
  ]);
  
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [modalSettings, setModalSettings] = useState<ChartSettings>({ title: '', periods: 6 });

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentIndex = blocks.findIndex(b => b.id === id);
      const newBlock: EditorBlock = { 
        id: Date.now().toString(), 
        type: 'text', 
        content: '' 
      };
      
      const newBlocks = [...blocks];
      newBlocks.splice(currentIndex + 1, 0, newBlock);
      setBlocks(newBlocks);
      setFocusedBlockId(newBlock.id);
    }
    
    if (e.key === 'Backspace') {
      const currentIndex = blocks.findIndex(b => b.id === id);
      const currentBlock = blocks[currentIndex];
      
      if (currentBlock.content === '' && blocks.length > 1) {
        e.preventDefault();
        const newBlocks = blocks.filter(b => b.id !== id);
        setBlocks(newBlocks);
        if (currentIndex > 0) {
          setFocusedBlockId(blocks[currentIndex - 1].id);
        } else if (blocks[currentIndex + 1]) {
            setFocusedBlockId(blocks[currentIndex + 1].id);
        }
      }
    }
  };

  const handleInsertChart = () => {
    const defaultSettings: ChartSettings = { title: '时间维度分析', periods: 5 };
    const newChartBlock: EditorBlock = { id: `chart-${Date.now()}`, type: 'chart', content: JSON.stringify(defaultSettings) };
    const newTextBlock: EditorBlock = { id: `text-${Date.now()}`, type: 'text', content: '' };
    
    let insertIndex = blocks.length;
    if (focusedBlockId) {
        const idx = blocks.findIndex(b => b.id === focusedBlockId);
        if (idx !== -1) insertIndex = idx + 1;
    }

    const newBlocks = [...blocks];
    newBlocks.splice(insertIndex, 0, newChartBlock, newTextBlock);
    setBlocks(newBlocks);
    setFocusedBlockId(newTextBlock.id);
  };

  // Open settings for a specific chart block
  const openSettings = (blockId: string, content: string) => {
    let settings: ChartSettings;
    try {
      settings = JSON.parse(content);
    } catch {
      settings = { title: '时间维度分析', periods: 5 };
    }
    setEditingBlockId(blockId);
    setModalSettings(settings);
    setIsSettingsOpen(true);
  };

  // Save settings back to the block
  const saveSettings = (newSettings: ChartSettings) => {
    if (editingBlockId) {
      updateBlockContent(editingBlockId, JSON.stringify(newSettings));
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors text-sm"
          >
            <ChevronLeft size={16} />
            返回
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded px-3 py-1.5 bg-white w-40 justify-between">
            <span className="text-sm text-gray-700">2022年第3季度</span>
            <Calendar size={14} className="text-gray-400" />
          </div>
          <button className="flex items-center gap-1 border border-gray-200 px-3 py-1.5 rounded bg-white hover:bg-gray-50 text-gray-700 text-sm">
             <Eye size={14} />
             预览
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[280px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
          <div className="flex border-b border-gray-100">
             <button 
               className={`flex-1 py-3 text-sm font-medium relative ${activeTab === 'dataset' ? 'text-blue-600' : 'text-gray-600'}`}
               onClick={() => setActiveTab('dataset')}
             >
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
                   <div 
                     className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm text-gray-700"
                     onClick={() => toggleExpand(plan.id)}
                   >
                      {expandedItems.has(plan.id) ? <ChevronDown size={14} className="text-gray-400"/> : <ChevronRight size={14} className="text-gray-400"/>}
                      <span className="truncate">{plan.name}</span>
                   </div>
                   {expandedItems.has(plan.id) && (
                      <div className="pl-6 space-y-1 mt-1">
                          <div className="bg-blue-50 text-blue-600 px-2 py-1.5 rounded text-sm cursor-pointer flex items-center gap-2">
                             <ChevronDown size={14} />
                             <span className="truncate">目录下的指标...</span>
                          </div>
                          <div className="pl-6 space-y-1">
                             <div 
                                className="text-sm text-gray-500 py-1 hover:text-blue-600 cursor-pointer select-none font-medium"
                                onDoubleClick={handleInsertChart}
                                title="双击插入图表"
                             >
                                时间分析趋势图 (双击插入)
                             </div>
                             <div className="text-sm text-gray-500 py-1 hover:text-blue-600 cursor-pointer">科室分析趋势图</div>
                          </div>
                      </div>
                   )}
                </div>
             ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50">
           {/* Toolbar */}
           <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 justify-between flex-shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-2">
                 <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded px-2 py-1 hover:border-blue-400 text-gray-700 mr-2">
                    <Wand2 size={14} className="text-purple-500" />
                    AI 工具箱
                 </button>
                 
                 <div className="flex items-center bg-gray-50 rounded-lg p-1 gap-0.5">
                    <button onClick={() => executeCommand('formatBlock', 'H1')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600" title="H1"><Type size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={() => executeCommand('bold')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600" title="Bold"><Bold size={16} /></button>
                    <button onClick={() => executeCommand('italic')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600" title="Italic"><Italic size={16} /></button>
                    <button onClick={() => executeCommand('underline')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600" title="Underline"><Underline size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={() => executeCommand('justifyLeft')} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600"><AlignLeft size={16} /></button>
                    <button className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600"><List size={16} /></button>
                    <div className="w-px h-4 bg-gray-300 mx-1"></div>
                    <button onClick={handleInsertChart} className="p-1.5 hover:bg-white hover:shadow-sm rounded text-gray-600" title="Insert Chart"><Table size={16} /></button>
                 </div>
              </div>
              <div className="text-xs text-gray-400">
                  {blocks.length} 块内容
              </div>
           </div>

           {/* Canvas */}
           <div className="flex-1 overflow-y-auto p-8 flex justify-center cursor-text" onClick={() => {
               if (blocks.length > 0) {
                   const lastBlock = blocks[blocks.length - 1];
                   if (lastBlock.type === 'text') setFocusedBlockId(lastBlock.id);
               }
           }}>
              <div 
                className="w-[800px] min-h-[1100px] bg-white shadow-sm border border-gray-200 p-16 relative cursor-auto"
                onClick={(e) => e.stopPropagation()} 
              >
                 {blocks.map((block) => (
                    <div key={block.id} className="group relative">
                        {block.type === 'text' ? (
                            <TextBlock 
                                block={block}
                                autoFocus={focusedBlockId === block.id}
                                onUpdate={updateBlockContent}
                                onKeyDown={handleKeyDown}
                                onFocus={setFocusedBlockId}
                            />
                        ) : (
                            <SimpleBarChart 
                                settings={(() => {
                                  try { return JSON.parse(block.content) }
                                  catch { return { title: '解析错误', periods: 5 } }
                                })()}
                                onOpenSettings={() => openSettings(block.id, block.content)}
                                onDelete={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                            />
                        )}
                    </div>
                 ))}
              </div>
           </div>
        </main>
      </div>

      <ChartSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialSettings={modalSettings}
        onSave={saveSettings}
      />
    </div>
  );
};

export default ReportEditor;