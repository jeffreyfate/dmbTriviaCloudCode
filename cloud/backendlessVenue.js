module.exports = {
  getBackendlessVenue: function(name, body, success, error, response) {
    var queryParams = '?where=name%3D\'' + encodeURIComponent(name) + '\'';
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://api.backendless.com/v1/data/Venue' + queryParams,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        }
    }).then(function(httpResponse) {
      if (httpResponse.data.totalObjects === 0) {
        if (error) {
          error(body, null, null, response, httpResponse);
        }
        else {
          response.success('Venue ' + name + ' not found!')
        }
      }
      else {
        if (success) {
          success(name, body, null, null, response, httpResponse);
        }
        else {
          response.error('Venue ' + name + ' found!');
        }
      }
    }, function(httpResponse) {
      response.error('Failed GET for venue ' + name + ' in Backendless!');
    });
  },
  putBackendlessVenue: function(name, body, success, error, response) {
    var queryParams = '?where=name%3D\'' + encodeURIComponent(name) + '\'';
    console.log('body:');
    console.log(body);
    Parse.Cloud.httpRequest({
        method: 'PUT',
        url: 'https://api.backendless.com/v1/data/Venue' + queryParams,
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
        response.success('Successfully updated venue!');
      }
    }, function(httpResponse) {
      if (error) {
        error(body);
      }
      else {
        response.error('Unable to update venue!');
      }
    });
  },
  postBackendlessVenue: function(body, success, error, response) {
    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.backendless.com/v1/data/Venue',
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
        response.success('Successfully created venue!');
      }
    }, function(httpResponse) {
      if (error) {
        error(body);
      }
      else {
        response.error('Unable to create new venue!');
      }
    });
  }
}
