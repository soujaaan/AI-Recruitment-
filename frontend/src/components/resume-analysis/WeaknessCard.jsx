const WeaknessCard = ({ strengths = [], weaknesses = [] }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-foreground">Strengths & Weaknesses</h2>
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Strengths</h3>
          <ul className="mt-3 space-y-2">
            {strengths.length ? (
              strengths.map((item) => (
                <li key={`strength-${item}`} className="text-sm text-foreground">
                  - {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No strengths listed.</li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-300">Weaknesses</h3>
          <ul className="mt-3 space-y-2">
            {weaknesses.length ? (
              weaknesses.map((item) => (
                <li key={`weakness-${item}`} className="text-sm text-foreground">
                  - {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No weaknesses listed.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WeaknessCard;
