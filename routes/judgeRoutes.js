const Judge = require('../models/Judge');

module.exports = (app) => {
    const bcrypt = require('bcryptjs');
    const EmailValidator = require('email-validator');
    const ScuntAdmin = require('../models/ScuntAdmin')
    const { OK, NOT_ACCEPTED, DUPLICATE_EMAIL, INVALID_EMAIL, USER_ERROR, INTERNAL_ERROR } = require('./errorMessages');

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
    })

}