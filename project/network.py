import os
from pyvis.network import Network
import networkx as nx
from datetime import datetime
from tqdm import tqdm
import json

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT_DIR, 'data')
ASSETS_DIR = os.path.join(ROOT_DIR, 'assets')
MONTH_TO_MONTHNUM = {'jan': '01',
                     'feb': '02',
                     'mar': '03',
                     'apr': '04',
                     'may': '05',
                     'jun': '06',
                     'jul': '07',
                     'aug': '08',
                     'sep': '09',
                     'oct': '10',
                     'nov': '11',
                     'dec': '12'
                     }


def parse_tweet_time(tweet_time):
    _, month, day, time, _, year = tweet_time.split(' ')
    month_num = MONTH_TO_MONTHNUM[month.lower()]
    date_time_string = f'{year}-{month_num}-{day} {time}'
    date_time_obj = datetime.strptime(date_time_string, '%Y-%m-%d %H:%M:%S')
    return date_time_obj.timestamp()


def format_tweet_text(text):
    words = text.split(' ')
    output_text = ''
    word_num = 5
    quotient = len(words) // word_num
    # remainder = len(words) % word_num
    for segment in range(len(words) // word_num):
        segment_start = segment * 5
        segment_end = (segment + 1) * 5
        output_text += ' '.join(words[segment_start:segment_end]) + '<br>'
    else:
        if quotient == 0:
            return text
        else:
            output_text += ' '.join(words[segment_end:])
    return output_text


def plot_tweet_graphs(name='charliehebdo'):
    with open(os.path.join(DATA_DIR, f'{name}.json'), 'r') as jsonfile:
        data = json.load(jsonfile)
    tree_ids = data.keys()
    # g = nx.DiGraph()
    # node_num = 0
    # tweetid_to_node_num = {}
    for group_num, root_tweetid in tqdm(enumerate(tree_ids)):
        g = nx.DiGraph()
        node_num = 0
        tweetid_to_node_num = {}
        tree = data[root_tweetid]
        nodes = []
        edges = []
        for key, tweet in tree.items():
            if not key.isnumeric():
                continue
            curr_node_num = tweetid_to_node_num.get(key, None)
            if curr_node_num is None:
                curr_node_num = node_num
                tweetid_to_node_num[key] = node_num
            tweet_time = tweet['tweet_time']
            formatted_text = format_tweet_text(tweet['text'])
            parent_tweetid = tweet['parent_tweetid']
            if key == root_tweetid:
                node = (curr_node_num, {'title': f'{key}<br>{formatted_text}<br>{tweet_time}',
                                   'label': f'{key}',
                                   # 'time': tweet_time,
                                   'group': group_num,
                                   'color': 'black'}
                        )
            elif tree.get(f'{parent_tweetid}', None) is None:
                continue
            else:
                # parent_tweet_time = tree[f'{parent_tweetid}']['tweet_time']
                # edge_weight = parse_tweet_time(tweet_time) - parse_tweet_time(parent_tweet_time)
                node = (curr_node_num, {'title': f'{key}<br>{formatted_text}<br>{tweet_time}',
                                   'label': f'{key}',
                                   # 'time': tweet_time,
                                   'group': group_num}
                        )
            nodes.append(node)
            node_num += 1
            if parent_tweetid is None:
                # print(key, node[1]['title'])
                continue
            parent_node_num = tweetid_to_node_num.get(f'{parent_tweetid}', None)
            # print(parent_node_num, curr_node_num, type(parent_tweetid), type(key))
            edge = (parent_node_num, curr_node_num)
            edges.append(edge)
        else:
            # print(nodes)
            # print(edges)
            g.add_nodes_from(nodes)
            g.add_edges_from(edges)
            group_num += 1
            # if group_num >= 10:
            #     break
            net = Network('600px', '1000px')
            net.from_nx(g)
            net.save_graph(os.path.join(ASSETS_DIR, f'{name}_{root_tweetid}.html'))
        # print(tree)
        # print(nodes)
        # print(edges)
        # net = Network('500px', '500px')
        # net.add_nodes(nodes=nodes, title=title)
        # print(net.nodes)
        # net.add_edges(edges)
        # net.save_graph(f'{name}.html')
    # print(g)
    # net = Network('600px', '1000px')
    # net.from_nx(g)
    # net.save_graph(f'{name}_nx1.html')
    # net.show(f'{name}_nx.html')
    # return nodes, edges, g


def compile_user_info(name='charliehebdo'):
    with open(os.path.join(DATA_DIR, f'{name}.json'), 'r') as jsonfile:
        data = json.load(jsonfile)
    tree_ids = data.keys()
    tweets_per_userid = {}
    for group_num, root_tweetid in tqdm(enumerate(tree_ids)):
        tree = data[root_tweetid]
        for key, tweet in tree.items():
            if not key.isnumeric():
                continue
            try:
                tweets_per_userid[key] += 1
            except:
                tweets_per_userid[key] = 1
    tweet_dist = []
    for key, value in tqdm(tweets_per_userid.items()):
        tweet_dist.append((key, value))
    tweet_dist = sorted(tweet_dist, key=lambda x: x[1], reverse=True)
    return tweets_per_userid, tweet_dist


def compile_link_info(name='charliehebdo'):
    with open(os.path.join(DATA_DIR, f'{name}.json'), 'r') as jsonfile:
        data = json.load(jsonfile)
    tree_ids = data.keys()
    links_per_userid = {}
    for group_num, root_tweetid in tqdm(enumerate(tree_ids)):
        tree = data[root_tweetid]
        for key, tweet in tree.items():
            if not key.isnumeric():
                continue
            parent_tweetid = tweet['parent_tweetid']
            if key == root_tweetid:
                continue
            elif tree.get(f'{parent_tweetid}', None) is None:
                continue
            try:
                links_per_userid[f'{parent_tweetid}-{root_tweetid}'] += 1
            except:
                links_per_userid[f'{parent_tweetid}-{root_tweetid}'] = 1
    link_dist = []
    for key, value in tqdm(links_per_userid.items()):
        key, tree_id = key.split('-')
        link_dist.append((key, tree_id, value))
    link_dist = sorted(link_dist, key=lambda x: x[2], reverse=True)
    return links_per_userid, link_dist


if __name__ == '__main__':
    # plot_tweet_graphs()
    tweets_per_userid, tweet_dist = compile_user_info()
    links_per_userid, link_dist = compile_link_info()
    with open('links_per_userid.csv', 'w') as f:
        f.write('tweetid,root_tweetid,link_count,tweet_count')
        for (tweetid, root_tweetid, link_count), (_, tweet_count) in zip(link_dist, tweet_dist):
            f.write(f'\n{tweetid},{root_tweetid},{link_count},{tweet_count}')