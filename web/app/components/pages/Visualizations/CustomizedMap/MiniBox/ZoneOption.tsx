import { useParams } from "@remix-run/react";
import { useState } from "react";
import {
	Checkbox,
	RoundCheckbox,
	ZoneLabel,
	ZoneOptionContainer,
} from "../styled.js";

export default function ZoneOption({
	label,
	isChecked,
	onChange,
	isDarkMode,
}: {
	zoneKey: string;
	label: string;
	isChecked: boolean;
	onChange: (checked: boolean) => void;
	isDarkMode: boolean;
}) {
	const { useCaseId } = useParams();
	const [selected, setSelected] = useState(isChecked);
	const handleClick = () => {
		onChange(!selected);
	};

	return (
		<ZoneOptionContainer onClick={handleClick}>
			{useCaseId === "16" ? (
				<Checkbox
					type="checkbox"
					checked={selected}
					onChange={(e) => {
						setSelected(e.target.checked);
						onChange(e.target.checked);
					}}
				/>
			) : useCaseId === "12" ? (
				<RoundCheckbox
					type="checkbox"
					checked={selected}
					onChange={(e) => {
						setSelected(e.target.checked);
						onChange(e.target.checked);
					}}
					isDarkMode={isDarkMode}
				/>
			) : null}
			<ZoneLabel isDarkMode={isDarkMode}>{label}</ZoneLabel>
		</ZoneOptionContainer>
	);
}
