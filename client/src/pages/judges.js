import React from 'react'
import { HeaderPage, HeaderParagraph} from "../components/texts"
import "./judges.css"

import {ProfilePicture} from "../components/judges";
import {JUDGES_DATA} from "../util/judges.js";


export default function Judges() {

    const judgesList = JUDGES_DATA.map(person => (

        <ProfilePicture
          name = {person.name}
          content = {person.content}
          image = {person.img}
          key = {person.name}
  
        />
      )
    ); 


  return (
    <div>
      <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      
      <div className="base">
        <HeaderParagraph> Meet your Judges </HeaderParagraph>

        <div className="judgesList">

            {judgesList}

        </div>

        

      </div>
      
    </div>
  );
}