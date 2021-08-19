import React, { useEffect, useRef, useState } from 'react'
import { HeaderPage } from "../components/texts"
import { Button } from '../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../components/forms'
import { ContainerPopupModal, ContainerPopupModalConfirm, MissionAdminContainer } from '../components/containers'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import './dashboard.css'

const MISSION_SPREADSHEET = "missionSpreadsheet"
const MISSION_SHEET_NAME = "missionSheetName"

export default function ScuntAdminDasboard () {
    const [view, setView] = useState('judges')
    const [accountInfo, setAccountInfo] = useState({})
    const [judges, setJudges] = useState({
        inReview: [],
        approved: []
    })
    const [missions, setMissions] = useState([])
    const [categories, setCategories] = useState([])
    const [teams, setTeams] = useState([])

    useEffect(() => {
        const getInfo = async () => {
            const account = await axios.get('/user/current')
            const missions = await axios.get('/get/admin/missions')
            const judges = await axios.get('/get/admin/judges')
            // const teams = await axios.get('/get/admin/teams')

            setAccountInfo(account.data)
            if(missions.data.status === 200) {
                setMissions(missions.data.missions)
                setCategories(missions.data.categories)
            }
            if(judges.data.status === 200) setJudges(judges.data.judges)
            // setTeams(teams.data)
        }
        getInfo()
    }, [])

    return(
        <div>
            <br/>
            <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt Admin Panel </HeaderPage>
            <br/>
            <Container>
                <h3>{accountInfo.name}</h3>
                <p>{accountInfo.email}</p>
                <div className="tabs">
                    <Button primary={view === 'judges'} label="Judges" onClick={() => setView('judges')}/>
                    <Button primary={view === 'missions'} label="Missions" onClick={() => setView('missions')}/>
                    <Button primary={view === 'teams'} label="Teams" onClick={() => setView('teams')}/>
                </div>
                <br/>
                <div className="views">
                    { 
                        view === 'judges' && <JudgesView judges={judges} setJudges={setJudges}/> 
                    }
                    { 
                        view === 'missions' && <MissionsView 
                            missions={missions} setMissions={setMissions}
                            categories={categories} setCategories={setCategories}/>
                    }
                </div>
            </Container>
        </div>
    )
}

function JudgesView ({ judges, setJudges }) {
    const IN_REVIEW = "in-review", APPROVED = "approved"
    const deleteJudgeConfirm = useRef()
    const [view, setView] = useState(IN_REVIEW)
    const [updateJudgeMsg, setUpdateJudgeMsg] = useState('')
    const [delJudgeEmail, setDelJudgeEmail] = useState('')

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
    )
}

function MissionsView ({ missions, categories, setCategories, setMissions }) {
    const uploadPopup = useRef(), deleteConfirmModal = useRef()
    const [missionsInView, setMissionsInView] = useState([])
    const [missionsChecked, setMissionsChecked] = useState([])
    const [loadingMissionUpload, setLoadingMissionUpload] = useState(false)
    const [missionUploadErr, setMissionUploadErr] = useState('')
    const [loadingViewable, setLoadingViewable] = useState(false)
    const [viewableErr, setViewableErr] = useState('')
    const [deleteErr, setDeleteErr] = useState('')
    const [currCategory, setCurrCategory] = useState('')

    useEffect(() => {
        setMissionsInView(() => missions)
    }, [missions])

    const checkAllFields = () => {
        setMissionsChecked(() => missionsInView.flatMap(m => m.number))
    }
    const deselectAllFields = () => {
        setMissionsChecked(() => [])
        setViewableErr('')
    }
    const checkOneField = (num) => {
        setViewableErr('')
        if(missionsChecked.includes(num)){
            const idx = missionsChecked.indexOf(num)
            const newMissions = [...missionsChecked]
            newMissions.splice(idx, 1)
            setMissionsChecked(() => newMissions)
        } else {
            setMissionsChecked((oldMissions) => [...oldMissions, num])
        }
    }
    const handleChangeViewable = async (isViewable) => {
        const state = isViewable ? 'viewable' : 'hidden'
        setLoadingViewable(true)
        setViewableErr(`Setting ${missionsChecked.length} missions as ${state}...`)
        const { data } = await axios.post('/post/admin/missions/viewable', {
            missionsChecked,
            isViewable
        })

        if (data.status === 200) {
            setMissions(() => data.missions)
            console.log(currCategory)
            setMissionsInView(() => data.missions.filter(m => m.category === currCategory))
            setViewableErr(`Complete! 🎈 ${missionsChecked.length} missions are now ${state}`)
        } else {
            setViewableErr(data.errorMsg)
        }
        setLoadingViewable(false)
    }
    const uploadMissions = async () => {
        setDeleteErr('')
        setLoadingMissionUpload(true)
        setMissionUploadErr('')
        const sheetId = localStorage[MISSION_SPREADSHEET].split('/')[5]
        const { data } = await axios.post('/upload/admin/missions', {
            sheetId,
            sheetName: localStorage[MISSION_SHEET_NAME]
        })
        if (data.status === 200) {
            setMissions(() => data.missions)
            setMissionsInView(() => data.missions)
            setCategories(() => data.categories)
            setCurrCategory('All')
            setMissionUploadErr('Upload Complete 🎈. You can now close this popup window.')
        } else {
            setMissionUploadErr(data.errorMsg)
        }
        setLoadingMissionUpload(false)
    }
    const deleteAll = async (isDelete) => {
        if(isDelete) {
            setDeleteErr('')
            const { data } = await axios.delete('/delete/admin/missions')
            if (data.status === 200) {
                setMissions(() => data.missions)
                setMissionsInView(() => data.missions)
                setCategories(() => data.categories)
                setDeleteErr('Delete Complete 🎈')
            } else {
                setDeleteErr(data.errorMsg)
            }
        } 
        deleteConfirmModal?.current.setModalState(false)
    }
    const selectCategory = (category) => 
        setMissionsInView(() => 
            category === "All" ? missions : missions.filter(m => m.category === category)
        )

    return (
        <div>
            <p>TODO: ask scunt if they want to change missions (e.g. name, description) on admin panel</p>
            <Button primary={false} label="Upload Missions" onClick={() => uploadPopup?.current.setModalState(true)}/>
            { 
                missionsInView.length > 0 && <>
                    <Button primary={false} label="Select All" onClick={checkAllFields}/> 
                    { missionsChecked.length > 0 && <Button primary={false} label="Deselect All" onClick={deselectAllFields}/> }
                    <Button primary={false} label="Delete All" onClick={() => deleteConfirmModal?.current.setModalState(true)}/> 
                    <span style={{fontFamily: 'AvenirLTStd-Roman', fontSize: '15px'}}>
                        {missionsChecked.length} out of {missions.length} missions selected.
                    </span>
                    <p>{deleteErr}</p>
                </>
            }
            <br/>
            { 
                missionsInView.length > 0 &&
                <FormDropdownMenu 
                    label="Filter by category"
                    items={categories}
                    onChange={(idx, item) => {
                        setCurrCategory(item)
                        selectCategory(item)
                    }}
                />
            }
            {   
                missionsChecked.length > 0 && categories.length > 0 && <>
                    <h4>Make selected ... </h4>
                    <Button primary label="Viewable" onClick={() => handleChangeViewable(true)} />
                    <Button primary label="Hidden" onClick={() => handleChangeViewable(false)} />
                    <span style={{fontFamily: 'AvenirLTStd-Roman', fontSize: '15px', color: loadingViewable ? 'purple' : 'orange'}}>
                        {viewableErr}
                    </span>
                </>
            }
            {
                missionsInView.length > 0 ? missionsInView.map(m => (
                    <MissionAdminContainer 
                        number={m.number} 
                        name={m.name} 
                        category={m.category} 
                        totalPoints={m.totalPoints}
                        isSelected={missionsChecked.includes(m.number)}
                        checkMission={(val) => checkOneField(m.number)}
                        isViewable={m.isViewable}
                    />
                )) : <h4>You have no missions</h4>
            }
            <ContainerPopupModalConfirm 
                ref={deleteConfirmModal} 
                labelYes="Delete All" 
                labelNo="Cancel" 
                buttonCallback={deleteAll}
                header={"Are you sure you want to delete all missions?"} 
                message={"This cannot be undone"} 
            />
            <ContainerPopupModal header="Upload Missions" ref={uploadPopup} exitButton={!loadingMissionUpload} exitBackground={!loadingMissionUpload}>
                <ol>
                    <li>
                        To upload, you first must share your spreadsheet with our service account.
                        To do this, please share the spreadsheet (click the "Share" button like how you'd normally share a spreadsheet)
                        with this email: frosh-relations@frosh-relations-2021.iam.gserviceaccount.com 
                        (click "share anyway" since the service account is outside of the organization)
                    </li>
                    <li>
                        Please paste the url of the spreadsheet here: 
                        <FormTextBox style={{width: '80%'}} type="input" label="URL spreadsheet" localStorageKey={MISSION_SPREADSHEET}/>
                        <FormTextBox style={{width: '80%'}} type="input" label="Enter the sheet name with the mission data" localStorageKey={MISSION_SHEET_NAME}/>
                        If you have already existing missions, this button will update them and if they are new missions, it will add them to our database.
                        <Button primary onClick={uploadMissions} label="Upload" disabled={loadingMissionUpload}/>
                    </li>
                </ol>
                { loadingMissionUpload && <p style={{color: 'red'}}>Uploading missions please wait ⛵ ... </p> }
                { missionUploadErr && <p style={{color: 'orange'}}> {missionUploadErr} </p> }
            </ContainerPopupModal>
        </div>
    )
}