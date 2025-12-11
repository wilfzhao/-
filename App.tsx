import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RoleList from './components/RoleList';
import PermissionTable from './components/PermissionTable';
import PlanManagement from './components/PlanManagement';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('indicator_auth');
  const [headerItems, setHeaderItems] = useState<string[]>([
    '医院等级评审', 
    '公立医院绩效考核', 
    '指标管理中心', 
    '管理配置', 
    '运营决策中心'
  ]);

  const handleAddHeaderItem = (name: string) => {
    // Avoid duplicates
    if (!headerItems.includes(name)) {
      setHeaderItems([...headerItems, name]);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'plan_mgmt':
        return <PlanManagement onAddPlan={handleAddHeaderItem} />;
      case 'indicator_auth':
        return (
          <>
            <RoleList />
            <PermissionTable />
          </>
        );
      default:
        return (
           <div className="flex-1 flex items-center justify-center text-gray-400 bg-white rounded-lg shadow-sm">
             <div className="text-center">
               <h2 className="text-xl font-medium mb-2">功能开发中</h2>
               <p className="text-sm">Current View ID: {currentView}</p>
             </div>
           </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
      <Header items={headerItems} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeId={currentView} onNavigate={setCurrentView} />
        <main className="flex-1 p-4 flex gap-4 overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;