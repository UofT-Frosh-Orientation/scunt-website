import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap';
import { Route, Redirect } from "react-router-dom";
import { HeaderPage } from '../components/texts';

export default function PrivateRoute({ path, homeRoute, render, routeType }) {
    const [authType, setAuthType] = useState('')
    const [hasStarted, setHasStarted] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getIsSignedIn = async() => {
            const isSignedIn = await axios.get('/user/signedIn')
            const eventDetails = await axios.get('/get/eventDetails')
            if(isSignedIn.data) {
                setAuthType(isSignedIn.data)
            }
            if(eventDetails.data) {
                setHasStarted(eventDetails.data.startEvent)
            }
            setLoading(false)
            if(!isSignedIn) alert(`Please login.`)
        }
        getIsSignedIn()
    }, [])

    return(
        <>
            { 
                loading ? <></> : 
                    (
                        authType === routeType ? 
                            ( 
                                !hasStarted && routeType === 'frosh' && window.location.pathname !== "/frosh/teamInfo" ? 
                                <EventNotStarted/> : 
                                <Route path={path} exact render={render}/>
                            ) : 
                        <Redirect to={homeRoute}/>
                    )
            }
        </>
    )

}

function EventNotStarted() {
    return(
        <div>
            <br/>
            <HeaderPage img={require("../assets/banners/about_us.svg").default}> Event hasn't started yet </HeaderPage>
            <br/>
            <Container>
                <h3> Scunt starts on September 8th at 5:30pm, see you then! </h3>
            </Container>
        </div>
    )
}