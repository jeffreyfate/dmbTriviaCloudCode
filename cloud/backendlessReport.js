module.exports = {
  getBackendlessReport: function(body, success, error, response) {
    var queryParams = '?where=objectId%3D\'' + body.objectId + '\'';
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://api.backendless.com/v1/data/Report' + queryParams,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        }
    }).then(function(httpResponse) {
      if (httpResponse.data.totalObjects === 0) {
        if (error) {
          error(body, null, null, response);
        }
        else {
          response.success('Report ' + body.objectId + ' not found!')
        }
      }
      else {
        if (success) {
          success(body, null, null, response);
        }
        else {
          response.error('Report ' + body.objectId + ' found!');
        }
      }
    }, function(httpResponse) {
      response.error('Failed GET for report ' + body.objectId +
        ' in Backendless!');
    });
  },
  putBackendlessReport: function(body, success, error, response) {
    var queryParams = '?where=objectId%3D\'' + body.objectId + '\'';
    Parse.Cloud.httpRequest({
        method: 'PUT',
        url: 'https://api.backendless.com/v1/data/Report' + queryParams,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        },
        body: JSON.stringify(body)
    }).then(function(httpResponse) {
      if (success) {
        success(name, body);
      }
      else {
        response.success('Successfully updated report!');
      }
    }, function(httpResponse) {
      if (error) {
        error(body);
      }
      else {
        response.error('Unable to update report!');
      }
    });
  },
  postBackendlessReport: function(body, success, error, response) {
    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.backendless.com/v1/data/Report',
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        },
        body: JSON.stringify(body)
    }).then(function(httpResponse) {
      if (success) {
        success(body);
      }
      else {
        response.success('Successfully created report!');
      }
    }, function(httpResponse) {
      if (error) {
        error(body);
      }
      else {
        response.error('Unable to create new report!');
        console.error(httpResponse);
      }
    });
  }
}
