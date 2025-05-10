import Badge from "app/components/atoms/Badge";

interface FilterSectionProps {
	badgeCounts?: number;
	title: string;
}
const FilterSectionTitle: React.FC<FilterSectionProps> = ({
	badgeCounts,
	title,
}) => {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
			}}
		>
			{title}
			<Badge
				count={badgeCounts}
				style={{
					backgroundColor: "#52c41a",
					marginLeft: "8px",
				}}
			/>
		</div>
	);
};

export default FilterSectionTitle;
