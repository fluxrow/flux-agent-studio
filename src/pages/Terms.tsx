import { useMemo } from "react";
import { getComplianceDoc } from "@/compliance";
import { CompliancePublicLayout, MarkdownLite } from "@/components/compliance/CompliancePublicLayout";

export default function Terms() {
  const doc = useMemo(() => getComplianceDoc("terms"), []);
  return (
    <CompliancePublicLayout doc={doc}>
      <MarkdownLite source={doc.body} />
    </CompliancePublicLayout>
  );
}
