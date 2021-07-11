import React from 'react'
import { HeaderPage, HeaderParagraph, HeaderSection } from "../components/texts"

export default function Rules() {
  return (
    <div>
      <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      <HeaderSection>Rules</HeaderSection>
      <HeaderParagraph> Welcome to Scunt! </HeaderParagraph>
    </div>
  );
}