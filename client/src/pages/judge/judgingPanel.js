import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MissionJudgeContainer, ContainerPopupModalConfirm } from '../../components/containers';
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
        const ticketSocket = io.connect(`http://localhost:6969/judge-tickets`)
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
                <Button primary={tabView === "livestream"} label="Livestream" onClick={() => setTabView("submitted")}/>
                <Button primary={tabView === "unresolved"} label="Unresolved" onClick={() => setTabView("unresolved")}/>
                <Button primary={tabView === "in-person"} label="In-person judging" onClick={() => setTabView("in-person")}/>
                <Button primary={tabView === "bribes-and-deductions"} label="Bribes &amp; Deductions" onClick={() => setTabView("bribes-and-deductions")}/>
                <Button primary={tabView === "completed"} label="Completed" onClick={() => setTabView("completed")}/>
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
    const [missionToUpdate, setMissionToUpdate] = useState({})
    const [teamNumber, setTeamNumber] = useState(undefined)
    const [achievedPoints, setAchievedPoints] = useState(undefined)
    const [newPoints, setNewPoints] = useState(undefined)

    useEffect(()=> {
    }, [])

    const handlePopulate = async(missionNumber) => {
        // validate, 
        // get mission info
        setMissionToUpdate({
            number: 1,
            name: "test test test",
            category: "classics",
            totalPoints: 500
        })
    }
    const handlePopulateTeamInfo = async(teamNumber) => {
        // validate, 
        // get team info
        setTeamNumber(teamNumber)
        setAchievedPoints(100)
    }
    const handleManualUpdate = async(confirm) => {
        if (confirm){
            // update
        }else {
            // clear state
        }
    }

    return (
        <div>                
            <Row>
                <Col md={5}>
                    <h3>Enter mission number &amp; team number below</h3>
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        inputId={'missionSearchBar'} 
                        type={"text"} 
                        label={"Search Mission"} 
                        onChange={handlePopulate}
                    />
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        inputId={'missionNumber'} 
                        type={"number"} 
                        label={"mission #"} 
                        description={"please type in the mission number"} 
                        onChange={handlePopulate}
                        />
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        inputId={'teamNumber'} 
                        type={"number"} 
                        label={"team #"} 
                        description={"team number (not team name!)"}
                        onChange = {handlePopulateTeamInfo} 
                        />
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        inputId={'newPointsManualUpdate'} 
                        type={"number"} 
                        label={"New Points"} 
                        description={`Current Points: ${0}/${0}`}
                        onChange = {setNewPoints}
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
                            <td> <h4>Current Points:</h4> </td>
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
            <Button label={"Clear"} primary={false} onClick={handleManualUpdate}/>
            </div>
        </div>
    )
}

function BribesAndDeductions() {
    const [missionToUpdate, setMissionToUpdate] = useState({})
    const [teamNumber, setTeamNumber] = useState(undefined)
    const [achievedPoints, setAchievedPoints] = useState(undefined)
    const [newPoints, setNewPoints] = useState(undefined)

    useEffect(()=> {
    }, [])

    const handlePopulate = async(missionNumber) => {
        // validate, 
        // get mission info
        setMissionToUpdate({
            number: 1,
            name: "test test test",
            category: "classics",
            totalPoints: 500
        })
    }
    const handlePopulateTeamInfo = async(teamNumber) => {
        // validate, 
        // get team info
        setTeamNumber(teamNumber)
        setAchievedPoints(100)
    }
    const handleManualUpdate = async(confirm) => {
        if (confirm){
            // update
        }else {
            // clear state
        }
    }

    return (
        <div>                
            <Row>
                <Col md={5}>
                    <h3>Bribes</h3>
                    <FormDropdownMenu 
                        label="Team Number"
                        items={["yes", "no"]}
                        onChange={(idx, item) => {
                        
                        }}
                    />
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        inputId={'BribesPoints'} 
                        type={"number"} 
                        label={"Bribes Points"} 
                        description={`Current Points: ${0}/${0}`}
                        onChange = {setNewPoints}
                        />
                    <div style={{float:"right"}}>
                        <Button label={"Update"} onClick={handleManualUpdate}/>
                        <Button label={"Clear"} primary={false} onClick={handleManualUpdate}/>
                    </div>
                </Col>
                <Col md={2}></Col>
                <Col md={5}>
                    <h3>Deductions</h3>
                    <FormDropdownMenu 
                        label="Team Number"
                        items={["yes", "no"]}
                        onChange={(idx, item) => {
                        
                        }}
                    />
                    <FormTextBox 
                        style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                        inputId={'Deduction Points'} 
                        type={"number"} 
                        label={"Bribes Points"} 
                        description={`Current Points: ${0}/${0}`}
                        onChange = {setNewPoints}
                        />
                    <div style={{float:"right"}}>
                        <Button label={"Update"} onClick={handleManualUpdate}/>
                        <Button label={"Clear"} primary={false} onClick={handleManualUpdate}/>
                    </div>
                    <br/> 
                </Col>
            </Row>
        </div>
    )
}