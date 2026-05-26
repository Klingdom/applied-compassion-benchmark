import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("city");
export const generateMetadata = makeHistoryGenerateMetadata("city", "/city");
export default makeHistoryPage("city", "/city");
