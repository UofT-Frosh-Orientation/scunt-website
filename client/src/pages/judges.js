import React from 'react'
import { HeaderPage, HeaderParagraph, HeaderSection } from "../components/texts"

export default function Judges() {
  return (
    <div>
      <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      <HeaderSection> Judges </HeaderSection>
      <HeaderParagraph> Welcome to Scunt! </HeaderParagraph>
    </div>
  );
}