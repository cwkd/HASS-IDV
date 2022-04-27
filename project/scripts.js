const meta_info_path = 'data/tweet_meta_info.csv'
const tree_info_path = 'data/tree_info.csv'

var curr_tree_id
var curr_tree_counter = 0

var meta_info
var tree_info

d3.csv(meta_info_path)
    .then(d => {
        meta_info = d;
//        console.log(meta_info.slice(0, 100));
//        console.log(meta_info.length);
    });

d3.csv(tree_info_path)
    .then(d => {
        tree_info = d;
        curr_tree_id = tree_info[curr_tree_counter].tree_id;
        updateNetworkContent(curr_tree_id);
//        console.log(tree_info.slice(0, 100));
    });

const nextCallback = function () {
    curr_tree_counter += 1;
    curr_tree_counter %= tree_info.length;
//    curr_tree_id = meta_info[curr_tree_counter].root_tweetid;
    curr_tree_id = tree_info[curr_tree_counter].tree_id;
    console.log(curr_tree_counter, curr_tree_id);
    updateNetworkContent(curr_tree_id);
}

const backCallback = function () {
    curr_tree_counter -= 1;
    if (curr_tree_counter < 0) {
        curr_tree_counter += tree_info.length;
    }
//    curr_tree_id = meta_info[curr_tree_counter].root_tweetid;
    curr_tree_id = tree_info[curr_tree_counter].tree_id;
    console.log(curr_tree_counter, curr_tree_id);
    updateNetworkContent(curr_tree_id);
}

const updateNetworkContent = function (tree_id) {
    d3.select('#network-graph-iframe').attr('src', `assets/charliehebdo_${tree_id}.html`);
    d3.select("#tree-id-searchbar").property('value', tree_id);
}

const treeIdSearch = function () {
    new_value = d3.select('#tree-id-searchbar').property('value');
    console.log(new_value, curr_tree_counter, curr_tree_id);
    updateNetworkContent(new_value);
}