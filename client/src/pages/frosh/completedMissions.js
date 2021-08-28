import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import { LoadingAnimation, MissionFroshContainer, MissionGeneralContainer, MissionIncompleteContainer } from '../../components/containers'
import { FormDropdownMenu } from '../../components/forms'
import { HeaderPage } from '../../components/texts'

export default function CompletedMissions() {
    const [missions, setMissions] = useState({})
    const [accountInfo, setAccountInfo] = useState({})
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        const getMissions = async () => {
            const account = await axios.get('/user/current')
            const { data } = await axios.get(`/get/frosh/missions?teamNumber=${account.data.scuntTeam}`)

            setAccountInfo(account.data)
            if (data.status === 200) {
                setMissions({
                    "Missions in Judging": data.inProgressMissions.map(m => <MissionFroshContainer {...m}/>),
                    "Completed Missions": data.completedMissions.map(m => <MissionFroshContainer {...m}/>),
                    "Incomplete Missions": data.incompleteMissions.map(m => <MissionIncompleteContainer {...m}/>),
                    "Submitted by me": data.submittedByUser.map(m => <MissionFroshContainer {...m}/>)
                })
                setFilter("Incomplete Missions")
            }
            setLoading(false)
        }
        setLoading(true)
        getMissions()
    }, [])

    return(
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Submitted and Completed Missions </HeaderPage>
            <br/>
            <Container>
                { 
                    missions["Incomplete Missions"] && missions["Missions in Judging"] && missions["Completed Missions"]
                    && <FormDropdownMenu
                        label="Filter by mission status"
                        items={["Incomplete Missions", "Missions in Judging", "Completed Missions", "Submitted by me"]}
                        onChange={(idx, item) => setFilter(item)}
                    />
                }
                { loading && <div className="center"><LoadingAnimation/></div> }
                { !loading && missions[filter] }
            </Container>
        </div>
    )
}