import os
from pyvis.network import Network
import networkx as nx
from datetime import datetime
from tqdm import tqdm
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
    g = nx.DiGraph()
    node_num = 0
    for group_num, root_tweetid in tqdm(enumerate(tree_ids)):
        tree = data[root_tweetid]
        nodes = []
        # title = []
        edges = []
        # print(len(tree) - 2)
        for key, tweet in tree.items():
            if not key.isnumeric():
                continue
            tweet_time = tweet['tweet_time']
            formatted_text = format_tweet_text(tweet['text'])
            parent_tweetid = tweet['parent_tweetid']
            if key == root_tweetid:
                node = (int(key), {'title': f'{formatted_text}<br>{tweet_time}',
                                   # 'time': tweet_time,
                                   'group': group_num,
                                   'color': 'red'}
                        )
            elif tree.get(f'{parent_tweetid}', None) is None:
                continue
            else:
                parent_tweet_time = tree[f'{parent_tweetid}']['tweet_time']
                edge_weight = parse_tweet_time(tweet_time) - parse_tweet_time(parent_tweet_time)
                node = (int(key), {'title': f'{formatted_text}<br>{tweet_time}',
                                   # 'time': tweet_time,
                                   'group': group_num}
                        )
            nodes.append(node)
            node_num += 1
            if parent_tweetid is None:
                # print(key, node[1]['title'])
                continue
            edge = (int(parent_tweetid), int(key))
            edges.append(edge)
        else:
            g.add_nodes_from(nodes)
            g.add_edges_from(edges)
            group_num += 1
            # print(nodes)
            # print(edges)
            break
        # print(tree)
        # print(nodes)
        # print(edges)
        # net = Network('500px', '500px')
        # net.add_nodes(nodes=nodes, title=title)
        # print(net.nodes)
        # net.add_edges(edges)
        # net.save_graph(f'{name}.html')
    print(g)
    net = Network('1000px', '1000px')
    net.from_nx(g)
    net.save_graph(f'{name}_nx.html')
    # net.show(f'{name}_nx.html')
    return nodes, edges, g


if __name__ == '__main__':
    nodes, edges, g = plot_tweet_graphs()