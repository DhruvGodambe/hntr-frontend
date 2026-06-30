import { PageHero } from "@/components/layout/page-hero";
import { collectionHero } from "@/features/my-nfts/data/collection-data";

export function CollectionHero() {
  return (
    <PageHero
      variant="mosaic"
      title={collectionHero.title}
      subtitle={collectionHero.subtitle}
    />
  );
}
