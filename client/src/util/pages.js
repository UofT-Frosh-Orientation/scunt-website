import Missions from "../pages/missions"
import Judges from "../pages/judgesInfo"
import Rules from "../pages/rules"
// import ScuntAdminDasboard from "../admin/dashboard"
import SignUpForm from "../pages/judge/signupForm"
import JudgingPanel from "../pages/judge/judgingPanel"
import MissionsAdminView from "../pages/admin/missions"
import JudgesAdminView from "../pages/admin/judges"
import TeamsAdminView from "../pages/admin/teams"
import SubmitMission from "../pages/frosh/submitMission"
import CompletedMissions from "../pages/frosh/completedMissions"
import LeedurSignUpForm from "../pages/leedur/signupForm"
import LeedursAdminView from "../pages/admin/leedur"
import TeamInfo from "../pages/frosh/teamInfo"
import Leaderboard from "../pages/leaderboard"

export const pages = {
  "main" : [
    {
      "title": "Missions",
      "link": "/",
      "component" : <Missions/>
    },
    {
      "title": "Leaderboard",
      "link": "/leaderboard",
      "component" : <Leaderboard/>
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
      "component": <TeamsAdminView/>,
      "protected": "admin"
    },
    {
      "title": "Scunt Admin Leedurs",
      "link": "/admin/leedurs",
      "component": <LeedursAdminView/>,
      "protected": "admin"
    },
    {
      "title": "Judge Sign Up Form",
      "link": "/judge/signup",
      "component": <SignUpForm/>,
    },
    {
      "title": "Judging Panel",
      "link": "/judge/panel",
      "component": <JudgingPanel/>,
      // "protected": "judge",
    },
    {
      "title": "Leedur Sign Up Form",
      "link": "/leedur/signup",
      "component": <LeedurSignUpForm/>,
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
      "component": <CompletedMissions/>,
      "protected": "frosh"
    },
    {
      "title": "Scunt Team Info",
      "link": "/frosh/teamInfo",
      "component": <TeamInfo/>,
      "protected": "frosh"
    }
  ]
}