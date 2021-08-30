import React,{Component} from 'react'
import "./forms.css"
import {TextInfo, TextAccent, TextParagraph, TextTooltip} from "./texts"
import {DropdownMenu} from "./buttons"

export class FormCheckbox extends Component {
  constructor(props) {
    super();
    this.state = {
      selected: false,
    }
  }

  inputChange(checked){
    if(this.props.onChange) this.props.onChange(checked)
    this.setState({selected:checked})
    if(this.props.localStorageKey){
      localStorage.setItem(this.props.localStorageKey, checked);
    }
  }

  getValue = () => {
    return(this.state.selected);
  }

  componentDidMount(){
    if(this.props.localStorageKey){
      var storedValue = localStorage.getItem(this.props.localStorageKey)
      if(storedValue===undefined||storedValue===null){
        this.setState({selected: this.props.default?this.props.default:false});
      } else {
        this.setState({selected: storedValue==="true"});
      }
    } else {
      this.setState({selected: this.props.default?this.props.default:false});
    }
  }

  render(){
    return(
      <>
        <div className="requiredStar">{this.props.required?"*":""}</div>
        {this.props.label!==undefined?<TextAccent small={this.props.small} style={{fontSize: "18px", display:"inline-block", marginLeft: this.props.required?"13px":"0px"}}>{this.props.label}</TextAccent>:<div/>}
        <div>
          <div>
            <img alt="check" className={( (this.props.selected ?? this.state.selected) ?"checkButtonFadeIn":"checkButtonFadeOut") + " checkMarkPosition"}  src={require("../assets/icons/check-solid.svg").default}/>
            <input disabled={this.props.disabled} onChange={(event)=>this.inputChange(event.target.checked)} checked={this.props.selected ?? this.state.selected} id="option" type="checkbox" className={"checkButton"+(this.props.disabled?" checkButtonDisabled":"")} name={this.props.label}/>
            <label onClick={()=>{if(this.props.disabled!==true)this.inputChange(!this.state.selected)}} style={{paddingLeft:"10px"}}><TextParagraph><div className={this.props.disabled?"disabledLabel":""}>{this.props.option}</div></TextParagraph></label><br/>
          </div>
        </div>
      </>
    )
  }
}


export class FormRadioOptions extends Component {
  constructor(props) {
    super();
    this.state ={
      selectedItem: 0,
    };
  }

  inputChange(item){
    if(this.props.onChange) this.props.onChange(item)
    this.setState({selectedItem:item})
    if(this.props.localStorageKey){
      localStorage.setItem(this.props.localStorageKey, item);
    }
  }

  getValue = () => {
    return(this.state.selectedItem);
  }

  setValue = (value) => {
    this.setState({selectedItem: value})
    if(this.props.localStorageKey){
      localStorage.setItem(this.props.localStorageKey, value);
    }
  }

  componentDidMount(){
    if(this.props.localStorageKey){
      let storedValue = localStorage.getItem(this.props.localStorageKey)
      if(storedValue===undefined||storedValue===null){
        this.setState({selectedItem: this.props.options[this.props.defaultIndex?this.props.defaultIndex:-1],});
      } else {
        this.setState({selectedItem: storedValue,});
      }
    } else {
      this.setState({selectedItem: this.props.options[this.props.defaultIndex===undefined?-1:this.props.defaultIndex],});
    }
  }

  render(){
    return(
      <>
        <div className="requiredStar">{this.props.required?"*":""}</div>
        <TextAccent small={this.props.small} style={{fontSize: "18px", display:"inline-block", marginLeft: this.props.required?"13px":"0px"}}>{this.props.label}</TextAccent>
        <div>
          {
            this.props.options.map((option, index)=>{
              let checked=false
              if(index===this.props.defaultIndex){
                // eslint-disable-next-line
                checked=true
              }
              var disabled = this.props.disabledIndex?.includes(index)||this.props.allDisabled===true
              return(
                <div key={index}>
                  <input disabled={disabled} onChange={(event)=>this.inputChange(event.target.value)} checked={this.state.selectedItem===option} className={"radioButton "+(disabled?"radioButtonDisabled":"")} type="radio" id="option" name={this.props.label} value={option}/>
                  <label onClick={()=>{if(disabled===false){this.inputChange(option)}}} style={{paddingLeft:"10px"}}><TextParagraph><div className={disabled?"disabledLabel":""}>{option}</div></TextParagraph></label><br/>
                </div>
              )
            })
          }
        </div>
        <TextInfo style={{color:"red", fontSize: "13px"}}>{this.props.error}</TextInfo>
      </>
    )
  }
}

export class FormTextBox extends Component {
  constructor(props) {
    super();
    this.state ={
      labelState: "textBoxLabelFadeOut",
      value: "",
    };
    this.firstOpen=true;
  }

  getValue = () => {
    return(this.state.value);
  }

  setValue = (newValue) => {
    this.setState({value: newValue});
  }

  onKeyPress = (target) => {
    if(target.charCode===13){
      if(this.props.onEnterKey) this.props.onEnterKey();
    }
  }

  inputChange(text){
    //Replace non ASCII letter, digit, underscore, !, ?, space, -, @
    var value = text.replace(/[^\w\n!@#$%^&*()\-+={}[\]:";'<>,./?~`\\ ]+/g,"");
    let labelState
    this.firstOpen=false;
    if(value!=="" || this.props.type==="date"){
      labelState="textBoxLabelFadeIn"
    } else {
      labelState="textBoxLabelFadeOut"
    }
    if(this.props.localStorageKey){
      localStorage.setItem(this.props.localStorageKey, value);
    }
    if(this.props.onChange) this.props.onChange(value)
    this.setState({labelState: labelState, value: value})
  }

  componentDidMount(){
    if(this.props.localStorageKey){
      let storedValue = localStorage.getItem(this.props.localStorageKey) ? localStorage.getItem(this.props.localStorageKey) : undefined
      if(storedValue===undefined||storedValue===null||storedValue===""){
        if(this.props.defaultValue!==undefined && this.props.defaultValue!==""){
          this.setState({value: this.props.defaultValue, labelState: "textBoxLabelFadeIn"});
          this.firstOpen=false;
        } else {
          this.setState({value: "", labelState: "textBoxLabelFadeOut"});
          this.firstOpen=true;
        }
        localStorage.setItem(this.props.localStorageKey, "");
      } else {
        this.setState({value: storedValue, labelState: "textBoxLabelFadeIn"});
        this.firstOpen=false;
      }
    } else if (this.props.defaultValue!==undefined){
      this.setState({value: this.props.defaultValue, labelState: "textBoxLabelFadeIn"});
      this.firstOpen=false;
    }
    if(this.props.type==="date"){
      this.firstOpen = false;
      this.setState({labelState: "textBoxLabelFadeIn"});
    }
  }

  render(){

    if(this.props.type==="textArea"){
      return(
        <div style={this.props.margin!==false?{marginTop:"5px",marginBottom:"5px"}:{}}>
          <div style={{opacity:0}} className={!this.firstOpen?this.state.labelState:""}><TextAccent small={this.props.small} style={{marginBottom:"-3px"}}>{this.props.label}</TextAccent></div>
          <p className="requiredStar">{this.props.required?"*":""}</p>
          <TextTooltip description={this.props.description}>
            <textarea required={this.props.required} disabled={this.props.disabled} className={"formTextBoxWidth formTextBox textParagraph "+this.props.styleClass+(this.props.disabled?" formTextBoxDisabled":"")} value={this.state.value} ref={this.props.searchRef} id={this.props.inputId} style={Object.assign({},{resize:"both", border: this.props.error===undefined || this.props.error===""?"":"2px solid red"},this.props.style)} placeholder={this.props.label} type={this.props.type} onChange={(event)=>{this.inputChange(event.target.value)}}/>
          </TextTooltip>
          <TextInfo style={{color:"red", fontSize: "13px", transform:"translateY(-6px)"}}>{this.props.error}</TextInfo>
        </div>
      )
    } else if(this.props.type==="password"){
      return(
        <div style={this.props.margin!==false?{marginTop:"5px",marginBottom:"5px"}:{}}>
          <div style={{opacity:0}} className={!this.firstOpen?this.state.labelState:""}><TextAccent small={this.props.small} style={{marginBottom:"-3px"}}>{this.props.label}</TextAccent></div>
          <p className="requiredStar">{this.props.required?"*":""}</p>
          <TextTooltip id="tooltip" description={this.props.description}>
            <div style={{display:"flex"}} className={"formTextBoxWidth "+this.props.styleClass}>
              <input disabled={this.props.disabled} onKeyPress={this.onKeyPress} ref={(input)=> this.input = input} value={this.state.value} style={Object.assign({},{border: this.props.error===undefined || this.props.error===""?"":"2px solid red"},this.props.style)} required={this.props.required} placeholder={this.props.label} className={"formTextBox textParagraph"+(this.props.disabled?" formTextBoxDisabled":"")} type={this.state.type===undefined?"password":this.state.type} onChange={(event)=>{this.inputChange(event.target.value)}}/>
              <img className={"formTextBoxEye"} onClick={()=>{this.state.type==="text"?this.setState({type:"password"}):this.setState({type:"text"})}} src={this.state.type==="text"?require("../assets/icons/eye-solid.svg").default:require("../assets/icons/eye-slash-solid.svg").default} alt="clear"/>
            </div>
          </TextTooltip>
          <TextInfo style={{color:"red", fontSize: "13px"}}>{this.props.error}</TextInfo>
        </div>
      )
    } else {
      let specialExitButton = {}
      let max = ""
      if(this.props.type==="date"){
        specialExitButton = {width:"7px", marginLeft:"-16px"}
        max = "2021-09-01" // This fixes the weird 6 digit year problem on Chrome but not Firefox :(
      }
      return(
        <div style={this.props.margin!==false?{marginTop:"5px",marginBottom:"5px"}:{}}>
          <div style={{opacity:0}} className={!this.firstOpen?this.state.labelState:""}><TextAccent small={this.props.small} style={{marginBottom:"-3px"}}>{this.props.label}</TextAccent></div>
          <p className="requiredStar">{this.props.required?"*":""}</p>
          <TextTooltip id="tooltip" description={this.props.description}>
            <div style={{display:"flex"}} className={"formTextBoxWidth "+this.props.styleClass}>
              <input required={this.props.required} max={max} disabled={this.props.disabled} onKeyPress={this.onKeyPress} ref={(input)=> this.input = input} value={this.state.value} style={Object.assign({},{border: this.props.error===undefined || this.props.error===""?"":"2px solid red"},this.props.style)} placeholder={this.props.label} className={"formTextBox textParagraph"+(this.props.disabled?" formTextBoxDisabled":"")} type={this.props.type} onChange={(event)=>{this.inputChange(event.target.value)}}/>
              {this.props.clearButton && !this.firstOpen?<img style={specialExitButton} className={"formTextBoxClear "+(this.state.labelState+"Only ") + (this.props.type==="date"?"date":"")} onClick={()=>{this.input.value=""; this.inputChange("")}} src={require("../assets/icons/exit.svg").default} alt="clear"/>:<div/>}
            </div>
          </TextTooltip>
          <TextInfo style={{color:"red", fontSize: "13px"}}>{this.props.error}</TextInfo>
        </div>
      )
    }
  }
}

export class FormDropdownMenu extends Component {
  constructor(props) {
    super();
    this.state ={
      selectedIndex: 0,
    };
    this.items = []

    for(let i = 0; i < props.items.length; i++){
      let item = {"title":"", "function":""}
      item["title"] = props.items[i]
      item["function"] = (index)=>this.updateTitle(index)
      this.items.push(item)
    }
  }

  async componentDidMount(){
    if(this.props.localStorageKey){
      this.setState({selectedIndex: localStorage.getItem(this.props.localStorageKey) ? localStorage.getItem(this.props.localStorageKey) : (this.props.defaultIndex?this.props.defaultIndex:0)});
    } else if (this.props.defaultIndex){
      this.setState({selectedIndex: this.props.defaultIndex});
    }
  }

  getValue = () => {
    return(this.props.items[this.state.selectedIndex]);
  }

  updateTitle(index){
    this.setState({selectedIndex:index})
    this.props.onChange(index,this.props.items[index])
    if(this.props.localStorageKey){
      localStorage.setItem(this.props.localStorageKey, index);
    }
  }

  render(){
    return(
      <div style={this.props.margin!==false?{marginTop:"5px",marginBottom:"5px"}:{}}>
        <TextAccent small={this.props.small} style={{marginBottom:"-3px"}}>{this.props.label}</TextAccent>
        <p className="requiredStar">{this.props.required?"*":""}</p>
        {this.props.disabled?<div className="dropdownMenuDisabled"><TextParagraph style={{color:"gray", fontSize:"18px", display:"inline-block"}}>{this.items[this.state.selectedIndex]["title"]}</TextParagraph><img style={{height:"15px",width:"15px",display:"inline-block",marginLeft:"6px", marginBottom:"5px", marginRight:"-5px"}} src={require("../assets/icons/caret-down-solid.svg").default} alt="caret"/></div>:<DropdownMenu items={this.items} label={this.props.items[this.state.selectedIndex]}/>}
        <TextInfo style={{color:"red", fontSize: "13px"}}>{this.props.error}</TextInfo>
      </div>
    )
  }
}
