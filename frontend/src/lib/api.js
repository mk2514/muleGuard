import { getApiUrl } from "../config/api";

export async function uploadCsv(file) {
  const body = new FormData();
  if (file) body.append("file", file);

  const res = await fetch(getApiUrl("/upload/csv"), {
    method: "POST",
    body,
  });

  if (!res.ok) {
    throw new Error("Ingestion request failed");
  }

  return res.json();
}
