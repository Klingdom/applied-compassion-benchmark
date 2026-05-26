import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("us-city");
export const generateMetadata = makeHistoryGenerateMetadata("us-city", "/us-city");
export default makeHistoryPage("us-city", "/us-city");
