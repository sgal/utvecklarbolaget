# utvecklarbolaget
Utvecklarbolaget responsive website

## Deploying changes to firebase (demo site)

After you're done with the changes, here's the way how to upload new build to firebase.

1. Install [firebase-tools](https://github.com/firebase/firebase-tools) - `npm i -g firebase-tools`
2. Run `firebase login`
3. Browser window will be opened - you need to log in with the credentials provided in email
4. Build project `gulp build`
5. Run `firebase deploy`
6. Check that the changes are available on the [demo site](https://utvecklarbolaget.firebaseapp.com)
