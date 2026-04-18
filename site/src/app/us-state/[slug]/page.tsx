import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("us-state");
export const generateMetadata = makeGenerateMetadata("us-state");
export default makeEntityPage("us-state");
