require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');

// Getting github repositry, file name and mongoDB atlas cluster url from .env file.
let githubRepo = process.env.GITHUB_REPO;
let githubFileName = process.env.GITHUB_FILE_NAME;
const mongoURI = process.env.MONGO_URI;

// Connecting to MongoDB cluster
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error during connecting to MongoDB:'));
db.once('open', () => {
  console.log('Database Connected');
});

// Schema for Database
const PersonalIdentifiableInformationSchema = new mongoose.Schema({
  name: String,
  regexPattern: String,
  sensitive: Boolean,
  onKey: Boolean
},{ strict: false });

// Model for PII Data
const PIIModel = mongoose.model('Pii', PersonalIdentifiableInformationSchema);

// Function to fetch data and store it in MongoDB cluster.
const DataFetching = async () => {

  try {
    // Fetching data from Github from a particular file from repositry using Github Rest API.
    const url = `https://api.github.com/repos/${githubRepo}/contents/${githubFileName}`;
    const token = process.env.GITHUB_TOKEN;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
    const parsedContent = JSON.parse(content);
    const data = parsedContent.types;

    //Checking the obtained data from api is an array or not.
    if (!Array.isArray(data)) {
        throw new Error('Unsupported data format');
    }

    // If the data obtained is an array
    // Getting documents already existing in the collection.
    const existingDocuments = await PIIModel.find({});
    // console.log(existingDocuments);

    // Storing the name of existing in the document in a set. 
    let existingNames = new Set(existingDocuments.map(entry => entry.name));
    // console.log(existingNames);

    //Finding updated entries in the data obtained.
    const entry_Updated = data.filter(entry => existingNames.has(entry.name));

    // Finding new entries in the data obtained.
    const entry_New = data.filter(entry => !existingNames.has(entry.name));      
   
    existingNames.clear();

    //Adding name of entries from the documents in the set
    existingNames = new Set(data.map(entry => entry.name));

    // Identifying the names of the documents that need to be deleted.
    const deletedEntries = existingDocuments.filter(entry => !existingNames.has(entry.name));

    // Deleting document of the name identified the database.
    for (const deletedEntry of deletedEntries) {
      await PIIModel.deleteOne({ _id: deletedEntry._id });
    }

    // Updating existing entries in the collection
    for (const updatedEntry of entry_Updated) {
      const existingEntry = existingDocuments.find(existingEntry => existingEntry.name === updatedEntry.name);
      existingEntry.onKey = updatedEntry.onKey;
      existingEntry.regexPattern = updatedEntry.regexPattern;
      existingEntry.sensitive = updatedEntry.sensitive;
      await existingEntry.save();
    }
    // Inserting new entries in collection.
    for (const newEntry of entry_New) {
      const entry = new PIIModel(newEntry);
      await entry.save();
    }

    

    console.log('Data updated successfully in the Database');
  } catch (error) {
    console.error('Error', error.message);
    throw error
  }
};

//Setting the Cron Job.
const interval=8*60*60*1000;  //Interval for cron job.

// Function to run the cron job.
const runDataFetching = () => {
  DataFetching();
  setInterval(DataFetching,interval);
};

runDataFetching();