export type NftSaleNotification = {
  id: string;
  type: "nft-sale";
  imageSeed: string;
  assetName: string;
  salePrice: string;
  profit: string;
  profitUsd: string;
  viewHref: string;
};

export type OperationalNotification = {
  id: string;
  type: "operational";
  title: string;
  description: string;
  txHref: string;
};

export type NotificationItem = NftSaleNotification | OperationalNotification;

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    type: "nft-sale",
    imageSeed: "fidenza-565",
    assetName: "Fidenza #565",
    salePrice: "18.75 ETH",
    profit: "+4.25 ETH",
    profitUsd: "~$8,950",
    viewHref: "/pools/fidenza-565",
  },
  {
    id: "n2",
    type: "operational",
    title: "Referral Commission claimed successfully",
    description: "0.25 ETH claimed to wallet: 0x71C...492",
    txHref: "https://etherscan.io/tx/0xabc123",
  },
  {
    id: "n3",
    type: "operational",
    title: "Pool Reward claimed successfully",
    description: "0.25 ETH claimed to wallet: 0x71C...492",
    txHref: "https://etherscan.io/tx/0xdef456",
  },
  {
    id: "n4",
    type: "operational",
    title: "Pool Deposit Successful",
    description: "1.25 ETH deposited into Fidenza #565",
    txHref: "https://etherscan.io/tx/0xghi789",
  },
];

export const moreNotifications: NotificationItem[] = [
  {
    id: "n5",
    type: "operational",
    title: "Membership Upgraded",
    description: "Your membership was upgraded to Ranger",
    txHref: "/membership",
  },
  {
    id: "n6",
    type: "nft-sale",
    imageSeed: "bayc-3362",
    assetName: "BAYC #3362",
    salePrice: "19.40 ETH",
    profit: "+2.10 ETH",
    profitUsd: "~$4,620",
    viewHref: "/pools/bayc-3362",
  },
];
