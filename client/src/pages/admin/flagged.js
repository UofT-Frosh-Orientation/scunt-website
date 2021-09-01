import React, { useEffect, useRef, useState } from 'react'
import { HeaderPage } from "../../components/texts"
import { Button } from '../../components/buttons'
import { ContainerPopupModalConfirm, LoadingAnimation, MissionFroshContainer } from '../../components/containers'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import './dashboard.css'

export default function FlaggedAdminView () {
    const [flaggedMissions, setFlaggedMissions] = useState([])

    useEffect(() => {
        const getMissions = async () => {
            const { data } = await axios.get('/get/admin/flagged-missions')
            console.log(data)
            if (data.status === 200) setFlaggedMissions(data.missions)
        }
        getMissions()
    }, [])

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Scunt Admin - Manage Flagged Missions </HeaderPage>
            <br/>
            <Container>
                <p>View all flagged missions here.</p>
                <div>
                    { flaggedMissions.length <= 0 && <LoadingAnimation/> }
                    { flaggedMissions.length > 0 && flaggedMissions.map(m => <MissionFroshContainer {...m}/>) }
                </div>
            </Container>
        </div>
    )
}