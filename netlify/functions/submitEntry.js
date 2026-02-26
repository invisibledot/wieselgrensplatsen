const fetch = require("node-fetch");

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const BASE_ID = "appsWnWbbt04jYhN1";
  const TABLE_NAME = "Entries";

  const layerMap = {
    memories: "recI5CeL4O7d6hOE6",
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
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records: [record] })
    }
  );

  const text = await response.text();

  return {
    statusCode: response.status,
    body: text
  };
}