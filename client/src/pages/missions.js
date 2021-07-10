import React from 'react'
import { HeaderPage, HeaderParagraph, HeaderSection } from "../components/texts"

export default function Missions() {
  return (
    <div>
      <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      <HeaderSection> Missions </HeaderSection>
      <HeaderParagraph> Welcome to Scunt! </HeaderParagraph>
    </div>
  );
}


