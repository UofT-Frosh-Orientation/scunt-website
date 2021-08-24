const Judge = require('../models/Judge');

module.exports = (app) => {
    const bcrypt = require('bcryptjs');
    const EmailValidator = require('email-validator');
    const ScuntAdmin = require('../models/ScuntAdmin');
    const SubmittedMission = require('../models/SubmittedMission');

    const { OK, NOT_ACCEPTED, DUPLICATE_EMAIL, INVALID_EMAIL, USER_ERROR, INTERNAL_ERROR, INTERNAL_ERROR_MSG, SUBMITTED, JUDGING, COMPLETE } = require('./errorMessages');

    app.post('/create/judge/', async (req, res) => {
        const judgeData = req.body
        const response = {
			status: OK,
			errorMsg: ""
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

    // Actions: judging, cancel, update
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
                    submittedmission.status = JUDGING;
                    submittedmission.save();
                    res.send({status: OK});
                    return;
                } else if (action === "cancel") {
                    submittedmission.status = SUBMITTED;
                    submittedmission.save();
                    res.send({status: OK});
                    return;
                } else if (action === "update") {
                    // check new points is 
                    if (newPoints <  submittedmission.achievedPoints || newPoints > submittedmission.totalPoints) {
                        res.send({
                            status: NOT_ACCEPTED,
                            errorMsg: "New score should be higher than current score and lower than total score"
                        })
                        return;
                    }
                    submittedmission.achievedPoints = newPoints;
                    submittedmission.status = COMPLETE;
                    submittedmission.save();
                    res.send({status: OK});
                    return;
                } else {
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