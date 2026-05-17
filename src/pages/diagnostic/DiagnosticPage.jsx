import Navbar              from '../../components/layout/Navbar';
import Footer              from '../../components/layout/Footer';
import UploadSection       from './sections/UploadSection';
import WhatToExpectSection from './sections/WhatToExpectSection';

export default function DiagnosticPage() {
  return (
    <>
      <Navbar />
      <main>
        <UploadSection />
        <WhatToExpectSection />
      </main>
      <Footer />
    </>
  );
}
