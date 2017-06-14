var express = require('express'),
  fs      = require('fs'),
  app     = express(),
  eps     = require('ejs'),
  morgan  = require('morgan'),
  http    = require('http'),
  axios   = require('axios');
hbs     = require('express-handlebars')

Object.assign=require('object-assign')

app.engine('handlebars', hbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
  ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
  mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
  mongoURLLabel = "";

var bp = require('body-parser')
app.use(bp.json())
app.use(bp.urlencoded({extended: true}))

var token = '8553~7G6yIufBJhp30vX9A6NYC68aHSEeBxlm0LalJI1ARASZ4UWFq9bXBhWZGx3dPZiV'

app.post('/', function(req, res){
  var big_classes = []
  axios.get('https://umich-dev.instructure.com/api/v1/courses?access_token='+token)
    .then(function(classes){

      classes = classes.data


      for(cl in classes){
        cl = classes[cl]

        async function main(id, name){
          resp = await axios.get('https://umich-dev.instructure.com/api/v1/courses/'+id
            +'/students?access_token='+token)

          big_classes.push({
            name: name,
            id: id,
            users: resp.data
          })

          //done with async stuff
          if(big_classes.length == classes.length){
            handleClasses(big_classes, function(grouped_users){

              res.render('home', {
                title: 'Hey',
                message: 'Hello there!',
                people: grouped_users})

            })
          }
        }
        main(cl.id, cl.name);
        /*
          .then(function(res){

            users = res.data

            for(user in users){
              user = users[user]


              a = user_dict.get(user.id)

              console.log(a)

              user_dict.set(user, user.id)
            }

          }) */

      }
    })
    .catch(function(res){
      console.log(res)
    })
})

//all classes in the array now
function handleClasses(classes, callback){
  dictionary = new Map();
  getUserId(function(self_id){
    classes.forEach(function(cl){
      cl.users.forEach(function(user){

        //dont include ourselves
        if(self_id == user.id) return

        if(dictionary.has(user.id)){
          dictionary.get(user.id).classes.push(cl.name)
          //console.log('dupe')
        }
        else{
          //console.log(cl)
          user.classes = [cl.name]
          dictionary.set(user.id, user)
        }
      })
    })
    users = []
    dictionary.forEach(function(item){
      users.push(item)
    })
    callback(users)

  })


}

function getUserId(callback){
  let url = 'https://umich-dev.instructure.com/api/v1/users/self?access_token='
    +token

  axios.get(url).then(function(user){
    callback(user.data.id)
  })
}

app.get('/lol', function(req,res){
  getUserId()
})

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
