module.exports = (app) => {
    const EmailValidator = require('email-validator');
    const bcrypt = require('bcryptjs');
    const EventSettings = require('../models/EventSettings');
    const SubmittedMission = require('../models/SubmittedMission');
    const ScuntAdmin = require('../models/ScuntAdmin')
    const Leedur = require('../models/Leedur');
    const Judge = require('../models/Judge');
    const Team = require('../models/Team');
    const Mission = require('../models/Mission');
    const Frosh = require('../models/Frosh');
    const { OK, NOT_ACCEPTED, DUPLICATE_EMAIL, INVALID_EMAIL, USER_ERROR, INTERNAL_ERROR, SUBMITTED, JUDGING, COMPLETE } = require('./errorMessages');

    app.get('/get/missions', async (req, res) => {
        try {
            const missions = await Mission.find({ isViewable: true }).sort({number: 1})
            const categories = await Mission.distinct('category', { isViewable: true })
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
    
    // discord bot
    app.post('/post/submission', async (req, res) => {
        try {
            const { 
                email, 
                discordUsername,
                discordId, 
                missionNumber,
                teamNumber,
                submissionLink
            } = req.body

            const event = await EventSettings.findOne({ name: 'Scunt 2T1' })

            if(!event.startEvent) {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: 'The event has not started yet!'
                })
                return
            }

            if (!missionNumber || !submissionLink) {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: 'Please fill in required fields'
                })
                return
            }

            let user
            if (email) {
                const frosh = await Frosh.findOne({ email })
                const leedur = await Leedur.findOne({ email })
                if (frosh) user = frosh
                else if (leedur) user = leedur
            } else if (discordId) {
                const frosh = await Frosh.findOne({ discordId })
                const leedur = await Leedur.findOne({ discordId })
                if (frosh) user = frosh
                else if (leedur) user = leedur
            }

            console.log(user)
            if (user) {
                if (user.scuntTeam !== parseInt(teamNumber)) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: 'You cannot submit to a scunt team outside your own.'
                    })
                    return
                }
            } else {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: 'You have not registered for scunt or you have not logged into the scunt discord.'
                })
                return
            }

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
                    alreadySubmitted.submitterDiscordId = discordId
                    alreadySubmitted.timeCreated = new Date()
                    alreadySubmitted.save()
                } else {
                    const submission = new SubmittedMission({
                        name: mission.name,
                        number: missionNumber,
                        category: mission.category,
                        status: SUBMITTED,
                        submitter: discordUsername || email,
                        submitterDiscordId: discordId,
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

    // discord bot
    app.get('/get/mission/status', async (req, res) => {
        try {
            const event = await EventSettings.findOne({ name: 'Scunt 2T1' })
            if(!event.startEvent) {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: 'The event has not started yet!'
                })
                return
            }
            const { missionNumber, teamNumber, discordId } = req.query
            const frosh = await Frosh.findOne({ discordId })
            const leedur = await Leedur.findOne({ discordId })
            const user = frosh || leedur
            if (user) {
                if(user.scuntTeam !== parseInt(teamNumber)) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: 'You cannot get the status of a mission outside your team!'
                    })
                    return
                }
            } else {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: 'You have not logged into discord!'
                })
                return
            }
            const mission = await SubmittedMission.findOne({ 
                number: missionNumber,
                teamNumber
            })
            if (mission) {
                res.send({
                    status: OK,
                    missionStatus: mission.status,
                    points: mission.achievedPoints || 0,
                    name: `${mission.number} - ${mission.name}`,
                    category: mission.category
                })
            } else {
                res.send({
                    status: USER_ERROR,
                    errorMsg: 'Your team has not submitted this mission yet.'
                })
                return
            }
        } catch (err) {
            console.log('getting status - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Something went wrong while retrieving the status of this mission, please let tech team know."
            })
        }
    })

    app.get('/get/frosh/missions', async (req, res) => {
        try {
            const teamNumber = parseInt(req.query.teamNumber)
            if (req.isAuthenticated() && req.user.scuntTeam === teamNumber) {
                const submittedMissions = await SubmittedMission.find({ teamNumber })
                const missionNumbers = submittedMissions.flatMap(m => m.number)

                const inProgressMissions = submittedMissions.filter(m => m.status === SUBMITTED || m.status === JUDGING)
                const completedMissions = submittedMissions.filter(m => m.status === COMPLETE)
                const incompleteMissions = await Mission.find({
                    number: { $nin: missionNumbers },
                    isViewable: true
                }).sort({number: 1})
                const submittedByUser = await SubmittedMission.find({ 
                    teamNumber,                     
                    $or: [
                        {submitter: { $in: [req.user.email, req.user.discordUsername]}},
                        {submitterDiscordId: req.user.discordId}
                    ]
                })

                res.send({
                    status: OK,
                    inProgressMissions,
                    completedMissions,
                    incompleteMissions,
                    submittedByUser
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
                errorMsg: "Something went wrong while retrieving missions, please let tech team know."
            })
        }
    })

    app.get('/get/leedur/teams', async (req, res) => {
        try {
            const teams = await Team.find({}, {
                number: 1,
                name: 1
            }).sort({number: 1})
            const sanitizedTeams = teams.map(t => `${t.number} - ${t.name}`)

            res.send({
                status: OK,
                teams: sanitizedTeams
            })
        } catch (err) {
            console.log('getting status - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Something went wrong while retrieving the status of this mission, please let tech team know."
            })
        }
    })

    app.post('/create/leedur/', async (req, res) => {
        const leedurData = req.body
        const { name, email, password, scuntTeam } = leedurData
        const response = {
			status: OK,
			errorMsg: ""
		}

        if(!name || !email || !password || !scuntTeam) {
            response.status = NOT_ACCEPTED
            response.errorMsg = "Please fill in all fields"
            res.send(response)
            return
        }

        if (!EmailValidator.validate(leedurData.email)) {
            response.status = NOT_ACCEPTED
            response.errorMsg = INVALID_EMAIL
            res.send(response)
            return
        }

        const isAdmin = await ScuntAdmin.findOne({ email: leedurData.email })
        if (isAdmin) {
            response.status = USER_ERROR
            response.errorMsg = "You have an admin account, you cannot sign up as a leedur."
            res.send(response)
            return
        }

        const isJudge = await Judge.findOne({ email: leedurData.email })
        if (isJudge) {
            response.status = USER_ERROR
            response.errorMsg = "You have a judge account, you cannot sign up as a leedur."
            res.send(response)
            return
        }

        const user = await Leedur.findOne({ email: leedurData.email })
        if (user) {
            response.status = NOT_ACCEPTED
            response.errorMsg = "You have already signed up to be a leedur!"
            res.send(response)
            return
        } else {
            const newLeedur = new Leedur(leedurData);
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newLeedur.password, salt, (err, hash) => {
                    newLeedur.password = hash;
                    newLeedur.save();
                    console.log("new leedur account created");
                    res.send(response)
                })
            })
        }
    })

    app.get('/get/frosh/teamInfo', async (req, res) => {
        try {
            const teamNumber = parseInt(req.query.teamNumber)
            if (req.isAuthenticated() && req.user.scuntTeam === teamNumber) {
                const teamInfo = await Team.findOne({
                    number: teamNumber
                })

                res.send({
                    status: OK,
                    teamInfo
                })
            }
        } catch (err) {
            console.log('team info - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Something went wrong while retrieving team information, please let tech team know."
            })
        }
    })

    app.get('/get/eventDetails', async (req, res) => {
        const event = await EventSettings.findOne({ name: 'Scunt 2T1' })
        console.log(event)
        if (event) {
            res.send({
                revealTeams: event.revealTeams,
                startEvent: event.startEvent
            })
        } else {
            const newEvent = new EventSettings({ name: 'Scunt 2T1' })
            newEvent.save()
            res.send({
                revealTeams: false,
                startEvent: false
            })
        }
    })

    // discord bot
    app.post('/login/discord', async (req, res) => {
        try {
            const { email, code, discordUsername, id } = req.body
            const frosh = await Frosh.findOne({ email })
            const leedur = await Leedur.findOne({ email })
            const user = frosh || leedur
            const type = frosh ? 'frosh' : leedur ? 'leedur' : 'none'
            if (user) {
                if(user.scuntTeam) {
                    if(user.discordToken === code) {
                        user.discordUsername = discordUsername
                        user.discordId = id
                        user.discordSignedIn = true
                        user.save()
                        res.send({
                            status: OK,
                            type
                        })
                    } else {
                        res.send({
                            status: INTERNAL_ERROR,
                            errorMsg: 'Incorrect login code.'
                        })
                    }
                } else {
                    res.send({
                        status: INTERNAL_ERROR,
                        errorMsg: 'You have not registered for scunt. Please do so by logging into your account on orientation.skule.ca'
                    })
                }
            } else {
                res.send({
                    status: INTERNAL_ERROR,
                    errorMsg: 'You have not registered for frosh.'
                })
            }
        } catch (err) {
            console.log(err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: 'There was a problem with logging you in.'
            })
        }
    })

    app.get('/get/leaderboard/scores', async (req, res) => {
        try {
            const calledFromDiscord = req.query.discord === 'true'

            const teams = await Team.find()
            const teamScores = teams.flatMap(t => t.score)
            const teamNames = teams.flatMap(t => t.name)

            if (calledFromDiscord) {
                console.log("here")
                res.send({
                    status: OK,
                    teamScores,
                    teamNames
                })
            } else {
                // score algo
                const teamDisplayScores = [];
                for(let i = 0; i < teamScores.length; i++){
                    let runningSum = 0;
                    for(let j = 0; j < teamScores.length; j++){
                        if(i !== j){
                            runningSum += (0.1*teamScores[j]);
                        }else {
                            runningSum += teamScores[j]
                        }
                    }
                    teamDisplayScores.push(Math.floor(runningSum));
                }
                
                const teams = [];
                let maxScore = -1;
                for(let k = 0; k < teamScores.length; k++){
                    const team = {
                        name: teamNames[k],
                        score: teamDisplayScores[k]
                    };
                    teams.push(team);
                    maxScore = Math.max(maxScore, team.score)
                }
                teams.sort((a, b) => {return b.score - a.score});

                res.send({
                    status: OK,
                    teams: teams,
                    maxScore: maxScore
                })
            }
        } catch (err) {
            console.log(err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: 'There was a problem retrieving team scores'
            })
        }
    })
}