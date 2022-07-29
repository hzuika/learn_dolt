import axios from 'axios'

branch = 'james-harden-basket-counts'
query = 'SELECT committer, message FROM dolt_log'
res = await axios.get(`https://www.dolthub.com/api/v1alpha1/${owner}/${repo}/${branch}`, params:{q: query})
console.log(res)
