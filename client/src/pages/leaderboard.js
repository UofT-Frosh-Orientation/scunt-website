import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { HeaderPage, HeaderSection } from '../components/texts'
import './leaderboard.css'
const io = require("socket.io-client");

export default function Leaderboard () {
    const [teams, setTeams] = useState([])
    const [maxScore, setMaxScore] = useState([])
    const [hasStarted, setHasStarted] = useState(false)

    const getScores = async () => {
        const { data } = await axios.get('/get/leaderboard/scores?discord=false')
        if (data.status === 200) {
            setTeams(data.teams)
            setMaxScore(data.maxScore)
            setHasStarted(true)
        } else if (data.status === 69) {
            setHasStarted(false)
        }else {
            alert(data.errorMsg)
        }             
    }

    useEffect(() => {
        getScores()

        // socket.io client side setup
        console.log(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/leaderboard-scores`)
        const leaderboardSocket = io.connect(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/leaderboard-scores`)
        leaderboardSocket.on('connect', ()=> {
            console.log("client is connected!")
        });
        leaderboardSocket.on('scoresChanged', () => {
            setTeams(async () => {
                const { data } = await axios.get('/get/leaderboard/scores?discord=false')
                if (data.status === 200) {
                    setTeams(data.teams)
                    setMaxScore(data.maxScore)
                }
            });
        });
        return () => leaderboardSocket.disconnect();
    }, [])

    return (
        <div>
            <br/>
            <HeaderPage img={require("../assets/banners/about_us.svg").default}> Scunt 2021 </HeaderPage>
            <br/>
                <HeaderSection> Leaderboard </HeaderSection>
                <br/>
                {
                    hasStarted ?
                    <div className="graph" style={{height: 80*teams.length, margin: "1.5% 0 0 5vw"}}>
                        {
                            teams.length > 0 && teams.map((t, index) => 
                            <ScoreMeter maxScore={maxScore} score={t.score} team={t.name} numTeams={teams.length} index={index} key={"score" + index}/>
                            )
                        }
                    </div> :
                    <h3 className="center-text"> Scunt starts on September 8th at 5:30pm, see you then! </h3>
                }
        </div>
    )
}

function ScoreMeter({
    numTeams, index, score, maxScore, team
}) {

    // const height = window.innerHeight/numTeams - 25;
    const top = (80)*index
    const barWidth = (0.2*window.innerWidth)+ ((0.7 * window.innerWidth) - 50) * (score/maxScore)

    return(
        <div className="score-meter" style={{height: '50px', top}}>
            <h4>{team}</h4>
            <div className="points" style={{width: barWidth}}>{score}</div>
        </div>
    )
}