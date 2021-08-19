import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Route, Redirect } from "react-router-dom";

export default function PrivateRoute({ path, homeRoute, render, routeType }) {
    const [authType, setAuthType] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getIsSignedIn = async() => {
            const isSignedIn = await axios.get('/user/signedIn')
            if(isSignedIn.data) {
                setAuthType(isSignedIn.data)
            }
            setLoading(false)
            if(!isSignedIn) alert(`Please login.`)
        }
        getIsSignedIn()
    })

    return(
        <>
            { loading ? <></> : authType === routeType ? <Route path={path} exact render={render}/> : <Redirect to={homeRoute}/> }
        </>
    )

}