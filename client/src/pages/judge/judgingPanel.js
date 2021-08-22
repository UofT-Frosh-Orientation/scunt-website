import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MissionJudgeContainer } from '../../components/containers';
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'

export default function JudgingPanel() {
    const [missions, setMissions] = useState([])
    const [submissionLink, setSubmissionLink] = useState('')
    const [missionNumber, setMissionNumber] = useState(0)
    const [loading, setLoading] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [accountInfo, setAccountInfo] = useState({})

    useEffect(() => {
        const getMissions = async () => {
          const { data } = await axios.get('/get/missions')
          const account = await axios.get('/user/current')

          setAccountInfo(account.data)
          if(data.status === 200) {
            setMissions(() => data.missions.map(m => `${m.number} - ${m.name}`))
          }
          setLoading(false)
        }
        setLoading(true)
        getMissions()
    }, [])

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Judging Panel </HeaderPage>
            <br/>
            <Container>
               <MissionJudgeContainer 
                number={3} 
                teamNumber={"test"}
                totalPoints={500}
                submissionLink={"https://www.google.com"}
                status={"submitted"}
                submitter={"yuying"}
                category={"classics"}
                name={"do blah blah and balh"}
                timeCreated="today"
              />
            </Container>
        </div>
    )
}