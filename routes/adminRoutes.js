module.exports = (app) => {
    const bcrypt = require('bcryptjs');
    const { google } = require('googleapis')
    const EmailValidator = require('email-validator');
    const randToken = require('rand-token');

    const EventSettings = require('../models/EventSettings');
    const Leedur = require('../models/Leedur');
    const ScuntAdmin = require('../models/ScuntAdmin')
    const Judge = require('../models/Judge');
    const Mission = require('../models/Mission');
    const Team = require('../models/Team');
    const Frosh = require('../models/Frosh');

    const { OK, NOT_ACCEPTED, DUPLICATE_EMAIL, INVALID_EMAIL, USER_ERROR, INTERNAL_ERROR } = require('./errorMessages');
    const client_email = process.env.SERVICE_ACCOUNT_CLIENT_EMAIL || require('../config/serviceAccount.json').client_email
    const private_key = process.env.SERVICE_ACCOUNT_PRIVATE_KEY || require('../config/serviceAccount.json').private_key
    const scopes = ["https://www.googleapis.com/auth/spreadsheets"]

    const jwt = new google.auth.JWT(
        client_email, 
        null,
        private_key.replace(/\\n/g, "\n"),
        scopes
    )

    const sheets = google.sheets({ version: 'v4', auth: jwt })
    const TEAMS_SHEET = '16pHJ-zPHcD-O31082k_aLgdUQIfwnhlXGTWIkQI_fB4'

    app.post('/post/admin/create', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            const adminData = req.body
            const response = {
                status: OK,
                errorMsg: ""
            }

            if (!EmailValidator.validate(adminData.email)) {
                response.status = NOT_ACCEPTED
                response.errorMsg = INVALID_EMAIL
                res.send(response)
                return
            }

            /*Check if user already exists and add user otherwise*/
            const user = await ScuntAdmin.findOne({ email: adminData.email })
            if (user) {
                response.status = NOT_ACCEPTED
                response.errorMsg = DUPLICATE_EMAIL
                res.send(response)
                return
            } else {
                const newAdmin = new ScuntAdmin(adminData);
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newAdmin.password, salt, (err, hash) => {
                        newAdmin.password = hash;
                        newAdmin.save();
                        console.log("new admin account created");
                        res.send(response)
                    })
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.post('/upload/admin/missions', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { data } = await sheets.spreadsheets.values.get({
                    spreadsheetId: req.body.sheetId,
                    range: req.body.sheetName,
                    majorDimension: 'ROWS'
                })

                const missions = data.values
                console.log(missions[0])
                if(
                    missions[0][0].trim() !== "#" ||
                    !missions[0][1].trim().includes("Mission") ||
                    missions[0][2].trim() !== "Category" ||
                    missions[0][3].trim() !== "Points"
                ) {
                    res.send({
                        status: USER_ERROR,
                        errorMsg: "Please put your spreadsheet in the correct format (columns with titles: #|Mission|Category|Points)"
                    })
                    return
                }

                const sanitizedData = await Promise.all(missions.slice(1).map( async(m, i) => {
                    const newMissionObj = {
                        name: m[1] || "",
                        number: i+1,
                        category: m[2] || "None",
                        totalPoints: m[3] || 0
                    }
                    const currMission = await Mission.findOne({ number: newMissionObj.number })
                    if (currMission) {
                        currMission.name = newMissionObj.name
                        currMission.category = newMissionObj.category
                        currMission.totalPoints = newMissionObj.totalPoints
                        currMission.save()
                    } else {
                        const newMission = new Mission(newMissionObj)
                        newMission.save()
                    }
                    return newMissionObj
                }))

                const categories = await Mission.distinct('category')

                res.send({
                    status: OK,
                    errorMsg: "",
                    missions: sanitizedData,
                    categories: ["All"].concat(categories)
                })
            } catch (err) {
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong on our end, please let tech team know. It may be because the format of the spreadsheet you entered is incorrect (e.g. mission a number/name/category for a mission)."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.get('/get/admin/missions', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const missions = await Mission.find({}, {
                    name: 1,
                    number: 1,
                    category: 1,
                    totalPoints: 1,
                    isViewable: 1
                }).sort({number: 1})

                const categories = await Mission.distinct('category')

                res.send({
                    status: OK,
                    errorMsg: "",
                    missions,
                    categories: ["All", "Viewable Missions", "Hidden Missions"].concat(categories)
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while retrieving all the missions, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.post('/post/admin/missions/viewable', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { missionsChecked, isViewable } = req.body
                
                for(const missionNum of missionsChecked) {
                    const mission = await Mission.findOne({ number: missionNum })
                    if (mission) {
                        mission.isViewable = isViewable
                        mission.save()
                    }
                }

                const missions = await Mission.find({}, {
                    name: 1,
                    number: 1,
                    category: 1,
                    totalPoints: 1,
                    isViewable: 1
                }).sort({number: 1})

                res.send({
                    status: OK,
                    errorMsg: "",
                    missions
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while changing the visibility of missions, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.get('/get/admin/judges', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const judges = await Judge.find({}, {
                    email: 1,
                    name: 1,
                    isActivated: 1
                })

                const activated = judges.filter(j => j.isActivated)
                const notActivated = judges.filter(j => !j.isActivated)

                res.send({
                    status: OK,
                    errorMsg: "",
                    judges: {
                        inReview: notActivated,
                        approved: activated
                    }
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while retrieving all the judges, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.delete('/delete/admin/missions', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                await Mission.deleteMany({})

                res.send({
                    status: OK,
                    errorMsg: "",
                    missions: [],
                    categories: []
                })
            } catch (err) {
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while deleting all the missions, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.post('/update/admin/judge', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { email, status } = req.body
                const judge = await Judge.findOne({ email })
                
                if (judge) {
                    judge.isActivated = status
                    judge.save()
                }

                res.send({
                    status: OK,
                    errorMsg: ""
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while updating judge status, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.delete('/delete/admin/judge', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { email } = req.query
                await Judge.deleteOne({ email })

                res.send({
                    status: OK,
                    errorMsg: "",
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while deleting the judge, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.get('/get/admin/teams', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const teams = await Team.find().sort({ number: 1 })
                res.send({
                    status: OK,
                    teams
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while uploading teams, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.post('/upload/admin/teams', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { data } = await sheets.spreadsheets.values.get({
                    spreadsheetId: TEAMS_SHEET,
                    range: 'Head Leedurs',
                    majorDimension: 'ROWS'
                })

                // console.log(data)
                const rowData = data.values
                // check headers
                if(
                    rowData[0][0] !== 'Team number' ||
                    rowData[0][1] !== 'Team name' ||
                    rowData[0][2] !== 'Name' ||
                    rowData[0][3] !== 'Phone Number' ||
                    rowData[0][4] !== 'Address' ||
                    rowData[0][5] !== 'Scunt Location' ||
                    rowData[0][6] !== 'Thinkific?'
                ) {
                    res.send({
                        status: USER_ERROR,
                        errorMsg: "Please put your spreadsheet in the correct format (columns with titles: Team number|Team name|Name|Phone Number|Address|Scunt Location|Thinkific?)"
                    })
                    return
                }

                // process team data
                const teams = {}
                let currTeamNum
                rowData.slice(1).forEach(row => {
                    if(row[0]) {
                        const num = parseInt(row[0])
                        teams[num] = {
                            number: num,
                            name: row[1] || "No Team Name",
                        }
                        if(row[2] && row[3] && row[4]) {
                            teams[num].leedurInformation = [
                                {
                                    name: row[2],
                                    number: row[3],
                                    address: row[4],
                                    scuntLocation: row[5]
                                }
                            ]
                        }
                        currTeamNum = num
                    } else {
                        if(row[2] && row[3] && row[4]) {
                            teams[currTeamNum].leedurInformation.push({
                                name: row[2],
                                number: row[3],
                                address: row[4],
                                scuntLocation: row[5]
                            })
                        }
                    }
                })

                for(const team of Object.values(teams)) {
                    const currTeam = await Team.findOne({ number: team.number })
                    if (currTeam) {
                        currTeam.name = team.name
                        currTeam.leedurInformation = team.leedurInformation
                        currTeam.save()
                    } else {
                        const newTeam = new Team(team)
                        newTeam.save()
                    }
                }

                res.send({
                    status: OK
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while uploading teams, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.delete('/delete/admin/team', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {

                const { number } = req.query
                await Team.deleteOne({ number })

                res.send({
                    status: OK
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while deleting team, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.delete('/deleteAll/admin/teams', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                await Team.deleteMany({})

                res.send({
                    status: OK,
                    teams: []
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while deleting teams, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.get('/get/admin/team/participants', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const teams = await Team.find({}, { number: 1 })
                if (teams.length <= 0){
                    res.send({
                        status: INTERNAL_ERROR,
                        errorMsg: "You have no teams uploaded right now, please upload teams first."
                    })
                    return
                }
                const sanitizedTeams = teams.flatMap(t => t.number)

                for(teamNum of sanitizedTeams) {
                    const frosh = await Frosh.find({ scuntTeam: teamNum }, { email: 1 })
                    const participants = frosh.flatMap(f => f.email)
                    const team = await Team.findOne({ number: teamNum })
                    if (team) {
                        team.participants = participants
                        team.save()
                    }
                }

                res.send({
                    status: OK
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while uploading team participants, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.get('/get/admin/leedurs', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const leedurs = await Leedur.find({}, {
                    email: 1,
                    name: 1,
                    scuntTeam: 1,
                    isActivated: 1
                })

                const activated = leedurs.filter(l => l.isActivated)
                const notActivated = leedurs.filter(l => !l.isActivated)

                res.send({
                    status: OK,
                    errorMsg: "",
                    leedurs: {
                        inReview: notActivated,
                        approved: activated
                    }
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while retrieving all the leedurs, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.post('/update/admin/leedur', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { email, status } = req.body
                const leedur = await Leedur.findOne({ email })
                
                if (leedur) {
                    leedur.isActivated = status
                    leedur.save()
                }

                res.send({
                    status: OK,
                    errorMsg: "",
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while updating leedur status, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.delete('/delete/admin/leedur', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { email } = req.query
                await Leedur.deleteOne({ email })

                res.send({
                    status: OK,
                    errorMsg: "",
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while deleting the leedur, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

    app.post('/update/admin/event', async (req, res) => {
        if(req.isAuthenticated() && req.user.accountType === "admin") {
            try {
                const { startEvent, revealTeams } = req.body
                const event = await EventSettings.findOne({ name: 'Scunt 2T1' })
                
                console.log(event, startEvent, revealTeams)
                if (event) {
                    if(startEvent !== undefined && startEvent !== null) event.startEvent = startEvent
                    if(revealTeams !== undefined && revealTeams !== null) {
                        event.revealTeams = revealTeams
                        // set codes for frosh
                        const participatingInScunt = await Frosh.find({
                            isScunt: { $in: ["Yes, in person", "Yes, but online"] }
                        })
                        for(let frosh of participatingInScunt) {
                            if(!frosh.discordToken) {
                                frosh.discordToken = randToken.generate(12)
                                frosh.save()
                            }
                        }
                    }
                    event.save()
                }

                res.send({
                    status: OK,
                    errorMsg: ""
                })
            } catch (err) {
                console.log(err)
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: "Something went wrong while updating event settings, please let tech team know."
                })
            }
        } else {
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Please login"
            })
        }
    })

}