import { describe, it, expect } from "vitest";
import {
  isConvertedStage,
  hasConvertedStage,
  countConverted,
} from "@/lib/leadStages";

describe("leadStages — isConvertedStage", () => {
  it("recognizes canonical Portuguese stages", () => {
    expect(isConvertedStage("convertido")).toBe(true);
    expect(isConvertedStage("convertida")).toBe(true);
    expect(isConvertedStage("ganho")).toBe(true);
    expect(isConvertedStage("ganha")).toBe(true);
    expect(isConvertedStage("vendido")).toBe(true);
    expect(isConvertedStage("fechado")).toBe(true);
  });

  it("recognizes English synonyms", () => {
    expect(isConvertedStage("won")).toBe(true);
    expect(isConvertedStage("sold")).toBe(true);
    expect(isConvertedStage("closed-won")).toBe(true);
    expect(isConvertedStage("closed_won")).toBe(true);
  });

  it("normalizes case and whitespace", () => {
    expect(isConvertedStage(" Convertido ")).toBe(true);
    expect(isConvertedStage("WON")).toBe(true);
  });

  it("rejects non-converted stages", () => {
    expect(isConvertedStage("novo")).toBe(false);
    expect(isConvertedStage("qualificado")).toBe(false);
    expect(isConvertedStage("negociacao")).toBe(false);
    expect(isConvertedStage("perdido")).toBe(false);
    expect(isConvertedStage("")).toBe(false);
    expect(isConvertedStage(null)).toBe(false);
    expect(isConvertedStage(undefined)).toBe(false);
  });
});

describe("leadStages — countConverted (CRM scenarios)", () => {
  const leads = [
    { id: "1", stage: "novo" },
    { id: "2", stage: "qualificado" },
    { id: "3", stage: "negociacao" },
    { id: "4", stage: "convertido" },
  ];

  it("counts exactly 1 conversion across the canonical pipeline", () => {
    const won = countConverted(leads, (l) => l.stage);
    expect(won).toBe(1);
  });

  it("computes a conversion rate of 100% when only won/lost are decided", () => {
    const decided = leads.filter(
      (l) => isConvertedStage(l.stage) || l.stage === "perdido",
    );
    const won = countConverted(decided, (l) => l.stage);
    const rate = decided.length > 0 ? won / decided.length : 0;
    expect(rate).toBe(1);
  });

  it("hasConvertedStage detects at least one win", () => {
    expect(hasConvertedStage(leads.map((l) => l.stage))).toBe(true);
    expect(hasConvertedStage(["novo", "qualificado"])).toBe(false);
  });
});
