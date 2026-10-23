export type ResultRow = { label: string; value: string; mono?: boolean };

type ResultPanelProps = { status: string; detail: string; rows?: ResultRow[]; pending?: boolean };

// No test id while pending: the fallback and the streamed result can briefly coexist.
export function ResultPanel({ status, detail, rows = [], pending = false }: ResultPanelProps) {
  return (
    <section
      aria-labelledby="result-heading"
      className="flex flex-col gap-2 border border-e2e-hairline-strong bg-e2e-panel p-5"
    >
      <h1 id="result-heading" className="type-label-xs text-e2e-text-faint">
        Payment
      </h1>
      <p data-testid={pending ? undefined : "payment-status"} className="type-h3-display text-e2e-text-bright">
        {status}
      </p>
      <p className="type-body-s text-e2e-text-soft">{detail}</p>
      {rows.length > 0 && (
        <dl className="mt-3 flex flex-col gap-2 border-t border-e2e-hairline-strong pt-4 type-body-s">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <dt className="text-e2e-text-faint">{row.label}</dt>
              <dd className={row.mono ? "truncate type-code-s text-e2e-text-soft" : "text-e2e-text-soft"}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
