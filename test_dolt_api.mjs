import axios from 'axios'

owner, repo, branch = 'dolthub', 'nba-players', 'master'
query = "SELECT id FROM `players` where last_name='Harden'"
res = await axios.get(`https://www.dolthub.com/api/v1alpha1/${owner}/${repo}`, {params:{q: query}})
console.log(res)
