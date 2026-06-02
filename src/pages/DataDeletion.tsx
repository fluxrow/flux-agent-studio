import { useMemo } from "react";
import { getComplianceDoc } from "@/compliance";
import { CompliancePublicLayout, MarkdownLite } from "@/components/compliance/CompliancePublicLayout";

export default function DataDeletion() {
  const doc = useMemo(() => getComplianceDoc("data_deletion"), []);
  return (
    <CompliancePublicLayout doc={doc}>
      <MarkdownLite source={doc.body} />
    </CompliancePublicLayout>
  );
}
