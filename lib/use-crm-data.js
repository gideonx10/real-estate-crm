"use client";

import { useEffect, useState } from "react";
import { fetchCRMData } from "@/lib/crm-client";

export function useCRMData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const nextData = await fetchCRMData();
      if (!cancelled) setData(nextData);
    }

    refresh();
    window.addEventListener("crm-data-changed", refresh);
    return () => {
      window.removeEventListener("crm-data-changed", refresh);
      cancelled = true;
    };
  }, []);

  return data;
}
