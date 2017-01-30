/**
 * Triggered each time a {Parse.User} is created or updated, which starts the user migration to Backendless.
 *
 * @param {Object} the user that was changed
 * @param {Function} handles the user that was changed
 */
Parse.Cloud.afterSave(Parse.User, function(request) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/userMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {
  }, function(httpResponse) {
  });
});

/**
 * Migrate a created or updated user to Backendless from Parse.
 *
 * @param {string} name of the job
 * @param {function} takes the user request and resolves the response after performing the migration
 */
Parse.Cloud.job("userMigration", function(request, response) {
  var body = JSON.parse(request.body);
  var backendlessUser = require('cloud/backendlessUser.js');
  if (body.username) {
    backendlessUser.get(body.username, "", body, backendlessUser.put, response);
  } else {
    response.error('userMigration failure: missing username');
  }
});

Parse.Cloud.afterSave("Audio", function(request) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/audioMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {
    console.log('afterSave audio');
    console.log(httpResponse);
  }, function(httpResponse) {
  });
});

Parse.Cloud.job("audioMigration", function(request, response) {
  var body = JSON.parse(request.body);
  var backendlessAudio = require('cloud/backendlessAudio.js');
  if (body.name) {
    backendlessAudio.getBackendlessAudio(body, backendlessAudio.putBackendlessAudio,
      backendlessAudio.postBackendlessAudio, response);
  } else {
    response.error('audioMigration failure: missing name');
  }
});

Parse.Cloud.afterDelete("Audio", function(request) {
  var backendlessAudio = require('cloud/backendlessAudio.js');
  var body = JSON.parse(JSON.stringify(request.object));
  if (body.name) {
    backendlessAudio.getBackendlessAudio(body, backendlessAudio.deleteBackendlessAudio, null, null);
  } else {
    console.log('delete audio failure: missing name');
  }
});

Parse.Cloud.afterSave('CorrectAnswers', function(request) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/correctAnswersMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {
    //console.log(httpResponse);
  }, function(httpResponse) {
    //console.error('**************************************************');
    //console.error('POST to correctAnswersMigration failed with response code ' +
    //    httpResponse.status);
    //console.error(httpResponse);
    //console.error('**************************************************');
  });
});

/**
 * objectId
 * ACL
 * createdAt
 * hint
 * questionId
 * updatedAt
 * userId
 *
 * TO
 *
 * (In Users)
 * correct (relation to Question)
 * hint (relation to Question)
 *
 * 1. Create relation to Question from User for both correct and hint (if hint is true)
 *  a. Get Question (P)
 *  b. Get question text (P)
 *  c. Find Question by text (B)
 *  d. Get User (P)
 *  e. Get User username (P)
 *  f. Find User by username (D)
 *  g. Create relation to that Question for that User (B)
 */
Parse.Cloud.job("correctAnswersMigration", function(request, response) {
  var body = JSON.parse(request.body);
  var userId = body.userId;
  var questionId = body.questionId;
  var username;
  var parseUser = require('cloud/parseUser.js');
  parseUser.get(userId, function(httpResponseText) {
    console.log("Found userId " + userId);
    console.log(httpResponseText);
    var parsedResponse = JSON.parse(httpResponseText);
    console.log("Found username " + parsedResponse.username);
    username = parsedResponse.username;
    var backendlessUser = require('cloud/backendlessUser.js');
    // Check to see if the user already exists in Backendless
    backendlessUser.get(username, "correct", body,
      // Found in Backendless
      function(username, incomingData, userData, successCallback, errorCallback) {
        console.log("incomingData");
        console.log(incomingData);
        console.log("userData");
        console.log(userData);
        console.log("correct");
        console.log(userData.correct);
        var correct = userData.correct;
        console.log("correct[0]");
        console.log(correct[0]);
        var parseQuestion = require('cloud/parseQuestion.js');
        parseQuestion.get(
          questionId,
          function(httpResponse) {
            var question = JSON.parse(httpResponse).question;
            console.log("get parse question response:");
            console.log(httpResponse);
            console.log(question);
            var backendlessQuestion = require('cloud/backendlessQuestion.js');
            backendlessQuestion.get(
              question,
              function(httpResponse) {
                console.log("backendlessQuestion.get response");
                console.log(httpResponse);
              },
              function(httpResponse) {
                console.log("backendlessQuestion.get error");
                console.log(httpResponse);
              }
            );
            var newCorrect = {
              "objectId": incomingData.questionId,
              "___class": "Question"
            };
            console.log(correct.length);
            correct.push(newCorrect);
            console.log("correct");
            console.log(correct.length);
            console.log(correct[correct.length-1]);
            successCallback("done");
          },
          function(httpResponse) {
            console.log(httpResponse);
            response.error(httpResponse);
          }
        );
        /**
        var correctArray = [];
        var hintArray = [];
        for (var i = 0; i < userObject.correct.length; i++) {
          var correctAnswer = {};
          correctAnswer.___class = userObject.correct[i].___class;
          correctAnswer.objectId = userObject.correct[i].objectId;
          correctArray.push(correctAnswer);
        }
        hintArray = userObject.hint;
        correctArray.push(newCorrect);
        userObject.correct = correctArray;
        if (hint) {
          hintArray.push(hint);
        }
        userObject.hint = hintArray;
        var params = JSON.stringify(userObject);
        // Update the user with correct answer data
        backendlessUser.put(userObject.username, params,
          // Success
          function(httpResponseText) {
            //console.log(httpResponseText);
            // Error
          }, function(httpResponseText) {
            //console.log(httpResponseText);
            //console.log("ERROR $$$$$$$$$$$$$$$$$$$$$$$$$$$$");
            //console.log(params);
        });
         */
      },
      response
    );
  }, function(httpResponseText) {
    response.error(httpResponseText);
  });
  var hint;
  if (body.hint) {
    hint = {
      "objectId": body.questionId,
      "___class": "Question"
    }
  }

  /**
   Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://api.backendless.com/v1/data/Users/' + userId +
            '?loadRelations=correct',
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        }
    }).then(function(httpResponse) {
        userObject = JSON.parse(httpResponse.text);
        correctArray = JSON.parse(httpResponse.text).correct;
        hintArray = JSON.parse(httpResponse.text).hint;
        correctArray.push(correct);
        userObject.correct = correctArray;
        if (hint) {
            hintArray.push(hint);
        }
        userObject.hint = hintArray;
        var params = JSON.stringify(userObject);
        Parse.Cloud.httpRequest({
            method: 'PUT',
            url: 'https://api.backendless.com/v1/data/Users/' + userId,
            headers: {
                'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
                'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
                'Content-Type': 'application/json',
                'application-type': 'REST'
            },
            body: params
        }).then(function(httpResponse) {
            console.log("PUT User " + userId + " SUCCESS!");
            console.log(httpResponse);
        }, function(httpResponse) {
            console.log("PUT User " + userId + " FAILED!");
            console.log(httpResponse);
        });
    }, function(httpResponse) {
        // Get the Parse user
        console.log('https://api.parse.com/1/users/' + userId);
        Parse.Cloud.httpRequest({
            method: 'GET',
            url: 'https://api.parse.com/1/users/' + userId,
            headers: {
                'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
                'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
                'Content-Type': 'application/json;charset=utf-8'
            }
        }).then(function(httpResponse) {
            // Add this user to Backendless
            console.log("########################################################");
            console.log("GET USER FROM PARSE:");
            console.log(httpResponse.text);
            console.log("########################################################");

            Parse.Cloud.httpRequest({
                method: 'POST',
                url: 'https://api.parse.com/1/jobs/',
                headers: {
                    'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
                    'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: httpResponse.text
            }).then(function(httpResponse) {
              Parse.Cloud.httpRequest({
                  method: 'GET',
                  url: 'https://api.backendless.com/v1/data/Users/' + userId +
                      '?loadRelations=correct',
                  headers: {
                      'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
                      'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
                      'Content-Type': 'application/json',
                      'application-type': 'REST'
                  }
              }).then(function(httpResponse) {
                  userObject = JSON.parse(httpResponse.text);
                  correctArray = JSON.parse(httpResponse.text).correct;
                  hintArray = JSON.parse(httpResponse.text).hint;
                  correctArray.push(correct);
                  userObject.correct = correctArray;
                  if (hint) {
                      hintArray.push(hint);
                  }
                  userObject.hint = hintArray;
                  var params = JSON.stringify(userObject);
                  Parse.Cloud.httpRequest({
                      method: 'PUT',
                      url: 'https://api.backendless.com/v1/data/Users/' + userId,
                      headers: {
                          'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
                          'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
                          'Content-Type': 'application/json',
                          'application-type': 'REST'
                      },
                      body: params
                  }).then(function(httpResponse) {
                      console.log("PUT User " + userId + " SUCCESS!");
                      console.log(httpResponse);
                  }, function(httpResponse) {
                      console.log("PUT User " + userId + " FAILED!");
                      console.log(httpResponse);
                  });
              }, function(httpResponse) {
                console.log("GET User " + userId + " FAILED!");
                console.log(httpResponse);
              });
            }, function(httpResponse) {
                console.error('**************************************************');
                console.error('POST to userMigration failed with response code ' +
                    httpResponse.status);
                console.error(httpResponse);
                console.error('**************************************************');
            });
        }, function(httpResponse) {
            // User exists in neither backendless nor Parse
            console.error('**************************************************');
            console.error('GET user failed with response code ' +
                httpResponse.status);
            console.error(httpResponse);
            console.error('**************************************************');
        });
    });
   */
});

Parse.Cloud.job("questionMigration", function(request, response) {
  console.log('questionMigration request:');
  console.log(request);
  console.log('questionMigration response:');
  console.log(response);
  var body = JSON.parse(request.body);
  if (body.objectId) {
    var newBody = {
      answer: body.answer,
      category: body.category,
      question: body.question,
      score: body.score,
      trivia: body.trivia,
      created: body.createdAt,
      updated: body.updatedAt
    };
    /**
    question: {
      "objectId": body.questionId,
      "___class": "Question"
    },
     */
    var backendlessQuestion = require('cloud/backendlessQuestion.js');
    backendlessQuestion.get(body.objectId, newBody,
      backendlessQuestion.put,
      backendlessQuestion.post, response);
  }
  else {
    response.error('Missing objectId for Question!');
    console.error(body);
  }
});

Parse.Cloud.job("reportMigration", function(request, response) {
  var body = JSON.parse(request.body);
  if (body.objectId && body.questionId) {
    var newBody = {
      question: {
        "objectId": body.questionId,
        "___class": "Question"
      },
      created: body.createdAt,
      updated: body.updatedAt
    };
    var backendlessReport = require('cloud/backendlessReport.js');
    backendlessReport.getBackendlessReport(newBody,
      backendlessReport.putBackendlessReport,
      backendlessReport.postBackendlessReport, response);
  }
  else {
    response.error('Missing objectId or questionId for Report!');
    console.error(body);
  }
});
/**
{
  "createdAt": "2016-07-31T00:24:17.344Z",
  "plays": {
    "__type": "Relation",
    "className": "Play"
  },
  "set": "Jul 30 2016\nDave Matthews Band\nPerfect Vodka Amphitheatre\nWest Palm Beach, FL\n\nSquirm\nCrash Into Me\nPig\nCrush\nBob Law\nGranny\nCorn Bread\nDigging a Ditch\nSugar Will\nDon\u0092t Drink the Water\nGravedigger\nWhere Are You Going\nDancing Nancies\nYou and Me\nThe Best of Whats Around\nTypical Situation\nAnts Marching\n\nEncore:\nTwo Step ->\nHalloween\n\nNotes:\n-> indicates a segue into next song",
  "setDate": {
    "__type": "Date",
    "iso": "2016-07-30T00:00:00.000Z"
  },
  "updatedAt": "2016-08-15T02:17:33.299Z",
  "venue": {
    "__type": "Pointer",
    "className": "Venue",
    "objectId": "x8zvZSgsOI"
  },
  "objectId": "0ZSRI8wzH5"
}

{
  "created": "2016-07-31T00:24:17.344Z",
  "set": "July 30 2016\nDave Matthews Band\nPerfect Vodka Amphitheatre\nWest Palm Beach, FL\n\nSquirm\nCrash Into Me\nPig\nCrush\nBob Law\nGranny\nCorn Bread\nDigging a Ditch\nSugar Will\nDon\u0092t Drink the Water\nGravedigger\nWhere Are You Going\nDancing Nancies\nYou and Me\nThe Best of Whats Around\nTypical Situation\nAnts Marching\n\nEncore:\nTwo Step ->\nHalloween\n\nNotes:\n-> indicates a segue into next song",
  "setDate": "2016-07-30T00:00:00.000Z",
  "updated": "2016-08-15T02:33:17.912Z",
  "venue": {
    "objectId": "x8zvZSgsOI",
    "___class": "Venue"
  }
}
 */
Parse.Cloud.job("setlistMigration", function(request, response) {
  var oldBody = JSON.parse(request.body);
  var parseVenue = require('cloud/parseVenue.js');
  parseVenue.getParseVenue(oldBody.venue.objectId,
    function(httpResponseText) {
      console.log('Venue get success!');
      Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.parse.com/1/jobs/venueMigration',
        headers: {
          'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
          'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: httpResponseText
      }).then(function(httpResponse) {
        console.log('Venue after save success');
        console.log(httpResponse);
        var venue = JSON.parse(httpResponseText);
        var backendlessVenue = require('cloud/backendlessVenue.js');
        backendlessVenue.getBackendlessVenue(venue.name, null,
          function(objectId, body, success, error, response, httpResponse) {
            console.log("success httpResponse:");
            console.log(JSON.parse(httpResponse.text).data[0].objectId);
            var newId = JSON.parse(httpResponse.text).data[0].objectId;
            console.log('oldBody:');
            console.log(oldBody);
            var newBody = {
              created: oldBody.createdAt,
              set: oldBody.set,
              setDate: oldBody.setDate.iso,
              updated: oldBody.updatedAt,
              venue: {
                objectId: newId,
                ___class: "Venue"
              }
            };
            console.log('newBody:');
            console.log(newBody);
            var backendlessSetlist = require('cloud/backendlessSetlist.js');
            if (oldBody.objectId) {
              backendlessSetlist.getBackendlessSetlist(oldBody.objectId,
                newBody, backendlessSetlist.putBackendlessSetlist,
                backendlessSetlist.postBackendlessSetlist, response);
            }
            else {
              response.error('No objectId for Setlist!');
              console.error(oldBody);
            }
          },
          function(body, success, error, response, httpResponse) {
            console.log("error httpResponse:");
            console.log(httpResponse);
          }, httpResponse);
      }, function(httpResponse) {
        console.log('Venue after save failure');
        console.log(httpResponse);
      });
      console.log(httpResponseText);
    },
    function(httpResponseText) {
      console.log('Venue get failure!');
      console.log(httpResponseText);
    }
  );
});

Parse.Cloud.job("venueMigration", function(request, response) {
  var body = JSON.parse(request.body);
  var newBody = {
    city: body.city,
    created: body.createdAt,
    name: body.name,
    updated: body.updatedAt
  };
  var backendlessVenue = require('cloud/backendlessVenue.js');
  if (body.objectId) {
    backendlessVenue.getBackendlessVenue(body.name, newBody,
      backendlessVenue.putBackendlessVenue,
      backendlessVenue.postBackendlessVenue, response);
  }
  else {
    response.error('No objectId for Venue!');
    console.error(body);
  }
});

Parse.Cloud.job('stageTransfer', function(request, response) {
  var query = new Parse.Query("Stage");
  query.each(function (stage) {
    var start = new Date().getTime();
    while (new Date().getTime() < start+1000) {
    }
    console.log(stage);
    Parse.Cloud.httpRequest({
      method: 'POST',
      url: 'https://api.parse.com/1/jobs/stageMigration',
      headers: {
        'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
        'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: stage
    }).then(function(httpResponse) {}, function(httpResponse) {});
  }, {
    success: function () {
      response.success("success");
    },
    error: function () {
      response.error("error");
    }
  });
});

Parse.Cloud.job('stageMigration', function(request, response) {
    var body = JSON.parse(request.body);
    var userObject;
    var hintArray;
    var skipArray;
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://api.backendless.com/v1/data/Users/' + body.userId +
            '?loadRelations=correct',
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        }
    }).then(function(httpResponse) {
        userObject = JSON.parse(httpResponse.text);
        hintArray = JSON.parse(httpResponse.text).hint;
        skipArray = JSON.parse(httpResponse.text).skip;
        if (body.hint) {
            var hint = {
                "objectId": body.questionId,
                "___class": "Question"
            };
            hintArray.push(hint);
            userObject.hint = hintArray;
        }
        if (body.skip) {
            var skip = {
                "objectId": body.questionId,
                "___class": "Question"
            };
            skipArray.push(skip);
            userObject.skip = skipArray;
        }
        var params = JSON.stringify(userObject);
        Parse.Cloud.httpRequest({
            method: 'PUT',
            url: 'https://api.backendless.com/v1/data/Users/' + body.userId,
            headers: {
                'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
                'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
                'Content-Type': 'application/json',
                'application-type': 'REST'
            },
            body: params
        }).then(function(httpResponse) {
          response.success("PUT User " + body.userId + " SUCCESS: " + httpResponse);
        }, function(httpResponse) {
          response.error("PUT User " + body.userId + " FAILED: " + httpResponse);
        });
    }, function(httpResponse) {
      response.error("GET User " + body.userId + " FAILED: " + httpResponse);
    });
});

/******************************************************************************/
/*********************************After Save***********************************/
/******************************************************************************/
Parse.Cloud.afterSave('Question', function(request) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/questionMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {
    //console.log(httpResponse);
  }, function(httpResponse) {
    //console.error(httpResponse);
  });
});

Parse.Cloud.afterSave('Report', function(request) {
  console.log('Report AfterSave');
  console.log(request);
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/reportMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {
    console.log('Report after save success');
    console.log(httpResponse);
  }, function(httpResponse) {
    console.log('Report after save failure');
    console.log(httpResponse);
  });
});
/**
{
  "createdAt": "2016-07-31T00:24:17.344Z",
  "plays": {
    "__type": "Relation",
    "className": "Play"
  },
  "set": "Jul 30 2016\nDave Matthews Band\nPerfect Vodka Amphitheatre\nWest Palm Beach, FL\n\nSquirm\nCrash Into Me\nPig\nCrush\nBob Law\nGranny\nCorn Bread\nDigging a Ditch\nSugar Will\nDon\u0092t Drink the Water\nGravedigger\nWhere Are You Going\nDancing Nancies\nYou and Me\nThe Best of Whats Around\nTypical Situation\nAnts Marching\n\nEncore:\nTwo Step ->\nHalloween\n\nNotes:\n-> indicates a segue into next song",
  "setDate": {
    "__type": "Date",
    "iso": "2016-07-30T00:00:00.000Z"
  },
  "updatedAt": "2016-08-15T02:17:33.299Z",
  "venue": {
    "__type": "Pointer",
    "className": "Venue",
    "objectId": "x8zvZSgsOI"
  },
  "objectId": "0ZSRI8wzH5"
}
*/
/**
Parse.Cloud.afterSave('Setlist', function(request) {
  console.log('Setlist');
  console.log(request.object);
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/setlistMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {
    console.log('Setlist after save success');
    console.log(httpResponse);
  }, function(httpResponse) {
    console.log('Setlist after save failure');
    console.error(httpResponse);
  });
});

Parse.Cloud.afterSave('Venue', function(request) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/venueMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {
    console.log('Venue after save success');
    console.log(httpResponse);
  }, function(httpResponse) {
    console.log('Venue after save failure');
    console.log(httpResponse);
  });
});
*/


/******************************************************************************/
/*************************************Old**************************************/
/******************************************************************************/
/**
Parse.Cloud.afterSave('CorrectAnswers', function(request) {
    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.parse.com/1/jobs/correctAnswersMigration',
        headers: {
            'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
            'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: request.object
    }).then(function(httpResponse) {
        //console.log(httpResponse);
    }, function(httpResponse) {
        //console.error('**************************************************');
        //console.error('POST to correctAnswersMigration failed with response code ' +
        //    httpResponse.status);
        //console.error(httpResponse);
        //console.error('**************************************************');
    });
});
*/
Parse.Cloud.afterSave('Stage', function(request) {
  Parse.Cloud.httpRequest({
    method: 'POST',
    url: 'https://api.parse.com/1/jobs/stageMigration',
    headers: {
      'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
      'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      'Content-Type': 'application/json;charset=utf-8'
    },
    body: request.object
  }).then(function(httpResponse) {}, function(httpResponse) {});
});
