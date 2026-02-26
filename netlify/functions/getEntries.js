const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function() {
  const AIRTABLE_BASE = "appsWnWbbt04jYhN1";
  const AIRTABLE_TABLE = "Entries";
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

  try {
    const resp = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}?view=Grid%20view`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
      }
    );

    const result = await resp.json();

    // Only send entries with Status = Approved
    const approved = result.records.filter(r => r.fields.Status === "Approved");

    return {
      statusCode: 200,
      body: JSON.stringify({ entries: approved })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};