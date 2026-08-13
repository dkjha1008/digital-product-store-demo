"use client";

import { useState } from "react";

import { getErrorMessage } from "@/lib/api/client";

export function useAsyncAction(fallbackError = "Something went wrong. Please try again.") {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    setLoading(true);
    setError("");
    try {
      return await fn();
    } catch (err) {
      setError(getErrorMessage(err, fallbackError));
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, error, setError, run };
}
