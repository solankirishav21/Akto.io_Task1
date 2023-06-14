# Akto.io_Intern_Task1

The script fetches data from a specified file of a GitHub repository using GitHub API and stores/updates it in a Database.
The above task is performed periodically at a specified interval of time(in this case, 8 hours).

## Requirments for the script to run

<li> Node.js and npm installed in the device.</li>
<li> Github Personal Accesss Token with required permissions.</li>
<li> A Github repository that contains the data in a JSON file.</li>
<li> MongoDB Atlas account to create cluster.</li>

## Installation

<li> Clone the repository to your device.
  
  ```git clone https://github.com/solankirishav21/Akto.io_Task1.git ```
  </li>
  
  <li> Install all the dependencies 
    
  ```npm i```
</li>
<li> Create a .env file.

## Configuration

### 1. Setting up DB.
   <li> Login to your MongoDB cluster account and create a cluster. </li>
   <li> Now click on the connect button on the dashboard and select the option with VS Code and the url. </li>
   <li> Add the url to the .env file 
  
    MONGO_URI = YOUR-URL/THE-COLLECTION-NAME-YOU-WANT-TO-STORE-DATA
  </li>
    
### 2. JSON File Information
<li>Add your username and the name of repository storing the json data in the .env file. 
         
     GITHUB_REPO = "YOUR-GITHUB-USERNAME/YOUR-REPO-NAME"
  (In my case  solankirishav21/JsonDataforAkto)
</li>
         
         
<li> Also add the file name storing the json file
  
         GITHUB_FILE_NAME = "FILE-NAME"
  
  (In my case data.json)
</li>

<li> Create Github Personal Access Token from setting tab in your gihub account and add the in the .env file.
        
          GITHUB_TOKEN = "YOUR-TOKEN"
  </li>
  
 
 ### Running The Script 
 
 1. Start the script using
      
            node index.js
      
    or
    
          nodemon index.js
 2. The script will connect to the database and log it on console "Database Connected" and when the data is added the console will be logged with "Data updated successfully in the Database".
  
 3. The console will be logged with error if any.

