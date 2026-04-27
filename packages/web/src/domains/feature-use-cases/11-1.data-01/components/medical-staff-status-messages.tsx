import type { CombinedError } from "urql";

interface MedicalStaffStatusMessagesProps {
  addAppliedCount: number | null;
  addError: CombinedError | undefined;
  clearAppliedCount: number | null;
  clearError: CombinedError | undefined;
  configError: string | null;
  fetching: boolean;
  hasRows: boolean;
  queryError: CombinedError | undefined;
}

export function MedicalStaffStatusMessages(props: MedicalStaffStatusMessagesProps) {
  const {
    addAppliedCount,
    addError,
    clearAppliedCount,
    clearError,
    configError,
    fetching,
    hasRows,
    queryError,
  } = props;

  return (
    <>
      {configError && <pre className="text-sm text-red-600">{configError}</pre>}
      {!configError && queryError && <pre className="text-sm text-red-600">{queryError.message}</pre>}
      {!configError && addError && <pre className="text-sm text-red-600">{addError.message}</pre>}
      {!configError && clearError && <pre className="text-sm text-red-600">{clearError.message}</pre>}
      {!configError && addAppliedCount !== null && (
        <p className="text-sm text-muted-foreground">
          last add appliedCount: <code>{addAppliedCount}</code>
        </p>
      )}
      {!configError && clearAppliedCount !== null && (
        <p className="text-sm text-muted-foreground">
          last clear appliedCount: <code>{clearAppliedCount}</code>
        </p>
      )}
      {!configError && fetching && <p className="text-sm">loading...</p>}
      {!configError && !fetching && !hasRows && <p className="text-sm">medicalStaffs: 0</p>}
    </>
  );
}
