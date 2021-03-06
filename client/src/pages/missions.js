import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { Container } from 'react-bootstrap';
import { MissionGeneralContainer } from '../components/containers';
import { FormDropdownMenu, FormTextBox } from '../components/forms';
import { HeaderPage, HeaderSection } from "../components/texts"

export default function Missions() {
  const searchRef = useRef()
  const [missions, setMissions] = useState([])
  const [missionsInView, setMissionsInView] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [currCategory, setCurrCategory] = useState('All')
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const getMissions = async () => {
      const { data } = await axios.get('/get/missions')
      const event = await axios.get('/get/eventDetails')
      setHasStarted(event.data.startEvent)
      if (event.data.startEvent) {
        if(data.status === 200) {
          setMissions(() => data.missions)
          setMissionsInView(() => data.missions)
          setCategories(() => data.categories)
        }
      }
      setLoading(false)
    }
    setLoading(true)
    getMissions()
  }, [])

  const selectCategory = (category) => { 
    if(isSearching) {
      isSearching(false)
    }
    setMissionsInView(
      category === "All" ? missions : 
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
      <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
      <br/>
      <Container>
        <HeaderSection> Missions </HeaderSection>
        { loading ? <p>Loading ...</p> : hasStarted && missions.length <= 0 && <h4>There are currently no missions</h4> }
        { 
          hasStarted ? 
            missions.length > 0 && 
            <>
              <div style={{display: "flex", flexDirection:"row", justifyContent:"center", alignItems:"flex-end", flexWrap:"wrap"}}>
                <FormTextBox 
                  style={{width:"100%"}} 
                  ref={searchRef} 
                  inputId={'missionSearchBar'} 
                  type={"text"} 
                  label={"Search for a Mission Name, Category or Number"} 
                  description={"Looking for a Mission?"} 
                  onChange={handleSearch}
                  small
                  clearButton
                />
                <div style={{width:"10px"}}/>
                {
                  categories.length > 0 &&
                  <FormDropdownMenu 
                      // label={isSearching ? "Stop searching to Filter by category" : "Filter by category"}
                      items={categories}
                      onChange={(idx, item) => {
                        setCurrCategory(item)
                        selectCategory(item)
                      }}
                      disabled={isSearching}
                  />
                }
              </div>
              {
                (isSearching ? searchResults : missionsInView)
                .filter(m => currCategory === "All" ? m : m.category === currCategory)
                .map(m => 
                  <MissionGeneralContainer 
                    name={m.name}
                    number={m.number}
                    category={m.category}
                    totalPoints={m.totalPoints}
                    key={m.number}
                  />
                )
              }
            </> :
            <h3 className="center-text"> Scunt starts on September 8th at 5:30pm, see you then! </h3>
        }
        { hasStarted && isSearching && searchResults.length <= 0 && missions.length > 0 && <h4>There are no results for your search.</h4>}
      </Container>
    </div>
  );
}


