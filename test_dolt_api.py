import requests
owner, repo = 'dolthub', 'nba-players'
res = requests.get('https://dolthub.com/api/v1alpha1/{}/{}'.format(owner, repo))
print(res.json())
