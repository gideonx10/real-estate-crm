"use client";

const emptyCRMData = {
  companies: [],
  builders: [],
  brokers: [],
  projects: [],
  leads: [],
  units: [],
  lead_activities: [],
};

function notifyDataChanged() {
  window.dispatchEvent(new CustomEvent("crm-data-changed"));
}

export async function fetchCRMData() {
  const response = await fetch("/api/crm", { cache: "no-store" });
  const payload = await response.json();

  if (!response.ok) {
    console.error(payload.error || "Unable to load CRM data");
    return { ...emptyCRMData, error: payload.error || "Unable to load CRM data" };
  }

  return { ...emptyCRMData, ...payload.data };
}

export async function createCRMRecord(collection, payload) {
  const endpoint = collection === "lead_activities" ? "lead-activities" : collection;

  const response = await fetch(`/api/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `Unable to create ${collection}`);
  }

  notifyDataChanged();
  return result.data;
}

export async function updateCRMRecord(collection, id, payload) {
  const response = await fetch(`/api/crm/${collection}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `Unable to update ${collection}`);
  }

  notifyDataChanged();
  return result.data;
}

export async function deleteCRMRecord(collection, id) {
  const response = await fetch(`/api/crm/${collection}/${id}`, { method: "DELETE" });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || `Unable to delete ${collection}`);
  }

  notifyDataChanged();
  return result.data;
}
