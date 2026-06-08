import { useMemo } from "react";
import { getComplianceDoc } from "@/compliance";
import { CompliancePublicLayout, MarkdownLite } from "@/components/compliance/CompliancePublicLayout";
import { Seo } from "@/components/seo/Seo";

export default function DataDeletion() {
  const doc = useMemo(() => getComplianceDoc("data_deletion"), []);
  return (
    <>
      <Seo
        title="Exclusão de Dados — Flux Agent Studio"
        description="Como solicitar a exclusão dos seus dados pessoais e dos leads armazenados no Flux Agent Studio, conforme a LGPD."
        path="/data-deletion"
      />
      <CompliancePublicLayout doc={doc}>
        <MarkdownLite source={doc.body} />
      </CompliancePublicLayout>
    </>
  );
}
