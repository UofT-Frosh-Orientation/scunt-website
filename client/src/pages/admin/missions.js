import React, { useEffect, useRef, useState } from 'react'
import { HeaderPage } from "../../components/texts"
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { ContainerPopupModal, ContainerPopupModalConfirm, MissionAdminContainer } from '../../components/containers'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import './dashboard.css'

const MISSION_SPREADSHEET = "missionSpreadsheet"
const MISSION_SHEET_NAME = "missionSheetName"

export default function MissionsAdminView () {
    const uploadPopup = useRef(), deleteConfirmModal = useRef()
    const [missions, setMissions] = useState([])
    const [categories, setCategories] = useState([])
    const [accountInfo, setAccountInfo] = useState({})

    const [missionsInView, setMissionsInView] = useState([])
    const [missionsChecked, setMissionsChecked] = useState([])
    const [loadingMissionUpload, setLoadingMissionUpload] = useState(false)
    const [missionUploadErr, setMissionUploadErr] = useState('')
    const [loadingViewable, setLoadingViewable] = useState(false)
    const [viewableErr, setViewableErr] = useState('')
    const [deleteErr, setDeleteErr] = useState('')
    const [currCategory, setCurrCategory] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    useEffect(() => {
        const getInfo = async () => {
            const account = await axios.get('/user/current')
            const missions = await axios.get('/get/admin/missions')

            setAccountInfo(account.data)
            if(missions.data.status === 200) {
                setMissions(missions.data.missions)
                setMissionsInView(missions.data.missions)
                setCategories(missions.data.categories)
            }
        }
        getInfo()
    }, [])

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
            const missions = await axios.get('/get/admin/missions')
            setMissions(() => missions.data.missions)
            setMissionsInView(() => 
                currCategory === "All" ? missions.data.missions : 
                    currCategory === "Viewable Missions" ?
                        missions.data.missions.filter(m => m.isViewable) :
                    currCategory === "Hidden Missions" ?
                        missions.data.missions.filter(m => !m.isViewable) :
                missions.data.missions.filter(m => m.category === currCategory)
            )
            setIsSearching(false)
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
    const selectCategory = (category) => {
        if(isSearching) {
            isSearching(false)
        }
        setMissionsInView(() => 
            category === "All" ? missions : 
                category === "Viewable Missions" ?
                    missions.filter(m => m.isViewable) :
                category === "Hidden Missions" ?
                    missions.filter(m => !m.isViewable) :
            missions.filter(m => m.category === category)
        )
    }
    
    function formatStrings(string){
        return string.replace(" ","").replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    const handleSearch = (text) => {
        const notEmpty = text.length > 0;
        if(notEmpty) {
            let textFormatted = formatStrings(text)
            setSearchResults(missionsInView.filter(m => formatStrings(m.category).includes(textFormatted) || formatStrings(m.name).includes(textFormatted) || m.number===parseInt(textFormatted)));
        }
        setIsSearching(notEmpty)
    }

    return (
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Scunt Admin - Manage Missions </HeaderPage>
            <br/>
            <Container>
                <h3>{accountInfo.name}</h3>
                <p>{accountInfo.email}</p>
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
                        categories.length > 0 &&
                        <FormDropdownMenu 
                            label={isSearching ? "Stop searching to filter by category" : "Filter by category"}
                            items={categories}
                            onChange={(idx, item) => {
                                setCurrCategory(item)
                                selectCategory(item)
                            }}
                            disabled={isSearching}
                        />
                    }
                    <FormTextBox 
                        style={{width:"50%", margin: '0.75rem auto'}} 
                        inputId={'missionSearchBar'} 
                        type={"text"} 
                        label={"Search for a Mission Name, Category or Number"} 
                        description={"Looking for a Mission?"} 
                        onChange={handleSearch}
                    />
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
                        missionsInView.length > 0 ? (isSearching ? searchResults : missionsInView).map(m => (
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
            </Container>
        </div>
    )
}
