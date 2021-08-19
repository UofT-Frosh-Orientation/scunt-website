module.exports = (app) => {

	const bcrypt = require('bcryptjs');
	const passport = require('passport');
    const Judge = require("../models/Judge");
    const ScuntAdmin = require("../models/ScuntAdmin");

    app.post('/login', async (req, res, next) => {
		const response = { registerStatus: false, errorMessage: '' };
		const { email, password } = req.body;
		let errors = [];
        let loginType = ''

		/* Perform Input Validation*/
		/*Check if Fields Empty */
		if (!email || !password) {
			errors.push('Make sure all fields are completed.');
		}

		// const frosh = await Frosh.findOne({ email })
        const judge = await Judge.findOne({ email })
        const admin = await ScuntAdmin.findOne({ email })

		// if(frosh) {
		// 	if (frosh.isDeleted) {
		// 		errors.push('Your account has been deleted due to outstanding fees. Unfortunately if you want to participate in frosh again, you must re-register')
		// 	}
		// } else {
            if (judge) {
				if (!judge.isActivated) {
					errors.push('Your judge account has not been activated.')
				} else {
                	loginType = 'judge'
				}
            } else if (admin) {
                loginType = 'admin'
            } else {
			    errors.push('You have not registered for a scunt account yet.')
            }
		// }

		if (errors.length > 0) {
			response.errorMessage = errors[0];
			res.send(response);
			return;
		}

		passport.authenticate(loginType, {
			successRedirect: '/login_success',
			failureRedirect: '/login_failure'
		})(req, res, next);
	});

	app.get('/login_success', (req, res) => {
		const response = { loginStatus: true, errorMessage: '' };
		res.send(response)
	});

	app.get('/login_failure', (req, res) => {
		const response = { loginStatus: false, errorMessage: 'An error occured. Make sure login info is correct.' };
		res.send(response)
	});

    app.get('/user/signedIn', (req, res) => {
		if (req.isAuthenticated()) {
			const {accountType} = req.user
			if(accountType) {
				res.send(accountType);
			}else{
				res.send('');
			}
		} else {
			res.send(null);
		}
	});

    app.get('/user/current', (req, res) => {
		if(req.isAuthenticated()) {
			const { user } = req
			user['__v'] = undefined
			user.password = undefined
			user['_id'] = undefined
			user.resetPasswordToken = undefined
			user.resetPasswordExpires = undefined
			console.log(user)
			res.send(user)
		} else {
			res.send({})
		}
	});

	app.get('/user/accountInfo', (req, res) => {
		if(req.isAuthenticated()) {
			const fullName = req.user.name
			const names = fullName.toUpperCase().split(' ')
			res.send({
				initials: names.length === 1 ? names[0].charAt(0) : `${names[0].charAt(0)}${names[names.length-1].charAt(0)}`,
				accountType: req.user.accountType,
				name: fullName
			})
		} else {
			res.send({
				initials: '',
				accountType: '',
				name: ''
			})
		}
	})

	app.get('/logout', (req, res) => {
		console.log('logging out');
		req.logout();
		// res.redirect('/login');
		res.send(true)
	});
}