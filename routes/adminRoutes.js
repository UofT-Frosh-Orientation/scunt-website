module.exports = (app) => {
    const bcrypt = require('bcryptjs');
    const { google } = require('googleapis')
    const EmailValidator = require('email-validator');

    const ScuntAdmin = require('../models/ScuntAdmin')
    const Judge = require('../models/Judge');
    const Mission = require('../models/Mission');

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

    app.post('/post/admin/create', async (req, res) => {
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
                    !missions[0][1].trim().includes("Item") ||
                    missions[0][2].trim() !== "Category" ||
                    missions[0][3].trim() !== "Points"
                ) {
                    res.send({
                        status: USER_ERROR,
                        errorMsg: "Please put your spreadsheet in the correct format (columns with titles: #|Item|Category|Points)"
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
                    categories: ["All"].concat(categories)
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

                const judges = await Judge.find({}, {
                    email: 1,
                    name: 1,
                    isActivated: 1
                })

                const approved = judges.filter(j => j.isActivated)
                const inReview = judges.filter(j => !j.isActivated)

                res.send({
                    status: OK,
                    errorMsg: "",
                    judges: { inReview, approved }
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

                const judges = await Judge.find({}, {
                    email: 1,
                    name: 1,
                    isActivated: 1
                })

                const approved = judges.filter(j => j.isActivated)
                const inReview = judges.filter(j => !j.isActivated)

                res.send({
                    status: OK,
                    errorMsg: "",
                    judges: { inReview, approved }
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
}