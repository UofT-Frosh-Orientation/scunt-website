import React, { useEffect, useRef, useState } from 'react'
import { HeaderPage } from "../../components/texts"
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { ContainerPopupModal, ContainerPopupModalConfirm, MissionAdminContainer, TeamInfo } from '../../components/containers'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import './dashboard.css'

const IN_REVIEW = "in-review", APPROVED = "approved"

export default function JudgesAdminView () {
    const deleteJudgeConfirm = useRef()
    const [accountInfo, setAccountInfo] = useState({})
    const [judges, setJudges] = useState({
        inReview: [],
        approved: []
    })
    const [view, setView] = useState(IN_REVIEW)
    const [updateJudgeMsg, setUpdateJudgeMsg] = useState('')
    const [delJudgeEmail, setDelJudgeEmail] = useState('')

    useEffect(() => {
        const getInfo = async () => {
            const account = await axios.get('/user/current')
            const judges = await axios.get('/get/admin/judges')

            setAccountInfo(account.data)
            if(judges.data.status === 200) setJudges(judges.data.judges)
        }
        getInfo()
    }, [])

    const updateJudgeStatus = async (email, status) => {
        setUpdateJudgeMsg('Updating ...')
        const { data } = await axios.post('/update/admin/judge', {
            email, status
        })
        if (data.status === 200) {
            setJudges(data.judges)
            setUpdateJudgeMsg(`Judge with email ${email} has been ${status ? 'approved' : 'revoked'} access`)
        } else {
            setUpdateJudgeMsg(data.errorMsg)
        }
    }
    const deleteJudgeAcct = async (confirm) => {
        deleteJudgeConfirm?.current.setModalState(false)
        if (confirm) {
            setUpdateJudgeMsg('Deleting ...')
            const { data } = await axios.delete(`/delete/admin/judge?email=${delJudgeEmail}`)
            if (data.status === 200) {
                setJudges(data.judges)
                setUpdateJudgeMsg(`Judge with email ${delJudgeEmail} has been removed.`)
            } else {
                setUpdateJudgeMsg(data.errorMsg)
            }
        }
    }

    const judgeHTML = (j, state) => (
        <div className="judge-info">
            <h3>{j.name}</h3>
            <p>{j.email}</p>
            { 
                state === IN_REVIEW && <Button primary label='Approve ✅' onClick={() => updateJudgeStatus(j.email, true)}/> 
            }
            { 
                state === APPROVED && <Button primary label='Revoke ❌' onClick={() => updateJudgeStatus(j.email, false)}/> 
            }
            <Button primary={false} label='Delete 💀' onClick={() => {
                setDelJudgeEmail(j.email)
                deleteJudgeConfirm?.current.setModalState(true)
            }}/> 
        </div>
    )

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Scunt Admin - Manage Judges </HeaderPage>
            <br/>
            <Container>
                <h3>{accountInfo.name}</h3>
                <p>{accountInfo.email}</p>
                <div>
                    <div className="tabs">
                        <Button primary={view === IN_REVIEW} label="In Review" onClick={() => setView(IN_REVIEW)}/>
                        <Button primary={view === APPROVED} label="Approved" onClick={() => setView(APPROVED)}/>
                    </div>
                    <p>{updateJudgeMsg}</p>
                    {
                        view === IN_REVIEW && (judges.inReview.length > 0 ? judges.inReview.map(j => judgeHTML(j, IN_REVIEW)) : <h3>There are no judges that are in review</h3>)
                    }
                    {
                        view === APPROVED && (judges.approved.length > 0 ? judges.approved.map(j => judgeHTML(j, APPROVED)) : <h3>There are no judges that are approved</h3>)
                    }
                    <ContainerPopupModalConfirm 
                        ref={deleteJudgeConfirm} 
                        labelYes="Delete Judge" 
                        labelNo="Cancel" 
                        buttonCallback={deleteJudgeAcct}
                        header={`Are you sure you want to delete judge ${delJudgeEmail}?`} 
                        message={"This cannot be undone"} 
                    />
                </div>
            </Container>
        </div>
    )
}