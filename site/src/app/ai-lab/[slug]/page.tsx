import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("ai-lab");
export const generateMetadata = makeGenerateMetadata("ai-lab");
export default makeEntityPage("ai-lab");
