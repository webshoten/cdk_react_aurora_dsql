import type { CombinedError } from "urql";

interface ImageStatusMessagesProps {
  configError: string | null;
  createUrlError: CombinedError | undefined;
  fetching: boolean;
  hasImages: boolean;
  imagePath: string | null;
  queryError: CombinedError | undefined;
  registerAppliedCount: number | null;
  registerError: CombinedError | undefined;
}

export function ImageStatusMessages(props: ImageStatusMessagesProps) {
  const {
    configError,
    createUrlError,
    fetching,
    hasImages,
    imagePath,
    queryError,
    registerAppliedCount,
    registerError,
  } = props;

  return (
    <>
      {configError && <pre className="text-sm text-red-600">{configError}</pre>}
      {!configError && queryError && <pre className="text-sm text-red-600">{queryError.message}</pre>}
      {!configError && createUrlError && (
        <pre className="text-sm text-red-600">{createUrlError.message}</pre>
      )}
      {!configError && registerError && (
        <pre className="text-sm text-red-600">{registerError.message}</pre>
      )}
      {!configError && imagePath && (
        <p className="text-sm text-muted-foreground">
          last imagePath: <code>{imagePath}</code>
        </p>
      )}
      {!configError && registerAppliedCount !== null && (
        <p className="text-sm text-muted-foreground">
          last register appliedCount: <code>{registerAppliedCount}</code>{" "}
          <span className="text-xs">(0 は既存データのためスキップで正常)</span>
        </p>
      )}
      {!configError && fetching && <p className="text-sm">loading...</p>}
      {!configError && !fetching && !hasImages && <p className="text-sm">images: 0</p>}
    </>
  );
}
