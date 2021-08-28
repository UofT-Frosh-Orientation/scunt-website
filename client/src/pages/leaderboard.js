import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { HeaderPage, HeaderSection } from '../components/texts'
import './leaderboard.css'

export default function Leaderboard () {
    const [teams, setTeams] = useState([])
    const [maxScore, setMaxScore] = useState([])
    const [hasStarted, setHasStarted] = useState(false)

    useEffect(() => {
        const getScores = async () => {
            const { data } = await axios.get('/get/leaderboard/scores?discord=false')
            const event = await axios.get('/get/eventDetails')
            setHasStarted(event.data.startEvent)
            if(event.data.startEvent) {
                if (data.status === 200) {
                    setTeams(data.teams)
                    setMaxScore(data.maxScore)
                } else {
                    alert(data.errorMsg)
                }
            }                
        }
        getScores()
    }, [])

    return (
        <div>
            <br/>
            <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
            <br/>
            <Container>
                <HeaderSection> Leaderboard </HeaderSection>
                <br/>
                {
                    hasStarted ?
                    <div className="graph" style={{height: window.innerHeight - 25, margin: "2.5% 0 0 1%"}}>
                        {
                            teams.length > 0 && teams.map((t, index) => 
                            <ScoreMeter maxScore={maxScore} score={t.score} team={t.name} numTeams={teams.length} index={index} key={"score" + index}/>
                            )
                        }
                    </div> :
                    <h3 className="center-text"> Scunt starts on September 8th at 5:00pm, see you then! </h3>
                }
            </Container>
        </div>
    )
}

function ScoreMeter({
    numTeams, index, score, maxScore, team
}) {

    const height = (100/numTeams - 5)*1.5;
    const top = (height+2)*index
    const barWidth = (0.2*window.innerWidth)+ ((0.7 * window.innerWidth) - 50) * (score/maxScore)

    return(
        <div className="score-meter" style={{height: height.toString() + "%", top: top.toString() + "%"}}>
            <h4>{team}</h4>
            <div className="points" style={{width: barWidth}}>{score}</div>
        </div>
    )
}