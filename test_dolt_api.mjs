import axios from 'axios'

//const axios = require('axios').default;

let owner = 'dolthub'
let repo = 'nba-players'
let branch = 'master'
let query = "SELECT id FROM `players` where last_name='Harden'"

//res = await axios.get(`https://www.dolthub.com/api/v1alpha1/${owner}/${repo}`, {params:{q: query}})

const url = "https://www.dolthub.com/api/v1alpha1" 
axios.get(`https://www.dolthub.com/api/v1alpha1/${owner}/${repo}`, {params:{q: query}}).then((res) => {
//console.log(res)
})

owner = 'hzuika'
repo = 'dotlive_video'
query = "SELECT * FROM channel"
axios.get(`${url}/${owner}/${repo}`, {params:{q: query}}).then(res => {
  res.data.rows.map(data => {
    console.log(data.id);
  });
});
