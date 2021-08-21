import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {BrowserRouter,Route,Redirect,Switch} from 'react-router-dom'
import ScrollToTop from "./components/scrollToTop"
import {pages} from "./util/pages"
import {Navbar} from "./components/navbar"
import {TransitionGroup,CSSTransition} from 'react-transition-group'
import Footer from "./components/footer"
import {error404} from './pages/error404'
import axios from 'axios'
import PrivateRoute from './routes/privateRoute'

function App() {

  const navbarRef = React.useRef();

  React.useEffect(() => {
    handlePageChange(window.location.pathname);
    if(window.location.search.includes('login=true')) setLoginPopupState(true)
    const isLoggedIn = async() => {
      const res = await axios.get('/user/signedIn')
      console.log(res.data)
      if(res.data) {
        const {data} = await axios.get('/user/accountInfo')
        handleLoginChange(true, data.initials, data.accountType, data.name)
      } else {
        handleLoginChange(false, "", "", "")
      }
    }
    isLoggedIn()
  }, []);

  function handlePageChange(link){
    navbarRef.current?.handlePageChange(link);
  }

  function handleLoginChange(status, initials, accountType, name){
    //status: boolean, initials: string
    navbarRef.current?.handleLoginChange(status, initials, accountType, name);
  }

  //Opens the login popup
  function setLoginPopupState(state){
    navbarRef.current?.setLoginPopupState(state);
  }

  return (
    <BrowserRouter>
      <Route render={({ location }) => {
        console.log(location)
        if(location.search.includes('login=true')) setLoginPopupState(true)
        
        return (
        <div style={{position:"absolute",right:0, left:0, bottom:0, top:0}}>

          <ScrollToTop/>
          <Navbar ref={navbarRef} handleLoginChange={handleLoginChange}/>

          <TransitionGroup>
            <CSSTransition timeout={300} classNames='page' key={location.key}>
              <Switch location={location}>

                {[...pages["main"],...pages["resources"],...pages["hidden"]].map((item, index)=>{
                  if(item.protected) {
                    return (
                    <PrivateRoute 
                      path={item.link} 
                      homeRoute="/?login=true" 
                      routeType={item.protected}
                      render={
                      ()=>{
                        handlePageChange(item.link); 
                        return (
                          <div className="page-outer">
                            <div className="page-inner">
                              {item.component}
                            </div>
                            <Footer/>
                          </div>
                        )
                      }} 
                      key={item.link}/>)
                  }else {
                    return(<Route path={item.link} exact render={()=>{handlePageChange(item.link); return (
                      <div style={{position:"absolute",right:0, left:0, bottom:0, top:0}}>
                        <div style={{minHeight: "100vh"}}>
                          {item.component}
                        </div>
                        <Footer/>
                      </div>
                    )}} key={item.link}/>)
                  }
                })}
                <Route path='/404' component={error404} />
                <Redirect from='*' to='/404' />
                
              </Switch>
            </CSSTransition>
          </TransitionGroup>
          
        </div>
      )}} />
    </BrowserRouter>
  );
}

export default App;