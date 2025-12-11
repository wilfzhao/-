import React, { useState } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { PLANS } from '../constants';
import { Plan } from '../types';
import CreatePlanModal from './CreatePlanModal';

interface PlanManagementProps {
  onAddPlan?: (name: string) => void;
}

const PlanManagement: React.FC<PlanManagementProps> = ({ onAddPlan }) => {
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSavePlan = (data: Partial<Plan>) => {
    const newPlan: Plan = {
      id: Date.now().toString(),
      name: data.name || '未命名方案',
      indicatorCount: 0,
      remark: data.remark || '无',
      status: data.status || 'enabled',
      application: data.application,
    };
    setPlans([newPlan, ...plans]);
    
    // Add to Header
    if (onAddPlan && newPlan.name) {
      onAddPlan(newPlan.name);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex rounded border border-gray-200 overflow-hidden bg-white">
            <input 
                type="text" 
                placeholder="请输入关键词搜索" 
                className="px-3 py-2 text-sm outline-none text-gray-600 w-64 bg-white"
            />
            <button className="bg-gray-50 px-4 text-gray-600 border-l border-gray-200 hover:bg-gray-100 font-medium text-sm">
                搜索
            </button>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          新建
        </button>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          {plans.map((plan: Plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 relative group hover:shadow-md transition-shadow">
              {/* Status Badge */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs text-white rounded-bl-lg rounded-tr-lg ${plan.status === 'enabled' ? 'bg-blue-600' : 'bg-gray-500'}`}>
                {plan.status === 'enabled' ? '已启用' : '已停用'}
              </div>

              {/* Header */}
              <div className="flex items-start gap-3 mb-4 mt-1">
                <div className="bg-blue-500 text-white p-2.5 rounded-lg flex-shrink-0">
                  <FileText size={24} />
                </div>
                <div className="pr-12">
                  <h3 className="font-bold text-gray-800 text-base leading-tight mb-1">{plan.name}</h3>
                  {plan.application && <p className="text-xs text-gray-400">{plan.application}</p>}
                </div>
              </div>

              {/* Content */}
              <div className="text-sm text-gray-500 space-y-2 mb-4 relative z-10">
                <p>指标数：<span className="text-gray-700">{plan.indicatorCount}</span></p>
                <p className="line-clamp-2 h-10 leading-5" title={plan.remark}>备注：{plan.remark}</p>
              </div>

              {/* Background Watermark/Icon */}
              <div className="absolute right-4 bottom-12 opacity-5 pointer-events-none">
                <FileText size={80} />
              </div>

              {/* Actions */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-end gap-3 text-sm">
                <button className="text-blue-600 hover:text-blue-800 hover:underline">复制</button>
                <div className="h-3 w-px bg-gray-300"></div>
                <button className="text-blue-600 hover:text-blue-800 hover:underline">编辑</button>
                <div className="h-3 w-px bg-gray-300"></div>
                <button className="text-blue-600 hover:text-blue-800 hover:underline">关联指标</button>
                <div className="h-3 w-px bg-gray-300"></div>
                <button className="text-red-400 hover:text-red-600 hover:underline">删除</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <CreatePlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleSavePlan}
      />
    </div>
  );
};

export default PlanManagement;