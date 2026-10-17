import MainLayout from "../components/MainLayout";
import HntrFooter from "../components/layout/shell/HntrFooter";
import { TERMS_HTML } from "./terms-content";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="feed" id="feed-terms">
        <div className="page-body">
          <article className="tc-wrap" dangerouslySetInnerHTML={{ __html: TERMS_HTML }} />
        </div>
        <HntrFooter />
      </div>
    </MainLayout>
  );
}
