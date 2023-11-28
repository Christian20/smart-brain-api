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

const handleClarifaiAPICall = (req, res, ClarifaiStub, grpc) => {
    // Your PAT (Personal Access Token) can be found in the portal under Authentification
    const PAT = 'd33d1ad2d50540f6bb4390f7bfc3f90b';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = 'winter20';       
    const APP_ID = 'smart-brain';
    // Change these to whatever model and image URL you want to use
    const MODEL_ID = 'face-detection';
    const IMAGE_URL = req.body.imageUrl;

    const stub = ClarifaiStub.grpc();

    // This will be used by every Clarifai endpoint call
    const metadata = new grpc.Metadata();
    metadata.set("authorization", "Key " + PAT);

    stub.PostModelOutputs(
        {
            user_app_id: {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            model_id: MODEL_ID,
            inputs: [
                { data: { image: { url: IMAGE_URL, allow_duplicate_url: true } } }
            ]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.error(err);
                return res.status(500).json('Error calling Clarifai API');
            }
            
            if (response.status.code !== 10000) {
                console.error("Post model outputs failed, status: " + response.status.description);
                return res.status(400).json('Clarifai API request failed');
            }

            // // Since we have one input, one output will exist here
            // const output = response.outputs[0];

            // console.log("Predicted concepts:");
            // for (const concept of output.data.concepts) {
            //     console.log(concept.name + " " + concept.value);
            // }
            res.json(response);
        }
    );
}

export { handleImage, handleClarifaiAPICall };