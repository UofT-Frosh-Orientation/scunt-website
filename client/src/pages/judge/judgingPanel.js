import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MissionJudgeContainer, ContainerPopupModalConfirm } from '../../components/containers';
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'
var io = require("socket.io-client");

// statuses: submitted, judging, completed
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
            console.log(data);
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
                <Button primary={statusView === "completed"} label="Completed" onClick={() => setStatusView("completed")}/>
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
        </div>
    )
}