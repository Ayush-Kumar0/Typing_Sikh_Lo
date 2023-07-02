const { errorMonitor } = require('connect-mongo');
const typeController = require('./type_controller');
const fetch = require('node-fetch');

module.exports.generateParagraph = async function (req, res, next) {
    // console.log(req.query);
    let { minLength, maxLength, minCount, maxCount } = req.query;
    minLength = Number.parseInt(minLength);
    maxLength = Number.parseInt(maxLength);
    minCount = Number.parseInt(minCount);
    maxCount = Number.parseInt(maxCount);

    if (1 <= minLength && minLength <= maxLength && maxLength <= 15 && 10 <= minCount && minCount <= maxCount && maxCount <= 500) {
        // If the request is valid
        let numberOfWords = Number.parseInt((Math.random() * (maxCount - minCount)).toFixed(0)) + Number.parseInt(minCount);
        console.log(numberOfWords);
        const API_KEY = process.env.WORDNIK_API;

        let words = [];
        const url = `https://api.wordnik.com/v4/words.json/randomWords` +
            `?hasDictionaryDef=true&maxCorpusCount=-1&minDictionaryCount=1&maxDictionaryCount=-1&minLength=${minLength}&maxLength=${maxLength}&limit=${numberOfWords}&api_key=${API_KEY}`;

        // console.log(numberOfWords);
        let errorOccured = false;
        while (words.length == 0) {
            let res2 = await fetch(url);
            let data = await res2.clone().json();
            try {
                if (data) {
                    let len = data.length;
                    numberOfWords -= len;
                    await Array.from(data).forEach(async element => {
                        if (element.word)
                            await words.push(element.word.replaceAll('`', `'`).replaceAll('’', `'`).trim());
                    });
                }
            } catch (e) {
                console.log(e);
                return res.status(500).redirect('back');
            }
        }
        await typeController.setCustomParagraph(words.join(' ') + '.', next);
        return;
    }
    else {
        // Wrong inputs
        return res.status(400).redirect('back');
    }
}

module.exports.generateFacts = async function (req, res, next) {
    let count = req.query.count;
    count = Number.parseInt(count);

    if (count >= 1 && count <= 15) {
        console.log(count);
        const url = process.env.USELESS_FACTS_URL || `https://uselessfacts.jsph.pl/random.json?language=en`;
        let facts = [];
        for (let i = 0; i < count; i++) {
            try {
                let res2 = await fetch(url);
                let data = await res2.clone().json();
                if (data && data.text)
                    facts.push(data.text.replaceAll('`', `'`).replaceAll('’', `'`).trim());
            } catch (e) {
                console.log(e);
                return res.status(500).redirect('back');
            }
        }
        console.log(facts);
        await typeController.setCustomParagraph(facts.join(" "), next);
        return;
    }
    else {
        return res.status(400).redirect('back');
    }
}

module.exports.renderHistoryPara = async function (req, res, next) {
    // console.log(req.query);
    let random = await req.user.random.find((value, index) => {
        return value._id == req.query.id;
    });
    // console.log(random);

    let para = random.paragraph
    typeController.setCustomParagraph(para, next);
    return;
}