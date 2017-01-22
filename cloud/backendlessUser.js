module.exports = {
  /**
   * Grab a user from Backendless given uniquely identifiable data
   * Updates the user if present, otherwise logs that user doesn't exist
   * Users must be created directly using Backendless API
   *
   * @param {string} objectId - value expected in the objectId column
   * @param {string} username - value expected in the username column
   * @param {string} relations - column name to load relations from
   * @param {Object} data - user data from Parse to be saved to Backendless
   * if applicable
   * @param {updateCallback} updateCallback - callback that updates data in
   * Backendless if user already exists
   */
  getBackendlessUser: function (objectId, username, relations, data,
      updateCallback) {
    var queryParams = "?where=";
    if (objectId) {
      queryParams += "objectId%3D'" + objectId + "'";
    } else if (username) {
      queryParams += "username%3D'" + username + "'";
    } else {
      queryParams = '';
    }
    if (relations) {
      if (queryParams) {
        queryParams += "&loadRelations=" + relations;
      } else {
        queryParams = "?loadRelations=" + relations;
      }
    }
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://api.backendless.com/v1/data/Users' + queryParams,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        }
    }).then(function(httpResponse) {
      var json = httpResponse.data.data;
      if (json.length > 0) {
        updateCallback(json[0].username, json[0], console.log, console.log);
      } else {
        console.log("No user exists in Backendless:");
        console.log(queryParams);
      }
    }, function(httpResponse) {
      console.log("GET Backendless user FAILED with " + queryParams);
      var json = JSON.parse(httpResponse);
      console.log("Response:");
      console.log(json);
    });
  },
  /**
   * Update a user in Backendless
   *
   * @callback updateCallback
   * @param {string} username - value expected in the username column
   * @param {Object} data - user data to update the user to
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  putBackendlessUser: function (username, data, successCallback, errorCallback) {
    var objectId;
    if (data.created) {
      delete data.created;
    }
    if (data.updated) {
      delete data.updated;
    }
    if (data.objectId) {
      objectId = data.objectId;
      delete data.objectId;
    }
    if (data.username) {
      delete data.username;
    }
    if (data.lastLogin === null || data.lastLogin) {
      delete data.lastLogin;
    }
    if (data.userStatus) {
      delete data.userStatus;
    }
    if (data.email === null || data.email) {
      delete data.email;
    }
    if (data.updatedAt) {
      delete data.updatedAt;
    }
    if (data.createdAt) {
      delete data.createdAt;
    }
    if (!data.username) {
      data.username = username;
    }
    if (!data.password) {
      data.password = "";
    }
    data = JSON.stringify(data);
    Parse.Cloud.httpRequest({
        method: 'PUT',
        url: 'https://api.backendless.com/v1/data/Users/' + objectId,
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
    }, function(httpResponse) {
      console.log("Error");
      if (errorCallback) {
        errorCallback(httpResponse.text);
      } else {
        console.log(httpResponse.text);
      }
    });
  },
  /**
   * NOT FUNCTIONING - NEED TO USE THE CREATE USER API
   * Create a user in Backendless
   *
   * @param {Object} data - data of user to create
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  postBackendlessUser: function (data, successCallback, errorCallback) {
    console.log("postBackendlessUser");
    console.log(data);
    var authData = JSON.stringify(data.authData);
    var parameters = {
        "authData": authData,
        "createdAt": data.createdAt,
        "displayName": data.displayName,
        "score": data.score,
        "sessionToken": data.sessionToken,
        "updatedAt": data.updatedAt,
        "username": "'" + data.username + "'",
        "password": "'" + data.password + "'"
    };
    var params = JSON.stringify(parameters);
    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.backendless.com/v1/data/Users',
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        },
        body: params
    }).then(function(httpResponse) {
      console.log("Success");
      if (successCallback) {
        successCallback(body);
      } else {
        console.log(httpResponse.text);
      }
    }, function(httpResponse) {
      console.log("Error");
      if (errorCallback) {
        errorCallback(body);
      } else {
        console.log(httpResponse.text);
      }
    });
  }
}
