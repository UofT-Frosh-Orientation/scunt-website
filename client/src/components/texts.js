import React,{Component} from 'react'
import "./texts.css"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Wave from 'react-wavify'

export class TextTooltip extends Component {
  render(){
    if(this.props.description==="" || this.props.description===undefined){
      return this.props.children
    }
    if(this.props.width===undefined){
      return(
        <OverlayTrigger placement={this.props.placement===undefined?"bottom":this.props.placement} overlay={<Tooltip id="tooltip"><div dangerouslySetInnerHTML={{ __html: this.props.description }}></div></Tooltip>}>
          {this.props.children}
        </OverlayTrigger>
      )
    } else {
      var width = this.props.width===undefined?"20px":this.props.width
      return(
        <OverlayTrigger placement={this.props.placement===undefined?"bottom":this.props.placement} overlay={<Tooltip id="tooltip"><div dangerouslySetInnerHTML={{ __html: this.props.description }}></div></Tooltip>}>
          <img alt="descriptions" src={require("../assets/icons/info-circle-solid.svg").default} style={{width:width, height:width, opacity:0.8}}/>
        </OverlayTrigger>
      )
    }
  }
}

export class HeaderPage extends Component {
  render() {
    return (
      <div style={{position:"relative"}}>
        <div className="landingImage">
          <p>{this.props.children}</p>
          <div className='waveOverlay'>
            <Wave fill='#6F1E88'
              style={{opacity:0.7}}
              options={{
                height: 15,
                amplitude: 10,
                speed: 0.4,
                points: 7
              }}
            />
          </div>
          <img style={{backgroundColor: "#6F1E889D"}} src={this.props.img} alt="header"></img>
        </div>
      </div>
    )
  }
}

export class HeaderSection extends Component {
  render(){
    return(
      <div className="sectionTitleContainer">
        <div className="sectionTitle">
          {this.props.children}
        </div>
      </div>
    )
  }
}

export class HeaderParagraph extends Component {
  render(){
    return(
      <div className="headerParagraph">
        {this.props.children}
      </div>
    )
  }
}

export class HeaderBold extends Component {
  render () {
    return(
      <div className="headerBold">
        {this.props.children}
      </div>
    )
  }
}

export class HeaderFancy extends Component {
  render() {
    return(
      <div className = "headerFancy">
        {this.props.children}
      </div>
    )
  }
}

export class TextParagraph extends Component {
  render(){
    return(
      <div className="textParagraph" style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}

export class TextInfo extends Component {
  render(){
    return(
      <div className="textInfo" style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}

export class TextAccent extends Component {
  render(){
    return(
      <div className={"textAccent" + (this.props.small ? " textAccentSmall" : "") +(this.props.primary || this.props.primary===undefined ? "" : " textAccentSecondary")} style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}

export class TextLink extends Component {
  render(){
    return(
      <div onClick={this.props.onClick} className="textLink textParagraph">
        <a className="textLink textParagraph" href={this.props.href}>{this.props.children}</a>
      </div>
    )
  }
}