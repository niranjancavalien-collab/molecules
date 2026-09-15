import { AssessmentsEngine } from "~/components/AssessmentsEngine";
import { CandidateHub } from "~/components/CandidateHub";
import { Ecosystem } from "~/components/Ecosystem";
import { Footer } from "~/components/Footer";
import { Hero } from "~/components/Hero";
import { MoleculeBackground } from "~/components/MoleculeBackground";
import { Navbar } from "~/components/Navbar";
import { NcetSection } from "~/components/NcetSection";
import { SandboxPro } from "~/components/SandboxPro";

export default function Index() {
  return (
    <>
      <MoleculeBackground />
      <div className="min-h-screen">
        <Navbar />
        <main>
          <Hero />
          <CandidateHub />
          <AssessmentsEngine />
          <NcetSection />
          <SandboxPro />
          <Ecosystem />
        </main>
        <Footer />
      </div>
    </>
  );
}
