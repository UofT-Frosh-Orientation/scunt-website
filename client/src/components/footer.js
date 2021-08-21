import React,{Component} from 'react'
import "./footer.css"
import {SocialMediaIcon} from "./socials"

export default class Footer extends Component {
  render(){
    return(
      <>
        <div className="footer">
          <div className="footerSocialMedias">
            <SocialMediaIcon socialMedia="Instagram" width="40px" height="40px"/>
            <SocialMediaIcon socialMedia="Facebook" width="40px" height="40px"/>
          </div>
          <p className="center-text">💜 Made with love by the F!rosh Week 2T1 Tech Team 💜</p>
          
        </div>
      </>
    )
  }
}

