const participantDocs = require('./swaggerRoutes/participantDocs.json')
const judgeDocs = require('./swaggerRoutes/judgeDocs.json')
const authDocs = require('./swaggerRoutes/authDocs.json')
const adminDocs = require('./swaggerRoutes/adminDocs.json')

module.exports = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Scunt Express API with Swagger",
			version: "1.0.0",
			description: "This is a simple CRUD API application made with Express and documented with Swagger",
			license: {
				name: "MIT",
				url: "https://spdx.org/licenses/MIT.html",
			},
			contact: {
				name: "F!rosh Orientation",
				url: "https://orientation.skule.ca",
				email: "tech@orientation.skule.ca",
			},
		},
		servers: [
			{
				url: "http://localhost:6969",
				description: "Development Server"
			},
		],
		paths: {
			// admin routes
			"/post/admin/create": adminDocs.createAdminAccount,
			"/upload/admin/teams": adminDocs.uploadTeams,
			// auth routes
			// judge routes
			// participant routes
			"/post/submission": participantDocs.submit,
			"/testing/post/submitMany": participantDocs.submitMany
		}
	},
	apis: ["./routes/*.js"]
};

