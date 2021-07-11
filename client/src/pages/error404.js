import React,{Component} from 'react'
import {FroshWeekIcon} from "../components/socials"
import Wave from 'react-wavify'
import Particles from 'react-particles-js';
//import { tsParticles } from "tsparticles";

import {HeaderFancy, TextAccent} from "../components/texts"

export class error404 extends Component {
  render(){
    return(
      <>
        <div style={{zIndex:10, pointerEvents:"none",textAlign:"center", position:"absolute", width:"100vw", height:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", }}>
          <div style={{height:"100px"}}/>
          <div style={{maxWidth:"50vh", maxHeight:"50vh"}}><FroshWeekIcon width="100%" height="100%" linkHome logo={require("../assets/logos/Frosh Logo/F Logo yellow transparent.png").default}/></div>
          <HeaderFancy style={{padding:"0px 30px"}}>Lost at sea?</HeaderFancy>
          <TextAccent primary={false} style={{padding:"10px 30px"}}>The page you are looking for does not exist</TextAccent>
        </div>
        <div style={{position:"fixed", zIndex:2,  backgroundColor:"#673ab7"}}>
          <Particles height="100vh" width="100vw"
            params={{
              "particles": {
                collisions: {
                  enable: false,
                },
                "color":"#c7a4ff",
                  "number": {
                    "value": 200,
                    "density": {
                      "enable": true
                    }
                  },
                  "size": {
                    "value": 10, "random": true,
                    "anim": {
                      "speed": 4,
                      "size_min": 0.3
                    }
                  },
                  "line_linked": {
                    "enable": false
                  },
                  "move": {
                    "random": true,
                    "speed": 1,
                    "direction": "top",
                    "out_mode": "out"
                  }
              },
              "interactivity": {
                "events": {
                  "onhover": {
                      "enable": true,
                      "mode": "bubble",
                  },
                  "onclick": {
                    "enable": true,
                    "mode": "repulse"
                  }
                },
                "modes": {
                  "bubble": {
                    "distance": 150,
                    "size": 20,
                    "opacity": 1,
                  },
                  "repulse": {
                    "distance": 400,
                    "duration": 10
                  }
                }
              }
          }} />
        </div>
        <div style={{position:"absolute",width:"100vw", height:"100px", backgroundColor:"#FFFFFF", zIndex:2}}/>
        <div style={{transform:"scaleY(-1)", position:"absolute", zIndex:2, width:"100vw", marginTop:"100px"}}>
          <Wave fill='white' options={{ height: 100, amplitude: 10, speed: 0.4, points: 7}}/>
        </div>
      </>
    )
  }
}