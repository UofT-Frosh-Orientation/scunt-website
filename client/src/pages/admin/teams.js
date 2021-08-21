import React, { useEffect, useRef, useState } from 'react'
import { HeaderPage } from "../../components/texts"
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { ContainerPopupModal, ContainerPopupModalConfirm, TeamInfo } from '../../components/containers'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import './dashboard.css'

export default function TeamsAdminView() {
    const [accountInfo, setAccountInfo] = useState({})
    const [teams, setTeams] = useState([])

    useEffect(() => {
        const getInfo = async () => {
            const account = await axios.get('/user/current')
            // const teams = await axios.get('/get/admin/teams')

            setAccountInfo(account.data)
            // setTeams(teams.data)
        }
        getInfo()
    }, [])

    return(
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Scunt Admin - Manage Teams </HeaderPage>
            <br/>
            <Container>
                <h3>{accountInfo.name}</h3>
                <p>{accountInfo.email}</p>
                <TeamInfo
                    name="Team 1"
                    score={100}
                    missionsCompleted={[1,2,3,4,5,6]}
                    participants={[
                        {
                            email: "blah@gmail.com",
                        },
                        {
                            email: "blah@gmail.com",
                        },
                        {
                            email: "bloo@gmail.com",
                        },
                        {
                            email: "gaga@gmail.com",
                            warned: true
                        },
                        {
                            email: "blah@gmail.com",
                        },
                        {
                            email: "blah@gmail.com",
                        },
                        {
                            email: "bloo@gmail.com",
                        },
                        {
                            email: "gaga@gmail.com",
                        },
                    ]}
                />
            </Container>
        </div>
    )
}