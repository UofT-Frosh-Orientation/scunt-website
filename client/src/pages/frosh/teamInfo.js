import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { LoadingAnimation } from '../../components/containers'
import { HeaderPage } from '../../components/texts'

export default function TeamInfo() {
    const [teamInfo, setTeamInfo] = useState({})
    const [account, setAccount] = useState({})
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getMissions = async () => {
            const account = await axios.get('/user/current')
            const { data } = await axios.get(`/get/frosh/teamInfo?teamNumber=${account.data.scuntTeam}`)

            setAccount(account.data)
            if (data.status === 200) {
                setTeamInfo(data.teamInfo)
            }
            setLoading(false)
        }
        setLoading(true)
        getMissions()
    }, [])

    console.log(teamInfo)
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
                            <h2>Your Information</h2>
                            <Col md={4}>
                                <h3>Email</h3>
                                <p>{account.email}</p>
                            </Col>
                            <Col md={4}>
                                <h3>Discord Code</h3>
                                <p>{account.discordToken}</p>
                            </Col>
                            {
                                account.discordSignedIn ?   
                                <Col md={4}>
                                    <h3>Discord Username</h3>
                                    <p>{account.discordUsername}</p>
                                </Col> : 
                                <Col md={4}>
                                    <p>
                                        It seems like you haven't signed into discord yet.
                                        Please join <a href="https://discord.gg/ApuNhwxyjK">the havenger scunt server</a>!
                                    </p>
                                </Col>
                            }
                        </Row>
                        <Row>
                            <h2>Team Information</h2>
                            <Col md={3}> <h3> Team Number </h3> </Col>
                            <Col md={8}> <p> {teamInfo.number} </p> </Col>
                            <Col md={3}> <h3> Team Name </h3> </Col>
                            <Col md={8}> <p> {teamInfo.name} </p> </Col>
                        </Row>
                        <br/>
                        <Row>
                            <h2>Head Leedurs on your team</h2>
                            {
                                teamInfo.leedurInformation && teamInfo.leedurInformation.map(l =>
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