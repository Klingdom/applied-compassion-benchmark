import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("us-state");
export const generateMetadata = makeHistoryGenerateMetadata("us-state", "/us-state");
export default makeHistoryPage("us-state", "/us-state");
