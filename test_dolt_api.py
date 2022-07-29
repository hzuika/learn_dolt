import requests
owner, repo = 'dolthub', 'nba-players'
res = requests.get('https://dolthub.com/api/v1alpha1/{}/{}'.format(owner, repo))
#print(res.json())

owner, repo, branch = 'dolthub', 'nba-players', 'master'
query = '''SELECT tot.pts / tot.gp as ppg, ply.full_name as player
    FROM `season_totals_regular_season` as tot
    JOIN `players` as ply ON tot.player_id = ply.id
    WHERE tot.season_id = '2019-20'
    ORDER BY ppg DESC LIMIT 10;'''
res = requests.get('https://www.dolthub.com/api/v1alpha1/{}/{}/{}'.format(owner, repo, branch), params={'q': query})
print(res) #504
def print_res(res):
    if res.status_code == requests.codes.ok:
        print(res.json())
print_res(res)
query = "SELECT id FROM `players` where last_name='Harden'"
res = requests.get('http://www.dolthub.com/api/v1alpha1/{}/{}'.format(owner, repo), params={'q': query})
print(res)
print_res(res)
