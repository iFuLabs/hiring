const API_BASE = "/api/assessment";

export async function startAssessment(candidateInfo) {
  const res = await fetch(`${API_BASE}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidateInfo)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to start assessment");
  }
  return res.json();
}

export async function submitAssessment(sessionId, answers, monitoring) {
  const res = await fetch(`${API_BASE}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, answers, monitoring })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to submit assessment");
  }
  return res.json();
}
