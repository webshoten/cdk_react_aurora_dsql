import { resolveConfigError } from "@/app/config/runtime-config.ts";
import { Button } from "@/shared/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";
import { useEffect, useState } from "react";
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

  const [viewMedicalStaffs, setViewMedicalStaffs] = useState<
    Array<{
      staffCode: string | null;
      name: string | null;
      profession: string | null;
      institutionCode: string | null;
    }>
  >([]);

  useEffect(() => {
    if (!data?.medicalStaffsByInstitution) return;
    setViewMedicalStaffs(data.medicalStaffsByInstitution);
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>11-1.data-01 Medical Staff</CardTitle>
        <CardDescription>医療者Web表示（React + GraphQL Lambda）</CardDescription>
        <CardDescription>
          institutionCode: <code>{institutionCode}</code>
        </CardDescription>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">このページで確認する仕様</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>一覧取得（Query）が成功し、スタッフ一覧が表示されること</li>
            <li>「ランダム追加」で `addRandomMedicalStaff`（Mutation）が実行されること</li>
            <li>「全削除」で `clearMedicalStaffsByInstitution`（Mutation）が実行されること</li>
            <li>Mutation 成功後に一覧が再取得され、最新状態が反映されること</li>
            <li>`config.js` 未設定時は API 呼び出しを止めてエラー表示すること</li>
          </ul>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={Boolean(configError) || isAddingRandom || isClearing}
            onClick={async () => {
              if (configError) return;

              const result = await addRandomMedicalStaff({ institutionCode });
              if (!result.error) {
                reexecuteMedicalStaffsQuery({ requestPolicy: "network-only" });
              }
            }}
          >
            {isAddingRandom ? "追加中..." : "ランダム追加"}
          </Button>
          <Button
            disabled={Boolean(configError) || isAddingRandom || isClearing}
            onClick={async () => {
              if (configError) return;

              const result = await clearMedicalStaffs({ institutionCode });
              if (!result.error) {
                setViewMedicalStaffs([]);
                reexecuteMedicalStaffsQuery({ requestPolicy: "network-only" });
              }
            }}
            variant="outline"
          >
            {isClearing ? "削除中..." : "全削除"}
          </Button>
        </div>

        {configError && <pre className="text-sm text-red-600">{configError}</pre>}
        {!configError && error && <pre className="text-sm text-red-600">{error.message}</pre>}
        {!configError && addRandomError && (
          <pre className="text-sm text-red-600">{addRandomError.message}</pre>
        )}
        {!configError && clearError && <pre className="text-sm text-red-600">{clearError.message}</pre>}
        {!configError && addRandomData && (
          <p className="text-sm text-muted-foreground">
            last add appliedCount: <code>{addRandomData.addRandomMedicalStaff?.appliedCount ?? 0}</code>
          </p>
        )}
        {!configError && clearData && (
          <p className="text-sm text-muted-foreground">
            last clear appliedCount:{" "}
            <code>{clearData.clearMedicalStaffsByInstitution?.appliedCount ?? 0}</code>
          </p>
        )}

        {!configError && fetching && <p className="text-sm">loading...</p>}
        {!configError && !fetching && viewMedicalStaffs.length === 0 && (
          <p className="text-sm">medicalStaffs: 0</p>
        )}

        {!configError && viewMedicalStaffs.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">staffCode</th>
                  <th className="px-4 py-2 text-left font-medium">name</th>
                  <th className="px-4 py-2 text-left font-medium">profession</th>
                  <th className="px-4 py-2 text-left font-medium">institutionCode</th>
                </tr>
              </thead>
              <tbody>
                {viewMedicalStaffs.map((staff, index) => (
                  <tr className="border-t border-border" key={staff.staffCode ?? `unknown-${index}`}>
                    <td className="px-4 py-2">{staff.staffCode ?? "-"}</td>
                    <td className="px-4 py-2">{staff.name ?? "-"}</td>
                    <td className="px-4 py-2">{staff.profession ?? "-"}</td>
                    <td className="px-4 py-2">{staff.institutionCode ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
