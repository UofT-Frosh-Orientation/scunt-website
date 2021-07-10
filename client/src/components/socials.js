import React,{Component} from 'react'
import "./socials.css"

import {socialMedias} from "../util/socialMedias.js"
import {Link} from 'react-router-dom';

export class FroshWeekIcon extends Component {
  render(){
    if(this.props.linkHome){
      return(
        <Link to={"/"}>
          <img className="socialMediaIcon" src={this.props.logo} style={{width:(this.props.width?this.props.width:"70px"), height:(this.props.height?this.props.height:"70px")}} alt="Frosh icon"/>
        </Link>
      )
    } else {
      return(
        <img src={this.props.logo} style={{width:(this.props.width?this.props.width:"70px"), height:(this.props.height?this.props.height:"70px")}} alt="Frosh icon"/>
      )
    }
  }
}

export class SocialMediaIcon extends Component {
  render(){
    return(
      // eslint-disable-next-line
      <a target="_blank" href={socialMedias[this.props.socialMedia].link}>
        <img className="socialMediaIcon" src={socialMedias[this.props.socialMedia].icon} style={{width:(this.props.width?this.props.width:"70px"), height:(this.props.height?this.props.height:"70px")}} alt="socials icon"/>
      </a>
    )
  }
}

export class EmailBox extends Component {
  render(){
    return(
      <>
        <div className="emailContactHeader">
          {this.props.header}
        </div>
        <div className={"emailContact"+(this.props.notEmail?" not-email-clickable":"")+(this.props.onClick!==undefined?" clickable":"")}>
          { this.props.notEmail ? <div onClick={this.props.onClick}> {this.props.email} </div> : <a href={"mailto:"+this.props.email}>{this.props.email}</a> }
        </div>
      </>
    )
  }
}

export class SocialMediaIconLarge extends Component {
  render(){
    return(
      <a href={socialMedias[this.props.socialMedia].link}>
        <div className="socialIconLarge" style={{background:socialMedias[this.props.socialMedia].color}}>
          <img src={socialMedias[this.props.socialMedia].iconLarge} alt={this.props.socialMedia}></img>
        </div>
      </a>
    )
  }
}