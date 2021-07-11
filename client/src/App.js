import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

import {BrowserRouter,Route,Redirect,Switch} from 'react-router-dom'
import ScrollToTop from "./components/scrollToTop"
import {pages} from "./util/pages"
import {Navbar} from "./components/navbar"
import {TransitionGroup,CSSTransition} from 'react-transition-group'
import Footer from "./components/footer"
import {error404} from './pages/error404'


export default function App() {

  const navbarRef = React.useRef();

  React.useEffect(() => {
    handlePageChange(window.location.pathname);
    
  }, []);

  function handlePageChange(link){
    navbarRef.current?.handlePageChange(link);
  }

  return (
    <BrowserRouter>
      <Route render={({ location }) => {
        // console.log(location)
        //if(location.search.includes('froshLogin=true')) setLoginPopupState(true)
        
        return (
        <div style={{position:"absolute",right:0, left:0, bottom:0, top:0}}>

          <ScrollToTop/>
          <Navbar ref={navbarRef} /*handleLoginChange={handleLoginChange}*//>

          <TransitionGroup>
            <CSSTransition timeout={300} classNames='page' key={location.key}>
              <Switch location={location}>

                {[...pages["main"],...pages["resources"],...pages["hidden"]].map((item, index)=>{
                  
                      return ( <Route path={item.link} exact render= { ()=> { 
                        
                        handlePageChange(item.link); 
                        return (
                            
                            <div style={{position:"absolute",right:0, left:0, bottom:0, top:0}}>
                              {item.component}
                              <Footer/>
                            </div>

                          )
                        }
                      } key={item.link}/> 
                      )
                    
                } ) }

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


