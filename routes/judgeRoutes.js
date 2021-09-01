module.exports = (app) => {
    const bcrypt = require('bcryptjs');
    const EmailValidator = require('email-validator');
    const ScuntAdmin = require('../models/ScuntAdmin');
    const Judge = require('../models/Judge');
    const Team = require('../models/Team');
    const SubmittedMission = require('../models/SubmittedMission');
    const Mission = require('../models/Mission');
    const { OK, NOT_ACCEPTED, DUPLICATE_EMAIL, INVALID_EMAIL, USER_ERROR, INTERNAL_ERROR, INTERNAL_ERROR_MSG, SUBMITTED, SUBMITTED_LIVE, JUDGING, JUDGING_LIVE, COMPLETE, FLAGGED } = require('./errorMessages');

    app.post('/create/judge/', async (req, res) => {
        const judgeData = req.body
        const { name, email, password } = judgeData
        const response = {
			status: OK,
			errorMsg: ""
		}

        if(!name || !email || !password) {
            response.status = NOT_ACCEPTED
            response.errorMsg = "Please fill in all fields"
            res.send(response)
            return
        }

        if (!EmailValidator.validate(judgeData.email)) {
            response.status = NOT_ACCEPTED
            response.errorMsg = INVALID_EMAIL
            res.send(response)
            return
        }

        const isAdmin = await ScuntAdmin.findOne({ email: judgeData.email })
        if (isAdmin) {
            response.status = USER_ERROR
            response.errorMsg = "You have an admin account, please sign up with another email."
            res.send(response)
            return
        }

        const user = await Judge.findOne({ email: judgeData.email })
        if (user) {
            response.status = NOT_ACCEPTED
            response.errorMsg = DUPLICATE_EMAIL
            res.send(response)
            return
        } else {
            const newJudge = new Judge(judgeData);
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newJudge.password, salt, (err, hash) => {
                    newJudge.password = hash;
                    newJudge.save();
                    console.log("new judge account created");
                    res.send(response)
                })
            })
        }
    });

    // TODO: set protection rules for these endpoints
    // TODO: maybe create submissions schema for deductions?
    app.get('/get/submittedmissions', async (req, res) => {
        try {
            const submittedmissions = await SubmittedMission.find({
                number: { $ne: -1 }
            });
            res.send({
                status: OK,
                submittedmissions,
            })
        } catch (err) {
            console.log('submittedmissions - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: "Something went wrong while retrieving all the submissions, please try refreshing the page"
            })
        }
    });

    // Actions: judging, cancel, update, screen, flag
    app.post('/judge/update', async (req, res) => {
        try {
            const { 
                ticketId, 
                action,
                newPoints
            } = req.body;

            const submittedmission = await SubmittedMission.findById(ticketId);
            if(submittedmission) {
                if (action === "judging") {
                    if (submittedmission.status === SUBMITTED_LIVE) {
                        submittedmission.status = JUDGING_LIVE;
                    }else {
                        submittedmission.status = JUDGING;
                    }
                    submittedmission.save();
                    res.send({status: OK});
                    return;
                } else if (action === "cancel") {
                    if (submittedmission.status === JUDGING_LIVE) {
                        submittedmission.status = SUBMITTED_LIVE;
                    }else {
                        submittedmission.status = SUBMITTED;
                    }
                    submittedmission.save();
                    res.send({status: OK});
                    return;
                } else if (action === "update") {
                    // check new points range
                    if (isNaN(newPoints) || newPoints <  submittedmission.achievedPoints || newPoints > submittedmission.totalPoints * 1.5) {
                        res.send({
                            status: NOT_ACCEPTED,
                            errorMsg: "New score should be higher than current score and lower than total score x 1.5"
                        })
                        return;
                    }
                    // check team
                    const team = await Team.findOne({number: submittedmission.teamNumber});
                    if (!team) {
                        res.send({
                            status: NOT_ACCEPTED,
                            errorMsg: "Something is wrong with this submission ticket: this scunt team doesn't exist. Please ignore this item"
                        })
                        return;
                    }
                    team.score = team.score - submittedmission.achievedPoints + newPoints;
                    submittedmission.achievedPoints = newPoints;
                    submittedmission.status = COMPLETE;
                    submittedmission.save();
                    team.save();

                    res.send({status: OK});
                    return;
                } else if (action === "screen") {
                    submittedmission.status = SUBMITTED_LIVE;
                    submittedmission.save();
                    res.send({status: OK});
                    return;
                } else if (action === "flag") {
                    submittedmission.status = FLAGGED;
                    submittedmission.save();
                    res.send({status: OK});
                    return;
                }else {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "Don't try to hack the website, thanks"
                    })
                    return;
                }
            } else {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: "Cannot find the submission, please refresh the page and try again"
                })
                return;
            }
        } catch (err) {
            console.log('judge update - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: INTERNAL_ERROR_MSG
            });
            return;
        }
    });

    app.post('/judge/manual-update', async (req, res) => {
        try {
            const { 
                number, 
                teamNumber,
                newPoints
            } = req.body;

            const submittedmission = await SubmittedMission.findOne({number: number, teamNumber: teamNumber});
            if(submittedmission) {
                // check new points range
                if (isNaN(newPoints) || newPoints <  submittedmission.achievedPoints || newPoints > submittedmission.totalPoints * 1.5) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "New score should be higher than current score and lower than total score x 1.5"
                    })
                    return;
                }
                // check team
                const team = await Team.findOne({number: teamNumber});
                if (!team) {
                    res.send({
                        status: INTERNAL_ERROR,
                        errorMsg: INTERNAL_ERROR_MSG
                    })
                    return;
                }
                team.score = team.score - submittedmission.achievedPoints + newPoints;
                submittedmission.achievedPoints = newPoints;
                submittedmission.status = COMPLETE;
                submittedmission.save();
                team.save();
                res.send({status: OK});
                return;
            } else {
                // check valid mission number
                const mission = await Mission.findOne({number: number});
                if (!mission) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "Mission not found, please double check your mission number"
                    })
                    return;
                }
                // check new points range
                if (isNaN(newPoints) || newPoints > mission.totalPoints * 1.5) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "New score should be higher than current score and lower than total score x 1.5"
                    })
                    return;
                }
                // check team
                const team = await Team.findOne({number: teamNumber});
                if (!team) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "Scunt team not found, please double check your team number"
                    })
                    return;
                }
                const newSubmittedmission = new SubmittedMission({
                    name: mission.name, 
                    number: mission.number, 
                    category: mission.category,
                    status: COMPLETE,
                    submitter: "in-person hero",
                    achievedPoints: newPoints,
                    totalPoints: mission.totalPoints, 
                    teamNumber: teamNumber,
                    timeCreated: new Date()
                });
                newSubmittedmission.save();
                team.score = team.score + newPoints;
                team.save();
                res.send({status: OK});
                return;
            }
        } catch (err) {
            console.log('judge manual update - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: INTERNAL_ERROR_MSG
            });
            return;
        }
    });

    app.post('/judge/get-team-mission-points', async (req, res) => {
        try {
            const { 
                number,
                teamNumber,
            } = req.body;

            const submittedmission = await SubmittedMission.findOne({number: number, teamNumber: teamNumber});
            if(submittedmission) {
                res.send({
                    status: OK, 
                    achievedPoints: submittedmission.achievedPoints
                });
                return;
            } else {
                res.send({
                    status: OK, 
                    achievedPoints: 0
                });
                return;
            }
        } catch (err) {
            console.log('judge get team points - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: INTERNAL_ERROR_MSG
            });
            return;
        }
    });

    // actions: bribes, deductions
    app.post('/judge/special-update', async (req, res) => {
        try {
            const { 
                action, 
                teamNumber,
                pointsChanged
            } = req.body;

            console.log(pointsChanged)
            if (action === 'bribes'){
                // check bribes range
                if (isNaN(pointsChanged) || pointsChanged < 0 || pointsChanged > req.user.bribePointsLeft) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "bribes points out of range"
                    })
                    return;
                }
                // check team
                const team = await Team.findOne({number: teamNumber});
                if (!team) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "invalid team number, please try again"
                    })
                    return;
                }

                const judge = await Judge.findById(req.user._id);

                // submit bribe as mission
                const newBribe = new SubmittedMission({
                    name: "Bribe",
                    number: -1,
                    totalPoints: pointsChanged,
                    teamNumber: team.number,
                    category: judge.name
                })
                newBribe.save()

                // add bribe to team score
                team.score += parseInt(pointsChanged);
                team.save();
                judge.bribePointsLeft -= parseInt(pointsChanged);
                judge.save();   
                             
                res.send({status: OK});
                return;
            } else if (action === 'deductions') {
                // check deductions range
                if (isNaN(pointsChanged) || pointsChanged < 0) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "Make sure you input a positive number"
                    })
                    return;
                }
                // check team
                const team = await Team.findOne({number: teamNumber});
                if (!team) {
                    res.send({
                        status: NOT_ACCEPTED,
                        errorMsg: "invalid team number, please try again"
                    })
                    return;
                }

                const judge = await Judge.findById(req.user._id);

                // submit deduction as mission
                const newDeduc = new SubmittedMission({
                    name: "Deduction",
                    number: -1,
                    totalPoints: pointsChanged,
                    teamNumber: team.number,
                    category: judge.name
                })
                newDeduc.save()

                team.score -= parseInt(pointsChanged);
                team.save();
                res.send({status: OK});
                return;

            } else {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: "Don't try to hack the website, thanks"
                })
                return;
            }
        } catch (err) {
            console.log('judge manual update - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: INTERNAL_ERROR_MSG
            });
            return;
        }
    });

    app.get('/get/judge/bribe-deduction-history', async (req, res) => {
        try{
            if (req.isAuthenticated() && req.user.accountType === 'judge') {
                const bribesAndDeductions = await SubmittedMission.find({
                    number: -1,
                    name: { $in: ['Bribe', 'Deduction'] },
                })
                res.send({
                    status: OK,
                    bribesAndDeductions
                })
            } else {
                res.send({
                    status: NOT_ACCEPTED,
                    errorMsg: "Please login to the correct account to get this information."
                })
            }
        } catch (err) {
            console.log('judge bribe deduction history - ' + err)
            res.send({
                status: INTERNAL_ERROR,
                errorMsg: INTERNAL_ERROR_MSG
            });
            return
        }
    })
}