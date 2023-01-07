const User = require('../models/user');

module.exports.asideeInfo = async function (req, res) {
    if (req.xhr) {
        User.findById(req.user.id, function (err, user) {
            if (err || !user) { res.json({}); return; }
            else {
                // console.log(user.netRandomScore, user.avgRandomWPM, user.randomStars, user.random.length);
                res.json({
                    data: {
                        netRandomScore: user.netRandomScore,
                        randomStars: user.randomStars,
                        avgRandomWPM: user.avgRandomWPM,
                        tried: user.random.length
                    },
                    message: 'asidee data sent'
                });
                return;
            }
        });
    }
}