import React, { useState, useRef, useEffect } from 'react';
import { X, Link as LinkIcon, FileText, ChevronDown, Plus, Check } from 'lucide-react';
import { Toggle } from './ui/Toggle';
import { Checkbox } from './ui/Checkbox';
import { Plan } from '../types';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Partial<Plan>) => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [remark, setRemark] = useState('');
  const [error, setError] = useState('');
  
  // Custom Dropdown State
  const [applications, setApplications] = useState([
    '三级医院等级评审',
    '公立医院绩效考核',
    '医疗质量管理'
  ]);
  const [selectedApp, setSelectedApp] = useState('');
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const [isAddingApp, setIsAddingApp] = useState(false);
  const [newAppValue, setNewAppValue] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setName('');
      setIsEnabled(true);
      setRemark('');
      setSelectedApp('');
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAppDropdownOpen(false);
        setIsAddingApp(false);
      }
    };

    if (isAppDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAppDropdownOpen]);

  const handleAddApp = () => {
    if (newAppValue.trim()) {
      const newVal = newAppValue.trim();
      // Avoid duplicates
      if (!applications.includes(newVal)) {
          setApplications([...applications, newVal]);
      }
      setSelectedApp(newVal);
      setNewAppValue('');
      setIsAddingApp(false);
      setIsAppDropdownOpen(false);
    }
  };

  const handleConfirm = () => {
    if (!name.trim()) {
      setError('请输入方案名称');
      return;
    }
    if (!selectedApp) {
      setError('请选择应用');
      return;
    }

    onConfirm({
      name: name,
      application: selectedApp,
      remark: remark,
      status: isEnabled ? 'enabled' : 'disabled'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 pointer-events-none opacity-[0.03]">
             <div className="relative w-48 h-48 -mr-10 -mt-10">
                <FileText size={200} className="text-blue-900 transform rotate-12" />
                <div className="absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2">
                   <LinkIcon size={80} className="text-blue-900" />
                </div>
             </div>
        </div>

        {/* Header */}
        <div className="px-8 py-5 relative z-10 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">新增方案</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
        </div>

        {/* Form Body */}
        <div className="px-8 pb-4 space-y-5 relative z-10">
            {error && (
              <div className="bg-red-50 text-red-500 text-sm px-3 py-2 rounded">
                {error}
              </div>
            )}

            {/* Plan Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>方案名称：
                </label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入方案名称"
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400"
                />
            </div>

            {/* Application (Custom Dropdown) */}
            <div className="relative" ref={dropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>应用：
                </label>
                
                {/* Trigger */}
                <div 
                  className={`w-full border rounded px-3 py-2 text-sm bg-white cursor-pointer flex justify-between items-center transition-all ${isAppDropdownOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'}`}
                  onClick={() => {
                      if (!isAddingApp) setIsAppDropdownOpen(!isAppDropdownOpen);
                  }}
                >
                    <span className={selectedApp ? 'text-gray-800' : 'text-gray-400'}>
                        {selectedApp || '请选择应用'}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isAppDropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {isAppDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
                        <div className="max-h-48 overflow-y-auto">
                            {applications.map((app) => (
                                <div 
                                    key={app}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${selectedApp === app ? 'text-blue-600 font-medium bg-blue-50' : 'text-gray-600'}`}
                                    onClick={() => {
                                        setSelectedApp(app);
                                        setIsAppDropdownOpen(false);
                                    }}
                                >
                                    {app}
                                </div>
                            ))}
                        </div>
                        
                        {/* Divider */}
                        <div className="h-px bg-gray-100 my-0"></div>
                        
                        {/* Add New Option Area */}
                        <div className="p-2 bg-gray-50/50">
                            {isAddingApp ? (
                                <div className="flex items-center gap-2 animate-in fade-in">
                                    <input 
                                        type="text"
                                        autoFocus
                                        placeholder="输入新应用名称"
                                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 bg-white"
                                        value={newAppValue}
                                        onChange={(e) => setNewAppValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddApp();
                                            if (e.key === 'Escape') {
                                                setIsAddingApp(false);
                                                setNewAppValue('');
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={handleAddApp}
                                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setIsAddingApp(false);
                                            setNewAppValue('');
                                        }}
                                        className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="w-full flex items-center justify-center gap-1 text-sm text-blue-600 hover:bg-blue-50 py-1.5 rounded transition-colors border border-dashed border-blue-200 hover:border-blue-400"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent closing dropdown
                                        setIsAddingApp(true);
                                    }}
                                >
                                    <Plus size={14} />
                                    <span>添加新应用</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Display Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>显示类型：
                </label>
                <div className="flex gap-8 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox defaultChecked className="w-4 h-4 rounded text-blue-600" />
                        <span className="text-sm text-gray-600">PC端</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <Checkbox defaultChecked className="w-4 h-4 rounded text-blue-600" />
                        <span className="text-sm text-gray-600">移动端</span>
                    </label>
                </div>
            </div>

            {/* Remarks */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    备注：
                </label>
                <div className="relative">
                    <textarea 
                        placeholder="请输入备注"
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-400 h-24 resize-none"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        maxLength={200}
                    />
                    <span className="absolute bottom-2 right-3 text-xs text-gray-400 select-none">
                        {remark.length} / 200
                    </span>
                </div>
            </div>

             {/* Status */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>是否启用：
                </label>
                <div className="flex items-center gap-3 mt-2">
                    <Toggle checked={isEnabled} onChange={setIsEnabled} />
                    <span className={`text-sm ${isEnabled ? 'text-blue-600' : 'text-gray-500'}`}>
                        {isEnabled ? '已启用' : '已停用'}
                    </span>
                </div>
            </div>

        </div>

        {/* Footer */}
        <div className="flex justify-center gap-6 pb-8 pt-4">
            <button 
                onClick={onClose}
                className="w-24 py-2 rounded bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 text-sm font-medium transition-colors"
            >
                取 消
            </button>
            <button 
                onClick={handleConfirm}
                className="w-24 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm text-sm font-medium transition-colors"
            >
                确 定
            </button>
        </div>

      </div>
    </div>
  );
};

export default CreatePlanModal;