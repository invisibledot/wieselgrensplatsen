  module.exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const BASE_ID = "appsWnWbbt04jYhN1";
  const TABLE_NAME = "Entries";

  const layerMap = {
    hidden: "recI5CeL4O7d6hOE6",
    everyday: "recy14HbZoS3UQrsw",
    social: "rechd3W4jzgCz12uG"
  };

  try {
    const data = JSON.parse(event.body);

    const record = {
      fields: {
        Text: data.text,
        Latitude: data.lat,
        Longitude: data.lng,
        "Approximate location": data.approximate === true,
        Layer: [layerMap[data.layer]],
        Status: "Pending"
      }
    };

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
      { method: "POST", headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ records: [record] }) }
    );
    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, id: result.records[0].id })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};