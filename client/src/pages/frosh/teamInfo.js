import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { LoadingAnimation } from '../../components/containers'
import { HeaderPage } from '../../components/texts'

export default function TeamInfo() {
    const [teamInfo, setTeamInfo] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getMissions = async () => {
            const account = await axios.get('/user/current')
            const { data } = await axios.get(`/get/frosh/teamInfo?teamNumber=${account.data.scuntTeam}`)

            if (data.status === 200) {
                setTeamInfo(data.teamInfo)
            }
            setLoading(false)
        }
        setLoading(true)
        getMissions()
    }, [])

    return(
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Team Information </HeaderPage>
            <br/>
            <Container>
                { loading && <div className="center"><LoadingAnimation/></div> }
                { 
                    !loading &&
                    <>
                        <Row>
                            <Col md={9}> {teamInfo.number} - {teamInfo.name} </Col>
                            <Col md={3}> {teamInfo.score}pts </Col>
                        </Row>
                        <Row>
                            {
                                teamInfo.leedurInformation.map(l =>
                                    <Col md={6}>
                                        <h3>{l.name}</h3>
                                        <p>{l.number}</p>
                                    </Col>
                                )
                            }
                        </Row>
                    </>
                }
            </Container>
        </div>
    )
}