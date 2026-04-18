import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("city");
export const generateMetadata = makeGenerateMetadata("city");
export default makeEntityPage("city");
