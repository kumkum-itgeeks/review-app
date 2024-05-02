import shopify from "../shopify.js";
import { con } from "../index.js";
import nodemailer from 'nodemailer'

const addSettings = async (req, res) => {

  const SettingsTable = req.shopname + '_settings';

  // if changing the json data after data is inserted once in default table  . It wont affect the data . and new data will
  // not be inserted .
  const jsonData = [
    {
      "type": "autopublish",
      "setting": { "autopublish": "disabled" }
    },
    {
      "type": "emailSettings",
      "setting": { "sendEmail": false, "email": "" }
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
        "reviewLink": "Write a Review Here",
        "noReviewSummary": "No reviews yet",
        "reviewSummary": "Based on ${length} reviews",
        "paginationNextLabel": "Next",
        "paginationPrevLabel": "Previous",
        "reportAsinappropriate": "Report review as Inappropriate",
        "reportAsinappropriateMessage": "This review has been reported",
        "authorInformation": "<p><i><b>${itm.userName} </b> on <b>${itm.datePosted}</b></i></p>"
      }
    },
    {
      "type": "reviewFormText",
      "setting": {
        "authorEmail": "Email",
        "emailHelpMessage": "xyz@example.com",
        "emailType": "required",
        "authorName": "Name",
        "nameHelpMessage": "Enter your name here",
        "nameType": "required",
        "authorLocation": "Location",
        "locationHelpMessage": "Enter your location here",
        "locationType": "hidden",
        "reviewFormTitle": "Write a Review",
        "reviewRating": "Rating",
        "reviewTitle": "Review Title",
        "reviewTitleHelpMessage": "Give your review a heading",
        "reviewBody": "Description of Review",
        "reviewBodyHelpMessage": "Write your description here",
        "submitButtton": "Submit Review",
        "successMessage": "Thank you for submitting a review!",
        "errorMessage": "Fields and rating can not be left empty."
      }
    },
    {
      "type": "badgeText",
      "setting": {
        "noReviewsBadge": "No reviews",
        "reviewsBadge": "${count} reviews"
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

  con.query(sql, async (err, result) => {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
    }
    else {

      await checkData()
    }
  });


  async function checkData() {
    let checkQuery = ` SELECT * from ${SettingsTable}`
    con.query(checkQuery, async (err, results) => {
      if (err) {
        return res.status(400).send(JSON.stringify({ 'error': err.message }))
      }
      else {
        if (results.length) {
          res.status(200).send(JSON.stringify({ message: "setting table and correct data exists ." }));
        }
        else {
          await addSettingdata()
        }
      }
    });
  }

  let query = `INSERT INTO ${SettingsTable} (type, defaultSettings , settings) VALUES ?`;

  const values = types.map((type, index) => [type, JSON.stringify(settingsArray[index]), JSON.stringify(settingsArray[index])]);


  async function addSettingdata() {

    con.query(query, [values], (err, results) => {
      if (err) {
        return res.status(400).send(JSON.stringify({ 'error': err.message }))
      }
      res.status(200).send(JSON.stringify({ message: "Data inserted in settings table " }));
    });
  }

}


const getSettings = (req, res) => {
  const settingsTable = req.shopname + '_settings';

  const query = `SELECT type , settings FROM ${settingsTable} `
  con.query(query, (err, results) => {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
    }

    const transformedData = results.map(item => {
      const settingsObj = JSON.parse(item.settings);
      return { [item.type]: settingsObj };
    });
    res.status(200).send(JSON.stringify(transformedData));
  }
  );
}


const setAutoPublish = async (req, res) => {

  const shopName = req.shopname;
  const settingsTable = shopName + '_settings';
  const PlanTable = shopName + '_pricing_plan';
  const query = `SELECT * FROM information_schema.tables WHERE table_schema = 'reviews' AND table_name = '${settingsTable}'`;

  con.query(query, function (err, tables) {
    if (err) {
      throw err;
    }

    if (tables.length > 0) {
      const AutopublishDisable = { "autopublish": "disabled" };
      const updateQuery = `UPDATE ${settingsTable} SET settings = ? WHERE type = 'autopublish'`;

      con.query(updateQuery, [JSON.stringify(AutopublishDisable)], (err, results) => {
        if (err) {
          return res.status(400).send(JSON.stringify({ 'err': err }))
        }
        else {
          res.send(JSON.stringify({ message: 'succesfully updated to  basic plan ' }))
        }
      });
    }
    else {
      res.send(JSON.stringify({ message: 'succesfully updated to  basic plan ' }))
    }

  })

};


const ModifySettings = async (req, res) => {
  try {
    const jsonData = req.body.data;
    const type = jsonData.map((itm) => itm.type);
    const shopName = req.shopname;
    const settingsTable = shopName + '_settings';
    const PlanTable = shopName + '_pricing_plan';

    // Function to save settings
    async function saveSettings() {
      for (const item of jsonData) {
        const { type, setting } = item;
        const updateQuery = `UPDATE ${shopName}_settings SET settings = ? WHERE type = ?`;
        await new Promise((resolve, reject) => {
          con.query(updateQuery, [JSON.stringify(setting), type], (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve(results);
            }
          });
        });
      }
    }

    // Check the plan
    const checkPlanQuery = `SELECT planName FROM ${PlanTable} WHERE shop = '${shopName}'`;
    con.query(checkPlanQuery, async (err, results) => {
      if (err) {
        return res.status(400).send(JSON.stringify({ error: err.message }));
      }

      const PlanName = results[0]?.planName;
      if (PlanName === 'Basic Plan') {
        await saveSettings();
        await saveBasicPlanSettings();
        res.send(JSON.stringify('Updated successfully'));
      } else {
        await saveSettings();
        res.send(JSON.stringify('Updated successfully'));
      }
    });

    // Function to save basic plan settings
    async function saveBasicPlanSettings() {
      const AutopublishDisable = { "autopublish": "disabled" };
      const updateQuery = `UPDATE ${settingsTable} SET settings = ? WHERE type = 'autopublish'`;

      await new Promise((resolve, reject) => {
        con.query(updateQuery, [JSON.stringify(AutopublishDisable)], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }
  } catch (error) {
    res.status(500).send(JSON.stringify({ error: error.message }));
  }
};

const resetSettings = (req, res) => {
  //reset all settings

  const settingsTable = req.shopname + '_settings';

  const query = `SELECT type , defaultSettings FROM ${settingsTable} `
  con.query(query, (err, results) => {
    if (err) {
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
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
          return res.status(400).send(JSON.stringify({ 'error': err.message }))
        }

      });
    });
    res.send(JSON.stringify(transformedData))
  }
  );
}
const sendMail = (req, res) => {
  //reset all settings

  const settingsTable = req.shopname + '_settings';
  const checkMailSetting = `Select settings FROM ${settingsTable} Where type='emailSettings'`;
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "mailto:itg.donotreply@gmail.com",
      pass: "suntduvmuohcccwa",
    },
  });

  con.query(checkMailSetting, async (err, results) => {
    if (err) {
      console.log(err)
      return res.status(400).send(JSON.stringify({ 'error': err.message }))
    }
    else {
      let resultObj = results[0]?.settings;
      let dataObj = JSON.parse(resultObj)
      const sendMail = dataObj?.sendEmail;
      const userEmail = dataObj.email;
      if (sendMail === true) {
        await sendingMail(userEmail)
      }
      else {
        console.log('not sending email')
        res.send(JSON.stringify({ message: 'no Email sent' }))

      }
    }

  });

  async function sendingMail(userEmail) {
    // send mail with defined transport object
    try {
      await transporter.sendMail({
        from: '"IT GEEKS Reviews" <mailto:itg.donotreply@gmail.com>', // sender address
        to: userEmail, // list of receivers
        subject: "Review Update !", // Subject line
        text: "Review submitted", // plain text body
        html: "<b>your review has been submitted.</b>", // html body
      });

      res.send(JSON.stringify({ message: 'Email sent' }))

    }
    catch (err) {
      console.log(err, 'error sending mail')
      return res.status(400).send(JSON.stringify({ 'error generating mail': err.message }))

    }

  }


}
export default { addSettings, getSettings, ModifySettings, resetSettings, setAutoPublish, sendMail }