const handleImage = (req, res, db) => {
    const { id } = req.body;
    db('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then (entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'));
}

const handleClarifaiAPICall = (req, res) => {
    const returnClarifaiRequestOptions = (imageUrl) => {
        // Your PAT (Personal Access Token) can be found in the portal under Authentification
        const PAT = 'd33d1ad2d50540f6bb4390f7bfc3f90b';
        // Specify the correct user_id/app_id pairings
        // Since you're making inferences outside your app's scope
        const USER_ID = 'winter20';       
        const APP_ID = 'face-detection';
        // Change these to whatever model and image URL you want to use  
        const IMAGE_URL = imageUrl;      
        const raw = JSON.stringify({
          "user_app_id": {
              "user_id": USER_ID,
              "app_id": APP_ID
          },
          "inputs": [
              {
                  "data": {
                      "image": {
                          "url": IMAGE_URL
                      }
                  }
              }
            ]
        });      
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Key ' + PAT
            },
            body: raw
        };     
        return requestOptions;
    }
    const { imageUrl } = req.body;
    fetch("https://api.clarifai.com/v2/models/face-detection/outputs", returnClarifaiRequestOptions(imageUrl))
        .then(response => response.json())
        .then(response => {
        res.json(response);
        })
        .catch(err => res.status(400).json('Unable to work with Clarifai API'));
}

export { handleImage, handleClarifaiAPICall };