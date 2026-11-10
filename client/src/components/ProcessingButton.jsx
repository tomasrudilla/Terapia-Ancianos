export function ProcessingButton({
  processing = false,
  processingLabel = 'Procesando…',
  className = 'btn btn-primary',
  disabled = false,
  children,
  ...rest
}) {
  return (
    <button
      type="submit"
      className={`${className}${processing ? ' is-processing' : ''}`.trim()}
      disabled={disabled || processing}
      aria-busy={processing}
      {...rest}
    >
      {processing ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          <span>{processingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
