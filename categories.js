const url = 'https://backend.composio.dev/api/v3/toolkits/categories';
const options = {method: 'GET', headers: {'x-api-key': 'ak_2DMBA25XIz4pigtgZvmz'}};
const response = await fetch(url, options);
const data = await response.json();
const categories = new Set(["all", ...data.items.map(item => item.name)])
console.log(categories)
