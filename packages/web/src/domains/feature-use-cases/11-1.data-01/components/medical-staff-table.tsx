import type { MedicalStaffRow } from "./types.ts";

interface MedicalStaffTableProps {
  rows: MedicalStaffRow[];
}

export function MedicalStaffTable({ rows }: MedicalStaffTableProps) {
  if (rows.length === 0) {
    return null;
  }

  return (
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
          {rows.map((staff, index) => (
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
  );
}
