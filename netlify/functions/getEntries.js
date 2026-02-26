export async function handler() {
  const BASE_ID = "appsWnWbbt04jYhN1";
  const TABLE_NAME = "Entries";

  const url =
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}` +
    `?filterByFormula=${encodeURIComponent("{Status}='Approved'")}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data.records)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}