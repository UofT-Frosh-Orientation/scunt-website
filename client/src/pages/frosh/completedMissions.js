import React from 'react'
import { Container } from 'react-bootstrap'
import { HeaderPage } from '../../components/texts'

export default function completedMissions() {
    return(
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Submitted and Completed Missions </HeaderPage>
            <br/>
            <Container>
                <h3>sup 🤙</h3>
            </Container>
        </div>
    )
}