import axios from 'axios';

export async function validateToken(token) {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user`,   {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return {
      user: response.data.user,
      updatedToken: response.data.token
    };
  } catch (error) {
    return { user: null, updatedToken: null };
  }
}
