import axios from 'axios';
async function getData(url) {
  const response = await axios.get(url);
  return response.data;
}

export { getData };