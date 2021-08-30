import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { Button } from '../../components/buttons'
import { FormDropdownMenu, FormTextBox } from '../../components/forms'
import { HeaderPage } from '../../components/texts'

export default function LeedurSignUpForm() {
    const [leedurDetails, setLeedurDetails] = useState({
        name: '',
        email: '',
        password: '',
        scuntTeam: 1,
        pronouns: ''
    })
    const [teams, setTeams] = useState([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const getTeams = async () => {
            const { data } = await axios.get('/get/leedur/teams')
            if (data.status === 200) setTeams(data.teams)
        }
        getTeams()
    },[])

    const handleChange = (key, val) => {
        setLeedurDetails(old => {
            old[key] = val
            return old
        })
    }

    const signup = async () => {
        setLoading(true)
        setMessage('Loading...')
        const { data } = await axios.post('/create/leedur/', leedurDetails)
        if (data.status === 200) {
            setMessage(`Complete! 🎈 Your request to be a leedur has been sent! You will not be able to login until the scunt subcoms approve your request.`)
        } else {
            setMessage(data.errorMsg)
        }
        setLoading(false)
    }

    return(
        <div>
            <br/>
            <HeaderPage img={require("../../assets/banners/about_us.svg").default}> Leedur Sign Up Form </HeaderPage>
            <br/>
            <Container>
               
                {
                    teams.length > 0 ?
                    <>
                        <h3>Please fill out the form below to be a scunt leedur. This will give you access to submit missions.</h3>
                        <FormTextBox label="Name" required clearButton onChange={(value)=>{handleChange("name",value)}}/>
                        <FormTextBox label="Email" type="email" required clearButton onChange={(value)=>{handleChange("email",value)}}/>
                        <FormTextBox label="Password" type="password" required clearButton onChange={(value)=>{handleChange("password",value)}}/>
                        <FormDropdownMenu
                            label="Choose Team"
                            items={teams}
                            onChange={(idx, item) => {
                            handleChange("scuntTeam", idx+1)
                            }}
                        />
                        <FormTextBox label="Pronouns" required clearButton onChange={(value)=>{handleChange("pronouns",value)}}/>
                        <Button primary label="Sign Up" onClick={signup} disabled={loading}/>
                        <h4 style={{color: loading ? 'purple' : 'orange'}}>{message}</h4>
                    </> :
                    <h3>Teams have not been created so you can't sign up just yet, please tell scunt subcoms to upload & create teams.</h3>
                }
            </Container>
        </div>
    )
}