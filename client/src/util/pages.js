import Missions from "../pages/missions"
import Judges from "../pages/judges"
import Rules from "../pages/rules"
import ScuntAdminDasboard from "../admin/dashboard"
import SignUpForm from "../judge/signupForm"

export const pages = {
  "main" : [
    {
      "title": "Missions",
      "link": "/",
      "component" : <Missions/>
    },
    {
      "title": "Judges",
      "link": "/judges",
      "component" : <Judges/>
    },
    {
      "title": "Rules",
      "link": "/rules",
      "component" : <Rules/>
    },
  ],
  "resources" : [
    
  ],
  "hidden" : [
    {
      "title": "Scunt Admin Dashboard",
      "link": "/admin/dashboard",
      "component": <ScuntAdminDasboard/>,
      "protected": "admin"
    },
    {
      "title": "Judge Sign Up Form",
      "link": "/judge/signup",
      "component": <SignUpForm/>,
    }
  ]
}