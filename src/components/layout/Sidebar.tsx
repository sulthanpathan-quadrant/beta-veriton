// import { useAuth } from '@/contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Brain,
  Cpu,
  GitCompare,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: string;
  onSectionClick: (section: string) => void;
}

const sections = [
  { id: 'models', label: 'Models', icon: Cpu },
  { id: 'comparison', label: 'History', icon: GitCompare },
];

const Sidebar = ({ activeSection, onSectionClick }: SidebarProps) => {
  const { logout } = useAuth();

  return (
    <aside className="fixed top-0 left-0 h-screen w-[72px] bg-sidebar border-r border-sidebar-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-14 flex items-center justify-center border-b border-sidebar-border">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 hover:bg-primary/20 transition-colors"
          title="Scroll to top"
        >
          <Brain className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <motion.button
              key={section.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSectionClick(section.id)}
              className={cn("sidebar-item w-full", isActive && "active")}
              title={section.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{section.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="sidebar-item w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default Sidebar;
