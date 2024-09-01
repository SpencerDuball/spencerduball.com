import cron from "node-cron";
async function main() {
    cron.schedule("* * * * *", () => {
        console.log("running a task every minute");
    });
}
main();
