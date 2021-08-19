import axios from 'axios'
import React, { useState } from 'react'
import { Container } from 'react-bootstrap'
import { Button } from '../components/buttons'
import { FormTextBox } from '../components/forms'
import { HeaderPage } from '../components/texts'

export default function SignUpForm() {
    const [judgeDetails, setJudgeDetails] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (key, val) => {
        setJudgeDetails(old => {
            old[key] = val
            return old
        })
    }

    const signup = async () => {
        setLoading(true)
        setMessage('Loading...')
        const { data } = await axios.post('/create/judge/', judgeDetails)
        if (data.status === 200) {
            setMessage(`Complete! 🎈 Your request to be a judge has been sent! You will not be able to login until the scunt subcoms approve your request.`)
        } else {
            setMessage(data.errorMsg)
        }
        setLoading(false)
    }

    return(
        <div>
            <br/>
            <HeaderPage img={require("../assets/banners/about_us.svg").default}> Judge Sign Up Form </HeaderPage>
            <br/>
            <Container>
                <h3>Please fill out the form below to access the scunt judge panel.</h3>
                <FormTextBox label="Name" required clearButton onChange={(value)=>{handleChange("name",value)}}/>
                <FormTextBox label="Email" type="email" required clearButton onChange={(value)=>{handleChange("email",value)}}/>
                <FormTextBox label="Password" type="password" required clearButton onChange={(value)=>{handleChange("password",value)}}/>
                <Button primary label="Sign Up" onClick={signup} disabled={loading}/>
                <h4 style={{color: loading ? 'purple' : 'orange'}}>{message}</h4>
            </Container>
        </div>
    )
}