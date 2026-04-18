const SectionCard = ({ title, subtitle, children, right, className = "" }) => {
  return (
    <section className={`app-card p-5 md:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="text-sm text-slate-500 mt-1">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
};

export default SectionCard;
