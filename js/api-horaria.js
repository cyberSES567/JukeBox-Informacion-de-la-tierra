// js/api-horaria.js - Temperatura por hora (NASA POWER, endpoint "hourly")
// api.js no se toca: este archivo es aparte.

export const DATA_START = "20260101";
export const DATA_END = "20260107"; // día cuyo ciclo horario se muestra

export async function getHourlyTemperatures(lat, lon) {
  try {
    const url =
      `https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=T2M` +
      `&community=RE&longitude=${lon}&latitude=${lat}` +
      `&start=${DATA_START}&end=${DATA_END}&time-standard=UTC&format=JSON`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(response.statusText);

    const data = await response.json();

    // Claves tipo "2026010714" (AAAAMMDDHH, en UTC)
    return Object.entries(data.properties.parameter.T2M).map(
      ([key, value]) => ({
        day: key.slice(0, 8),
        hour: Number(key.slice(8, 10)),
        value,
      }),
    );
  } catch (error) {
    console.error("Falló la API horaria de la NASA:", error);
    return [];
  }
}
