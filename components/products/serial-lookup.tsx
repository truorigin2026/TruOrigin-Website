"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type SerialLookupProps = {
  codes: string[];
  slugByCode: Record<string, string>;
};

export function SerialLookup({ codes, slugByCode }: SerialLookupProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = value.trim().toUpperCase();

    if (!normalized) {
      setError("Enter a serial number to continue.");
      return;
    }

    const match = slugByCode[normalized];
    if (!match) {
      setError("We could not find that serial number. Try one of the sample codes below.");
      return;
    }

    setError("");
    startTransition(() => {
      router.push(`/product/${match}`);
    });
  }

  return (
    <div className="serial-lookup-card">
      <form className="serial-lookup-form" onSubmit={handleSubmit}>
        <label htmlFor="serial-number" className="serial-lookup-label">
          Enter serial number
        </label>
        <div className="serial-lookup-input-row">
          <input
            id="serial-number"
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Example: TO-NSTAR-SERUM-01"
            className="serial-lookup-input"
          />
          <button type="submit" className="serial-lookup-button" disabled={isPending}>
            {isPending ? "Checking..." : "Check product"}
          </button>
        </div>
      </form>

      <div className="serial-lookup-meta">
        <p className="serial-lookup-helper">
          Use the code printed on the product to open its verification page instantly.
        </p>
        <div className="serial-lookup-chips">
          {codes.slice(0, 4).map((code) => (
            <button
              key={code}
              type="button"
              className="serial-lookup-chip"
              onClick={() => {
                setValue(code);
                setError("");
              }}
            >
              {code}
            </button>
          ))}
        </div>
        {error ? <p className="serial-lookup-error">{error}</p> : null}
      </div>
    </div>
  );
}
