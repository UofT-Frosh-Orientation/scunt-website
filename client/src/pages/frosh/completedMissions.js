import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Container, Row } from 'react-bootstrap'
import { BribeDeductionContainer, LoadingAnimation, MissionFroshContainer, MissionGeneralContainer, MissionIncompleteContainer } from '../../components/containers'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'

export default function CompletedMissions() {
    const [missions, setMissions] = useState({})
    const [accountInfo, setAccountInfo] = useState({})
    const [loading, setLoading] = useState(false)
    const [filter, setFilter] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)
    const [allMissions, setAllMissions] = useState({})

    useEffect(() => {
        const getMissions = async () => {
            const account = await axios.get('/user/current')
            const { data } = await axios.get(`/get/frosh/missions?teamNumber=${account.data.scuntTeam}`)

            setAccountInfo(account.data)
            if (data.status === 200) {
                setAllMissions({
                    "Missions in Judging": data.inProgressMissions,
                    "Completed Missions": data.completedMissions,
                    "Incomplete Missions": data.incompleteMissions,
                    "Missions Submitted by me": data.submittedByUser,
                    "Bribes & Deductions": data.bribesAndDeductions,
                })
                setMissions({
                    "Missions in Judging": data.inProgressMissions.map(m => <MissionFroshContainer {...m}/>),
                    "Completed Missions": data.completedMissions.map(m => <MissionFroshContainer {...m}/>),
                    "Incomplete Missions": data.incompleteMissions.map(m => <MissionIncompleteContainer {...m}/>),
                    "Missions Submitted by me": data.submittedByUser.map(m => <MissionFroshContainer {...m}/>),
                    "Bribes & Deductions": data.bribesAndDeductions.map(m => <BribeDeductionContainer {...m}/>),
                })
                setFilter("Incomplete Missions")
            }
            setLoading(false)
        }
        setLoading(true)
        getMissions()
    }, [])

    function formatStrings(string){
        return string.replace(" ","").replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    }
  
    const handleSearch = (text) => {
        const notEmpty = text.length > 0;
        if(notEmpty) {
            let textFormatted = formatStrings(text)
            setSearchResults(allMissions[filter]
                .filter(m => 
                    formatStrings(m.name).includes(textFormatted) ||
                    formatStrings(m.number.toString()).includes(textFormatted) ||
                    formatStrings(m.category).includes(textFormatted)
                )
            )
        }
        setIsSearching(notEmpty)
    }

    return(
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Submitted and Completed Missions </HeaderPage>
            <br/>
            <Container>
                { 
                    missions["Incomplete Missions"] && missions["Missions in Judging"] && missions["Completed Missions"]
                    && <>
                        <FormDropdownMenu
                            label={isSearching ? "Stop searching to filter by mission status" : "Filter by mission status"}
                            items={["Incomplete Missions", "Missions in Judging", "Completed Missions", "Missions Submitted by me", "Bribes & Deductions"]}
                            onChange={(idx, item) => {
                                setIsSearching(false)
                                setFilter(item)
                            }}
                            disabled={isSearching}
                        />
                        {    
                            filter !== "Bribes & Deductions" && 
                            <FormTextBox 
                                style={{width:"100%", margin: '0.75rem auto'}} clearButton 
                                inputId={'missionSearchBar'} 
                                type={"text"} 
                                label={"Search All Missions"} 
                                onChange={handleSearch}
                            />
                        }
                        {isSearching && <p>Searching {filter} </p> }
                    </>
                }
                { loading && <div className="center"><LoadingAnimation/></div> }
                { 
                    !loading && 
                    isSearching ? searchResults.map(m =>
                        filter === "Incomplete Missions" ? <MissionIncompleteContainer {...m}/> : <MissionFroshContainer {...m}/>
                    ) : missions[filter] 
                }
            </Container>
        </div>
    )
}