export const validateChatPayload = (body = {}) => {
  const { message, type, profile, resumeData, atsData } = body;

  if (typeof message !== "string" || !message.trim()) {
    return { ok: false, error: "message must be a non-empty string" };
  }

  const mode = (type || "default").toString().toLowerCase();
  const allowed = new Set(["resume", "interview", "ats", "career", "roadmap", "default"]);
  const finalMode = allowed.has(mode) ? mode : "default";

  return { ok: true, value: { message: message.trim(), mode, profile, resumeData, atsData } };
};

