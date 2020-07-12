import * as admin from "firebase-admin";

if (!process.env.GOOGLE_SERVICE_ACCOUNT) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT must be defined");
}
const { GOOGLE_SERVICE_ACCOUNT } = process.env;
const serviceAccount = JSON.parse(GOOGLE_SERVICE_ACCOUNT);

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(serviceAccount)),
  databaseURL: "https://bunch-of-nothing.firebaseio.com",
});

export default admin;
