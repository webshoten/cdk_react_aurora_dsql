import { resolveConfigError } from "@/app/config/runtime-config.ts";
import { Card, CardContent, CardHeader } from "@/shared/ui/card.tsx";
import { useCallback, useEffect, useState } from "react";
import { Data01Specification } from "../components/data-01-specification.tsx";
import { MedicalStaffActions } from "../components/medical-staff-actions.tsx";
import { MedicalStaffStatusMessages } from "../components/medical-staff-status-messages.tsx";
import { MedicalStaffTable } from "../components/medical-staff-table.tsx";
import type { MedicalStaffRow } from "../components/types.ts";
import { useAddRandomMedicalStaffMutation } from "../hooks/use-add-random-medical-staff-mutation.ts";
import { useClearMedicalStaffsByInstitutionMutation } from "../hooks/use-clear-medical-staffs-by-institution-mutation.ts";
import { useMedicalStaffsByInstitutionQuery } from "../hooks/use-medical-staffs-by-institution-query.ts";

/*
 * # 11-1.data-01 ページ（GraphQL 動作確認）
 *
 * ## 目的
 * GraphQL 経路（Query + Mutation）が end-to-end で動くことを画面から確認する検証ページ。医療機関スタッフ一覧表示と、ランダム追加/全削除ボタンを提供する。
 *
 * ## 説明
 * - institutionCode は demo-hospital-1 固定（デモデータ前提）。
 * - 設定エラー（apiUrl 未設定）検出時は Query を pause し、エラーメッセージのみ表示。
 * - Mutation 成功後は requestPolicy "network-only" で Query を再実行し、最新値を再取得。
 */
export function Data01Page() {
  const institutionCode = "demo-hospital-1";
  const configError = resolveConfigError();

  const [{ data, fetching, error }, reexecuteMedicalStaffsQuery] =
    useMedicalStaffsByInstitutionQuery(institutionCode, Boolean(configError));
  const [
    { data: addRandomData, fetching: isAddingRandom, error: addRandomError },
    addRandomMedicalStaff,
  ] = useAddRandomMedicalStaffMutation();
  const [{ data: clearData, fetching: isClearing, error: clearError }, clearMedicalStaffs] =
    useClearMedicalStaffsByInstitutionMutation();

  const [viewMedicalStaffs, setViewMedicalStaffs] = useState<MedicalStaffRow[]>([]);

  useEffect(() => {
    if (!data?.medicalStaffsByInstitution) return;
    setViewMedicalStaffs(data.medicalStaffsByInstitution);
  }, [data]);

  const handleAddRandom = useCallback(async () => {
    if (configError) return;

    const result = await addRandomMedicalStaff({ institutionCode });
    if (!result.error) {
      reexecuteMedicalStaffsQuery({ requestPolicy: "network-only" });
    }
  }, [addRandomMedicalStaff, configError, reexecuteMedicalStaffsQuery]);

  const handleClear = useCallback(async () => {
    if (configError) return;

    const result = await clearMedicalStaffs({ institutionCode });
    if (!result.error) {
      setViewMedicalStaffs([]);
      reexecuteMedicalStaffsQuery({ requestPolicy: "network-only" });
    }
  }, [clearMedicalStaffs, configError, reexecuteMedicalStaffsQuery]);

  return (
    <Card>
      <CardHeader>
        <Data01Specification institutionCode={institutionCode} />
      </CardHeader>
      <CardContent className="space-y-4">
        <MedicalStaffActions
          configError={configError}
          isAddingRandom={isAddingRandom}
          isClearing={isClearing}
          onAddRandom={handleAddRandom}
          onClear={handleClear}
        />

        <MedicalStaffStatusMessages
          addAppliedCount={addRandomData?.addRandomMedicalStaff?.appliedCount ?? null}
          addError={addRandomError}
          clearAppliedCount={clearData?.clearMedicalStaffsByInstitution?.appliedCount ?? null}
          clearError={clearError}
          configError={configError}
          fetching={fetching}
          hasRows={viewMedicalStaffs.length > 0}
          queryError={error}
        />

        <MedicalStaffTable rows={viewMedicalStaffs} />
      </CardContent>
    </Card>
  );
}
