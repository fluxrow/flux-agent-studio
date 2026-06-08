import { useMemo } from "react";
import { getComplianceDoc } from "@/compliance";
import { CompliancePublicLayout, MarkdownLite } from "@/components/compliance/CompliancePublicLayout";
import { Seo } from "@/components/seo/Seo";

export default function Privacy() {
  const doc = useMemo(() => getComplianceDoc("privacy"), []);
  return (
    <>
      <Seo
        title="Política de Privacidade — Flux Agent Studio"
        description="Como o Flux Agent Studio coleta, usa e protege seus dados pessoais e os dados de leads das suas conversas — em conformidade com a LGPD."
        path="/privacy"
      />
      <CompliancePublicLayout doc={doc}>
        <MarkdownLite source={doc.body} />
      </CompliancePublicLayout>
    </>
  );
}
