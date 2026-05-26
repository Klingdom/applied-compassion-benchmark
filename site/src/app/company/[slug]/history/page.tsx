import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("company");
export const generateMetadata = makeHistoryGenerateMetadata("company", "/company");
export default makeHistoryPage("company", "/company");
