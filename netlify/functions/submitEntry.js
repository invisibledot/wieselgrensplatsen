const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const AIRTABLE_BASE = "appsWnWbbt04jYhN1";      // your Airtable base ID
  const AIRTABLE_TABLE = "Entries";               // your table name
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN; // personal access token

  try {
    const data = JSON.parse(event.body);

    // Map layer values to Airtable record IDs for linked field
    const layerMap = {
      memories: "recI5CeL4O7d6hOE6",
      everyday: "recy14HbZoS3UQrsw",
      social: "rechd3W4jzgCz12uG"
    };

    const record = {
      fields: {
        Text: data.text,
        Latitude: data.lat,
        Longitude: data.lng,
        "Approximate location": data.approximate === true,
        Layer: [layerMap[data.layer]],
        Status: data.status || "Pending"
      }
    };

    // Attach photos if any
    if (data.photos && data.photos.length > 0) {
      record.fields.Photos = data.photos.map(p => ({ url: p.url }));
    }

    const resp = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ records: [record] })
      }
    );

    const result = await resp.json();

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: result })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, record: result.records[0] })
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};