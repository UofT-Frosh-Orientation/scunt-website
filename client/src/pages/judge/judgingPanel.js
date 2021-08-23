import axios from 'axios'
import React, { useEffect, useState, useRef } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MissionJudgeContainer, ContainerPopupModalConfirm } from '../../components/containers';
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'

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

    useEffect(() => {
        const getSubmittedMissions = async () => {
        //   const account = await axios.get('/user/current')
        //   setAccountInfo(account.data)

        //   const { data } = await axios.get('/get/submittedmissions')
        //   if(data.status === 200) {
        //     setSubmittedmissions(() => data.missions)
        //   }
          // test
          setSubmittedmissions(() => [
              {_id: "612176f4df57ff16f4274299",
                category:"The Classics",
                submitter:"YuYing-Liang",
                totalPoints: 0,
                name:"5 condoms you got for free",
                number : 3,
                status:"submitted",
                submissionLink:"https://google.ca",
                teamNumber:1,
                timeCreated: "2021-08-21T21:58:12.822+00:00",
                },
                {_id: "612176f4df57ff16f4274298",
                category:"The Classics",
                submitter:"YuYing-Liang",
                totalPoints: 0,
                name:"5 condoms you got for free",
                number : 4,
                status:"judging",
                submissionLink:"https://google.ca",
                teamNumber:1,
                timeCreated: "2021-08-21T21:58:12.822+00:00",
                },
                {_id: "612176f4df57ff16f4274296",
                category:"The Classics",
                submitter:"YuYing-Liang",
                totalPoints: 0,
                name:"5 condoms you got for free",
                number : 3,
                status:"completed",
                submissionLink:"https://google.ca",
                teamNumber:2,
                timeCreated: "2021-08-21T21:58:12.822+00:00",
                },
          ])
          setLoading(false)
        }
        setLoading(true)
        getSubmittedMissions()
    }, [])

    const handleCancel = () => {
        setCurrentViewMore('')
        console.log("set status back to submitted")
    }
    const handleJudging = (requestId) => {
        console.log("set old one back to submitted: ", currentViewMore)
        setCurrentViewMore(requestId)
        console.log("set status to judging")
    }
    const handleUpdate = (confirm) => {
        // Popup modal accepts a boolean
        if (confirm){
            console.log("route to update score")
            const err = undefined

            if (!err){
                setCurrentViewMore('')
                console.log("set status to completed")
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
            {
              submittedmissions.filter(m => m.status === statusView || m.status === "judging")
              .map(m => 
                <MissionJudgeContainer
                    requestId={m._id}
                    number={m.number} 
                    teamNumber={m.teamNumber}
                    totalPoints={m.totalPoints}
                    currPoints={m.currentPoints}
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