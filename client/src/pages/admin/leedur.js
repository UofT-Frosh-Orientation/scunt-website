import React, { useEffect, useRef, useState } from 'react'
import { HeaderPage } from "../../components/texts"
import { Button } from '../../components/buttons'
import { ContainerPopupModalConfirm } from '../../components/containers'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import './dashboard.css'

const IN_REVIEW = "in-review", APPROVED = "approved"

export default function LeedursAdminView () {
    const deleteLeedurConfirm = useRef()
    const [accountInfo, setAccountInfo] = useState({})
    const [inReviewLeedurs, setInReviewLeedurs] = useState([])
    const [approvedLeedurs, setApprovedLeedurs] = useState([])
    const [view, setView] = useState(IN_REVIEW)
    const [updateLeedurMsg, setUpdateLeedurMsg] = useState('')
    const [delLeedurEmail, setDelLeedurEmail] = useState('')

    useEffect(() => {
        const getInfo = async () => {
            const account = await axios.get('/user/current')
            const leedurs = await axios.get('/get/admin/leedurs')

            setAccountInfo(account.data)
            if(leedurs.data.status === 200) {
                setInReviewLeedurs(leedurs.data.leedurs.inReview)
                setApprovedLeedurs(leedurs.data.leedurs.approved)
            }
        }
        getInfo()
    }, [])

    const updateLeedurstatus = async (email, status) => {
        setUpdateLeedurMsg('Updating ...')
        const { data } = await axios.post('/update/admin/leedur', {
            email, status
        })
        if (data.status === 200) {
            const leedurs = await axios.get('/get/admin/leedurs')
            if(leedurs.data.status === 200) {
                setInReviewLeedurs(leedurs.data.leedurs.inReview)
                setApprovedLeedurs(leedurs.data.leedurs.approved)
            }
            setUpdateLeedurMsg(`Leedur with email ${email} has been ${status ? 'approved' : 'revoked'} access`)
        } else {
            setUpdateLeedurMsg(data.errorMsg)
        }
    }

    const deleteLeedurAcct = async (confirm) => {
        deleteLeedurConfirm?.current.setModalState(false)
        if (confirm) {
            setUpdateLeedurMsg('Deleting ...')
            const { data } = await axios.delete(`/delete/admin/leedur?email=${delLeedurEmail}`)
            if (data.status === 200) {
                const leedurs = await axios.get('/get/admin/leedurs')
                if(leedurs.data.status === 200) {
                    setInReviewLeedurs(leedurs.data.leedurs.inReview)
                    setApprovedLeedurs(leedurs.data.leedurs.approved)
                }
                setUpdateLeedurMsg(`Leedur with email ${delLeedurEmail} has been removed.`)
            } else {
                setUpdateLeedurMsg(data.errorMsg)
            }
        }
    }

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Scunt Admin - Manage Leedurs </HeaderPage>
            <br/>
            <Container>
                <h3>{accountInfo.name}</h3>
                <p>{accountInfo.email}</p>
                <div>
                    <div className="tabs">
                        <Button primary={view === IN_REVIEW} label="In Review" onClick={() => setView(IN_REVIEW)}/>
                        <Button primary={view === APPROVED} label="Approved" onClick={() => setView(APPROVED)}/>
                    </div>
                    <p>{updateLeedurMsg}</p>
                    {
                        view === IN_REVIEW && (inReviewLeedurs.length > 0 ? inReviewLeedurs.map(l => 
                            <div className="judge-info">
                                <h3>{l.name}</h3>
                                <p>{l.email}</p>
                                <p>scunt team: {l.scuntTeam}</p>
                                <Button primary label='Approve ✅' onClick={() => updateLeedurstatus(l.email, true)}/>
                                <Button primary={false} label='Delete 💀' onClick={() => {
                                    setDelLeedurEmail(l.email)
                                    deleteLeedurConfirm?.current.setModalState(true)
                                }}/> 
                            </div>
                            
                        ) : <h3>There are no Leedurs that are in review</h3>)
                    }
                    {
                        view === APPROVED && (approvedLeedurs.length > 0 ? approvedLeedurs.map(l => 
                            <div className="judge-info">
                                <h3>{l.name}</h3>
                                <p>{l.email}</p>
                                <p>scunt team: {l.scuntTeam}</p>
                                <Button primary label='Revoke ❌' onClick={() => updateLeedurstatus(l.email, false)}/> 
                                <Button primary={false} label='Delete 💀' onClick={() => {
                                    setDelLeedurEmail(l.email)
                                    deleteLeedurConfirm?.current.setModalState(true)
                                }}/> 
                            </div>
                        ) : <h3>There are no Leedurs that are approved</h3>)
                    }
                    <ContainerPopupModalConfirm 
                        ref={deleteLeedurConfirm} 
                        labelYes="Delete Leedur" 
                        labelNo="Cancel" 
                        buttonCallback={deleteLeedurAcct}
                        header={`Are you sure you want to delete Leedur ${delLeedurEmail}?`} 
                        message={"This cannot be undone"} 
                    />
                </div>
            </Container>
        </div>
    )
}