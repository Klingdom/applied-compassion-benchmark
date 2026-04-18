import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("country");
export const generateMetadata = makeGenerateMetadata("country");
export default makeEntityPage("country");
