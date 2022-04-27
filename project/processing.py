import os
from pyvis.network import Network
import networkx as nx
from datetime import datetime
from tqdm import tqdm
from functools import reduce
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
    tree_num = 0
    for root_tweetid in tqdm(tree_ids):
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
            userid = tweet['userid']
            if key == root_tweetid:
                node = (curr_node_num,
                        {'title': f'Tweet ID: {key}<br>User ID: {userid}<br>{formatted_text}<br>{tweet_time}',
                         'label': f'{key}',
                         'group': tree_num,
                         'color': 'black'}
                        )
            elif tree.get(f'{parent_tweetid}', None) is None:
                continue
            else:
                # parent_tweet_time = tree[f'{parent_tweetid}']['tweet_time']
                # edge_weight = parse_tweet_time(tweet_time) - parse_tweet_time(parent_tweet_time)
                node = (curr_node_num,
                        {'title': f'Tweet ID: {key}<br>User ID: {userid}<br>{formatted_text}<br>{tweet_time}',
                         'label': f'{key}',
                         'group': tree_num}
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
            tree_num += 1
            # if group_num >= 10:
            #     break
            net = Network('600px', '1000px', directed=True)
            net.from_nx(g)
            net.save_graph(os.path.join(ASSETS_DIR, f'{name}_{root_tweetid}.html'))
            tree_num += 1
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


def compile_tweet_meta_info(name='charliehebdo'):
    with open(os.path.join(DATA_DIR, f'{name}.json'), 'r') as jsonfile:
        data = json.load(jsonfile)
    tree_ids = data.keys()
    tweet_meta_info = {}
    for root_tweetid in tqdm(tree_ids):
        tree = data[root_tweetid]
        for key, tweet in tree.items():
            if not key.isnumeric():
                continue
            parent_tweetid = tweet['parent_tweetid']
            if key == root_tweetid:
                tweet_meta_info[f'{key}'] = {'tree': f'{root_tweetid}'}
                continue
            elif tree.get(f'{parent_tweetid}', None) is None:
                continue
            # print(key, parent_tweetid)
            try:
                tweet_meta_info[f'{key}']['tree'] = f'{root_tweetid}'
            except:
                tweet_meta_info[f'{key}'] = {'tree': f'{root_tweetid}'}
            # Add parent tweet id to edge source list
            try:
                tweet_meta_info[f'{key}']['in'].append(f'{parent_tweetid}')
            except:
                tweet_meta_info[f'{key}']['in'] = [f'{parent_tweetid}']
            if tweet_meta_info.get(f'{parent_tweetid}', None) is None:
                tweet_meta_info[f'{parent_tweetid}'] = {'tree': f'{root_tweetid}'}
            # Add tweet id to edge destination list in parent
            try:
                tweet_meta_info[f'{parent_tweetid}']['out'].append(f'{key}')
            except:
                tweet_meta_info[f'{parent_tweetid}']['out'] = [f'{key}']
    tweet_meta_info_dist = []
    for key, value in tqdm(tweet_meta_info.items()):
        in_edge = value.get('in', [])
        out_edge = value.get('out', [])
        links = len(in_edge) + len(out_edge)
        tree_id = value.get('tree', None)
        tweet_meta_info_dist.append((key, tree_id, links, in_edge, out_edge))
    tweet_meta_info_dist = sorted(tweet_meta_info_dist, key=lambda x: x[2], reverse=True)
    return tweet_meta_info, tweet_meta_info_dist


def compile_user_info(name='charliehebdo'):
    with open(os.path.join(DATA_DIR, f'{name}.json'), 'r') as jsonfile:
        data = json.load(jsonfile)
    tree_ids = data.keys()
    tweets_per_userid, links_per_userid = {}, {}
    threads_per_userid = {}
    for root_tweetid in tqdm(tree_ids):
        tree = data[root_tweetid]
        label = 'unverified'
        for key, tweet in tree.items():
            if key == 'label':
                if tweet == 0:
                    label = 'non-rumour'
                elif tweet == 1:
                    label = 'false-rumour'
                elif tweet == 2:
                    label = 'true-rumour'
                else:
                    label = 'unverified'
            # Skip non-numeric keys; keys which are not tweet ids
            if not key.isnumeric():
                continue
            userid = tweet['userid']
            parent_tweetid = tweet['parent_tweetid']
            # If tweet is root tweet, add only tweet count to user id
            if key == root_tweetid:
                try:
                    tweets_per_userid[f'{userid}'].append(f'{key}')
                except:
                    tweets_per_userid[f'{userid}'] = [f'{key}']
                try:
                    threads_per_userid[f'{userid}'].add(f'{root_tweetid}')
                except:
                    threads_per_userid[f'{userid}'] = {f'{root_tweetid}'}
            elif tree.get(f'{parent_tweetid}', None) is None:  # If tweet parent does not exist in tree, skip it
                continue
            else:
                # Add tweet count to user id for regular tweet
                try:
                    tweets_per_userid[f'{userid}'].append(f'{key}')
                except:
                    tweets_per_userid[f'{userid}'] = [f'{key}']
                parent_userid = tree[f'{parent_tweetid}']['userid']
                # Add link destination to user id for regular tweet
                if links_per_userid.get(f'{userid}', None) is None:
                    links_per_userid[f'{userid}'] = {'src': {}, 'dst': {}}  # Init empty dict for new userid
                try:
                    links_per_userid[f'{userid}']['src'][f'{parent_userid}'] += 1
                except:
                    links_per_userid[f'{userid}']['src'][f'{parent_userid}'] = 1
                # Add link source to user id for regular tweet
                if links_per_userid.get(f'{parent_userid}', None) is None:
                    links_per_userid[f'{parent_userid}'] = {'src': {}, 'dst': {}}  # Init empty dict for new parent userid
                try:
                    links_per_userid[f'{parent_userid}']['dst'][f'{userid}'] += 1
                except:
                    links_per_userid[f'{parent_userid}']['dst'][f'{userid}'] = 1
                try:
                    threads_per_userid[f'{userid}'].add(f'{root_tweetid}')
                except:
                    threads_per_userid[f'{userid}'] = {f'{root_tweetid}'}
    user_tweet_dist, user_link_dist = [], []
    user_thread_dist = []
    for key, tweet_list in tqdm(tweets_per_userid.items()):
        user_tweet_dist.append((key, len(tweet_list)))
    user_tweet_dist = sorted(user_tweet_dist, key=lambda x: x[1], reverse=True)
    for key, link_dict in tqdm(links_per_userid.items()):
        try:
            src_count = sum(link_dict['src'].values())
        except:
            src_count = 0
        try:
            dst_count = sum(link_dict['dst'].values())
        except:
            dst_count = 0
        user_link_dist.append((key, src_count + dst_count))
        links_per_userid[key]['src']['total'] = src_count
        links_per_userid[key]['dst']['total'] = dst_count
        pass
    user_link_dist = sorted(user_link_dist, key=lambda x: x[1], reverse=True)
    for key, value in tqdm(threads_per_userid.items()):
        threads_per_userid[key] = list(value)
        user_thread_dist.append((key, len(value)))
    user_thread_dist = sorted(user_thread_dist, key=lambda x: x[1], reverse=True)
    return tweets_per_userid, user_tweet_dist, links_per_userid, user_link_dist, threads_per_userid, user_thread_dist


def compile_tree_info(tweet_meta_info, name='charliehebdo'):
    """
    Compile meta-information about tweet trees in an event
    :param name: name of the json file to be opened
    :return:
    """
    with open(os.path.join(DATA_DIR, f'{name}.json'), 'r') as jsonfile:
        data = json.load(jsonfile)
    tree_ids = data.keys()
    tree_info = {}
    for root_tweetid in tqdm(tree_ids):
        tree = data[root_tweetid]
        max_out_degree = 0
        max_links = 0
        num_tweets = 0
        for key in tree.keys():
            if key == 'label':
                if tree[key] == 0:
                    label = 'non-rumour'
                elif tree[key] == 1:
                    label = 'false-rumour'
                elif tree[key] == 2:
                    label = 'true-rumour'
                else:
                    label = 'unverified'
            tweet_info = tweet_meta_info.get(f'{key}', None)
            if tweet_info is None:
                continue
            else:
                num_tweets += 1
                out_degree = len(tweet_info.get('out', []))
                links = len(tweet_info.get('in', [])) + out_degree
                if out_degree > max_out_degree:
                    max_out_degree = out_degree
                if links > max_links:
                    max_links = links
        else:
            tree_info[f'{root_tweetid}'] = {'num_tweets': num_tweets,
                                            'max_links': max_links,
                                            'max_out_degree': max_out_degree,
                                            'label': label}
    tree_dist = []
    for tree_id, info in tqdm(tree_info.items()):
        tree_dist.append((tree_id, info['num_tweets'], info['max_links'], info['max_out_degree'], info['label']))
    tree_dist = sorted(tree_dist, key=lambda x: x[1], reverse=True)
    return tree_info, tree_dist


if __name__ == '__main__':
    tweet_meta_info, tweet_meta_info_dist = compile_tweet_meta_info()
    tree_info, tree_dist = compile_tree_info(tweet_meta_info)
    tweets_per_userid, user_tweet_dist, links_per_userid, user_link_dist, threads_per_userid, user_thread_dist = compile_user_info()
    # plot_tweet_graphs()

    with open('tree_info.csv', 'w') as f:
        f.write('tree_id,num_tweets,max_links,max_out_degree,label')
        for (tree_id, num_tweets, max_links, max_out_degree, label) in tree_dist:
            f.write(f'\n{tree_id},{num_tweets},{max_links},{max_out_degree},{label}')

    with open('tweet_meta_info.csv', 'w') as f:
        f.write('tweetid,root_tweetid,link_count,in_degree,out_degree,in_edge,out_edge')
        for (tweetid, root_tweetid, link_count, in_edge, out_edge) in tweet_meta_info_dist:
            f.write(f'\n{tweetid},{root_tweetid},{link_count},{len(in_edge)},{len(out_edge)},{in_edge},{out_edge}')

    with open('user_meta_info.json', 'w') as f:
        json_to_save = {'tweets': tweets_per_userid, 'links': links_per_userid, 'threads': threads_per_userid}
        json.dump(json_to_save, f, indent=1)

    with open('userid_tweet_stats.csv', 'w') as f:
        f.write('userid,tweet_count,link_count,src_count,dst_count,thread_count')
        for userid, tweet_count in user_tweet_dist:
            link_count = links_per_userid.get(userid, 0)
            if type(link_count) is dict:
                try:
                    src_count = link_count['src']['total']
                except:
                    src_count = 0
                try:
                    dst_count = link_count['dst']['total']
                except:
                    dst_count = 0
                link_count = src_count + dst_count
            thread_count = len(threads_per_userid.get(userid, []))
            f.write(f'\n{userid},{tweet_count},{link_count},{src_count},{dst_count},{thread_count}')