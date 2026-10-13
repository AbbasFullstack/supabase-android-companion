import React, { useState, useEffect } from 'react';
import { ProjectConfig, ActiveTab } from './types';
import { SupabaseManager } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ProjectModal } from './components/ProjectModal';
import { TablesView } from './views/TablesView';
import { SqlView } from './views/SqlView';
import { AuthView } from './views/AuthView';
import { StorageView } from './views/StorageView';
import { MetricsView } from './views/MetricsView';

export function App() {
  const [projects, setProjects] = useState<ProjectConfig[]>(() => SupabaseManager.getStoredProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() => SupabaseManager.getActiveProjectId());
  const [activeTab, setActiveTab] = useState<ActiveTab>('tables');
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);
  const [latency, setLatency] = useState<number | null>(32);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Ping project when active project changes
  const checkLatency = async () => {
    if (!activeProject) return;
    try {
      const res = await SupabaseManager.testConnection(activeProject);
      setLatency(res.latencyMs);
      setIsConnected(res.success);
    } catch {
      setIsConnected(false);
    }
  };

  useEffect(() => {
    checkLatency();
  }, [activeProjectId]);

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    SupabaseManager.setActiveProjectId(id);
  };

  const handleAddProject = (newProject: ProjectConfig) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    SupabaseManager.saveProjects(updated);
    handleSelectProject(newProject.id);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    SupabaseManager.saveProjects(updated);
    if (activeProjectId === id) {
      handleSelectProject(updated[0].id);
    }
  };

  return (
    <div className="min-h-screen bg-carbon-950 text-carbon-100 flex flex-col bg-grid-pattern selection:bg-supa-green selection:text-black">
      {/* Top Navigation */}
      <Navbar
        activeProject={activeProject}
        latency={latency}
        isConnected={isConnected}
        onOpenProjects={() => setIsProjectsModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-4 sm:pt-6">
        {activeTab === 'tables' && <TablesView project={activeProject} />}
        {activeTab === 'sql' && <SqlView project={activeProject} />}
        {activeTab === 'auth' && <AuthView project={activeProject} />}
        {activeTab === 'storage' && <StorageView project={activeProject} />}
        {activeTab === 'metrics' && (
          <MetricsView
            project={activeProject}
            currentLatency={latency}
            onRefreshLatency={checkLatency}
          />
        )}
      </main>

      {/* Floating Bottom Dock */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Project Switcher & Manager Modal */}
      <ProjectModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onAddProject={handleAddProject}
        onDeleteProject={handleDeleteProject}
      />
    </div>
  );
}

export default App;
