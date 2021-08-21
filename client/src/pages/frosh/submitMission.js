import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'

export default function SubmitMission() {
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

    function formatStrings(string){
        return string.replace(" ","").replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    }
  
    const handleSearch = (text) => {
        const notEmpty = text.length > 0;
        if(notEmpty) {
            let textFormatted = formatStrings(text)
            setSearchResults(() => missions.filter(m => formatStrings(m).includes(textFormatted)))
        }
    }

    const submit = async () => {
        const { data } = await axios.post('/post/submission', {
            email: accountInfo.email, 
            missionNumber: missionNumber,
            teamNumber: accountInfo.scuntTeam,
            submissionLink: submissionLink
        })

        if(data.status === 200) {
            alert(`Your submission for mission ${missionNumber} has been submitted, thank you!`)
        }
    }

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Submit a Mission </HeaderPage>
            <br/>
            <Container>
                <p>You must put a link (make sure its viewable to everyone) to your submission. Please upload your submission first before submitting here.</p>
                <Row>
                    <Col md={5}>
                        <h3>Enter submission</h3>
                        <FormTextBox 
                            style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                            inputId={'missionSearchBar'} 
                            type={"text"} 
                            label={"Search"} 
                            description={"Looking for a Mission?"} 
                            onChange={handleSearch}
                            />
                        {
                            missions.length > 0 ?
                                searchResults.length > 0 ? searchResults.map((m, i) => 
                                    <Button primary={false} label={m} onClick={setMissionNumber(i)}/>
                                ) : <p>There are no results for this search.</p>
                            : <p> There are no missions you can submit to at the moment</p>
                        }
                        <FormTextBox 
                            style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                            inputId={'submissionLink'} 
                            type={"text"} 
                            label={"Enter submission link"} 
                            description={"Your submission link"} 
                            onChange={setSubmissionLink}
                            />
                    </Col>
                    <Col md={2}/>
                    <Col md={5}>
                        <h3>Verify your submission</h3>
                        <table>
                            <tr>
                                <td> <h4>Email:</h4> </td>
                                <td> <p>{accountInfo.email}</p> </td>
                            </tr>
                            <tr>
                                <td> <h4>Team Number:</h4> </td>
                                <td> <p>{accountInfo.scuntTeam}</p> </td>
                            </tr>
                            <tr>
                                <td> <h4>Mission Number:</h4> </td>
                                <td> <p>{missionNumber}</p> </td>
                            </tr>
                            <tr>
                                <td> <h4>Submission link:</h4> </td>
                                <td> <p>{submissionLink}</p> </td>
                            </tr>
                        </table>
                        <br/>
                        <Button primary label="Submit!" onClick={submit} disabled={missions.length <= 0}/>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}