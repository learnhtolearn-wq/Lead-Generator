"use client";

import { useState } from "react";
import type { GenerateFormValues } from "@/types";

interface LeadFormProps {
  onSubmit: (values: GenerateFormValues) => Promise<void>;
  isLoading: boolean;
}

export function LeadForm({ onSubmit, isLoading }: LeadFormProps) {
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [geography, setGeography] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    if (!description.trim()) {
      setValidationError("Please describe your business and target leads.");
      return;
    }
    if (!niche.trim()) {
      setValidationError("Please enter the industry or niche.");
      return;
    }
    await onSubmit({ description, niche, geography });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Business description &amp; target leads
          <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="e.g. We sell SaaS tools for restaurant operators. We're looking for restaurant tech companies and food-service software vendors."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="niche" className="block text-sm font-medium text-gray-700 mb-1">
          Industry / niche<span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="niche"
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="e.g. restaurant tech"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="geography" className="block text-sm font-medium text-gray-700 mb-1">
          Target geography
          <span className="text-gray-400 ml-1 text-xs">(optional)</span>
        </label>
        <input
          id="geography"
          type="text"
          value={geography}
          onChange={(e) => setGeography(e.target.value)}
          placeholder="e.g. United States"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {validationError && <p className="text-sm text-red-600">{validationError}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Generating…" : "Generate Leads"}
      </button>
    </form>
  );
}
