import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("country");
export const generateMetadata = makeHistoryGenerateMetadata("country", "/country");
export default makeHistoryPage("country", "/country");
