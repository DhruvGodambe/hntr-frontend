"use client";

import MainLayout from "../components/MainLayout";
import GiftCodesPanel from "../components/gift-codes/GiftCodesPanel";

export default function GiftCodesPage() {
  return (
    <MainLayout>
      <div className="feed" id="feed-gift-codes">
        <div className="page-body">
          <GiftCodesPanel />
        </div>
      </div>
    </MainLayout>
  );
}
