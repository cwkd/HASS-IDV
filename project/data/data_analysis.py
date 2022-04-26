import json

data_path = 'charliehebdo.json'


def reader(data_path):
    with open(data_path, 'r') as f:
        data = json.load(f)
    return data


def writer(data_path, data):
    with open(data_path, 'w') as f:
        json.dump(data, f, indent=1)


def user_activity(data):
    user2user = {}
    user_set = set()
    for tweet_id in data.keys():
        root_user = data[tweet_id][tweet_id]['userid']
        user_set.add(root_user)
        if root_user in user2user.keys():
            user_dict = user2user[root_user]
        else:
            user_dict = {}
        for retweet_id in sorted(data[tweet_id].keys())[:-3]:
            if retweet_id != tweet_id:
                user_id = data[tweet_id][retweet_id]['userid']
                user_set.add(user_id)
                if user_id in user_dict.keys():
                    user_dict[user_id] += 1
                else:
                    user_dict[user_id] = 1
        user2user[root_user] = user_dict
    print(len(user_set))
    return user2user

def user_counter(user2user):
    user_count = {}
    for user in user2user.keys():
        user_count[user] = 0
        for user_id in user2user[user].keys():
            user_count[user] += user2user[user][user_id]
    first_users_id = [x[0] for x in sorted(user_count.items(), key=lambda x: x[1], reverse=True)[:10]]
    user_influence = {'name': 'user-influence', 'children': []}
    for id in first_users_id:
        first_user = {'name': 'User_id: {} Influence: {}'.format(id, user_count[id]), 'children': []}
        top_total = 0
        for item in sorted(user2user[id].items(), key=lambda x: x[1], reverse=True)[:10]:
            first_user['children'].append({'name': 'User_id: {} Interactions: {}'.format(item[0], item[1]), 'size': item[1]})
            top_total += item[1]
        # one_iteraction_user_count = 0
        # for user_id in user2user[id].keys():
        #     if user2user[id][user_id] == 1:
        #         one_iteraction_user_count += 1
        first_user['children'].append({'name': 'Other users in total, Interactions:{}'.format(user_count[id] - top_total), 'size': user_count[id] - top_total})
        user_influence['children'].append(first_user)
    print(user_influence)
    writer('user_influence.json', user_influence)
    # print(sorted(user_count.items(), key=lambda x: x[1], reverse=True)[:5])


def analysis(user2user):
    # print(len(user2user))
    for user in user2user.keys():
        # print(user, sorted(user2user[user].items(), key=lambda x: x[1], reverse=True)[:3])
        user_rank = sorted(user2user[user].items(), key=lambda x: x[1], reverse=True)[:3]
        for user_id, count in user_rank:
            # print('first layer: ',  user_id, count)
            if user_id in user2user.keys():
                print('second layer: ', user_id, sorted(user2user[user_id].items(), key=lambda x: x[1], reverse=True)[:3])
                print('first layer: ', user_id, count)
                # assert 1 == 0
        print(user)
data = reader(data_path)
# writer('data_zq.json', data)
user2user = user_activity(data)
# analysis(user2user)
user_counter(user2user)

# print(data.keys())