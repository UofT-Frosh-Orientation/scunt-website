import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Button } from '../../components/buttons'
import { FormCheckbox, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'
import './frosh.css'

export default function SubmitMission() {
    const [missions, setMissions] = useState([])
    const [submissionLink, setSubmissionLink] = useState('')
    const [missionNumber, setMissionNumber] = useState(null)
    const [isMediaConsent, setIsMediaConsent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [accountInfo, setAccountInfo] = useState({})
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const getMissions = async () => {
          const { data } = await axios.get('/get/missions')
          const account = await axios.get('/user/current')

          setAccountInfo(account.data)
          if(data.status === 200) {
            setMissions(() => data.missions.map(m => ({
                text: `${m.number} - ${m.name}`,
                number: m.number
            })))
          }
          if(window.location.search.includes('missionNumber')) setMissionNumber(parseInt(window.location.search.split('=')[1]))
          setIsMediaConsent(localStorage['mission-media-consent'])
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
            setSearchResults(missions.filter(m => formatStrings(m.text).includes(textFormatted)))
        }
        setIsSearching(notEmpty)
    }

    const submit = async () => {
        const { data } = await axios.post('/post/submission', {
            email: accountInfo.email, 
            missionNumber: missionNumber,
            teamNumber: accountInfo.scuntTeam,
            submissionLink: submissionLink,
            isMediaConsent
        })

        if(data.status === 200) {
            alert(`Your submission for mission ${missionNumber} has been submitted, thank you!`)
        } else {
            alert(data.errorMsg)
        }
    }

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> {missionNumber ? `Submitting Mission ${missionNumber}` : 'Submit a Mission'} </HeaderPage>
            <br/>
            <Container>
                <p>You must put a link (make sure its viewable to everyone) to your submission. Please upload your submission first before submitting here.</p>
                <Row>
                    <Col md={5}>
                        <h3>Enter submission</h3>
                        {
                            missions.length > 0 ?
                                <>
                                    <FormTextBox 
                                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                                        inputId={'missionSearchBar'} 
                                        type={"text"} 
                                        label={"Search Mission"} 
                                        onChange={handleSearch}
                                    />
                                    {
                                        isSearching ? 
                                            searchResults.map((m) => 
                                                <Button primary={false} label={m.text} onClick={() => setMissionNumber(m.number)}/>
                                            ) : missionNumber ? <p>Choose another mission</p> :
                                        <p>There are no results for this search.</p>
                                    }
                                </>
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
                        <FormCheckbox
                            localStorageKey="mission-media-consent"
                            label="Would you like to have this mission judged on the Scunt Live Stream?"
                            option="I consent to have this mission judged live"
                            onChange={(checked) => setIsMediaConsent(checked)}
                            />
                    </Col>
                    <Col md={1}/>
                    <Col md={6}>
                        <h3>Verify your submission</h3>
                        <p>If any of this information is incorrect, please let a Leedur or the Frosh Teach Team know.</p>
                        <ul className="verify-submission">
                            <li>
                                <h4>Email:</h4>
                                <p>{accountInfo.email}</p>
                            </li>
                            <li>
                                <h4>Team Number:</h4>
                                <p style={{fontWeight: 'bold'}}>{accountInfo.scuntTeam}</p>
                            </li>
                            <li>
                                <h4>Mission Number:</h4>
                                <p style={{fontWeight: 'bold'}}>{missionNumber}</p>
                            </li>
                            <li>
                                <h4>Submission link:</h4>
                                <p style={{
                                    maxHeight: '50px', 
                                    overflowY: 'hidden',
                                    whiteSpace: 'nowrap'
                                }}>{submissionLink}</p>
                            </li>
                            <li>
                                <h4>Media Consent:</h4>
                                <p style={{color: isMediaConsent ? 'green' : 'brown'}}>
                                    {isMediaConsent ?  'I consent to have this mission judged on the live stream' : 'I would not like this mission to be judged on the live stream'}
                                </p>
                            </li>
                        </ul>
                        <br/>
                        <Button primary label="Submit!" onClick={submit} disabled={missions.length <= 0}/>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}