import { FileUp, Loader2 } from "lucide-react";

const MAX_SIZE_MB = 5;

const UploadBox = ({ file, loading, error, onFileSelect, onSubmit }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <h2 className="text-xl font-semibold text-foreground">Upload Resume</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        PDF only, max {MAX_SIZE_MB}MB. We will run ATS-focused AI analysis on your resume.
      </p>

      <label
        htmlFor="resume-file"
        className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-black/30 px-6 py-10 text-center hover:border-accent/60 transition-colors"
      >
        <FileUp className="h-9 w-9 text-accent" />
        <span className="text-sm text-foreground">{file ? file.name : "Click to choose a PDF file"}</span>
        <span className="text-xs text-muted-foreground">Supported format: .pdf</span>
      </label>

      <input id="resume-file" type="file" accept="application/pdf" className="hidden" onChange={onFileSelect} />

      {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}

      <button
        type="button"
        disabled={!file || loading}
        onClick={onSubmit}
        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </div>
  );
};

export default UploadBox;
