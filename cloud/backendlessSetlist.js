module.exports = {
  getBackendlessSetlist: function(objectId, body, success, error, response) {
    console.log('getBackendlessSetlist');
    console.log('body:');
    console.log(body);
    var queryParams = '?where=objectId%3D\'' + objectId + '\'';
    console.log('https://api.backendless.com/v1/data/Setlist' + queryParams);
    Parse.Cloud.httpRequest({
        method: 'GET',
        url: 'https://api.backendless.com/v1/data/Setlist' + queryParams,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        }
    }).then(function(httpResponse) {
      if (httpResponse.data.totalObjects === 0) {
        console.log('objects 0');
        if (error) {
          error(body, null, null, response);
        }
        else {
          reponse.success('Object ' + objectId + ' not found!')
        }
      }
      else {
        console.log('objects not 0');
        if (success) {
          success(objectId, body, null, null, response);
        }
        else {
          response.error('Object ' + objectId + ' found!');
        }
      }
    }, function(httpResponse) {
      response.error(httpResponse.message);
    });
  },
  putBackendlessSetlist: function(objectId, body, success, error, response) {
    console.log('putBackendlessSetlist');
    var queryParams = '?where=objectId%3D\'' + objectId + '\'';
    Parse.Cloud.httpRequest({
        method: 'PUT',
        url: 'https://api.backendless.com/v1/data/Setlist' + queryParams,
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        },
        body: JSON.stringify(body)
    }).then(function(httpResponse) {
      if (success) {
        success(objectId, body);
      }
      else {
        response.success('Success');
      }
    }, function(httpResponse) {
      if (error) {
        error(body);
      }
      else {
        response.error(httpResponse.message);
      }
    });
  },
  postBackendlessSetlist: function(body, success, error, response) {
    console.log('postBackendlessSetlist');
    console.log(body);
    console.log(JSON.stringify(body));
    Parse.Cloud.httpRequest({
        method: 'POST',
        url: 'https://api.backendless.com/v1/data/Setlist',
        headers: {
            'application-id': 'F1672081-F7D4-EF63-FFB1-BB39109F8500',
            'secret-key': '6F3CD423-E453-D5D1-FF70-46C165C6E500',
            'Content-Type': 'application/json',
            'application-type': 'REST'
        },
        body: JSON.stringify(body)
    }).then(function(httpResponse) {
      console.log('post finished:');
      console.log(httpResponse.body);
      if (success) {
        success(body);
      }
      else {
        response.success('Success');
      }
    }, function(httpResponse) {
      console.log('post error:');
      console.log(httpResponse);
      if (error) {
        error(body);
      }
      else {
        response.error(httpResponse.message);
      }
    });
  }
}
