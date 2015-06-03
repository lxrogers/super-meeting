
/*
 * GET home page.
 */

exports.index = function(req, res){
    console.log('num:' + req.params.num)
  res.render('index', { title: 'Express' });
};