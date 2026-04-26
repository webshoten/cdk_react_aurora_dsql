import { useWebConfig } from "@/app/providers/use-web-config.ts";
import { Button } from "@/shared/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";
import { useMedicalStaffsByInstitutionQuery } from "../hooks/use-medical-staffs-by-institution-query.ts";
import { useSeedMedicalStaffsMutation } from "../hooks/use-seed-medical-staffs-mutation.ts";

export function Data01Page() {
  const institutionCode = "demo-hospital-1";
  const { configError } = useWebConfig();

  const [{ data, fetching, error }, reexecuteMedicalStaffsQuery] =
    useMedicalStaffsByInstitutionQuery(institutionCode, Boolean(configError));
  const [{ data: seedData, fetching: isSeeding, error: seedError }, seedMedicalStaffs] =
    useSeedMedicalStaffsMutation();

  const medicalStaffs = data?.medicalStaffsByInstitution ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>4-1.data-01 Medical Staff</CardTitle>
        <CardDescription>
          institutionCode: <code>{institutionCode}</code>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          disabled={Boolean(configError) || isSeeding}
          onClick={async () => {
            if (configError) return;

            const result = await seedMedicalStaffs({});
            if (!result.error) {
              reexecuteMedicalStaffsQuery({ requestPolicy: "network-only" });
            }
          }}
        >
          {isSeeding ? "投入中..." : "データ投入（冪等）"}
        </Button>

        {configError && <pre className="text-sm text-red-600">{configError}</pre>}
        {!configError && error && <pre className="text-sm text-red-600">{error.message}</pre>}
        {!configError && seedError && (
          <pre className="text-sm text-red-600">{seedError.message}</pre>
        )}
        {!configError && seedData && (
          <p className="text-sm text-muted-foreground">
            last seed appliedCount: <code>{seedData.seedMedicalStaffs.appliedCount}</code>
          </p>
        )}

        {!configError && fetching && <p className="text-sm">loading...</p>}
        {!configError && !fetching && medicalStaffs.length === 0 && (
          <p className="text-sm">medicalStaffs: 0</p>
        )}

        {!configError && !fetching && medicalStaffs.length > 0 && (
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
                {medicalStaffs.map((staff) => (
                  <tr className="border-t border-border" key={staff.staffCode}>
                    <td className="px-4 py-2">{staff.staffCode}</td>
                    <td className="px-4 py-2">{staff.name}</td>
                    <td className="px-4 py-2">{staff.profession}</td>
                    <td className="px-4 py-2">{staff.institutionCode}</td>
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
