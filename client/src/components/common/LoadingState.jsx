const LoadingState = ({ label = "Loading..." }) => {
  return (
    <div className="app-card p-8">
      <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
        <span className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
};

export default LoadingState;
