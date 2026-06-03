import { Header } from './Header';
import { Footer } from './Footer';

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background radial shapes for aesthetic continuity */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-100/30 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Landing Page style header navbar for all internal pages */}
      <Header />

      {/* Main Content Pane */}
      <main className="flex-grow pt-28 pb-16 max-w-7xl mx-auto w-full px-6 page-transition relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
export default MainLayout;
