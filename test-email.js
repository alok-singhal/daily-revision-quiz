const { google } = require("googleapis");

function getGmailAuth() {
  const credentials = JSON.parse(process.env.GMAIL_CREDENTIALS || "{}");
  const token = JSON.parse(process.env.GMAIL_TOKEN || "{}");
  
  console.log("Credentials keys:", Object.keys(credentials));
  console.log("Token keys:", Object.keys(token));
  
  if (!credentials.installed && !credentials.web) {
    console.log("❌ No valid credentials found");
    return null;
  }
  
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function testEmail() {
  console.log("Testing email configuration...");
  
  const auth = getGmailAuth();
  if (!auth) {
    console.error("❌ Gmail credentials not configured");
    return false;
  }
  
  try {
    const gmail = google.gmail({ version: "v1", auth });
    const profile = await gmail.users.getProfile({ userId: "me" });
    console.log("✅ Gmail authentication successful");
    console.log("Email address:", profile.data.emailAddress);
    return true;
  } catch (err) {
    console.error("❌ Gmail authentication failed:", err.message);
    return false;
  }
}

testEmail();