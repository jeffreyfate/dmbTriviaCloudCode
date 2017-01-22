function putAudio(target, response) {
  Parse.Cloud.httpRequest({
      method: 'PUT',
      url: 'https://api.backendless.com/v1/data/Audio/' + target.objectId,
      headers: {
          'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
          'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
          'Content-Type': 'application/json',
          'application-type': 'REST'
      },
      body: JSON.stringify(target)
  }).then(function(httpResponse) {
    console.log("Success");
    console.log(httpResponse.text);
    response.success(target.objectId + " updated");
  }, function(httpResponse) {
    console.log("Error");
    console.log(httpResponse.text);
    response.error(target.objectId + " update failed");
  });
}

function postAudio(target, response) {
  Parse.Cloud.httpRequest({
      method: 'POST',
      url: 'https://api.backendless.com/v1/data/Audio',
      headers: {
          'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
          'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
          'Content-Type': 'application/json',
          'application-type': 'REST'
      },
      body: JSON.stringify(target)
  }).then(function(httpResponse) {
    console.log("Success");
    console.log(httpResponse.text);
    response.success(target.name + " created");
  }, function(httpResponse) {
    console.log("Error");
    console.log(httpResponse.text);
    response.error(target.name + " create failed");
  });
}

function deleteAudio(target) {
  Parse.Cloud.httpRequest({
      method: 'DELETE',
      url: 'https://api.backendless.com/v1/data/Audio/' + target.objectId,
      headers: {
          'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
          'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
          'application-type': 'REST'
      }
  }).then(function(httpResponse) {
    console.log("Success");
    console.log(httpResponse.text);
  }, function(httpResponse) {
    console.log("Error");
    console.log(httpResponse.text);
  });
}

module.exports = {
  /**
   * Grab audio from Backendless given uniquely identifiable data
   * Updates the audio if present, otherwise creates the audio record
   *
   * @param {Object} data - data from Parse to be saved to Backendless
   * @param {updateCallback} updateCallback - callback that updates data in Backendless if already exists
   * @param {createCallback} createCallback - callback that creates data in Backendless
   */
  getBackendlessAudio: function (data, updateCallback, createCallback, response) {
    var queryParams = "?where=";
    if (data && data.name) {
      queryParams += "name%3D'" + data.name + "'";
    } else {
      queryParams = '';
    }
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://api.backendless.com/v1/data/Audio' + queryParams,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        }
    }).then(function(httpResponse) {
      var json = httpResponse.data.data;
      if (json.length > 0) {
        updateCallback(data, json[0], console.log, console.log, response);
      } else if (createCallback) {
        console.log("No audio exists in Backendless:");
        console.log(queryParams);
        createCallback(data, console.log, console.log, response);
      } else {
        console.log("No audio found and no createCallback defined");
      }
    }, function(httpResponse) {
      console.log("GET Backendless audio FAILED with " + queryParams);
      var json = JSON.parse(httpResponse);
      console.log("Response:");
      console.log(json);
      response.error("GET Backendless audio FAILED with " + queryParams)
    });
  },
  /**
   * Update audio in Backendless
   *
   * @callback updateCallback
   * @param {Object} data - data to update
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  putBackendlessAudio: function (source, target, successCallback, errorCallback, response) {
    if (!source) {
      response.error("No source provided");
      return;
    }
    if (!target) {
      response.error("No target provided");
      return;
    }
    var parseFile = require('cloud/parseFile.js');
    var backendlessFile = require('cloud/backendlessFile.js');

    var fileUrl;
    if (source.file && source.file.url) {
      fileUrl = source.file.url;
    }

    if (fileUrl) {
      parseFile.get(fileUrl).then(function (fileContents) {
        return fileContents;
      }).then(function (fileContents) {
        backendlessFile.put(fileContents, 'media/audio/' + target.objectId + '-' + source.name + '.mp3').then(function (url) {
          return url;
        }).then(function (url) {
          target.file = url;
          target.ref = url;
          putAudio(target, response);
        })
      });
    } else {
      target.file = null;
      target.ref = null;
      putAudio(target, response);
    }

  },
  /**
   * Create audio in Backendless
   *
   * @callback createCallback
   * @param {Object} source - data from Parse
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  postBackendlessAudio: function (source, successCallback, errorCallback, response) {
    if (!source) {
      response.error("No source data provided");
      return;
    }

    var parseFile = require('cloud/parseFile.js');
    var backendlessFile = require('cloud/backendlessFile.js');

    var fileUrl;
    if (source.file && source.file.url) {
      fileUrl = source.file.url;
    }

    var target = {
        "createdAt": source.createdAt,
        "name": source.name,
        "updatedAt": source.updatedAt
    };

    if (fileUrl) {
      parseFile.get(fileUrl).then(function (fileContents) {
        return fileContents;
      }).then(function (fileContents) {
        backendlessFile.put(fileContents, 'media/audio/' + source.objectId + '-' + source.name + '.mp3').then(function (url) {
          return url;
        }).then(function (url) {
          target.file = url;
          target.ref = url;
          postAudio(target, response);
        })
      });
    } else {
      target.file = null;
      target.ref = null;
      postAudio(target, response);
    }
  },
  /**
   * Delete audio from Backendless
   *
   * @callback createCallback
   * @param {Object} source - data from Parse
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  deleteBackendlessAudio: function (source, target, successCallback, errorCallback, response) {
    if (!source) {
      console.log("No source data provided");
      return;
    }

    deleteAudio(target);
  }
}
