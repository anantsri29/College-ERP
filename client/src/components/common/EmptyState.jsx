const EmptyState = ({ label = "No records found.", action }) => {
  return (
    <div className="app-card border-dashed p-8 text-center">
      <p className="text-sm text-slate-500">{label}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
