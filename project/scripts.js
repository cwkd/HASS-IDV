const meta_info_path = 'tweet_meta_info.csv'
const tree_info_path = 'tree_info.csv'

var curr_tree_id

var meta_info
var tree_info

d3.csv(meta_info_path)
    .then(d => {
        meta_info = d;
//        console.log(meta_info.slice(0, 100));
    });

d3.csv(tree_info_path)
    .then(d => {
        tree_info = d;
//        console.log(tree_info.slice(0, 100));
    });