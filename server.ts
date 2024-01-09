function getRandomJsonItem(filePath: string): string {
  const jsonData = JSON.parse(Deno.readTextFileSync(filePath));
  const randomItem = jsonData[Math.floor(Math.random() * jsonData.length)];
  return randomItem;
}

function addOne(value: any): number {
  if (isNaN(value)) {
    value = 0;
  }
  return Number(value) + 1;
}

async function setKeyValue(path: string): Promise<number> {
  const kv = await Deno.openKv();
  const num = await kv.get(["demo1", path]);
  const newNum = addOne(num.value);
  await kv.set(["demo1", path], newNum);
  console.log("Path:", path, "Num:", newNum);
  return newNum;
}

async function getKeyValue(): Promise<string> {
  const kv = await Deno.openKv();
  const num1 = await kv.get(["demo1", "/"]);
  const num2 = await kv.get(["demo1", "/gushi"]);
  const num3 = await kv.get(["demo1", "/images"]);
  return `<div> / ${num1.value}<br> /gushi ${num2.value}<br> /images ${num3.value}</div>`;
}

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  setKeyValue(url.pathname);
  switch (url.pathname) {
    case "/":
      const num = await getKeyValue();
      return new Response(
        Deno.readTextFileSync("index.html").replace(/{{num}}/g, num),
        { status: 200, headers: { "Content-Type": "text/html" } }
      );
    case "/gushi":
      return new Response(getRandomJsonItem("古诗.json"), { status: 200 });
    case "/images":
      return new Response("302", {
        status: 302,
        headers: { Location: getRandomJsonItem("images.json") },
      });
    default:
      return new Response("404", { status: 404 });
  }
};

console.log(`HTTP server running. Access it at: http://localhost:1024/`);
Deno.serve({ port: 1024, hostname: "0.0.0.0", handler });
