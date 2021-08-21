import Missions from "../pages/missions"
import Judges from "../pages/judgesInfo"
import Rules from "../pages/rules"
// import ScuntAdminDasboard from "../admin/dashboard"
import SignUpForm from "../pages/judge/signupForm"
import MissionsAdminView from "../pages/admin/missions"
import JudgesAdminView from "../pages/admin/judges"
import TeamsAdminVeiw from "../pages/admin/teams"
import SubmitMission from "../pages/frosh/submitMission"
import completedMissions from "../pages/frosh/completedMissions"

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
      "title": "Scunt Admin Missions",
      "link": "/admin/missions",
      "component": <MissionsAdminView/>,
      "protected": "admin"
    },
    {
      "title": "Scunt Admin Judges",
      "link": "/admin/judges",
      "component": <JudgesAdminView/>,
      "protected": "admin"
    },
    {
      "title": "Scunt Admin Teams",
      "link": "/admin/teams",
      "component": <TeamsAdminVeiw/>,
      "protected": "admin"
    },
    {
      "title": "Judge Sign Up Form",
      "link": "/judge/signup",
      "component": <SignUpForm/>,
    },
    {
      "title": "Frosh Submit",
      "link": "/frosh/submit",
      "component": <SubmitMission/>,
      "protected": "frosh"
    },
    {
      "title": "Frosh Missions",
      "link": "/frosh/missions",
      "component": <completedMissions/>,
      "protected": "frosh"
    }
  ]
}