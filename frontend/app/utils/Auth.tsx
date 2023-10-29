export const getStatus = async () => {
  try {
    const response = await fetch('http://localhost:8000/auth/is_authenticated')
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error(`Failed to fetch with status ${response.status}`)
      return null;
    }
  } catch (error) {
    console.error("Failed to fetch authentication status: ", error)
    return null;
  }
}