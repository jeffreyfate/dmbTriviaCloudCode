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
    var parseFile = require('cloud/parseFile.js');
    parseFile.get(data.file.url, console.log, console.log);
    var queryParams = "?where=";
    if (data.name) {
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
        updateCallback(json[0], console.log, console.log, response);
      } else {
        console.log("No audio exists in Backendless:");
        console.log(queryParams);
        createCallback(data, console.log, console.log, response);
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
  putBackendlessAudio: function (data, successCallback, errorCallback, response) {
    var objectId;
    if (data.objectId) {
      objectId = data.objectId;
      delete data.objectId;
    }
    if (data.updatedAt) {
      delete data.updatedAt;
    }
    if (data.createdAt) {
      delete data.createdAt;
    }
    data = JSON.stringify(data);
    Parse.Cloud.httpRequest({
        method: 'PUT',
        url: 'https://api.backendless.com/v1/data/Audio/' + objectId,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        },
        body: data
    }).then(function(httpResponse) {
      console.log("Success");
      if (successCallback) {
        successCallback(httpResponse.text);
      } else {
        console.log(httpResponse.text);
      }
      response.success(objectId + " updated");
    }, function(httpResponse) {
      console.log("Error");
      if (errorCallback) {
        errorCallback(httpResponse.text);
      } else {
        console.log(httpResponse.text);
      }
      response.error(objectId + " update failed");
    });
  },
  /**
   * Create audio in Backendless
   *
   * @callback createCallback
   * @param {Object} data - data to create
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  put: function (data, path) {
    if (!data) {
      return null;
    }
    return Parse.Cloud.httpRequest({
        method: 'PUT',
        url: 'https://api.backendless.com/v1/files/binary/' + path + '?overwrite=true',
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'text/plain',
            'application-type': 'REST'
        },
        body: data
    }).then(function(httpResponse) {
      console.log("Success");
      console.log(httpResponse.data);
      return httpResponse.data;
    }, function(httpResponse) {
      console.log("Error");
      return null;
    });
  }
}
