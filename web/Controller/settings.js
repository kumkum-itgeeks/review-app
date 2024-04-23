import shopify from "../shopify.js";
import { con } from "../index.js";

const addSettings = async(req, res) => {

  const SettingsTable = req.shopname + '_settings';

  // if changing the json data after data is inserted once in default table  . It wont affect the data . and new data will
  // not be inserted .
  const jsonData =[
    {
      "type": "autopublish",
      "setting": { "autopublish": "enabled" }
    },
    {
      "type": "emailSettings",
      "setting": { "sendEmail": true, "email": "yourEmail@gmail.com" }
    },
    {
      "type": "starIconColor",
      "setting": { "isThemeColor": "customcolor", "customColor": "#FFFF00" }
    },
    {
      "type": "reviewListingLayout",
      "setting": {
        "reviewOnload": false,
        "bordercolor": "#5A5A5A",
        "dividercolor": "#e3e3e3",
        "reviewListingPadding": "45",
        "reviewPerpage": "4"
      }
    },
    {
      "type": "reviewListingText",
      "setting": {
        "reviewHeadline": "Customer Reviews",
        "reviewLink": "Write a review",
        "noReviewSummary": "No reviews yet !",
        "reviewSummary": "Based on ${length} reviews",
        "paginationNextLabel": "Next",
        "paginationPrevLabel": "Previous",
        "reportAsinappropriate": "Report review as Inappropriate",
        "reportAsinappropriateMessage": "This review has been reported !",
        "authorInformation": "<p><i><b>${itm.userName} </b> on <b>${itm.datePosted}</b></i></p>"
      }
    },
    {
      "type": "reviewFormText",
      "setting": {
        "authorEmail": "Email",
        "emailHelpMessage": "john.smith@example.com...",
        "emailType": "required",
        "authorName": "Name",
        "nameHelpMessage": "Enter your name...",
        "nameType": "required",
        "authorLocation": "Location",
        "locationHelpMessage": "Enter your location",
        "locationType": "hidden",
        "reviewFormTitle": "Write a review",
        "reviewRating": "Rating",
        "reviewTitle": "Review Title",
        "reviewTitleHelpMessage": "Give your review a title ...",
        "reviewBody": "Body of Review",
        "reviewBodyHelpMessage": "Write your comments heree...",
        "submitButtton": "Submit Review",
        "successMessage": "Thank you for submitting a review!",
        "errorMessage": "Not all the fields have been filled out correctly!"
      }
    },
    {
      "type": "badgeText",
      "setting": {
        "noReviewsBadge": "No reviews",
        "reviewsBadge": "{{product.reviews_count}} {{ product.reviews_count | pluralize: 'review', 'reviews' }}"
      }
    }
  ]

  const types = jsonData.map((itm) => itm.type)
  const settingsArray = jsonData.map((itm) => itm.setting)

  var sql = `CREATE TABLE IF NOT EXISTS ${SettingsTable}  (
    id INT NOT NULL AUTO_INCREMENT,
    type VARCHAR(200),
    defaultSettings JSON,
    settings JSON,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    PRIMARY KEY (id)
    )`;

  con.query(sql,  async (err, result) =>{
    if (err) {
      console.error('error creating settings table ==>>', err)
    }
    else{
      
      console.log(JSON.stringify("setting table created"));
      // res.send(JSON.stringify({message:"setting table created"}));
       await checkData()
    }
  });
  

  async function checkData(){
    let checkQuery = ` SELECT * from ${SettingsTable}`
    con.query(checkQuery, async(err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Error inserting data');
      }
      else{
        if(results.length){
         res.status(200).send(JSON.stringify({message:"setting table and correct data exists ."}));
        }
        else{
          await addSettingdata()
        }
      }
    });
  }

  let query = `INSERT INTO ${SettingsTable} (type, defaultSettings , settings) VALUES ?`;

  const values = types.map((type, index) => [type, JSON.stringify(settingsArray[index]), JSON.stringify(settingsArray[index])]);


  async function addSettingdata(){
    
    con.query(query, [values], (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).send('Error inserting data');
      }
      res.status(200).send(JSON.stringify({message:"Data inserted in settings table "}));
    });
  }
    // const jsonData = req.body.data
  // console.log(jsonData)
  // return

  // const SettingsTable = req.shopname + '_settings';
}


const getSettings = (req, res) => {
  const settingsTable = req.shopname + '_settings';

  const query = `SELECT type , settings FROM ${settingsTable} `
  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }

    const transformedData = results.map(item => {
      const settingsObj = JSON.parse(item.settings);
      return { [item.type]: settingsObj };
    });
    res.status(200).send(JSON.stringify(transformedData));
  }
  );
}

const ModifySettings = (req, res) => {
  const jsonData = req.body.data;
  const type = jsonData.map((itm) => itm.type)
  const setting =jsonData.map((itm=>itm.setting))
  const settingsTable = req.shopname + '_settings';

  const typesString = type.map((type) => `'${type}'`).join(',');



  jsonData.forEach((item) => {
    const { type, setting } = item;
    const updateQuery = `UPDATE ${req.shopname}_settings SET settings = ? WHERE type = ?`;
  
    con.query(updateQuery, [JSON.stringify(setting), type], (err, results) => {
      if (err) {
        console.error('Error updating settings:', err);
        return;
      }
      console.log(`Settings updated for type: ${type}`);
      
    });
  });

  res.send(JSON.stringify('Updated successfully'))

}

const resetSettings=(req,res)=>{
  //reset all settings

  const settingsTable = req.shopname + '_settings';

  const query = `SELECT type , defaultSettings FROM ${settingsTable} `
  con.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).send('Error fetching data');
    }

    const transformedData = results.map(item => {
      const settingsObj = JSON.parse(item.defaultSettings);
      return { [item.type]: settingsObj };
    });
    
    results.forEach((item) => {
    
      const { type, defaultSettings } = item;
      const updateQuery = `UPDATE ${settingsTable} SET settings = ? WHERE type = ?`;
    
      con.query(updateQuery, [(defaultSettings), type], (err, results) => {
        if (err) {
          console.error('Error updating settings:', err);
          return;
        }
        console.log(`Settings updated for type: ${type}`);
        
      });
    });
    res.send(JSON.stringify(transformedData))
  }
  );
}
export default { addSettings, getSettings , ModifySettings ,resetSettings}