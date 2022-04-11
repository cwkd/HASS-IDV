import os
from pyvis.network import Network
import networkx as nx
from datetime import datetime
import json

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT_DIR, 'data')
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


def main(name='charliehebdo'):
    with open(os.path.join(DATA_DIR, f'{name}.json'), 'r') as jsonfile:
        data = json.load(jsonfile)
    tree_ids = data.keys()
    for root_tweet_id in tree_ids:
        tree = data[root_tweet_id]
        nodes, title, value = [], [], []
        edges = []
        for key, tweet in tree.items():
            if not key.isnumeric():
                continue
            nodes.append(int(key))
            tweet_time = tweet['tweet_time']
            title.append(f"{tweet['text']}\n{tweet_time}")
            # value.append(tweet_time)
            parent_tweetid = f"{tweet['parent_tweetid']}"
            if parent_tweetid is None:
                continue
            if tree.get(parent_tweetid, None) is None:
                continue
            else:
                parent_tweet_time = tree[parent_tweetid]['tweet_time']
                edge_weight = parse_tweet_time(tweet_time) - parse_tweet_time(parent_tweet_time)
            edge = (int(parent_tweetid), int(key))
            edges.append(edge)
        # print(tree)
        print(nodes)
        print(edges)
        net = Network('500px', '500px')
        net.add_nodes(nodes=nodes, title=title)
        # print(net.nodes)
        net.add_edges(edges)
        net.save_graph(f'{name}.html')
        break


if __name__ == '__main__':
    main()