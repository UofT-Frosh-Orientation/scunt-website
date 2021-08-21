module.exports = (app) => {
    const SubmittedMission = require('../models/SubmittedMission');
    const Team = require('../models/Team');
    const Mission = require('../models/Mission');
    const { OK, INTERNAL_ERROR, NOT_ACCEPTED, INTERNAL_ERROR_MSG, SUBMITTED } = require('./errorMessages');

    app.get('/get/missions', async (req, res) => {
        try {
            const missions = await Mission.find({ isViewable: true }).sort({number: 1})
            const categories = await Mission.distinct('category')
            res.send({
                status: OK,
                missions,
                categories: ["All"].concat(categories)
            })
        } catch (err) {
            console.log('missions - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Something went wrong while retrieving all the missions, please let tech team know."
            })
        }
    })
    
    app.post('/post/submission', async (req, res) => {
        try {
            const { 
                email, 
                discordUsername, 
                missionNumber,
                teamNumber,
                submissionLink
            } = req.body

            const mission = await Mission.findOne({
                isViewable: true,
                number: missionNumber
            })
            const alreadySubmitted = await SubmittedMission.findOne({
                number: missionNumber,
                teamNumber
            })
            if(mission) {
                if (alreadySubmitted) {
                    alreadySubmitted.status = SUBMITTED
                    alreadySubmitted.submitter = discordUsername || email
                    alreadySubmitted.submissionLink = submissionLink
                    alreadySubmitted.teamNumber = teamNumber
                    alreadySubmitted.timeCreated = new Date()
                    alreadySubmitted.save()
                } else {
                    const submission = new SubmittedMission({
                        name: mission.name,
                        number: missionNumber,
                        category: mission.category,
                        status: SUBMITTED,
                        submitter: discordUsername || email,
                        submissionLink,
                        teamNumber,
                        totalPoints: mission.totalPoints,
                        timeCreated: new Date()
                    })
                    submission.save()
                }
                res.send({
                    status: OK,
                })
            } else {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: "You cannot submit to this mission. To see the missions you can submit to, please go to the scunt website."
                })
            }
        } catch (err) {
            console.log('submit - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: INTERNAL_ERROR_MSG
            })
        }
    })

    app.post('/testing/post/submitMany', async (req, res) => {
        try {
            const { numberOfMissions } = req.body
            const missions = await Mission.find()
            // mix up missions
            for(let i=0; i < 10000; i++) {
                const randNum1 = Math.floor(Math.random()*missions.length)
                const randNum2 = Math.floor(Math.random()*missions.length)
                const temp = missions[randNum1]
                missions[randNum1] = missions[randNum2]
                missions[randNum2] = temp
            }
            for(let i=0; i < numberOfMissions; i++) {
                const submission = new SubmittedMission({
                    name: missions[i].name,
                    number: missions[i].number,
                    category: missions[i].category,
                    status: SUBMITTED,
                    submitter: "aldjflsdk",
                    submissionLink: "https://google.ca",
                    teamNumber: Math.floor(Math.random()*3),
                    totalPoints: mission.totalPoints,
                    timeCreated: new Date()
                })
                submission.save()
            }
            res.send({
                status: OK,
            })
        } catch (err) {
            console.log('submit - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: INTERNAL_ERROR_MSG
            })
        }
    })

    app.get('/get/mission/status', async (req, res) => {
        try {
            const { missionNumber, teamNumber } = req.body
            const mission = await SubmittedMission.findOne({ 
                number: missionNumber,
                teamNumber
            })
            res.send({
                status: OK,
                status: mission.status,
                points: mission.achievedPoints
            })
        } catch (err) {
            console.log('getting status - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Something went wrong while retrieving the status of this mission, please let tech team know."
            })
        }
    })

    app.get('/get/missions', async (req, res) => {
        try {
            const { teamNumber } = req.query
            if (req.isAuthenticated() && req.user.scuntTeam === teamNumber) {
                const submittedMissions = await SubmittedMission.find({
                    teamNumber
                })
                const completedMissions = await Team.find({ teamNumber })
                const incompleteMissions = await Mission.find({
                })
                res.send({
                    status: OK,
                    submittedMissions,
                    completedMissions
                })
            } else {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: "Please login to the correct account to get this information."
                })
            }
        } catch (err) {
            console.log('getting status - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Something went wrong while retrieving the status of this mission, please let tech team know."
            })
        }
    })
}