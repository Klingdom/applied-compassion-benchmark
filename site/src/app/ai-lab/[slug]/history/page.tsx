import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("ai-lab");
export const generateMetadata = makeHistoryGenerateMetadata("ai-lab", "/ai-lab");
export default makeHistoryPage("ai-lab", "/ai-lab");
