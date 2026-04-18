const JsonPreview = ({ data }) => (
  <pre className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-4 overflow-auto max-h-80">
    {JSON.stringify(data, null, 2)}
  </pre>
);

export default JsonPreview;
