module.exports.get = function (questionId, callback, error) {
  console.log("fetching " + questionId + " question");
  Parse.Cloud.httpRequest({
      method: 'GET',
      url: 'https://api.parse.com/1/classes/Question/' + questionId,
      headers: {
          'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
          'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
      }
  }).then(function(httpResponse) {
    console.log("get question success");
    if (callback) {
      callback(httpResponse.text);
    } else {
      console.log(httpResponse.text);
    }
  }, function(httpResponse) {
    console.log("get question error");
    if (error) {
      error(httpResponse.text);
    } else {
      console.log(httpResponse.text);
    }
  });
};
