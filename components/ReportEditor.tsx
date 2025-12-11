import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, Settings, Eye, Search, 
  ChevronRight, ChevronDown, Type, List, AlignLeft, 
  Bold, Italic, Underline, Strikethrough, Image, Table, 
  MoreHorizontal, Wand2, Trash2
} from 'lucide-react';
import { PLANS } from '../constants';

interface ReportEditorProps {
  onBack: () => void;
}

// Block Data Structure
interface EditorBlock {
  id: string;
  type: 'text' | 'chart';
  content: string; // HTML for text, or config for chart
}

// --- Custom SVG Chart Component ---
const SimpleBarChart = () => {
  const data = [
    { label: ['2024年', '三季度'], value: 62 },
    { label: ['2024年', '四季度'], value: 5 },
    { label: ['2025年', '一季度'], value: 38 },
    { label: ['2025年', '二季度'], value: 90 },
    { label: ['2025年', '三季度'], value: 61 },
  ];
  const maxValue = 100;
  const height = 350;
  const width = 600;
  const padding = { top: 40, right: 20, bottom: 60, left: 40 };
  const chartHeight = height - padding.top - padding.bottom;
  const chartWidth = width - padding.left - padding.right;
  const barWidth = 40;
  const step = chartWidth / data.length;

  return (
    <div className="my-6 flex flex-col items-center select-none" contentEditable={false}>
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
      <div className="mt-2 text-xl font-medium text-gray-700">时间维度分析</div>
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

  // Focus Handling
  useEffect(() => {
    if (autoFocus && contentRef.current) {
      // Only focus if not already focused to avoid cursor jumping if user clicked mid-text
      if (document.activeElement !== contentRef.current) {
        contentRef.current.focus();
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [autoFocus]);

  // Content Sync Handling
  // Only update innerHTML if it differs from the prop to avoid React render loop clearing selection
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

  // Toggle Sidebar Items
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // --- Block Management Logic ---

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
      
      // If block is empty and not the only block
      if (currentBlock.content === '' && blocks.length > 1) {
        e.preventDefault();
        const newBlocks = blocks.filter(b => b.id !== id);
        setBlocks(newBlocks);
        // Focus previous block
        if (currentIndex > 0) {
          setFocusedBlockId(blocks[currentIndex - 1].id);
        } else {
            // Handle edge case where first block is deleted
            if (blocks[currentIndex + 1]) {
                setFocusedBlockId(blocks[currentIndex + 1].id);
            }
        }
      }
    }
  };

  const handleInsertChart = () => {
    const newChartBlock: EditorBlock = { id: `chart-${Date.now()}`, type: 'chart', content: '' };
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

  // --- Toolbar Actions ---
  // Using execCommand for simplicity in this demo. 
  // In a real production app, we would use the Selection API or a library like Slate/Tiptap.
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Re-focus current block to keep cursor active
    if (focusedBlockId) {
        // This is a simplified focus return. 
    }
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
               // If clicking empty space at bottom, focus last block if it's text, or add new one
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
                            <div className="relative group/chart">
                                <SimpleBarChart />
                                {/* Delete button for chart */}
                                <button 
                                    className="absolute -right-10 top-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover/chart:opacity-100 transition-opacity"
                                    onClick={() => {
                                        setBlocks(blocks.filter(b => b.id !== block.id));
                                    }}
                                    title="删除图表"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                 ))}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default ReportEditor;