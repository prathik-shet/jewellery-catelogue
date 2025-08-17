import axios from 'axios';

const API_URL = 'http://localhost:5000/api/jewellery';

export const getAllJewellery = () => axios.get(API_URL);
export const deleteJewellery = (id) => axios.delete(`${API_URL}/${id}`);
