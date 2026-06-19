import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("university");
export const generateMetadata = makeGenerateMetadata("university");
export default makeEntityPage("university");
