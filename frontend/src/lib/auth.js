export function isAuthenticated() {
  return localStorage.getItem("auth") === "true";
}

export function getSession() {
  return {
    refId: localStorage.getItem("ref_id") || "",
    dept: localStorage.getItem("dept") || "",
  };
}

export function signIn({ refId, dept }) {
  localStorage.setItem("auth", "true");
  localStorage.setItem("ref_id", refId);
  localStorage.setItem("dept", dept);
}

export function signOut() {
  localStorage.removeItem("auth");
  localStorage.removeItem("ref_id");
  localStorage.removeItem("dept");
}
