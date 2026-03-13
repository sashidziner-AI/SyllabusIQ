import { useTheme } from '../../context/ThemeContext';

export function MeshBackground() {
  const { theme } = useTheme();

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 theme-bg-primary" />
      <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
        theme === 'dark' ? 'bg-green-900 opacity-20' : 'bg-green-200 opacity-30'
      }`} />
      <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
        theme === 'dark' ? 'bg-emerald-900 opacity-20' : 'bg-emerald-200 opacity-30'
      }`} />
    </div>
  );
}
