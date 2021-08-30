import React,{Component} from 'react'
import './login.css';
import {FormTextBox} from "./forms"
import {ContainerPopupModal} from "./containers"
import {Button, ButtonBubble} from "./buttons"
import axios from 'axios'
import {getEmailErrorMsg} from '../util/verifyInputFields'


export class LoginButton extends Component {
  constructor(){
    super()
    this.state={
      status:false, 
      initials: "",
      accountType: "", 
      name: ""
    }
  }
  openLogin = () => {
    this.login.openLogin()
  }
  setLoginStatus = async (status, initials, accountType, name) => {
    if(!status) {
      await axios.get('/logout')
    }
    this.setState({
      status, initials, accountType, name
    })
  }
  render(){
    return(
      <>
        <ContainerPopupModal header={this.state.name} exitBackground blurBackground={false} customPosition={"loginInfoModal"} ref={(infoPopup)=> this.infoPopup = infoPopup}>
          <p style={{textTransform: 'capitalize', margin: '2px 0 4px 0'}}>{this.state.accountType}</p>
          { 
            this.state.accountType === "admin" && <>
              <ButtonBubble label="Manage Missions" link="/admin/missions" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              <ButtonBubble label="Manage Judges" link="/admin/judges" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              <ButtonBubble label="Manage Teams" link="/admin/teams" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              <ButtonBubble label="Manage Leedurs" link="/admin/leedurs" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              <ButtonBubble label="Logout" accent link="/" onClick={()=>{this.infoPopup.setModalState(false); this.setLoginStatus(false,"", "", "")}}/>
            </>
          }
          { 
            this.state.accountType === "judge" && <>
              <ButtonBubble label="Judging Panel" link="/judge/panel" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              {/* <ButtonBubble label="Your Info" link="/judge/account" onClick={()=>{this.infoPopup.setModalState(false)}}/> */}
              <ButtonBubble label="Logout" accent link="/" onClick={()=>{this.infoPopup.setModalState(false); this.setLoginStatus(false,"", "", "")}}/>
            </>
          }
          { 
            (this.state.accountType === "frosh" || this.state.accountType === "leedur") && <>
              <ButtonBubble label="Submit" link="/frosh/submit" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              <ButtonBubble label="Submitted & Completed Missions" link="/frosh/missions" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              <ButtonBubble label="Team Info" link="/frosh/teamInfo" onClick={()=>{this.infoPopup.setModalState(false)}}/>
              <ButtonBubble label="Logout" accent link="/" onClick={()=>{this.infoPopup.setModalState(false); this.setLoginStatus(false,"", "", "")}}/>
            </>
          }
        </ContainerPopupModal>
        <Login ref={(login)=> this.login = login} handleLoginChange={this.props.handleLoginChange} infoPopup={this.infoPopup}/>
        {!this.state.status?
          <div className="loginButton" onClick={this.openLogin}>
            Login
          </div>
          :
          <div className="profileIcon" onClick={()=>{this.infoPopup.setModalState(true)}}>
            {this.state.initials}
          </div>
        }
      </>
    )
  }
}

export class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loginError: '',
      forgetPasswordError: '',
      action: 'Login'
    }
  }
  openLogin = () => {
    this.setState({action: 'Login'});
    this.popup.setModalState(true);
  }
  handleLogin = async () => {
    const res = await axios.post('/login', {
      email: this.usernameInput.getValue(), 
      password: this.passwordInput.getValue()
    })
    if (res.data.loginStatus) {
      try {
        const { data } = await axios.get('/user/accountInfo')
        this.props.handleLoginChange(true, data.initials, data.accountType, data.name)
        this.popup.setModalState(false);
        this.props.infoPopup.setModalState(true)
      } catch (err) {
        this.setState({
          loginError: "An error has occured"
        })
      }
    } else {
      this.setState({
        loginError: res.data.errorMessage
      })
    }
  }
  // handleForgetPassword = async() => {
  //   //input validation and error handling
  //   const email = this.emailInput.getValue();
  //   const msg = getEmailErrorMsg(email)
  //   if(msg){
  //     this.setState({
  //       forgetPasswordError: msg
  //     });
  //     return;
  //   }

  //   const res = await axios.post('/forgotPassword', {
  //     email: email, 
  //   })
  //   if(res.data === 'recovery email sent'){
  //     alert("An link has been sent to you. Please check your email to reset your password.");
  //     this.popup.setModalState(false);
  //   }else{
  //     this.setState({
  //       forgetPasswordError: res.data
  //     });
  //   }
  // }
  render(){
    return (
      <ContainerPopupModal header={this.state.action} ref={(popup)=> this.popup = popup}>

      { this.state.action === "Login" ? 
        <>
          <div style={{width:"400px"}}/>
          <p> {this.state.loginError} </p>
          <FormTextBox ref={(usernameInput)=> this.usernameInput= usernameInput} clearButton style={{width:"100%"}} type={"email"} label="Email" localStorageKey="username"/>
          <FormTextBox onEnterKey={this.handleLogin} ref={(passwordInput)=> this.passwordInput= passwordInput} clearButton style={{width:"100%"}} type={"password"} label="Password"/>
          <div style={{height:"20px"}}/>
          <div style={{float:"right", marginRight:"-20px"}}><Button label="Login" onClick={this.handleLogin}/></div>
          {/* <p onClick={()=>{this.setState({action: 'Forgot Password'})}}><u>Forgot your password?</u></p> */}
        </> :
        <>
          <div style={{width:"400px"}}/>
          <h5>To reset your password, enter your email below</h5>
          <p> {this.state.forgetPasswordError} </p>
          {/* TODO: fix the bug and remove the line below */}
          {false && <FormTextBox/>}
          <FormTextBox onEnterKey={this.handleForgetPassword} ref={(emailInput)=> this.emailInput= emailInput} clearButton style={{width:"100%"}} type={"email"} label="Email" localStorageKey="Email"/>
          <div style={{height:"20px"}}/>
          <div style={{float:"right", marginRight:"-20px"}}><Button label="Send Email" onClick={this.handleForgetPassword}/></div>
          <div style={{float:"left", marginLeft:"20px"}}><Button label="Back" onClick={()=>{this.setState({action: 'Login'})}}/></div>
        </>
      }
      </ContainerPopupModal>
    )
  }
}
