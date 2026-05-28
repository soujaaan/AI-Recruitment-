const SuggestionsCard = ({ suggestions = [] }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-foreground">Suggestions</h2>
      <ul className="mt-4 space-y-3">
        {suggestions.length ? (
          suggestions.map((item) => (
            <li key={`suggestion-${item}`} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground">
              {item}
            </li>
          ))
        ) : (
          <li className="text-sm text-muted-foreground">No suggestions available.</li>
        )}
      </ul>
    </div>
  );
};

export default SuggestionsCard;
