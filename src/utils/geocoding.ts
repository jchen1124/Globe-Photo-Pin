async function getAddressFromCoords(latitude: number, longitude: number) {
  console.log("Fetching address for coords:", latitude, longitude);
  const response = await fetch(
    `https://globe-photo-pin-1.onrender.com/geocode?latitude=${latitude}&longitude=${longitude}`,
  );
  const data = await response.json();
//   console.log("Received geocode data:", data);
  return data.address;
}

export { getAddressFromCoords };
