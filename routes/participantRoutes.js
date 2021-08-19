module.exports = (app) => {
    const Mission = require('../models/Mission');
    const { OK, INTERNAL_ERROR } = require('./errorMessages');

    app.get('/get/missions', async (req, res) => {
        try {
            const missions = await Mission.find({ isViewable: true }).sort({number: 1})
            const categories = await Mission.distinct('category')
            res.send({
                status: OK,
                errorMsg: "",
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
}