const express = require('express');
const fs = require('fs');
const request = require('request');
const qs = require('querystring');
const { callbackify } = require('util');



const app = express();

const PORT = 8080;

app.use(express.static(__dirname + '/public'));
app.use(express.json())

app.get('/', (req, res) => {
    /*DISPLAY HTML HOME*/
    fs.readFile('./public/home.html', 'utf-8', (err, html) => {

        if (err) {
            res.status(500).send(`Couldn't load home site`);
        }

        res.send(html);
    })
})

app.get('/user/:id', (req, res) => {
    /* REST API */
    console.log("request made for " + req.params.id)
    getReposName(req.params.id).then(repos => {
        getLanguageStats(req.params.id, repos).then(stats => {
            res.status(200).send(getStatsByFrac(stats))
        })
    })
})

function GithubRequest(url) {
    return new Promise((resolve, reject) =>{
        request(
            {
                url: url,
                method: 'GET',
                headers: {'user-agent': 'node.js'},
                OAUth: "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"
            },

            (error, res) => {
                if(error) {
                    console.log("Failed to get date from Github");
                }
                else {
                    resolve(JSON.parse(res.body))
                }
            }
        )
    })
}


function getLanguageStats(username, repos) {
    console.log("getting stats")

    return new Promise((resolve, reject) =>{

        var get_stats = new Promise((resolve, reject) => {

            var stats = {}
            repos.forEach(function (repo, index) {
                url = "https://api.github.com/repos/" + username + "/" + repo['name'] + "/languages"
    
                GithubRequest(url).then(languages => {
                        for (const [key, value] of Object.entries(languages)) {
                            if (stats[key] == undefined){
                                stats[key] = value
                            }
                            else{
                                stats[key] = stats[key] + value
                                if (index === repos.length -1) {
                                    console.log("All data from github achived")
                                    resolve(stats)
                                }
                            }
                        }      
                })

            }) 
        })

        get_stats.then(stats => {resolve(stats)})
    })
}


function getStatsByFrac(stats) {

    var sum = Object.values(stats).reduce((a, b) => a + b, 0)

    var stats_by_frac = {}

    for (const [key, value] of Object.entries(stats)) {
        stats_by_frac[key] = value / sum
    }

    return stats_by_frac

}



function getReposName(username) {
    /* https://api.github.com/users/KarolPlonka */

    return new Promise((resolve, reject) =>{

        request(
            {
                url: 'https://api.github.com/users/' + username + '/repos',
                method: 'GET',
                headers: {'user-agent': 'node.js'},
                OAUth: "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"
            },
    
            (error, res) => {
                if(error) {
                    console.log("Failed to get date from Github");
                    reject("Failed to get date from Github")
                }
                else {
                    var repos = JSON.parse(res.body)

                    repos.forEach(function (item, index) {
                        repos[index] = {"name" : item['name'], "stats" : null }
                    })
            
                    resolve(repos)
                }
            }
        )




    })

}


app.get('/stats', (req, res) => {
    /* WEBSITE */
    console.log("request made for " + req.body.value)
    res.status(200).send({"python": 1})

    /*
    getReposName(req.body.value).then(repos => {
        getLanguageStats(req.params.id, repos).then(stats => {
            res.status(200).send(getStatsByFrac(stats))
        })
    })*/
})



app.listen(
    PORT,
    () => console.log( `server started`)
)