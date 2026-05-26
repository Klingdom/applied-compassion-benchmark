import {
  makeHistoryGenerateStaticParams,
  makeHistoryGenerateMetadata,
  makeHistoryPage,
} from "@/components/entity/renderHistoryPage";

export const dynamicParams = false;
export const generateStaticParams = makeHistoryGenerateStaticParams("robotics-lab");
export const generateMetadata = makeHistoryGenerateMetadata("robotics-lab", "/robotics-lab");
export default makeHistoryPage("robotics-lab", "/robotics-lab");
