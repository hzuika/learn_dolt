//import axios from 'axios'

const axios = require('axios').default;

let owner = 'dolthub'
let repo = 'nba-players'
let branch = 'master'
let query = "SELECT id FROM `players` where last_name='Harden'"

//res = await axios.get(`https://www.dolthub.com/api/v1alpha1/${owner}/${repo}`, {params:{q: query}})

axios.get(`https://www.dolthub.com/api/v1alpha1/${owner}/${repo}`, {params:{q: query}}).then((res) => {
console.log(res)
})
