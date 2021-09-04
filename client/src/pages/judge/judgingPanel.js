import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MissionJudgeContainer, ContainerPopupModalConfirm, LoadingAnimation, BribeDeductionContainer } from '../../components/containers';
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'
import './judge.css'
var io = require("socket.io-client");

// statuses: submitted(live), submitted, judging, judging(live), complete, flagged
// tabs: Livestream, Unresolved, In-person judging, Bribes & Deductions, Completed, 
export default function JudgingPanel() {
    const [submittedmissions, setSubmittedmissions] = useState([])
    const [tabView, setTabView] = useState('unresolved')
    const [loading, setLoading] = useState(false)
    const [currentViewMore, setCurrentViewMore] = useState('')
    const [currentTicketId, setCurrentTicketId] = useState('')
    const [popUpConfirmPoints, setPopUpConfirmPoints] = useState(0)
    const updateScoreConfirm = useRef()
    const livestreamConfirm = useRef()
    const flagConfirm = useRef()

    const getSubmittedMissions = async () => {
        const { data } = await axios.get('/get/submittedmissions')
        if(data.status === 200) {
            setSubmittedmissions(() => data.submittedmissions)
        }else {
            alert(data.errorMsg);
        }
        setLoading(false)
    }

    useEffect(() => {
        setLoading(true)
        getSubmittedMissions()

        // socket.io client side setup
        console.log(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/judge-tickets`)
        const ticketSocket = io.connect(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/judge-tickets`)
        ticketSocket.on('connect', ()=> {
            console.log("client is connected!")
        });
        ticketSocket.on('submissionsChanged', (data)=> {
            setSubmittedmissions((oldSubmittedmissions) => {
                const oldMissionIdx = oldSubmittedmissions.findIndex(m => m._id === data._id)
                if (oldMissionIdx === -1) {
                    // Add to collection
                    return [data,...oldSubmittedmissions];
                }else {
                    // Update old list
                    oldSubmittedmissions[oldMissionIdx] = data;
                    return [...oldSubmittedmissions];
                }
            });
        });
        return () => ticketSocket.disconnect();
    }, [])

    const handleCancel = async (ticketId) => {
        // Update database submission status
        const { data } = await axios.post('/judge/update', {
            ticketId: ticketId,
            action: "cancel",
            newPoints: -1
        })
        if (data.status === 200) {
            setCurrentViewMore('')
        } else {
            alert(data.errorMsg)
        }
    }
    const handleJudging = async (ticketId) => {
        // Set old one back to submitted:
        if (currentViewMore){
            const { data } = await axios.post('/judge/update', {
                ticketId: currentViewMore,
                action: "cancel",
                newPoints: -1
            })
            if (data.status !== 200) {
                alert(data.errorMsg)
                return
            } 
        }
        // Update new one to judging
        const { data } = await axios.post('/judge/update', {
            ticketId: ticketId,
            action: "judging",
            newPoints: -1
        })
        if (data.status === 200) {
            setCurrentViewMore(ticketId)
        } else {
            alert(data.errorMsg)
        }
    }
    
    const handleUpdate = async (confirm) => {
        // Popup modal accepts a boolean
        if (confirm){
            // Update database submission status
            const { data } = await axios.post('/judge/update', {
                ticketId: currentViewMore,
                action: "update",
                newPoints: popUpConfirmPoints
            })
            if (data.status === 200) {
                setCurrentViewMore('')
                alert('success!')
            } else {
                alert(data.errorMsg)
            }
        }
    }

    const handleScreen = async (confirm) => {
        if (confirm){
            // Update database submission status
            const { data } = await axios.post('/judge/update', {
                ticketId: currentTicketId,
                action: "screen",
                newPoints: -1
            })
            if (data.status !== 200) {
                alert(data.errorMsg)
            }
        }
    }

    const handleFlag = async (confirm) => {
        if (confirm){
            // Update database submission status
            const { data } = await axios.post('/judge/update', {
                ticketId: currentViewMore,
                action: "flag",
                newPoints: -1
            })
            if (data.status === 200) {
                setCurrentViewMore('')
            } else {
                alert(data.errorMsg)
            }
        }
    }

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Judging Panel </HeaderPage>
            <br/>
            <div style={{marginLeft:"5rem"}}>
                <Button primary={tabView === "livestream"} label="Livestream" onClick={() => setTabView("livestream")}/>
                <Button primary={tabView === "unresolved"} label="Unresolved" onClick={() => setTabView("unresolved")}/>
                <Button primary={tabView === "in-person"} label="In-person judging" onClick={() => setTabView("in-person")}/>
                <Button primary={tabView === "bribes-and-deductions"} label="Bribes &amp; Deductions" onClick={() => setTabView("bribes-and-deductions")}/>
                <Button primary={tabView === "completed"} label="Completed" onClick={() => setTabView("completed")}/>
                <Button primary={tabView === "bribe-and-deduction-history"} label="Bribe & Deduction History" onClick={() => setTabView('bribe-and-deduction-history')}/>
            </div>
            <br/>
            { loading ?? <p>Loading ...</p> }
            <Container>
                {/* livestream tab */}
                {tabView === "livestream" 
                    && submittedmissions &&
                    submittedmissions.filter(m => m.status === "submitted(live)" || m.status === "judging(live)")
                    .map(m => 
                      <MissionJudgeContainer
                          ticketId={m._id}
                          number={m.number} 
                          teamNumber={m.teamNumber}
                          totalPoints={m.totalPoints}
                          achievedPoints={m.achievedPoints}
                          submissionLink={m.submissionLink}
                          status={m.status}
                          submitter={m.submitter}
                          category={m.category}
                          name={m.name}
                          timeCreated={m.timeCreated}
                          isMediaConsent={m.isMediaConsent}
                          viewMore={currentViewMore === m._id}
                          handleCancel={handleCancel}
                          handleJudging={handleJudging}
                          handleUpdate={() => {updateScoreConfirm?.current.setModalState(true); setPopUpConfirmPoints(localStorage[`mission${m.number}_team_${m.teamNumber}_points`])}}
                          handleFlag={() => {flagConfirm?.current.setModalState(true);}}
                      />
                    )
                  }

                {/* unresolved tab */}
                {tabView === "unresolved" 
                    && submittedmissions &&
                    submittedmissions.filter(m => m.status === "submitted" || m.status === "judging")
                    .map(m => 
                      <MissionJudgeContainer
                          ticketId={m._id}
                          number={m.number} 
                          teamNumber={m.teamNumber}
                          totalPoints={m.totalPoints}
                          achievedPoints={m.achievedPoints}
                          submissionLink={m.submissionLink}
                          status={m.status}
                          submitter={m.submitter}
                          category={m.category}
                          name={m.name}
                          timeCreated={m.timeCreated}
                          isMediaConsent={m.isMediaConsent}
                          viewMore={currentViewMore === m._id}
                          handleCancel={handleCancel}
                          handleJudging={handleJudging}
                          handleUpdate={() => {updateScoreConfirm?.current.setModalState(true); setPopUpConfirmPoints(localStorage[`mission${m.number}_team_${m.teamNumber}_points`])}}
                          handleScreen={() => {setCurrentTicketId(m._id); livestreamConfirm?.current.setModalState(true)}}
                          handleFlag={() => {flagConfirm?.current.setModalState(true)}}
                      />
                    )
                  }

                {/* in-person judging tab */}
                {tabView === "in-person" 
                    &&  <InPersonJudgingPanel />}

                {/* bribes and deduction tab */}
                {tabView === "bribes-and-deductions" 
                    &&  <BribesAndDeductions />}

                {/* bribes and deduction history */}
                {
                    tabView === 'bribe-and-deduction-history' &&
                    <BribeDeductionHistory/>
                }
                {/* completed tab */}
                {tabView === "completed" 
                    && submittedmissions &&
                    submittedmissions.filter(m => m.status === "complete" || m.status === "judging")
                    .map(m => 
                      <MissionJudgeContainer
                          ticketId={m._id}
                          number={m.number} 
                          teamNumber={m.teamNumber}
                          totalPoints={m.totalPoints}
                          achievedPoints={m.achievedPoints}
                          submissionLink={m.submissionLink}
                          status={m.status}
                          submitter={m.submitter}
                          category={m.category}
                          name={m.name}
                          timeCreated={m.timeCreated}
                          isMediaConsent={m.isMediaConsent}
                          viewMore={currentViewMore === m._id}
                          handleCancel={handleCancel}
                          handleJudging={handleJudging}
                          handleUpdate={() => {updateScoreConfirm?.current.setModalState(true); setPopUpConfirmPoints(localStorage[`mission${m.number}_team_${m.teamNumber}_points`])}}
                          handleFlag={() => {flagConfirm?.current.setModalState(true)}}
                      />
                    )
                  }
            </Container>

            {/* pop up modals */}
            <ContainerPopupModalConfirm 
                ref={updateScoreConfirm} 
                labelYes="Update" 
                labelNo="Cancel" 
                buttonCallback={handleUpdate}
                header={`Are you sure?`} 
                message={`New point: ${popUpConfirmPoints}`} 
            />
            <ContainerPopupModalConfirm 
                ref={livestreamConfirm} 
                labelYes="Move to Live stream" 
                labelNo="Cancel" 
                buttonCallback={handleScreen}
                header={`Are you sure?`} 
                message={`Once you move the mission to the live stream category, you cannot move it back`} 
            />
            <ContainerPopupModalConfirm 
                ref={flagConfirm} 
                labelYes="Flag" 
                labelNo="Cancel" 
                buttonCallback={handleFlag}
                header={`Are you sure?`} 
                message={`Flagging this item will send it to the scunt admins, and you won't be able to view/judge it anymore`} 
            />
        </div>
    )
}

function InPersonJudgingPanel() {
    const [teams, setTeams] = useState([])
    const [missions, setMissions] = useState([])
    const [searchResults, setSearchResults] = useState([])
    const [searchErr, setSearchErr] = useState('')

    const [missionToUpdate, setMissionToUpdate] = useState({})
    const [teamNumber, setTeamNumber] = useState(undefined)
    const [achievedPoints, setAchievedPoints] = useState(undefined)
    const [newPoints, setNewPoints] = useState(undefined)
    const [newPointsErrMsg, setNewPointsErrMsg] = useState('')
    const searchBarRef = useRef()
    const newPointsRef = useRef()

    useEffect(()=> {
        const getTeamsAndMissions = async () => {
            const missionRes = await axios.get('/get/missions')  
            if(missionRes.data.status === 200) {
              setMissions(() => missionRes.data.missions.map(m => ({
                  text: `${m.number} - ${m.name}`,
                  number: m.number,
                  name: m.name, 
                  category: m.category, 
                  totalPoints: m.totalPoints
              })))
            }

            const teamRes = await axios.get('/get/leedur/teams')
            if (teamRes.data.status === 200) setTeams(teamRes.data.teams)
          }
          getTeamsAndMissions()
    }, [])

    const getPointsErrMsg = (value) =>{
        if (value > missionToUpdate.totalPoints * 1.5 || value < achievedPoints) {
            setNewPointsErrMsg('value out of range')
        } else {
            setNewPoints(value)
            setNewPointsErrMsg('')
        }
    }

    function formatStrings(string){
        return string.replace(" ","").replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    }
  
    const handleSearch = (text) => {
        if( text.length > 0) {
            let textFormatted = formatStrings(text)
            const searchItems = missions.filter(m => formatStrings(m.text).includes(textFormatted))
            if (searchItems.length === 0) {
                setSearchErr("no search result")
            } else {
                setSearchErr('')
            }
            setSearchResults(searchItems)
        } else {
            setSearchResults([])
        }
    }

    const handlePopulate = async(mission) => {
        setMissionToUpdate(mission)
        searchBarRef?.current.setValue(mission.text)
        setSearchResults([])
    }
    const handlePopulateTeamInfo = async(teamNumber) => {
        if (teamNumber > 0 && teamNumber <= teams.length) {
            setTeamNumber(teamNumber)
            if (!missionToUpdate.number) {
                alert("please fill out the mission number first")
                return
            }
            // get achieved points
            const { data } = await axios.post('/judge/get-team-mission-points', {
                number: missionToUpdate.number,
                teamNumber: teamNumber,
            })
            if (data.status !== 200) {
                alert(data.errorMsg)
            }
            setAchievedPoints(data.achievedPoints)
        }
    }

    const handleClear = async() => {
        searchBarRef?.current.inputChange("")
        newPointsRef?.current.inputChange("")
        setMissionToUpdate({})
        setTeamNumber(undefined)
        setAchievedPoints(undefined)
    }
    const handleManualUpdate = async() => {
        if (!missionToUpdate.number || !teamNumber || !newPoints ) {
            alert('Please fill out all the input fields')
            return
        }
        const { data } = await axios.post('/judge/manual-update', {
            number: missionToUpdate.number,
            teamNumber: teamNumber,
            newPoints: newPoints
        })
        if (data.status === 200) {
            alert('success!')
            await handleClear()
        } else {
            alert(data.errorMsg)
        }
    }

    return (
        <div>                
            <Row>
                <Col md={5}>
                    <h3>Enter mission number &amp; team number below</h3>
                    {missions.length > 0 ?
                        <>
                            <FormTextBox 
                                style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                                type={"text"} 
                                label={"Search Mission by number or name"} 
                                onChange={handleSearch}
                                ref={searchBarRef}
                                error={searchErr}
                            />
                            {searchResults.map((m) => 
                                <h4 className="search-results" onClick={() => handlePopulate(m)}> {m.text} </h4>
                                )
                            }
                        </>
                        : <p> There are no missions to judge at the momment</p>
                    }
                    {teams.length > 0 &&
                        <FormDropdownMenu
                            label="Team Number"
                            items={["Select Team"].concat(teams)}
                            onChange={(idx, item) => {
                                handlePopulateTeamInfo(idx)
                            }}
                        />
                    }
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        type={"number"} 
                        label={"New Points"} 
                        description={`Achieved Points: ${0}/${0}`}
                        ref={newPointsRef}
                        onChange = {getPointsErrMsg}
                        error = {newPointsErrMsg}
                        />
                </Col>
                <Col md={2}></Col>
                <Col md={5}>
                    <h3>Verify your submission</h3>
                    <table>
                        <tr>
                            <td> <h4>Mission Number:</h4> </td>
                            <td> <p>{missionToUpdate.number}</p> </td>
                        </tr>
                        <tr>
                            <td> <h4>Mission Name:</h4> </td>
                            <td> <p>{missionToUpdate.name}</p> </td>
                        </tr>
                        <tr>
                            <td> <h4>Category:</h4> </td>
                            <td> <p>{missionToUpdate.category}</p> </td>
                        </tr>
                        <tr>
                            <td> <h4>Total Points:</h4> </td>
                            <td> <p>{missionToUpdate.totalPoints}</p> </td>
                        </tr>
                        <tr>
                            <td> <h4>Team Number:</h4> </td>
                            <td> <p>{teamNumber}</p> </td>
                        </tr>
                        <tr>
                            <td> <h4>Achieved Points:</h4> </td>
                            <td> <p>{achievedPoints}</p> </td>
                        </tr>
                        <tr>
                            <td> <h4>New Points:</h4> </td>
                            <td> <p>{newPoints}</p> </td>
                        </tr>
                    </table>
                    <br/> 
                </Col>
            </Row>
            <div style={{float:"right"}}>
            <Button label={"Update"} onClick={handleManualUpdate}/>
            <Button label={"Clear"} primary={false} onClick={handleClear}/>
            </div>
        </div>
    )
}

function BribeDeductionHistory() {
    const [bribesAndDeductions, setBribesAndDeductions] = useState([])

    useEffect(() => {
        const getBribesAndDeduc = async () => {
            const { data } = await axios.get('/get/judge/bribe-deduction-history')
            if (data.status === 200) setBribesAndDeductions(data.bribesAndDeductions)
        }
        getBribesAndDeduc()
    })

    return(
        <div>
            { bribesAndDeductions.length <= 0 && <LoadingAnimation/> }
            {
                bribesAndDeductions.length > 0 && bribesAndDeductions.map(m => <BribeDeductionContainer {...m}/>)
            }
        </div>
    )
}

function BribesAndDeductions() {
    const [teams, setTeams] = useState([])
    const [accountInfo, setAccountInfo] = useState({})
    const [bribesTeamNumber, setBribesTeamNumber] = useState(undefined)
    const [bribesPoints, setBribesPoints] = useState(undefined)
    const [deductionsTeamNumber, setDeductionsTeamNumber] = useState(undefined)
    const [deductionPoints, setDeductionPoints] = useState(undefined)

    useEffect(()=> {
        const getTeamsAndAccountInfo = async () => {
            const teamRes = await axios.get('/get/leedur/teams')
            if (teamRes.data.status === 200) setTeams(teamRes.data.teams)
            const account = await axios.get('/user/current')
            setAccountInfo(account.data)
        }
          getTeamsAndAccountInfo()
    }, [])

    const handleBribesUpdate = async() => {
        if (!bribesTeamNumber || !bribesPoints ) {
            alert('Please fill out all the input fields')
            return
        }
        if (bribesPoints > accountInfo.bribePointsLeft ) {
            alert('No bribes points left :(')
            return
        }
        const { data } = await axios.post('/judge/special-update', {
            action: 'bribes',
            teamNumber: bribesTeamNumber,
            pointsChanged: bribesPoints
        })
        if (data.status === 200) {
            alert('success!')
        } else {
            alert(data.errorMsg)
        }
    }

    const handleDeductionsUpdate = async() => {
        if (!deductionsTeamNumber || !deductionPoints  || deductionPoints < 0) {
            alert('Please fill out all the input fields and make sure deduction points are positive')
            return
        }
        const { data } = await axios.post('/judge/special-update', {
            action: 'deductions',
            teamNumber: deductionsTeamNumber,
            pointsChanged: deductionPoints
        })
        if (data.status === 200) {
            alert('success!')
        } else {
            alert(data.errorMsg)
        }
    }

    return (
        <div>                
            <Row>
                <Col md={5}>
                    <h3>Bribes</h3>
                    <p>You have {accountInfo.bribePointsLeft} bribe points left</p>
                    {teams.length > 0 &&
                        <FormDropdownMenu
                            label="Team Number"
                            items={["Select Team"].concat(teams)}
                            onChange={(idx, item) => {
                                setBribesTeamNumber(idx)
                            }}
                        />
                    }
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        type={"number"} 
                        label={"Bribes Points"} 
                        description={`Bribes Points remaining: ${0}`}
                        onChange = {setBribesPoints}
                        />
                    <div style={{float:"right"}}>
                        <Button label={"Update"} onClick={handleBribesUpdate}/>
                    </div>
                </Col>
                <Col md={2}></Col>
                <Col md={5}>
                    <h3>Deductions</h3>
                    {teams.length > 0 &&
                        <FormDropdownMenu
                            label="Team Number"
                            items={["Select Team"].concat(teams)}
                            onChange={(idx, item) => {
                                setDeductionsTeamNumber(idx)
                            }}
                        />
                    }
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        inputId={'Deduction Points'} 
                        type={"number"} 
                        label={"Deduction Points"} 
                        description={`Enter the positive number of points you want to deduct`}
                        onChange = {setDeductionPoints}
                        />
                    <div style={{float:"right"}}>
                        <Button label={"Update"} onClick={handleDeductionsUpdate}/>
                    </div>
                    <br/> 
                </Col>
            </Row>
        </div>
    )
}