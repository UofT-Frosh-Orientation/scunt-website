import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { Container } from 'react-bootstrap'
import { Button } from '../../components/buttons'
import { ContainerPopupModalConfirm, TeamInfo } from '../../components/containers'
import { HeaderPage } from "../../components/texts"
import './dashboard.css'

export default function TeamsAdminVeiw() {
    const confirmRevealTeams = useRef(), confirmStartEvent = useRef(), deleteAllConfirm = useRef()
    const [accountInfo, setAccountInfo] = useState({})
    const [teams, setTeams] = useState([])
    const [eventDetails, setEventDetails] = useState({})
    const [actionMsg, setActionMsg] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getInfo = async () => {
            const account = await axios.get('/user/current')
            const teams = await axios.get('/get/admin/teams')
            const event = await axios.get('/get/eventDetails')
            setAccountInfo(account.data)
            setEventDetails(event.data)
            if (teams.status === 200) setTeams(teams.data.teams)
        }
        getInfo()
    }, [])

    const getTeams = async () => {
        setLoading(true)
        setActionMsg('Uploading teams ☝ ...')
        const { data } = await axios.post('/upload/admin/teams')

        if(data.status === 200) {
            const teams = await axios.get('/get/admin/teams')
            setTeams(teams.data.teams)
            setActionMsg('Teams successfully uploaded 😎')
        } else {
            setActionMsg(`${data.errorMsg} 😓`)
        }
        setLoading(false)
    }

    const deleteTeam = async (num) => {
        setLoading(true)
        setActionMsg(`Deleting team ${num} 🚽 ...`)
        const { data } = await axios.delete(`/delete/admin/team?number=${num}`)

        if(data.status === 200) {
            const teams = await axios.get('/get/admin/teams')
            setTeams(teams.data.teams)
            setActionMsg(`Team ${num} successfully deleted ✨`)
        } else {
            setActionMsg(`${data.errorMsg} 😓`)
        }
        setLoading(false)
    }

    const getParticipants = async () => {
        setLoading(true)
        setActionMsg('Getting frosh in scunt teams 🟣🟡🟣🟡 ...')
        const { data } = await axios.get('/get/admin/team/participants')

        if(data.status === 200) {
            const teams = await axios.get('/get/admin/teams')
            setTeams(teams.data.teams)
            setActionMsg('Participants successfully uploaded 🤙')
        } else {
            setActionMsg(`${data.errorMsg} 😓`)
        }
        setLoading(false)
    }

    const deleteAllTeams = async (confirm) => {
        if (confirm) {
            setLoading(true)
            setActionMsg(`Deleting all teams 💀 ...`)
            const { data } = await axios.delete('/deleteAll/admin/teams')

            if(data.status === 200) {
                setTeams([])
                setActionMsg(`Teams successfully deleted 🎆`)
            } else {
                setActionMsg(`${data.errorMsg} 😓`)
            }
            setLoading(false)
        }
    }

    const revealTeams = async (confirm) => {
        if (confirm) {
            setLoading(true)
            setActionMsg(!eventDetails.revealTeams ? `Revealing teams 📝 ...` : 'Hidding teams 🥽 ...')
            const { data } = await axios.post('/update/admin/event', {revealTeams: !eventDetails.revealTeams})

            if(data.status === 200) {
                const event = await axios.get('/get/eventDetails')
                setEventDetails(event.data)
                setActionMsg(!eventDetails.revealTeams ? 'Teams revealed! 👀' : 'Teams hidden 🙈')
            } else {
                setActionMsg(`${data.errorMsg} 😓`)
            }
            setLoading(false)
        }
    }

    const startEvent = async (confirm) => {
        if (confirm) {
            setLoading(true)
            setActionMsg(`Starting event 📝 ...`)
            const { data } = await axios.post('/update/admin/event', {startEvent: !eventDetails.startEvent})

            if(data.status === 200) {
                const event = await axios.get('/get/eventDetails')
                setEventDetails(event.data)
                setActionMsg(!eventDetails.startEvent ? 'Event has begun! 🎆' : 'Stopped event 🛑')
            } else {
                setActionMsg(`${data.errorMsg} 😓`)
            }
            setLoading(false)
        }
    }

    return(
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Scunt Admin - Manage Teams </HeaderPage>
            <br/>
            <Container>
                <h3>{accountInfo.name}</h3>
                <p>{accountInfo.email}</p>
                <div className="tabs">
                    <Button primary label="Get/Update Teams" onClick={getTeams} disabled={loading}/>
                    <Button primary label="Get Participants" onClick={getParticipants} disabled={loading}/>
                    <Button primary 
                        label={eventDetails.revealTeams ? "Hide Teams" : "Reveal Teams"} 
                        onClick={() => confirmRevealTeams.current?.setModalState(true)} disabled={loading}/>
                    <Button primary 
                        label={eventDetails.startEvent ? "Close Event 🚪" : "Start Event 🎊"}
                        onClick={() => confirmStartEvent.current?.setModalState(true)} disabled={loading}/>
                    <Button primary={false}
                        label="Delete All"
                        onClick={() => deleteAllConfirm.current?.setModalState(true)}
                        disabled={loading}/>
                </div>
                <br/>
                <p style={{color: loading ? 'purple' : 'orange'}}>{actionMsg}</p>
                {
                    teams.map(t => 
                        <TeamInfo
                            name={t.name}
                            number={t.number}
                            score={t.score}
                            leedurInformation={t.leedurInformation}
                            participants={t.participants}
                            deleteTeam={deleteTeam}
                            isLoading={loading}
                        />
                    )
                }
                
            </Container>
            <ContainerPopupModalConfirm
                ref={confirmRevealTeams}
                labelYes={eventDetails.revealTeams ? "Hide Teams from Frosh" : "Reveal Teams to Frosh"}
                labelNo="Cancel"
                message="This will reveal or hide the scunt teams and discord token to frosh when they login to their accounts on the orientation site. You must enable this if you want frosh to login to discord, it would also be useful to put in an email that frosh will require a discord token to login."
                header={eventDetails.revealTeams ? "Hide Scunt Teams" : "Reveal Scunt Teams"}
                buttonCallback={revealTeams}
            />
            <ContainerPopupModalConfirm
                ref={confirmStartEvent}
                labelYes={eventDetails.startEvent ? "Close Event 🚪" : "Start Scunt 🎊"}
                labelNo="Cancel"
                message="This will start to allow submissions from frosh on the scunt website and discord. Start and stop the event whenever you'd like. Stopping the event would prevent submissions from comming in."
                header={eventDetails.startEvent ? "Close Scunt Submissions" : "Open Scunt Submissions!"}
                buttonCallback={startEvent}
            />
            <ContainerPopupModalConfirm
                ref={deleteAllConfirm}
                labelYes="Delete All"
                labelNo="Cancel"
                header="Delete All Teams"
                message="Are you sure you want to delete all teams?"
                buttonCallback={deleteAllTeams}
            />
        </div>
    )
}