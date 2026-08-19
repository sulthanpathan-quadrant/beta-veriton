// ─────────────────────────────────────────────────────────────
// threadManager.ts
// Shared module that holds the in-flight create-thread promise.
// WorkflowSidebar fires it on click; VeritonChatBot awaits it.
// ─────────────────────────────────────────────────────────────

const BASE_URL = "https://veriton-webapp-ezbud7exfzb7g8at.eastus-01.azurewebsites.net";

let _pendingThread: Promise<any> | null = null;

/** Called by WorkflowSidebar on click — starts the fetch immediately. */
export function startCreateThread(): void {
  const userFromStorage = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}")
    : null;
  const userId = userFromStorage?.id || null;
  const jobId  = localStorage.getItem("current_job_id");

  if (!userId || !jobId) {
    _pendingThread = null;
    return;
  }

  _pendingThread = fetch(`${BASE_URL}/create-thread`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, job_id: jobId }),
  })
    .then((r) => r.json())
    .then((data) => {
      if (data.thread_id) {
        localStorage.setItem("current_thread_id", data.thread_id);
      }
      if (data.job_id) {
        localStorage.setItem("current_job_id", data.job_id);
      }
      return data;
    })
    .catch((err) => {
      console.error("create-thread failed:", err);
      return null;
    })
    .finally(() => {
      _pendingThread = null;
    });
}

/** Called by VeritonChatBot on mount — awaits the in-flight promise if any. */
export function awaitPendingThread(): Promise<any> | null {
  return _pendingThread;
}