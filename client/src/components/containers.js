import React,{Component} from 'react'
import "./containers.css"
import Accordion from 'react-bootstrap/Accordion'
import Card from 'react-bootstrap/Card'
import {TextAccent} from "./texts"
import {Button} from "./buttons"
import Wave from 'react-wavify'
import ReactCanvasConfetti from 'react-canvas-confetti';
import {FroshWeekIcon} from "./socials"
import { Col, Row } from 'react-bootstrap'
import { FormCheckbox } from './forms'

export class ContainerNote extends Component {
  render(){
    return(
      <div className="containerNote">
        <p style={{margin:0, padding:0}}>{this.props.children}</p>
      </div>
    )
  }
}


export class ContainerCheckApprovedAnimation extends Component {
  constructor(){
    super()
    this.state = ({animate: false})
  }
  startAnimation = () => {
    this.setState({animate:true})
    this.checkApprove.startAnimation()
  }
  resetAnimation = () => {
    this.setState({animate:false})
    this.checkApprove.resetAnimation()
  }
  render(){
    return(
      <div style={{display:"flex", flexDirection:"row", alignItems:"center"}}>
        <CheckApprovedAnimation ref={(checkApprove)=> this.checkApprove = checkApprove}/>
        <div className={"checkApprovedLabel"+(this.state.animate?" checkApprovedLabelIn":"")}><TextAccent style={{marginLeft: "10px"}}>{this.props.label}</TextAccent></div>
      </div>
    )
  }
}

export class CheckApprovedAnimation extends Component {
  constructor(){
    super()
    this.state = ({animate: false})
  }
  startAnimation = () => {
    this.setState({animate:true})
  }
  resetAnimation = () => {
    this.setState({animate:false})
  }
  render(){
    return(
      <div style={{width:this.props.width?this.props.width:"50px", height:this.props.width?this.props.width:"50px"}} className={"checkApprovedContainer"+(this.state.animate?" checkApprovedContainerIn":"")}>
        <img className={"checkApproved"+(this.state.animate?" checkApprovedIn":"")} src={require("../assets/icons/check-solid.svg").default} alt="check"/>
      </div>
    )
  }
}

export class LoadingAnimation extends Component {
  render(){
    return(
      <div className="loadingAnimationContainer" style={{width:this.props.width?this.props.width:"200px", height:this.props.width?this.props.width:"200px"}}>
        <div className="loadingAnimation" style={{width:this.props.width?this.props.width:"200px", height:this.props.width?this.props.width:"200px"}}></div>
        <div className="loadingAnimation loadingAnimationDelay1" style={{width:this.props.width?this.props.width:"200px", height:this.props.width?this.props.width:"200px"}}></div>
        <div className="loadingAnimation loadingAnimationDelay2" style={{width:this.props.width?this.props.width:"200px", height:this.props.width?this.props.width:"200px"}}></div>
        <FroshWeekIcon logo={require("../assets/logos/Frosh Logo/FroshLogo.png").default} width="65%" height="65%"/>
      </div>
    )
  }
}

export class AboutAccountHeader extends Component {
  render(){
    return(
      <div style={{marginTop:"-70px"}}>
        <Wave fill='#9243AA'
          paused={false}
          options={{
            height: 100,
            amplitude: 10,
            speed: 0.4,
            points: 7
          }}
        />
        <div className="aboutAccountHeader" style={{borderRadius:"0px 0px 20px 20px", padding:"25px 10px", width:"100%", backgroundColor:"#9243AA"}}>
          <h1 style={{textAlign:"center"}}>{this.props.name}</h1>
          <TextAccent primary={false} style={{textAlign:"center"}}>{this.props.email}</TextAccent>
        </div>
      </div>
    )
  }
}

export class ContainerPopupModalConfirm extends Component {
  setModalState = (state) => {
    this.popupRef.setModalState(state);
  }
  render(){
    return(
      <ContainerPopupModal exitBackground={false} exitButton={false} header={this.props.header} ref={(popup)=> this.popupRef = popup}>
        <p>{this.props.message}</p>
        <div style={{float:"right"}}>
          <Button label={this.props.labelYes!==undefined?this.props.labelYes:"Yes"} onClick={()=>{this.setModalState(false); this.props.buttonCallback(true);}}/>
          <Button label={this.props.labelNo!==undefined?this.props.labelNo:"No"} primary={false} onClick={()=>{this.setModalState(false); this.props.buttonCallback(false);}}/>
        </div>
      </ContainerPopupModal>
    )
  }
}

export class ContainerSnackbar extends Component {
  constructor(){
    super()
    this.state = {open: false}
    this.firstOpen = true;
  }

  setSnackbarState = (state) => {
    this.setState({open:state})
    this.firstOpen = false;
    if(this.props.closeAfter!==undefined && this.props.closeAfter!==0){
      setTimeout(() => {
        this.setState({open:false})
      }, this.props.closeAfter);
    }
  }

  render(){
    if(this.firstOpen){
      return(<div/>)
    } else {
      return(
        <>
          <div className={"snackbarContainer " + (this.state.open?"snackbarSlideUp":"snackbarSlideDown")}>
            <img className={"snackbarClear"} onClick={()=>{this.setSnackbarState(false)}} src={require("../assets/icons/exit.svg").default} alt="clear"/>
            <TextAccent style={{padding:"10px"}} primary={false}>{this.props.label}</TextAccent>
          </div>
        </>
      )
    }
  }
}

export class ContainerTicket extends Component {
  render(){
    return(
      <div className={"ticketWrapper"+(this.props.animationHover===false?"":" ticketWrapperHover")}>
        <div className="ticketInvertedCorner">
          <div className="ticketTop"/>
            <div className="ticketContainer">
              <TextAccent primary={false}>{this.props.header}</TextAccent>
              <h1>{this.props.label}</h1>
              <TextAccent primary={false}>{this.props.footer}</TextAccent>
            </div>
          <div className="ticketBottom"/>
        </div>
      </div>
    )
  }
}

export class ContainerPopupModal extends Component {
  constructor(){
    super()
    this.state = {open: false}
    this.firstOpen = true;
  }

  setModalState = (state) => {
    this.setState({open:state})
    this.firstOpen = false;
    if(this.props.onStateChange!==undefined){
      this.props.onStateChange(state)
    }
  }

  render(){
    if(this.firstOpen){
      return(<div/>)
    } else {
      if(this.props.customPosition!==undefined){
        return(
          <>
            {this.props.blurBackground===false?<div/>:<div onClick={()=>{this.setModalState(false)}} className={"popupModalBlur" + (!this.state.open?" popupModalHiddenBlur":" popupModalShownBlur")}/>}
            {this.props.exitBackground===true?<div onClick={()=>{this.setModalState(false)}} className={this.state.open?"popupModalClickBackground":""}/>:<div/>}
            <div onClick={()=>{if(this.props.smallInfoModal===true){this.setModalState(false)}}} className={this.props.customPosition + " popupModal"+ (this.props.smallInfoModal?" popupModalSmall":"") + (!this.state.open?" popupModalHidden":" popupModalShown")} style={{position:"fixed", zIndex:200}}>
              {this.props.exitButton!==false?<img onClick={()=>{this.setModalState(false)}} src={require("../assets/icons/exit.svg").default} className={"popupModalExit"+(this.props.smallInfoModal?" popupModalExitSmall":"")} alt="exit"/>:<div/>}
              {this.props.header!==undefined?<h2>{this.props.header}</h2>:<div/>}
              {this.props.children}
            </div>
          </>
        )
      } else {
        return(
          <>
            {this.props.blurBackground===false?<div/>:<div onClick={()=>{this.setModalState(false)}} className={"popupModalBlur" + (!this.state.open?" popupModalHiddenBlur":" popupModalShownBlur")}/>}
            <div className={(!this.state.open?" popupModalHidden":" popupModalShown")} style={{position:"fixed", zIndex:200, top:0, left:0}}>
              {this.props.exitBackground!==false?<div onClick={()=>{this.setModalState(false)}} className={this.state.open?"popupModalClickBackground":""}/>:<div/>}
              <div className="popupModalContainer">
                <div className={"popupModal" + (!this.state.open?" popupModalHidden":" popupModalShown")}>
                  {this.props.exitButton!==false?<img onClick={()=>{this.setModalState(false)}} src={require("../assets/icons/exit.svg").default} className="popupModalExit" alt="exit"/>:<div/>}
                  {this.props.header!==undefined?<h2>{this.props.header}</h2>:<div/>}
                  {this.props.children}
                </div>
              </div>
            </div>
          </>
        )
      }
    }
  }
}


export class ContainerAccordion extends Component {
  constructor(props){
    super()
    this.state = {open: props.initialOpen?true:false}
  }
  setAccordionState = (state) => {
    this.setState({open:state})
  }
  render(){
    var borderRadiusTop = "10px"
    var borderRadiusBottom = "10px"
    if(this.props.position==="top"){
      borderRadiusTop = "10px"
      borderRadiusBottom = "0px"
    } else if(this.props.position==="middle"){
      borderRadiusTop = "0px"
      borderRadiusBottom = "0px"
    } else if(this.props.position==="bottom"){
      borderRadiusTop = "0px"
      borderRadiusBottom = "10px"
    }
    return(
      <Accordion defaultActiveKey={this.props.initialOpen?"0":""} activeKey={this.state.open?"0":""}>
        <Card style={{borderTopRightRadius:borderRadiusTop,borderTopLeftRadius:borderRadiusTop,borderBottomLeftRadius:borderRadiusBottom,borderBottomRightRadius:borderRadiusBottom}} >
          <Accordion.Toggle className="accordionHeader" as={Card.Header} eventKey="0" onClick={()=>{this.setAccordionState(!this.state.open)}}>
            <TextAccent style={{float:"left"}}>{this.props.header}</TextAccent>
            <img src={require("../assets/icons/chevron-down-solid.svg").default} className={this.state.open?"accordionArrowOpen":"accordionArrowClosed"} alt="accordion icon"/>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0">
            {this.props.children}
          </Accordion.Collapse>
        </Card> 
      </Accordion>
    )
  }
}

export class ControlledContainerAccordion extends Component {
  constructor(props){
    super()
  }
  setAccordionState = (state) => {
    this.props.setOpenState(state)
  }
  render(){
    var borderRadiusTop = "10px"
    var borderRadiusBottom = "10px"
    if(this.props.position==="top"){
      borderRadiusTop = "10px"
      borderRadiusBottom = "0px"
    } else if(this.props.position==="middle"){
      borderRadiusTop = "0px"
      borderRadiusBottom = "0px"
    } else if(this.props.position==="bottom"){
      borderRadiusTop = "0px"
      borderRadiusBottom = "10px"
    }
    return(
      <Accordion defaultActiveKey={this.props.openState?"0":""} activeKey={this.props.openState?"0":""}>
        <Card style={{borderTopRightRadius:borderRadiusTop,borderTopLeftRadius:borderRadiusTop,borderBottomLeftRadius:borderRadiusBottom,borderBottomRightRadius:borderRadiusBottom}} >
          <Accordion.Toggle className="accordionHeader" id={this.props.id} as={Card.Header} eventKey="0" onClick={()=>{this.setAccordionState(!this.props.openState)}}>
            <TextAccent style={{float:"left"}}>{this.props.header}</TextAccent>
            <img src={require("../assets/icons/chevron-down-solid.svg").default} className={this.props.openState?"accordionArrowOpen":"accordionArrowClosed"} alt="accordion icon"/>
          </Accordion.Toggle>
          <Accordion.Collapse eventKey="0">
            {this.props.children}
          </Accordion.Collapse>
        </Card> 
      </Accordion>
    )
  }
}

export class Confetti extends React.Component {
  constructor(props) {
    super(props);
    this.isAnimationEnabled = false;
    this.animationInstance = null;
    this.nextTickAnimation = this.nextTickAnimation.bind(this);
    this.animationCount = 0;
  }

  makeShot = (angle, originX) => {
    this.animationInstance && this.animationInstance({
      particleCount: 100,
      angle,
      spread: 100,
      origin: {x:originX, y:0.6},
      colors: ["#6F1E88","#FFC112","#B27EC2","#FFF567"],
    });
  }

  nextTickAnimation = () => {
    setTimeout(() => {
      this.animationCount = this.animationCount+1;
      this.makeShot(60, 0);
      this.makeShot(120, 1);
      if (this.animationCount >= 5) this.isAnimationEnabled=false;
      if (this.isAnimationEnabled) requestAnimationFrame(this.nextTickAnimation);
    }, 400);
  }

  startAnimation = () => {
    if (!this.isAnimationEnabled) {
      this.isAnimationEnabled = true;
      this.animationCount = 0;
      this.nextTickAnimation();
    }
  }

  getInstance = (instance) => {
    this.animationInstance = instance;
  };

  componentWillUnmount() {
    this.isAnimationEnabled = false;
  }

  render() {
    return (
      <ReactCanvasConfetti refConfetti={this.getInstance} style={{position: "fixed", pointerEvents: "none", width: "100%", height: "100%", left: 0, top: 0, zIndex: 200}}/>
    );
  }
}

export function MissionAdminContainer({
  name,
  number,
  category,
  totalPoints,
  isViewable,
  checkMission,
  isSelected
}) {
  return <div className="mission-row">
    <Row>
      <Col md={1}>
        <FormCheckbox 
            option="" selected={isSelected}
            onChange={checkMission} small />
      </Col>
      <Col md={1}>
        <h6>{number}</h6>
      </Col>
      <Col md={7}>
        <div className="mission-name">
          <h6>{name}</h6>
          <p>{category}</p>
        </div>
      </Col>
      <Col md={2}> { totalPoints } </Col>
      <Col md={1}> { isViewable ? '👀' : '🚫'} </Col>
    </Row>
  </div>
}

export function MissionGeneralContainer ({
  name,
  number,
  category,
  totalPoints
}) {
  return <div className="mission-row">
    <Row>
      <Col md={1}>
        <h6>{number}</h6>
      </Col>
      <Col md={7}>
        <h6>{name}</h6>
      </Col>
      <Col md={3}> {<p>{category}</p>} </Col>
      <Col md={1}> { totalPoints } </Col>
    </Row>
  </div>
}

export function MissionFroshContainer ({
  name,
  number,
  category,
  status, 
  submitter,
  submissionLink,
  achievedPoints,
  totalPoints
}) {}

export function TeamInfo ({
  name,
  participants,
  score,
  missionsCompleted
}) {
  return <ContainerAccordion
    header={name}
    id={`team-${name}`}
  >
    <div className="team-info">
      <div className="team-subheader">
        <Button primary={false} label={`Missions Completed 🏅: ${missionsCompleted.length}`} onClick={() => {}}/>
        <p> Team Score: {score}pts </p>
      </div>
      { participants.map(p => <span style={{color: p.warned ? 'red' : 'purple'}}>{p.email},</span>) }
    </div>
  </ContainerAccordion>
}