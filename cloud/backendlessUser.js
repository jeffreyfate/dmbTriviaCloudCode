module.exports = {
  /**
   * Finds a user in Backendless given uniquely identifiable data then updates the user if present, otherwise logs that
   * the user doesn't exist.
   *
   * Note: Users must be created directly using Backendless API
   *
   * @param {string} username - value expected in the username column
   * @param {string} relations - column name to load relations from
   * @param {Object} data - user data from Parse to be saved to Backendless
   * if applicable
   * @param {updateCallback} updateCallback - callback that updates data in Backendless if user already exists
   * @param {Object} response - returned from the cloud job
   */
  get: function (username, relations, data, updateCallback, response) {
    var queryParams = "?where=";
    if (username) {
      queryParams += "username%3D%27" + username + "%27";
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
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500'
        }
    }).then(function(httpResponse) {
      var json = httpResponse.data.data;
      if (json.length > 0) {
        updateCallback(json[0].username, data, json[0], response.success, response.error);
      } else {
        response.success(httpResponse.text);
      }
    }, function(httpResponse) {
      response.error(httpResponse.text);
    });
  },
  /**
   * Update a user in Backendless with data from Parse.
   *
   * @callback updateCallback
   * @param {string} username - value expected in the username column
   * @param {Object} data - user data to update the user to
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  put: function (username, data, successCallback, errorCallback) {
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
      if (successCallback) {
        successCallback(httpResponse.text);
      } else {
        console.log(httpResponse.text);
      }
    }, function(httpResponse) {
      if (errorCallback) {
        errorCallback(httpResponse.text);
      } else {
        console.log(httpResponse.text);
      }
    });
  },
  /**
   * Create a user in Backendless via the user register API.
   *
   * @callback createCallback
   * @param {Object} data - data of user to create
   * @param {stringCallback} successCallback - handle success message
   * @param {stringCallback} errorCallback - handle error message
   */
  post: function (data, successCallback, errorCallback) {
    var authData = "";
    var parameters = "";
    if (data && data.authData) {
      authData = JSON.stringify(data.authData);
      parameters = {
          "authData": authData,
          "createdAt": data.createdAt,
          "displayName": data.displayName,
          "score": data.score,
          "sessionToken": data.sessionToken,
          "updatedAt": data.updatedAt,
          "username": "'" + data.username + "'",
          "password": "'" + data.password + "'"
      };
    }
    var params = JSON.stringify(parameters);
    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.backendless.com/v1/users/register',
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        },
        body: params
    }).then(function(httpResponse) {
      if (successCallback) {
        successCallback(httpResponse.text);
      } else {
        console.log(httpResponse.text);
      }
    }, function(httpResponse) {
      if (errorCallback) {
        errorCallback(httpResponse.text);
      } else {
        console.log(httpResponse.text);
      }
    });
  }
};
