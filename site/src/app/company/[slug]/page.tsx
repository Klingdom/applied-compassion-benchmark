import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("company");
export const generateMetadata = makeGenerateMetadata("company");
export default makeEntityPage("company");
