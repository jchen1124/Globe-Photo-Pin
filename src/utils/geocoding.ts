async function getAddressFromCoords(latitude: number, longitude: number) {
  console.log("Fetching address for coords:", latitude, longitude);
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/geocode?latitude=${latitude}&longitude=${longitude}`,
  );
  const data = await response.json();
//   console.log("Received geocode data:", data);
  return data.address;
}

export { getAddressFromCoords };
