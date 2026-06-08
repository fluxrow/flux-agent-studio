import { useMemo } from "react";
import { getComplianceDoc } from "@/compliance";
import { CompliancePublicLayout, MarkdownLite } from "@/components/compliance/CompliancePublicLayout";
import { Seo } from "@/components/seo/Seo";

export default function Terms() {
  const doc = useMemo(() => getComplianceDoc("terms"), []);
  return (
    <>
      <Seo
        title="Termos de Uso — Flux Agent Studio"
        description="Termos que regem o uso do Flux Agent Studio: contas, pagamentos, conteúdo dos usuários, responsabilidades e limites de uso da plataforma."
        path="/terms"
      />
      <CompliancePublicLayout doc={doc}>
        <MarkdownLite source={doc.body} />
      </CompliancePublicLayout>
    </>
  );
}
