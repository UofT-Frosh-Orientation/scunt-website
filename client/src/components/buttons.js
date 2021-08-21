import React,{Component} from 'react'
import "./buttons.css"
import {Dropdown, DropdownButton} from 'react-bootstrap';
import {TextInfo, TextAccent, TextParagraph} from "./texts"
import {Link} from 'react-router-dom'

export class ButtonBubble extends Component {
  render(){
    if(this.props.link){
      return(
        <Link to={this.props.link} className="noUnderline">
          <div onClick={this.props.onClick} className={"buttonBubble"+(this.props.accent?" buttonBubbleAccent":"")}>
            <TextParagraph>{this.props.label}</TextParagraph>
          </div>
        </Link>
      )
    } else {
      return(
        <div onClick={this.props.onClick} className={"buttonBubble"+(this.props.accent?" buttonBubbleAccent":"")}>
          <TextParagraph>{this.props.label}</TextParagraph>
        </div>
      )
    }
    
  }
}

export class ButtonNavbar extends Component {
  render(){
    return(
      <div className={"buttonNavbar" + (this.props.selected?" buttonNavbarSelected":"")}>
        <TextParagraph><div className={"buttonNavbarLabel" + (this.props.selected?" buttonNavbarLabelSelected":"")}>{this.props.label}</div></TextParagraph>
      </div>
    )
  }
}

export class Button extends Component {
  render(){
    if(this.props.disabled===true){
    return(
        <div className={"button buttonDisabled" + (this.props.large?" buttonLarge":"")}>
          {this.props.label}
        </div>
      )
    }else if(this.props.primary || this.props.primary===undefined){
      return(
        <div onClick={this.props.onClick} className={"button" + (this.props.large?" buttonLarge":"")}>
          {this.props.label}
        </div>
      )
    } else {
      return(
        <div onClick={this.props.onClick} className={"buttonSecondary" + (this.props.large?" buttonLarge":"")}>
          {this.props.label}
        </div>
      )
    }
  }
}

export class DropdownMenu extends Component {
  render(){
    return(
      <div className={"dropdownMenu " + (this.props.selected?"dropdownMenuSelected":"dropdownMenuNotSelected")}>
        <DropdownButton id={this.props.navbar?"dropdownMenuButtonNavbar":"dropdownMenuButton"} title={this.props.label}>
          {this.props.items.map((item, index)=>{
            if(item.link){
              return(
                <div className={item.title===this.props.selectedItem?"dropDownItemSelected":""} key={item.title + index.toString()}>
                <Dropdown.Item key={item.title + index.toString()}>
                    <Link to={item.link} className="linkLink">
                      <TextInfo>{item.title}</TextInfo>
                    </Link>
                </Dropdown.Item>
                </div>
              )
            } else {
              return(
                <Dropdown.Item key={item.title + index.toString()}>
                  <div onClick={()=>item.function(index)}>
                    <TextInfo>{item.title}</TextInfo>
                  </div>
                </Dropdown.Item>
              )
            }
            
          })}
        </DropdownButton>
      </div>
    )
  }
}

export class ButtonImage extends Component {
  render(){
    return(
      <a href={this.props.href}>
        <div className={"buttonImage "+(this.props.selected?"buttonImageSelected":"")} onClick={this.props.onClick}>
          <div style={{justifyContent:"center", display: "flex"}}><img src={this.props.img} className="buttonImageImage" alt="button"/></div>
          <TextAccent style={{justifyContent:"center", display: "flex", padding:"10px"}}>Test</TextAccent>
        </div>
      </a>
    )
  }
}
