const ATSScoreCard = ({ score = 0 }) => {
  const safeScore = Number.isFinite(Number(score)) ? Number(score) : 0;

  return (
    <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/20 via-white/5 to-transparent p-6 backdrop-blur-xl">
      <p className="text-sm uppercase tracking-wide text-muted-foreground">ATS Score</p>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-5xl font-bold text-accent">{safeScore}</span>
        <span className="mb-1 text-lg text-muted-foreground">/ 100</span>
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-accent transition-all duration-700"
          style={{ width: `${Math.max(0, Math.min(100, safeScore))}%` }}
        />
      </div>
    </div>
  );
};

export default ATSScoreCard;
