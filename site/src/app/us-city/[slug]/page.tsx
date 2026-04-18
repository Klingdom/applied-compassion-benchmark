import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("us-city");
export const generateMetadata = makeGenerateMetadata("us-city");
export default makeEntityPage("us-city");
