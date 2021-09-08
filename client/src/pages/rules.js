import React from 'react'
import { Container } from 'react-bootstrap'
import { HeaderPage, HeaderParagraph, HeaderSection } from "../components/texts"
import data from '../util/rules.json';


export default function Rules() {
  return (
    <div>
      <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      <br/>
      <Container>
        <HeaderSection>Rules</HeaderSection>
        <HeaderParagraph> Welcome to Scunt! </HeaderParagraph>
         <ol>
              {data.start.map(d => {
                return <Rule title={d.title} sub={d.sub} items={d.items}/>
              })}
        </ol>
        
      </Container>
    </div>
  );
}

function Rule(props) {
  return(
    <li>
      <h3><strong>{props.title}</strong></h3>
      <p>{props.sub}</p>
      {props.items && <ol>
        {props.items.map(i => {return <li dangerouslySetInnerHTML={ { __html: i } }></li>})}
      </ol>}
      <br/>
    </li>
  )
}