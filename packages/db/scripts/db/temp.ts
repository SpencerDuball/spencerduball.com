import ora from "ora";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function main() {
  const first = ora("Setting up the connection ...").start();
  await delay(2000);
  first.stop();

  for (let i of Object.keys(Array(10).fill(null))) {
    const idx = parseInt(i) + 1;
    const second = ora(`Running  ${idx}/${10}`).start();
    await delay(1000);
    second.succeed(`Finished ${idx}/${10}`);
  }
}

main();
