const ListSection = ({ title, items }) => (
  <div>
    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
    <div className="mt-3 flex flex-wrap gap-2">
      {items.length ? (
        items.map((item) => (
          <span key={`${title}-${item}`} className="rounded-lg border border-white/10 bg-black/30 px-3 py-1 text-sm text-foreground">
            {item}
          </span>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No items found.</p>
      )}
    </div>
  </div>
);

const SkillsCard = ({ technicalSkills = [], missingKeywords = [] }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-foreground">Skills & Keywords</h2>
      <div className="mt-5 space-y-5">
        <ListSection title="Technical Skills" items={technicalSkills} />
        <ListSection title="Missing Keywords" items={missingKeywords} />
      </div>
    </div>
  );
};

export default SkillsCard;
