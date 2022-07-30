const { exec } = require("child_process");

const database = "";
const table = "";

exec(`dolt sql -q "insert ${database}.${table} Values ('${new Date().toString()}', '${new Date().toString()}')"`, (err, stdout, stderr) => {
  if (err) {
    console.log(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
