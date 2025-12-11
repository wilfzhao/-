import React, { useState } from 'react';
import { TabType, Indicator } from '../types';
import { INDICATORS } from '../constants';
import { Toggle } from './ui/Toggle';
import { Checkbox } from './ui/Checkbox';
import { Search, Info, ChevronLeft, ChevronRight, MoreHorizontal, ChevronDown } from 'lucide-react';

const PermissionTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.INDICATOR_PERMISSION);
  const [superAdmin, setSuperAdmin] = useState(false);
  const [indicators, setIndicators] = useState<Indicator[]>(INDICATORS);
  const [selectAll, setSelectAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['g1', 'g2', 'g3', '9']));

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Helper to check if a node has children
  const hasChildren = (node: Indicator) => node.children && node.children.length > 0;

  // 1. Dependency Logic (Single Node)
  // Ensures: Fill -> Read -> Display
  //          !Read -> !Fill, !Display
  const applyDependencies = (node: Indicator, key: keyof Indicator, value: boolean): Indicator => {
    const newNode = { ...node, [key]: value };

    // Rule 1: Fill Permission -> Read + Display
    if (key === 'fillPermission' && value === true) {
      newNode.readPermission = true;
      newNode.displayEntry = true;
    }

    // Rule 2: Read logic
    if (key === 'readPermission') {
      if (value === true) {
        // Checking Read enables Display (default)
        newNode.displayEntry = true;
      } else {
        // Unchecking Read disables Display and Fill
        newNode.displayEntry = false;
        newNode.fillPermission = false;
      }
    }

    // Rule 3: Display logic
    // Enforce: Cannot check display if read is false.
    if (key === 'displayEntry' && value === true) {
      if (!newNode.readPermission) {
        newNode.displayEntry = false; // Prevent change
      }
    }

    // Global Invariant: If Read is false, Display must be false.
    // This catches edge cases and ensures consistency.
    if (!newNode.readPermission) {
       newNode.displayEntry = false;
    }

    // Rule for 'sub' tag: Display Entry is always false
    if (newNode.tag === 'sub') {
      newNode.displayEntry = false;
    }

    return newNode;
  };

  // 2. Cascade Logic (Top-Down)
  // Applies the value and dependencies to a node and all its descendants recursively
  const cascadeUpdate = (nodes: Indicator[], key: keyof Indicator, value: boolean): Indicator[] => {
    return nodes.map((node) => {
      let newNode = applyDependencies(node, key, value);
      if (hasChildren(newNode)) {
        newNode.children = cascadeUpdate(newNode.children!, key, value);
      }
      return newNode;
    });
  };

  // 3. Synchronization Logic (Bottom-Up)
  // Updates parents based on children's state.
  // Parent is True only if ALL children are True.
  const syncParents = (nodes: Indicator[]): Indicator[] => {
    return nodes.map((node) => {
      if (hasChildren(node)) {
        // First, sync children recursively
        const syncedChildren = syncParents(node.children!);
        
        // Then calculate parent state based on new children state
        const allRead = syncedChildren.every(c => c.readPermission);
        const allFill = syncedChildren.every(c => c.fillPermission);
        const allDisplay = syncedChildren.every(c => c.displayEntry);

        return {
          ...node,
          children: syncedChildren,
          readPermission: allRead,
          fillPermission: allFill,
          displayEntry: allDisplay
        };
      }
      return node;
    });
  };

  // 4. Main Toggle Handler
  const togglePermission = (targetId: string, type: 'read' | 'fill' | 'display') => {
    const targetKey =
      type === 'read'
        ? 'readPermission'
        : type === 'fill'
        ? 'fillPermission'
        : 'displayEntry';

    // Step 1: Find the target node to determine the Next Value
    let nextValue = true;
    
    const findAndDetermineValue = (nodes: Indicator[]) => {
      for (const node of nodes) {
        if (node.id === targetId) {
          nextValue = !node[targetKey];
          return;
        }
        if (node.children) findAndDetermineValue(node.children);
      }
    };
    findAndDetermineValue(indicators);

    // Step 2: Update the tree (Cascade Down)
    const updateTargetAndCascade = (nodes: Indicator[]): Indicator[] => {
      return nodes.map((node) => {
        if (node.id === targetId) {
          // Apply to self
          let updatedNode = applyDependencies(node, targetKey, nextValue);
          // Apply to children (Cascade)
          if (hasChildren(updatedNode)) {
             updatedNode.children = cascadeUpdate(updatedNode.children!, targetKey, nextValue);
          }
          return updatedNode;
        }
        if (node.children) {
          return { ...node, children: updateTargetAndCascade(node.children) };
        }
        return node;
      });
    };

    let newIndicators = updateTargetAndCascade(indicators);

    // Step 3: Sync Parents (Bubble Up)
    newIndicators = syncParents(newIndicators);

    setIndicators(newIndicators);
  };

  // Helper to determine indeterminate state for rendering
  const getCheckboxState = (node: Indicator, type: 'read' | 'fill' | 'display') => {
    const key =
      type === 'read'
        ? 'readPermission'
        : type === 'fill'
        ? 'fillPermission'
        : 'displayEntry';

    const checked = node[key];
    
    if (!hasChildren(node)) {
      return { checked, indeterminate: false };
    }

    const checkRecursive = (n: Indicator): boolean => {
        const k = key as keyof Indicator;
        if (n[k]) return true;
        if (n.children) return n.children.some(checkRecursive);
        return false;
    };
    
    const isActuallyChecked = checked;
    const isSomeChecked = checkRecursive(node);
    
    return {
        checked: isActuallyChecked,
        indeterminate: !isActuallyChecked && isSomeChecked
    };
  };

  // Flatten the tree for rendering, respecting expanded state
  const getVisibleRows = (nodes: Indicator[], level = 0): Array<Indicator & { level: number }> => {
    let rows: Array<Indicator & { level: number }> = [];
    nodes.forEach(node => {
      rows.push({ ...node, level });
      if (node.children && expandedIds.has(node.id)) {
        rows = rows.concat(getVisibleRows(node.children, level + 1));
      }
    });
    return rows;
  };

  const visibleRows = getVisibleRows(indicators);

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        <button
          className={`px-6 py-3 text-sm font-medium relative ${
            activeTab === TabType.INDICATOR_PERMISSION ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab(TabType.INDICATOR_PERMISSION)}
        >
          指标权限
          {activeTab === TabType.INDICATOR_PERMISSION && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium relative ${
            activeTab === TabType.PERSONNEL ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab(TabType.PERSONNEL)}
        >
          角色下人员
          {activeTab === TabType.PERSONNEL && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col overflow-hidden">
        {/* Super Permission Banner */}
        <div className="bg-gray-50 rounded-md p-4 mb-4 flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">超级权限</span>
          <Info size={14} className="text-gray-400" />
          <Toggle checked={superAdmin} onChange={setSuperAdmin} size="sm" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 flex-wrap">
             <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-600">方案:</span>
                 <select className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-600 bg-white outline-none focus:border-blue-500 w-40">
                     <option>三级医院等级评审</option>
                     <option>公立医院绩效考核</option>
                 </select>
             </div>

             <div className="flex items-center gap-2">
                 <span className="text-sm text-gray-600">指标权限:</span>
                 <select className="border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-600 bg-white outline-none focus:border-blue-500 w-32">
                     <option>请选择</option>
                     <option>已开启</option>
                     <option>已关闭</option>
                 </select>
             </div>

             <div className="flex rounded border border-gray-200 overflow-hidden bg-white">
                <input 
                    type="text" 
                    placeholder="请输入指标名称" 
                    className="px-3 py-1.5 text-sm outline-none text-gray-600 w-48 bg-white"
                />
                <button className="bg-gray-50 px-3 text-gray-500 border-l border-gray-200 hover:bg-gray-100">
                    <span className="text-sm">搜索</span>
                </button>
             </div>
          </div>

          <button className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors shadow-sm">
            批量操作
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border border-gray-100 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="p-3 w-10 border-b border-gray-100">
                    <Checkbox 
                        checked={selectAll}
                        onChange={() => setSelectAll(!selectAll)}
                    />
                </th>
                <th className="p-3 text-xs font-medium text-gray-500 border-b border-gray-100">指标名称</th>
                <th className="p-3 text-xs font-medium text-gray-500 border-b border-gray-100">应用方案</th>
                <th className="p-3 text-xs font-medium text-gray-500 border-b border-gray-100 w-24 text-center">查阅权限</th>
                <th className="p-3 text-xs font-medium text-gray-500 border-b border-gray-100 w-24 text-center">填报权限</th>
                <th className="p-3 text-xs font-medium text-gray-500 border-b border-gray-100 w-24 text-center">展示入口</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleRows.map((item) => {
                const readState = getCheckboxState(item, 'read');
                const fillState = getCheckboxState(item, 'fill');
                const displayState = getCheckboxState(item, 'display');

                const isSub = item.tag === 'sub';

                // Disable Display Entry if Read Permission is completely missing (not checked and not indeterminate)
                // OR if it is a 'sub' tag
                const isReadDisabled = !readState.checked && !readState.indeterminate;
                const isDisplayDisabled = isReadDisabled || isSub;

                return (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3">
                       <Checkbox />
                    </td>
                    <td className={`p-3 text-sm ${isSub ? 'text-gray-500' : 'text-blue-600'}`}>
                      <div className="flex items-center" style={{ paddingLeft: `${item.level * 24}px` }}>
                         <div className="w-5 flex items-center justify-center flex-shrink-0 mr-1">
                          {hasChildren(item) && (
                              <button onClick={() => toggleExpand(item.id)} className="text-gray-500 hover:text-blue-600 focus:outline-none">
                                  {expandedIds.has(item.id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                              </button>
                          )}
                         </div>
                         <span className="cursor-pointer hover:underline truncate">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">{item.scheme}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                          <Checkbox 
                              checked={readState.checked}
                              indeterminate={readState.indeterminate}
                              onChange={() => togglePermission(item.id, 'read')}
                              className="w-4 h-4"
                          />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                          <Checkbox 
                              checked={fillState.checked}
                              indeterminate={fillState.indeterminate}
                              onChange={() => togglePermission(item.id, 'fill')}
                              className="w-4 h-4"
                          />
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                          <Checkbox 
                              checked={displayState.checked}
                              indeterminate={displayState.indeterminate}
                              onChange={() => togglePermission(item.id, 'display')}
                              disabled={isDisplayDisabled}
                              className="w-4 h-4"
                          />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
           <span>共53页, 524条</span>
           <span>每页 
             <select className="mx-1 border border-gray-200 rounded px-1 py-0.5 outline-none bg-white">
                <option>10</option>
                <option>20</option>
                <option>50</option>
             </select> 
             条
           </span>
           <div className="flex items-center gap-1 ml-2">
               <button className="p-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"><ChevronLeft size={14}/></button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">1</button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">2</button>
               <button className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded">3</button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">4</button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">5</button>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">6</button>
               <span className="px-1"><MoreHorizontal size={12}/></span>
               <button className="w-6 h-6 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">53</button>
               <button className="p-1 border border-gray-200 rounded hover:bg-gray-50"><ChevronRight size={14}/></button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PermissionTable;