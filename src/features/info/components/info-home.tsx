import { InfoHero } from "./info-hero";
import { InfoResources } from "./info-resources";
import { InfoTopics } from "./info-topics";

export function InfoHome() {
  return (
    <>
      <InfoHero />
      <InfoTopics />
      <InfoResources />
    </>
  );
}
