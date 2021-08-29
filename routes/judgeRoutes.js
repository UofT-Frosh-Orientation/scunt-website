module.exports = (app) => {
    const bcrypt = require('bcryptjs');
    const EmailValidator = require('email-validator');
    const ScuntAdmin = require('../models/ScuntAdmin');
    const Judge = require('../models/Judge');
    const Team = require('../models/Team');
    const SubmittedMission = require('../models/SubmittedMission');

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
    app.get('/get/submittedmissions', async (req, res) => {
        try {
            const submittedmissions = await SubmittedMission.find();
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
                    if (isNaN(newPoints) || newPoints <  submittedmission.achievedPoints || newPoints > submittedmission.totalPoints) {
                        res.send({
                            status: NOT_ACCEPTED,
                            errorMsg: "New score should be higher than current score and lower than total score"
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
                    team.score = team.score - submittedmission.achievedPoints + team.score;
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

}