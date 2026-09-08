"use client";

import MainLayout from "../components/MainLayout";
import GiftCodesPanel from "../components/gift-codes/GiftCodesPanel";
import { useVoucherAccess } from "../../lib/vouchers";

export default function GiftCodesPage() {
  const { data: access, isLoading } = useVoucherAccess();

  return (
    <MainLayout>
      <div className="feed" id="feed-gift-codes">
        <div className="page-body">
          {isLoading ? null : access?.enabled ? (
            <GiftCodesPanel access={access} />
          ) : (
            <div className="gc-scope">
              <div className="gc-locked">
                <div className="gc-locked-title">Gift Codes unavailable</div>
                <div className="gc-locked-sub">
                  Your account is not enabled to issue gift codes. Contact an administrator if you
                  believe this is a mistake.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
