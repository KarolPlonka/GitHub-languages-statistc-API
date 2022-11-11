const express = require('express')
const fs = require('fs')
const request = require('request')

const app = express()

const PORT = 80

app.use(express.static(__dirname + '/public'))
app.use(express.json())

app.get('/', (req, res) => {
    /*DISPLAY HTML HOME*/
    fs.readFile('./public/home.html', 'utf-8', (err, html) => {
        if (err) {res.status(500).send(`Couldn't load home site`)}
        else     {res.send(html)}
    })
})

app.get('(/frac)?/user/:id', (req, res) => {
    res.status(200).send({"pyhon": 1})
    return
    /* GET DATA */
    console.log("request made for " + req.params.id)
    getReposName(req.params.id)
        .catch((error) => {                                 //better error handling required
            res.status(404).send({error: "User not found"}) //better error handling required
        })
        .then(repos => {
            getLanguageStats(req.params.id, repos)
        .then(stats => {
                res.status(200).send(getStatsByFrac(stats))
        })
        })
})

app.get('/bytes/user/:id', (req, res) => {
    /* GET DATA */
    console.log("request made for " + req.params.id)
    getReposName(req.params.id)
        .catch((error) => {                                 //better error handling required
            res.status(404).send({error: "User not found"}) //better error handling required
        })
        .then(repos => {
            getLanguageStats(req.params.id, repos)
        .then(stats => {
            res.status(200).send(stats)
        })
        })
})

function GithubRequest(url) {
    return new Promise((resolve, reject) =>{
        request(
            {
                url: url,
                method: 'GET',
                headers: {'user-agent': 'node.js'}
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
                    }
                }     
                if (index == (repos.length -1)) {
                    console.log("All data from github achived")
                    resolve(stats)
                }
            })

        }) 
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

    return new Promise((resolve, reject) =>{
        var url = 'https://api.github.com/users/' + username + '/repos'

        GithubRequest(url).then(repos => {

            if (repos.message == "Not Found"){
                console.log("user not found")
                reject("User not found")
            }

            repos.forEach(function (item, index) {
                repos[index] = {"name" : item['name']}
            })
    
            resolve(repos)
        })
    })

}



app.listen(
    PORT,
    () => console.log( `server started`)
)