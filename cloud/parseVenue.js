module.exports.getParseVenue = function (venueId, callback, error) {
  Parse.Cloud.httpRequest({
      method: 'GET',
      url: 'https://api.parse.com/1/classes/Venue/' + venueId,
      headers: {
          'X-Parse-Application-Id': 'ImI8mt1EM3NhZNRqYZOyQpNSwlfsswW73mHsZV3R',
          'X-Parse-Master-Key': 'QirtSimQTDJhPsCsIdGbEz9ymw5gclXhugs0l6ZD',
          'Content-Type': 'application/json;charset=utf-8'
      }
  }).then(function(httpResponse) {
    if (callback) {
      callback(httpResponse.text);
    }
  }, function(httpResponse) {
    if (error) {
      error(httpResponse.text);
    }
  });
};
