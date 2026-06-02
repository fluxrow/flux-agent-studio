import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getComplianceDoc } from "@/compliance";
import { CompliancePublicLayout, MarkdownLite } from "@/components/compliance/CompliancePublicLayout";

export default function Privacy() {
  const doc = useMemo(() => getComplianceDoc("privacy"), []);
  return (
    <CompliancePublicLayout doc={doc}>
      <MarkdownLite source={doc.body} />
    </CompliancePublicLayout>
  );
}
