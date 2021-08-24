import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MissionJudgeContainer, ContainerPopupModalConfirm } from '../../components/containers';
import { Button } from '../../components/buttons'
import { FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'
import './judge.css'
var io = require("socket.io-client");

// statuses: submitted, judging, complete
export default function JudgingPanel() {
    const [submittedmissions, setSubmittedmissions] = useState([])
    const [statusView, setStatusView] = useState('submitted')
    const [loading, setLoading] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [accountInfo, setAccountInfo] = useState({})
    const [currentViewMore, setCurrentViewMore] = useState('')
    const [popUpConfirmPoints, setPopUpConfirmPoints] = useState(0)
    const updateScoreConfirm = useRef()


    const getSubmittedMissions = async () => {
        const account = await axios.get('/user/current')
        setAccountInfo(account.data)

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

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Judging Panel </HeaderPage>
            <br/>
            <div style={{marginLeft:"5rem"}}>
                <Button primary={statusView === "submitted"} label="Unresolved" onClick={() => setStatusView("submitted")}/>
                <Button primary={statusView === "complete"} label="Completed" onClick={() => setStatusView("complete")}/>
            </div>
            { loading ?? <p>Loading ...</p> }
            <Container>
            { submittedmissions &&
              submittedmissions.filter(m => m.status === statusView || m.status === "judging")
              .map(m => 
                <MissionJudgeContainer
                    ticketId={m._id}
                    number={m.number} 
                    teamNumber={m.teamNumber}
                    totalPoints={m.totalPoints}
                    currPoints={m.achievedPoints}
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
                />
              )
            }
            </Container>

            <ContainerPopupModalConfirm 
                ref={updateScoreConfirm} 
                labelYes="Update" 
                labelNo="Cancel" 
                buttonCallback={handleUpdate}
                header={`Are you sure?`} 
                message={`New point: ${popUpConfirmPoints}`} 
            />

            <ManualUpdatePanel />
        </div>
    )
}

function ManualUpdatePanel(handleClick) {
    const manualUpdatePopup = useRef()
    const [currentView, setCurrentView] = useState('manualUpdate')  //manualUpdate or bribes
    const [missionToUpdate, setMissionToUpdate] = useState({})
    const [teamNumber, setTeamNumber] = useState(undefined)
    const [currPoints, setCurrPoints] = useState(undefined)
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
        setCurrPoints(100)
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
            <ContainerPopupModalConfirm 
                header="In Person Update and Bribes" 
                blurBackground={true} 
                ref={manualUpdatePopup} 
                labelYes="Confirm and update" 
                labelNo="Cancel" 
                buttonCallback={handleManualUpdate}>

                <div>
                    <Button primary={currentView === "manualUpdate"} label="Update submissions" onClick={() => setCurrentView("manualUpdate")}/>
                    <Button primary={currentView === "bribes"} label="Bribes" onClick={() => setCurrentView("bribes")}/>
                </div>
                
                {currentView==="manualUpdate"? 
                <Container>
                <Row>
                    <Col md={5}>
                        <h3>Enter mission number &amp; team number below</h3>
                        <FormTextBox 
                            style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                            inputId={'missionNumber'} 
                            type={"text"} 
                            label={"mission #"} 
                            description={"please type in the mission number"} 
                            onChange={handlePopulate}
                            />
                        <FormTextBox 
                            style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                            inputId={'teamNumber'} 
                            type={"text"} 
                            label={"team #"} 
                            description={"team number (not team name!)"}
                            onChange = {handlePopulateTeamInfo} 
                            />
                        <FormTextBox 
                            style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                            inputId={'newPointsManualUpdate'} 
                            type={"text"} 
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
                                <td> <p>{currPoints}</p> </td>
                            </tr>
                            <tr>
                                <td> <h4>New Points:</h4> </td>
                                <td> <p>{newPoints}</p> </td>
                            </tr>
                        </table>
                        <br/> 
                    </Col>
                </Row>
                <br/> 
                </Container>
                        : 
                <div></div>}


            </ContainerPopupModalConfirm>

            <div className="floating-button" onClick={() => {manualUpdatePopup.current.setModalState(true)}}>
                <span className="material-icons">
                    add
                </span>    
            </div>
        </div>
    )
}