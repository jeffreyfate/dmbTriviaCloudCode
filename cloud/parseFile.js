module.exports.get = function (fileUrl) {
  return Parse.Cloud.httpRequest({
      method: 'GET',
      url: fileUrl,
      headers: {
          'Content-Type': 'audio/mpeg3'
      }
  }).then(function(httpResponse) {
    console.log("parseFile.get:");
    console.log(httpResponse);
    console.log(httpResponse.buffer.toString('base64'));
    return httpResponse.buffer.toString('base64');
  }, function(httpResponse) {
    console.log("ERROR parseFile.get:");
    console.log(httpResponse);
    return null;
  });
};
