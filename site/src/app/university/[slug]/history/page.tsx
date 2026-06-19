import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("university");
export const generateMetadata = makeHistoryGenerateMetadata("university", "/university");
export default makeHistoryPage("university", "/university");
