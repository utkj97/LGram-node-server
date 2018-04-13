//Models imported
const Leads = require('../models/leads');
const Views = Leads.Views;
const Users = Leads.Users;

//Express router created
const express = require('express');
const router = express.Router();

const http = require('http');

//Get request to handle clicks and redirect
router.get('/trigger', function(req, res, next){
  //Code for get handler on /trigger route

  //Query data stored
  var source = req.query.source;
  var campaign = req.query.campaign;
  var timestamp = Date.now();
  var ip = req.ip;
  var location;

  //Making use of the ipstack API for getting geolocation
  http.get('http://api.ipstack.com/'+ip+'?access_key=e5c61b366f7f086115aaebe2bc99bc1f', function(response){

    //Encoding set to utf8
    response.setEncoding('utf8');
    var body = '';

    //Upon recieving a chunk of data appended to body
    response.on('data', function(data){
      body += data;
    });

    //Upon reaching the end JSON parsing is done
    response.on("end", function(){
      body = JSON.parse(body);
      location = body;
    });

    //Search the database to find a user whose IP matches with request IP
    Users.findOne({ip_address: ip}, function(err, user){

      if(err){
        //Handle Error
        throw err;
      }

      //If IP already exists
      if(user){
        //Update the values

        user.times_viewed += 1;
        user.timestamp_of_views.push(timestamp);
        user.source.push(source);
        user.campaign.push(campaign);
        user.location.push({
          lat: location.latitude,
          lng: location.longitude
        });
        //Save in database
        user.save((err) => {
          //Callback function

          if(err){
            //Handle Error
            throw err;
          }
          else{
            //Now updation of view collection is to be done
            Views.findOne({}, function(err, view){
              if(err){
                //Handle Error
                throw err;
              }

              //return_views is to be updated
              if(view){
                view.return_views += 1;
                view.save();
              }
            });
          }
        });
      }

      //If it a new click event or no user with request IP already in database
      else{

        //Create new user with data available
        Users.create({
          ip_address: ip,
          times_viewed: 1,
          timestamp_of_views: [timestamp],
          source: [source],
          campaign: [campaign],
          location: [{lat: location.latitude, lng: location.longitude}]
        },function(err, user){
          //Callback function

            if(err){
              //Handle error
              throw err;
            }

            //Update the views collection
            Views.findOne({},function(err, view){
              if(err){
                //Handle error
                throw err;
              }

              //If there have been previous views
              if(view){
                view.unique_views += 1;
                view.save();
              }

              //If this is the first time the API is being called
              else{
                Views.create({
                  unique_views: 1,
                  return_views: 0
                }, function(err, view){
                  //Callback function

                    if(err){
                      //handle Error
                      throw err;
                    }
                });

              }
            });

        });

      }

    });

    //Redirects to the url
    res.redirect('https://www.weloftlabs.com');

  });//End of the get API call

});//End of get request on trigger route

//Get request to send json response
router.get('/fetch', function(req, res, next){
  //Result will be returned as a JSON response
  var result = {
    unique_views: Number,
    return_views: Number,
    users: []
  };

  //Find all the data in the Views colection
  Views.find({}, function(err, views_data){
    if(err){
      //Handle Error
      throw err;
    }

    //Update the properties of the result object
    if(views_data.length>0){
      result.unique_views = views_data[0].unique_views;
      result.return_views = views_data[0].return_views;

      //Find all the data in the Users collection
      Users.find({}, function(err, users_data){
        if(err){
          //Handles Error
          throw err;
        }

        //update the users property of the result object
        for( var i=0; i<users_data.length; i++){
          result.users.push({
            ip_address: users_data[i].ip_address,
            times_viewed: users_data[i].times_viewed,
            timestamp_of_views: users_data[i].timestamp_of_views,
            source: users_data[i].source,
            campaign: users_data[i].campaign,
            location: users_data[i].location
          });
        }

        //Return a json response
        res.json(result);
      });
    }
    else{
      res.json({});
    }
  });

});//End of get request on fetch route

//Exports the router
module.exports = router;
