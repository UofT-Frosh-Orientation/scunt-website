import React from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import './judges.css';
import Wave from 'react-wavify';

import {TextAccent} from './texts';



export function ProfilePicture(props) {


    const contentList = props.content.map( (item, index) =>
        <li>{item}</li>
        );

    return (
    
    <div className = "person">

        <div className = 'profile'>
                                      
                        <div className = "profileImage">
                            <LazyLoadImage
                                alt= {props.name}
                                effect="blur"
                                src={props.image} 

                            />
                        </div>
                        
                        <div className="profileOverlay">
                        
                            <div className="overlayContainer">
                            
                                <div className ="overlayText">
                                    <ol>{contentList}</ol>
                                </div>
                            
                            </div>
                        
                        
                        </div>
                        
                        <div className="profileTitleContainer">

                            <div className = "profileName">
                                <TextAccent primary={false}> 
                                    <span className="mobileName">
                                        <strong>{props.name}</strong> 
                                    </span>
                                </TextAccent>
                            </div>

                            <div className = "waveOverlay">
                                <Wave fill='#6F1E88'
                                style={{opacity:0.7}}
                                options={{
                                    height: 30,
                                    amplitude: 8,
                                    speed: 0.4,
                                    points: 6
                                }}
                                />
                            </div>

                            <div className = "waveOverlay">
                                <Wave fill='#6F1E88'
                                style={{opacity:1}}
                                options={{
                                    height: 40,
                                    amplitude: 6,
                                    speed: 0.4,
                                    points: 4
                                }}
                                />
                            </div>
                            
                        
                        </div>
                    
                    
                </div>

    </div>
    )


}

