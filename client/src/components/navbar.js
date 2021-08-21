import React,{Component} from 'react'
import {DropdownMenu,ButtonNavbar} from "./buttons"
import './navbar.css';
import {Link} from 'react-router-dom';
import {HeaderBold} from "./texts"
import {FroshWeekIcon} from "./socials"
import {pages} from "../util/pages"
import {LoginButton} from "./login"


export class Navbar extends Component {
  constructor(props) {
    super();
    this.navbarPages = pages;
    this.navbarPagesTotalShown = [...this.navbarPages["main"],...this.navbarPages["resources"]]
    this.state = {open: false, currentLink: "", currentName: "", categorySelected: false}
    this.firstOpen = true;
  }
  setModalState = (state) => {
    this.setState({open:state})
    this.firstOpen = false;
  }
  setLoginPopupState = (state) => {
    this.loginButton?.openLogin(state);
  }
  handlePageChange = (currentLink) => {
    let currentPage = this.getCurrentPageName(currentLink);
    this.setState({currentLink:currentLink, currentName: currentPage["title"], categorySelected: currentPage["category"]})
  }
  handleLoginChange = (status, initials, accountType, name) => {
    this.loginButton.setLoginStatus(status,initials,accountType,name)
    this.setState({
      loginStatus: status, 
      loginInitials: initials,
      loginAccountType: accountType, 
      loginName: name
    })
  }

  getCurrentPageName = (currentLink) => {
    var keys = Object.keys(pages)
    for(var i = 0; i < keys.length; i++){
      for(var j = 0; j < pages[keys[i]].length; j++){
        if(currentLink===pages[keys[i]][j]["link"]){
          return({"title":pages[keys[i]][j]["title"],"category":keys[i]});
        }
      }
    }
    return({"title":"","category":""});
  }

  
  render(){
    const froshWeekIcon = <div onClick={()=>{this.setState({open:false})}} style={{position:"fixed", zIndex:210, left:"1.5%", top:"4px"}}>
      <FroshWeekIcon width="59px" height="59px" linkHome logo={require("../assets/logos/Main Logo/2T1 Octopus Logo transparent-04.png").default}/>
    </div>
    const loginButton = <div onClick={()=>{this.setState({open:false})}} style={{position:"fixed", zIndex:211, right:"1.5%", top:"9px"}}>
      <LoginButton ref={(loginButton)=> this.loginButton = loginButton} handleLoginChange={this.props.handleLoginChange}/>
    </div>
    return(
      <>
        {loginButton}
        {froshWeekIcon}
        <div className="navbar" id="navbarLarge">
          {this.navbarPages["main"].map((item, index)=>{
            var selected=false;
            if(item.link===this.state.currentLink){
              selected=true;
            }
            return(
              <Link to={item.link} className="navbarLink" key={item+index.toString()}>
                <ButtonNavbar label={item.title} selected={selected}/>
              </Link>
            )
          })}
          {this.navbarPages["resources"].length===0?<div/>:<div className="navbarLink">
            <DropdownMenu label={"Resources"} navbar items={this.navbarPages["resources"]} selected={this.state.categorySelected==="resources"} selectedItem={this.state.currentName}/>
          </div>}
        </div>
        <div id="navbarSmall">
          <div className="navbar">
            <div className="navbarSmall" onClick={()=>{this.setModalState(!this.state.open)}}>
              <div style={{paddingLeft:"20px"}}><HeaderBold>{this.state.currentName===undefined||this.state.currentName===""?"Page 404":this.state.currentName}</HeaderBold></div>
              <div style={{right:"70px", top:"18px",position:"absolute"}}><img src={require("../assets/icons/chevron-down-solid.svg").default} className={this.state.open?"accordionArrowOpen":"accordionArrowClosed"} alt="accordion icon"/> </div>
            </div>
          </div>
        </div>
        {!this.firstOpen?<div className={this.state.open?"":"navbarSmallSideElementSlideOut"} id="navbarSmallSide">
          {/* blank space */}
          <div style={{height:"68px"}} className={"navbarSmallSideElement "+(this.state.open?"navbarSmallSideElementSlideInLeft":"")}></div>
          {this.navbarPagesTotalShown.map((item, index)=>{
            var selected=false;
            if(item.link===this.state.currentLink){
              selected=true;
            }
            var styles={}
            if(index===this.navbarPagesTotalShown.length-1){
              styles={borderBottomLeftRadius:"10px",borderBottomRightRadius:"10px", paddingBottom:"20px"}
            }
            return(
              <Link onClick={()=>{this.setState({open:false})}} style={styles} to={item.link} className={"navbarSmallSideElement "+(this.state.open?(index%2===0?"navbarSmallSideElementSlideInRight":"navbarSmallSideElementSlideInLeft"):"")+" " + (selected?"navbarSmallSideElementSelected":"")} key={item+index.toString()}>
                {item.title}
              </Link>
            )
          })}
        </div>:<div/>}
      </>
    )
  }
}

export class NavbarSpace extends Component {
  render(){
    return(
      <>
        <div id="navbarSpaceLarger">
          <div style={{height:"70px"}}/>
        </div>
        <div id="navbarSpaceLarge">
          <div style={{height:"64px"}}/>
        </div>
        <div id="navbarSmall">
          <div style={{height:"64px"}}/>
        </div>
      </>
    )
  }
}