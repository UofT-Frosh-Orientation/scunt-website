import React, {useState, useEffect} from 'react'
import { Container } from 'react-bootstrap'
import { HeaderPage, HeaderParagraph, HeaderSection } from "../components/texts"
import data from '../util/rules.json';
import axios from 'axios'


export default function Rules() {
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const getEvent = async () => {
      const event = await axios.get('/get/eventDetails')
      setHasStarted(event.data.startEvent)
    }
    getEvent()
  }, [])

  return (
    <div>
      <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      <br/>
      <Container>
        <HeaderSection>Rules</HeaderSection>
        <HeaderParagraph> Welcome to Scunt! </HeaderParagraph>
        {hasStarted ? 
         <ol>
              {data.start.map(d => {
                return <Rule title={d.title} sub={d.sub} items={d.items}/>
              })}
        </ol> :
        <h2> The event hasn't started yet!</h2>
        }
        
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