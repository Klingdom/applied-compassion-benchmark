import {
  makeEntityPage,
  makeGenerateMetadata,
  makeGenerateStaticParams,
} from "@/components/entity/renderEntityPage";

export const generateStaticParams = makeGenerateStaticParams("robotics-lab");
export const generateMetadata = makeGenerateMetadata("robotics-lab");
export default makeEntityPage("robotics-lab");
