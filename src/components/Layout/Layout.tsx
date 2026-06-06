import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  pageTitle: string;
  onSearch?: (q: string) => void;
  demoMode?: boolean;
}

export function Layout({ children, currentPage, onNavigate, pageTitle, onSearch, demoMode }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageTitle} onSearch={onSearch} demoMode={demoMode} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
