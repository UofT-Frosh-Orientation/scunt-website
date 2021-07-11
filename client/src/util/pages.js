import Missions from "../pages/missions"
import Judges from "../pages/judges"
import Rules from "../pages/rules"

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
 
  ]
}