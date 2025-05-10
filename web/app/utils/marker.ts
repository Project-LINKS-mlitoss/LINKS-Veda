import L from "leaflet";

export const createMarkerIcon = (number: string) =>
	L.divIcon({
		className: "bg-transparent",
		html: `<svg width="42" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z" fill="#00474F"/>
      <text x="12" y="9" text-anchor="middle" fill="white" style="font-size: 8px; font-weight: bold;">${number}</text>
    </svg>`,
		iconSize: [42, 60],
		iconAnchor: [21, 60],
	});
