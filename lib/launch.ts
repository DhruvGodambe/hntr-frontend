/**
 * Pre-launch switch. While HNTR listings/sales are not live, the V2 NFT grids
 * (home listings + sales, marketplace, My NFTs) render the V2 placeholder cards
 * for every visitor. Flip to `true` at launch together with re-enabling the
 * live listing/sales data in those pages.
 */
export const LISTINGS_LIVE = false;

/**
 * Pre-launch membership pricing. While `true`, memberships are sold at their 50%-off pre-launch prices
 * (the prices in `TIERS`) and the Membership page shows the "Pre-launch pricing: 50% off" popup, which
 * states that prices double at official launch. Flip to `false` at launch, together with the new prices,
 * or the popup keeps promising a discount that no longer exists.
 */
export const PRELAUNCH_PRICING = true;
