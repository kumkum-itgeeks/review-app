import shopify from "../shopify.js";
import { con } from "../index.js";

const addSettings = (req, res) => {
  const jsonData = req.body.data
  const types = jsonData.map((itm) => itm.type)
  const settingsArray = jsonData.map((itm) => itm.setting)
  const SettingsTable = req.shopname + '_settings';

  let query = `INSERT INTO ${SettingsTable} (type, defaultSettings , settings) VALUES ?`;

  const values = types.map((type, index) => [type, JSON.stringify(settingsArray[index]), JSON.stringify(settingsArray[index])]);


  con.query(query, [values], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      return res.status(500).send('Error inserting data');
    }
    console.log('Data inserted successfully:', results);
    res.status(200).send(JSON.stringify('Data inserted successfully'));
  });

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
    // res.status(200).send(JSON.stringify(results));
    results.forEach((item) => {
      
      // console.log(JSON.stringify(item.defaultSettings))
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