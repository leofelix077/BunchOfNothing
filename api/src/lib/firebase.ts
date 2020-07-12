/* eslint-disable @typescript-eslint/camelcase */
import * as admin from "firebase-admin";

if (!process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("FIREBASE_PRIVATE_KEY must be defined");
}
if (!process.env.FIREBASE_PRIVATE_KEY_ID) {
  throw new Error("FIREBASE_PRIVATE_KEY_ID must be defined");
}

const { FIREBASE_PRIVATE_KEY, FIREBASE_PRIVATE_KEY_ID } = process.env;

admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "bunch-of-nothing",
    private_key_id: FIREBASE_PRIVATE_KEY_ID,
    private_key: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email:
      "firebase-adminsdk-wm9wq@bunch-of-nothing.iam.gserviceaccount.com",
    client_id: "106935929730276423693",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wm9wq%40bunch-of-nothing.iam.gserviceaccount.com",
  } as any),
  databaseURL: "https://bunch-of-nothing.firebaseio.com",
});

export default admin;
