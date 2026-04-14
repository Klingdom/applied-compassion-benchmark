import type { Metadata } from "next";
import SelfAssessment from "@/components/assessment/SelfAssessment";

export const metadata: Metadata = {
  title: "Self-Assessment",
  description:
    "Explore the 8 dimensions of compassionate institutional behavior and complete a self-assessment questionnaire.",
};

export default function SelfAssessmentPage() {
  return <SelfAssessment />;
}
