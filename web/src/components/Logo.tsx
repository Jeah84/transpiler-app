export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/transpiler-banner.png" className="h-9 object-contain" alt="Transpiler" />
    </div>
  );
}
