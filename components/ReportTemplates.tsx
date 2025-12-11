
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { REPORT_TEMPLATES } from '../constants';

interface ReportTemplatesProps {
  onEdit?: (id: string) => void;
}

const ReportTemplates: React.FC<ReportTemplatesProps> = ({ onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center">
          <div className="flex rounded border border-gray-200 overflow-hidden bg-white">
            <input 
                type="text" 
                placeholder="请输入关键词搜索" 
                className="px-3 py-2 text-sm outline-none text-gray-600 w-64 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="bg-gray-100 px-4 text-gray-600 border-l border-gray-200 hover:bg-gray-200 font-medium text-sm transition-colors">
                搜索
            </button>
          </div>
        </div>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1 text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          新建
        </button>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col border border-gray-100">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 w-[30%] border-b border-gray-200">模板名称</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 w-[20%] border-b border-gray-200">模板类型</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 w-[20%] border-b border-gray-200">创建人</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 w-[30%] border-b border-gray-200">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {REPORT_TEMPLATES.map((template) => (
                <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-800 align-middle">
                    {template.name}
                  </td>
                  <td className="px-6 py-4 text-sm align-middle">
                    <span className="inline-block border border-blue-400 text-blue-600 px-2 py-0.5 rounded text-xs">
                      {template.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 align-middle">
                    {template.creator}
                  </td>
                  <td className="px-6 py-4 text-sm align-middle">
                    <div className="flex items-center gap-4">
                      <button className="text-blue-600 hover:text-blue-800 hover:underline">管理模版</button>
                      <button 
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        onClick={() => onEdit && onEdit(template.id)}
                      >
                        编辑内容
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 hover:underline">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {REPORT_TEMPLATES.length === 0 && (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
               暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportTemplates;
